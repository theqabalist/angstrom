module.exports = (function (
    {createServer}, // http
    {fromEvents, pool, constant, constantError, fromPromise}, // kefir
    {head, last, objOf, cond, has, T, compose, toPairs, merge}
) {
    const server = createServer();
    const raw$ = fromEvents(server, "request", (req, res) => [req, res]);
    const req$ = raw$.map(head);

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
                .flatMap(fromPromise)
                .zip(raw$.map(last))
                .onValue(writeResponse);

            server.listen(port, host, () => {
                console.info(`Angstrom listening on ${host}:${port}.`);
            });
        }
    };
}(
    require("http"),
    require("kefir"),
    require("ramda")
));
