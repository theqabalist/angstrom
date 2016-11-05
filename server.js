module.exports = (function (
    {createServer}, // http
    {fromEvents, pool, constant, constantError, fromPromise}, // kefir
    {head, last, is, objOf},
    Promise) {
    const server = createServer();
    const raw$ = fromEvents(server, "request", (req, res) => [req, res]);
    const req$ = raw$.map(head);

    function errorToDescriptor(e) {
        return {body: JSON.stringify({msg: e.message, stack: e.stack.split("\n")}), status: 500};
    }

    return {
        serve: (app, host, port) => {
            req$.map(objOf("req"))
                .map(app)
                .map(x => is(String, x) ? {body: x, status: 200} : x)
                .map(Promise.resolve)
                .flatMap(p => fromPromise(p.catch(errorToDescriptor)))
                .zip(raw$.map(last))
                .onValue(([desc, res]) => {
                    try {
                        res.statusCode = desc.status;
                        res.end(desc.body);
                    } catch (e) {
                        res.statusCode = 500;
                        res.end();
                        console.error(e);
                    }
                });
            server.listen(port, host);
        }
    };
}(
    require("http"),
    require("kefir"),
    require("ramda"),
    require("bluebird")
));
