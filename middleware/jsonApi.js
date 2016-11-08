module.exports = (function ({jsonBody}, {evolve, curry, assoc}, Promise) {
    return curry((f, ctx) => {
        const contentType = ctx.req.headers["content-type"];
        const hasBody = parseInt(ctx.req.headers["content-length"], 10);
        console.dir(hasBody);
        return !hasBody || hasBody && contentType === "application/json" ?
            jsonBody(f, ctx)
                .then(evolve({
                    body: JSON.stringify,
                    headers: assoc("Content-Type", "application/json")
                })) :
            Promise.resolve({status: 400});
    });
}(
    require("./body"),
    require("ramda"),
    require("bluebird")
));
