module.exports = (function ({jsonBody}, {evolve, curry, assoc, cond, converge, and, T, curryN}, Promise) {
    const isJson = (f, ctx) => ctx.req.headers["content-type"] === "application/json";
    const notJson = (f, ctx) => !isJson(f, ctx);
    const hasBody = (f, ctx) => parseInt(ctx.req.headers["content-length"], 10);
    const runWithBody = (f, ctx) => jsonBody(f, ctx)
        .then(evolve({
            body: JSON.stringify,
            headers: assoc("Content-Type", "application/json")
        }));
    const badRequest = () => Promise.resolve({status: 400});
    const runWithoutBody = (f, ctx) => f(ctx);
    const runApp = curryN(2, cond([
        [converge(and, [isJson, hasBody]), runWithBody],
        [converge(and, [notJson, hasBody]), badRequest],
        [T, runWithoutBody]
    ]));
    return runApp;
}(
    require("./body"),
    require("ramda"),
    require("bluebird")
));
