const {
    serve,
    router: {compile, get},
    apps: {fileServer}
} = require("../index");
const {identity} = require("ramda");
const app = compile(
  get("^/(.*)$", {path: identity}, fileServer("./")) // serves files out of CWD; streams off disk, not buffered
);
serve(app, "localhost", 5000);
