module.exports = (function (
    {createServer}, // http
    {fromEvents, pool, constant, constantError, fromPromise}, // kefir
    {head, last, is, objOf, cond, has, T, compose, toPairs, merge},
    Promise) {
    const server = createServer();
    const raw$ = fromEvents(server, "request", (req, res) => [req, res]);
    const req$ = raw$.map(head);

    function errorToDescriptor(e) {
        return {body: JSON.stringify({msg: e.message, stack: e.stack.split("\n")}), status: 500};
    }

    function writeScalarResponse([desc, res]) {
        const withDefaults = merge({
            status: 200,
            headers: {},
            body: ""
        }, desc);
        res.statusCode = withDefaults.status;
        if (withDefaults.message) {
            res.statusMessage = withDefaults.message;
        }
        toPairs(withDefaults.headers).forEach((args) => res.setHeader(...args));
        res.end(withDefaults.body);
    }

    function writeStreamResponse([desc, res]) {
        res.statusCode = desc.status;
        desc.body$.onValue(res.write.bind(res));
        desc.body$.onEnd(res.end.bind(res));
    }

    const writeResponse = cond([
        [compose(has("body$"), head), writeStreamResponse],
        [T, writeScalarResponse]
    ]);

    return {
        serve: (app, host, port) => {
            req$.map(objOf("req"))
                .map(app)
                .map(x => is(String, x) ? {body: x, status: 200} : x)
                .map(Promise.resolve)
                .flatMap(p => fromPromise(p.catch(errorToDescriptor)))
                .zip(raw$.map(last))
                .onValue(writeResponse);
            server.listen(port, host);
        }
    };
}(
    require("http"),
    require("kefir"),
    require("ramda"),
    require("bluebird")
));
