module.exports = (function ({v4: uuid4}, {curry, toPairs, assoc, merge}, moment, Promise) {
    const defaultID = () => Promise.resolve(uuid4());

    const log = curry((reporter, lineLead, id, date, data) => {
        const kvs = toPairs(data).map(([k, v]) => `${k}=${v}`).join(" ");
        reporter(`${lineLead} ${moment(date).format("YYYYMMDD-HHmmss.SSS")} req=${id} ${kvs}`);
    });

    const innerLog = curry((reporter, id, data) => {
        log(reporter, "REQUEST_LOG", id, new Date(), data);
    });

    return curry((opts, f, ctx) => {
        const options = merge({
            genId: defaultID,
            reporter: console.log.bind(console)
        }, opts || {});
        const reqId = options.genId();
        const started = new Date().getTime();
        return Promise.resolve(reqId)
            .then(id => {
                log(options.reporter, "REQUEST_START", id, started, {
                    method: ctx.req.method,
                    path: ctx.req.url,
                    remoteAddr: ctx.req.connection.remoteAddress
                });
                return f(assoc("log", innerLog(options.reporter, id), ctx)).then(res => {
                    const ended = new Date().getTime();
                    log(options.reporter, "REQUEST_SERVICE", id, ended, {
                        status: res.status,
                        duration: ended - started
                    });
                    return res;
                });
            });
    });
}(
    require("uuid"),
    require("ramda"),
    require("moment"),
    require("bluebird")
));
