module.exports = (function ({streamingBody, bufferedBody, jsonBody}, {curry}) {
    return {
        streamingBody,
        bufferedBody,
        jsonBody,
        jsonApi: require("./jsonApi"),
        errorHandler: curry((f, ctx) => {
            try {
                return f(ctx);
            } catch (e) {
                console.error(e);
                return Promise.resolve({
                    status: 500,
                    body: e.stack,
                    headers: {"Content-Type": "text/plain"}
                });
            }
        }),
        requestLogger: require("./requestLogger")
    };
}(
    require("./body"),
    require("ramda")
));
