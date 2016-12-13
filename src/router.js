module.exports = (function ({
    curry, compose, pipe, zip, mergeAll, toPairs, cond, map, converge, pair,
    assoc, always, prop, match, tail, identity, replace, fromPairs
},
    Promise
) {
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
        const table = pipe(...directives)([]).concat(Array.of(defaultHandler));
        const condable = map(([meth, pat, pmap, handler]) => {
            const pred = compose(req => req.method.match(meth) && req.url.match(pat), prop("req"));
            const cont = transformPattern(pat, pmap, handler);
            return [pred, cont];
        }, table);
        return cond(condable);
    }

    const slugMatch = /:([^/]+)/g;
    const slugs = pipe(
        match(slugMatch),
        map(tail),
        map(x => [x, identity]),
        fromPairs
    );

    const regexify = pipe(
        replace(slugMatch, "([^/]+)"),
        x => `^${x}$`
    );

    return {
        compile,
        get: handleRoute("GET"),
        put: handleRoute("PUT"),
        post: handleRoute("POST"),
        delete: handleRoute("DELETE"),
        patch: handleRoute("PATCH"),
        sub: handleRoute(".*"),
        route: (method, sugary, handler) => method(...converge(pair, [regexify, slugs])(sugary).concat(handler))
    };
}(
    require("ramda"),
    require("bluebird")
));
