module.exports = (function ({v4: uuid4}, Promise, {curry, toPairs, assoc}, moment) {
    const defaultID = () => Promise.resolve(uuid4());

    const log = curry((lineLead, id, date, data) => {
        const kvs = toPairs(data).map(([k, v]) => `${k}=${v}`).join(" ");
        console.log(`${lineLead} ${moment(date).format("YYYYMMDD-HHmmss.SSS")} req=${id} ${kvs}`);
    });

    const innerLog = curry((id, data) => {
        log("REQUEST_LOG", id, new Date(), data);
    });

    return curry((_genId, f, ctx) => {
        const reqId = (_genId || defaultID)();
        const started = new Date().getTime();
        return Promise.resolve(reqId)
            .then(id => {
                log("REQUEST_START", id, started, {
                    method: ctx.req.method,
                    path: ctx.req.url,
                    remoteAddr: ctx.req.connection.remoteAddress
                });
                return Promise.resolve(f(assoc("log", innerLog(id), ctx))).then(res => {
                    const ended = new Date().getTime();
                    log("REQUEST_SERVICE", id, ended, {
                        status: res.status,
                        duration: ended - started
                    });
                    return res;
                });
            });
    });
}(
    require("node-uuid"),
    require("bluebird"),
    require("ramda"),
    require("moment")
));
