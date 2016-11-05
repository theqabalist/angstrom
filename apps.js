module.exports = (function ({curry}, {createReadStream, access, constants: R_OK}, {fromReadableStream}, Promise) {
    access = Promise.promisify(access);
    return {
        fileServer: curry((root, ctx) => {
            const path = root + ctx.params.path;
            return access(path, R_OK)
                .then(() => ({status: 200, body$: fromReadableStream(createReadStream(path))}))
                .catch(() => ({status: 404}));
        })
    };
}(
    require("ramda"),
    require("fs"),
    require("./streams"),
    require("bluebird")
));
