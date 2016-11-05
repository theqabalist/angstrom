module.exports = (function ({curry, identity, T, invoker, assoc, composeP}, {fromEvents}) {
    const join = invoker(1, "join");
    const bodyAsStream = (ctx) => {
        const end$ = fromEvents(ctx.req, "end");
        return fromEvents(ctx.req, "readable")
            .takeUntilBy(end$)
            .map(() => ctx.req.read())
            .filter(identity);
    };
    const bufferedBodyFromStream = (ctx) => bodyAsStream(ctx)
        .bufferWhile(T)
        .map(join(""))
        .toPromise();
    const jsonBodyFromStream = composeP(JSON.parse, bufferedBodyFromStream);
    const addRequestModifier = curry((property, transform, app, ctx) => app(assoc(property, transform(ctx), ctx)));
    return {
        streamingBody: addRequestModifier("body$", bodyAsStream),
        bufferedBody: addRequestModifier("body", bufferedBodyFromStream),
        jsonBody: addRequestModifier("body", jsonBodyFromStream)
    };
}(
    require("ramda"),
    require("kefir")
));
