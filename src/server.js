module.exports = (function (
    {createServer}, // http
    {fromEvents, pool, constant, constantError, fromPromise, never}, // kefir
    {head, last, objOf, cond, has, T, compose, toPairs, curry, mergeAll, invoker}
) {
    const server = createServer();
    const raw$ = fromEvents(server, "request", (req, res) => [req, res]);
    const req$ = raw$.map(head);
    const resEnd = invoker(1, "end");

    const withResponseSetup = curry((defaultBody, f, [desc, res]) => {
        const withDefaults = mergeAll([{status: 200, message: "OK", headers: {}}, defaultBody, desc]);
        res.statusCode = withDefaults.status;
        if (withDefaults.message) {
            res.statusMessage = withDefaults.message;
        }
        toPairs(withDefaults.headers).forEach((args) => res.setHeader(...args));
        const bodyKey = Object.keys(defaultBody)[0];
        f(withDefaults[bodyKey], res);
    });

    const writeScalarResponse = withResponseSetup({body: ""}, resEnd);

    const writeStreamResponse = withResponseSetup({body$: never()}, (body$, res) => {
        body$.onValue(res.write.bind(res));
        body$.onEnd(res.end.bind(res));
    });

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

            return server.close.bind(server);
        }
    };
}(
    require("http"),
    require("kefir"),
    require("ramda")
));
