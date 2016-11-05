module.exports = (function ({fromEvents}, {identity}) {
    return {
        fromReadableStream(str) {
            const end$ = fromEvents(str, "end");
            return fromEvents(str, "readable")
                .takeUntilBy(end$)
                .map(() => str.read())
                .filter(identity);
        }
    };
}(
    require("kefir"),
    require("ramda")
));
