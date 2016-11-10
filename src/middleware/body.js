module.exports = (function (
    {curry, identity, T, invoker, assoc, composeP, compose, prop},
    {fromReadableStream}
) {
    const join = invoker(1, "join");
    const bodyAsStream = compose(fromReadableStream, prop("req"));
    const bufferedBodyFromStream = (ctx) => bodyAsStream(ctx)
        .bufferWhile(T)
        .map(join(""))
        .toPromise();
    const jsonBodyFromStream = composeP(JSON.parse, bufferedBodyFromStream);
    const addRequestModifier = curry((property, transform, app, ctx) => app(assoc(property, transform(ctx), ctx)));
    const addSyncRequestModifier =
        curry((property, transform, app, ctx) => transform(ctx).then(x => app(assoc(property, x, ctx))));

    return {
        streamingBody: addRequestModifier("body$", bodyAsStream),
        bufferedBody: addSyncRequestModifier("body", bufferedBodyFromStream),
        jsonBody: addSyncRequestModifier("body", jsonBodyFromStream)
    };
}(
    require("ramda"),
    require("../streams")
));
