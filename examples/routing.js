const {serve, router: {compile, get, route}, middleware: {sync, simple}} = require("../index");
const {compose} = require("ramda");
const int = "(\\d+)";
const ss = compose(simple, sync);
const app = compile(
  get("^/person$", {}, ss(() => "You tried to get everyone.")),
  get(`^/person/${int}$`, {id: parseInt}, ss((ctx) => `You tried to get person ${ctx.params.id}`)),
  route(get, "/dog", ss(() => "You tried to get the dogs.")),
  route(get, "/dog/:id", ss((ctx) => `You tried to get dog ${ctx.params.id}`))
);
serve(app, "localhost", 5000);
