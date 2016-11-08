const {serve, router: {compile, get, post}, middleware: {jsonApi, simple, sync}} = require("../index");
const {compose} = require("ramda");
const ss = compose(simple, sync);
const jsonSS = compose(jsonApi, ss);
const app = compile(
  get("^/person", {}, ss(() => "You tried to get everyone.")),
  post("^/person", {}, jsonSS((ctx) => ctx.body.then(({name}) => `You tried to create person ${name}`)))
);
serve(app, "localhost", 5000);
