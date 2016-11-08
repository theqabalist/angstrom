module.exports = (function (
    {streamingBody, bufferedBody, jsonBody},
    {curry, curryN, compose, composeP, is},
    {resolve}
) {
    return {
        streamingBody,
        bufferedBody,
        jsonBody,
        jsonApi: require("./jsonApi"),
        errorHandler: curry((reporter, f, ctx) => {
            try {
                return f(ctx);
            } catch (e) {
                reporter(e);
                return Promise.resolve({
                    status: 500,
                    body: e.stack,
                    headers: {"Content-Type": "text/plain"}
                });
            }
        }),
        requestLogger: require("./requestLogger"),
        sync: curryN(2, compose)(resolve),
        simple: curryN(2, composeP)(x => is(String, x) ? {body: x, status: 200} : x)
    };
}(
    require("./body"),
    require("ramda"),
    require("bluebird")
));
