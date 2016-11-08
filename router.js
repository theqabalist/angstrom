module.exports = (function ({curry, compose, zip, mergeAll, toPairs, cond, map, assoc, always, prop}, Promise) {
    const handleRoute = curry(
        (method, pattern, pmap, handler, table) =>
            table.concat(Array.of([new RegExp(method), new RegExp(pattern), pmap, handler]))
    );

    const transformPattern = curry((pat, pmap, handler, ctx) => {
        const matches = zip(toPairs(pmap), pat.exec(ctx.req.url).slice(1));
        const applied = mergeAll(map(([[name, f], v]) => ({[name]: f(v)}), matches));
        return handler(assoc("params", applied, ctx));
    });

    const defaultHandler = [/.*/, /.*/, {}, always(Promise.resolve({body: "not found", status: 404}))];
    function compile(...directives) {
        const table = compose(...directives)([]).concat(Array.of(defaultHandler));
        const condable = map(([meth, pat, pmap, handler]) => {
            const pred = compose(req => req.method.match(meth) && req.url.match(pat), prop("req"));
            const cont = transformPattern(pat, pmap, handler);
            return [pred, cont];
        }, table);
        return cond(condable);
    }

    return {
        compile,
        get: handleRoute("GET"),
        put: handleRoute("PUT"),
        post: handleRoute("POST"),
        del: handleRoute("DELETE"),
        sub: handleRoute(".*")
    };
}(
    require("ramda"),
    require("bluebird")
));
