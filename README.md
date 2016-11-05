# angstrom
A minimalist server thought experiment.  Feel free to use in production, as you have to provide nearly all functionality yourself.

## Basic Example
```javascript
const Å = require("angstrom");
Å.serve(() => "hello world", "localhost", 5000);
```

## Async Example
```javascript
const Å = require("angstrom");
Å.serve(() => Promise.new((resolve) => setTimeout(() => resolve("hello world"), 2000)), "localhost", "5000");
```

## Routing Example
```javascript
const {serve, router: {compile, get}} = require("angstrom");
const int = "(\\d+)";
const app = compile(
  get("^/person", {}, () => "You tried to get everyone."),
  get(`^/person/${int}`, {id: parseInt}, (ctx) => `You tried to get person ${ctx.params.id}`)
)
server(app, "localhost", 5000);
```

## Middleware Example
```javascript
const {serve, router: {compile, get}, middleware: {jsonBody}} = require("angstrom");
const int = "(\\d+)";
const app = compile(
  get("^/person", {}, () => "You tried to get everyone."),
  post(`^/person`, {}, jsonBody((ctx) => `You tried to create person ${ctx.body.name}`))
)
server(app, "localhost", 5000);
```
### List of current middleware
streamingBody: turns the body into a kefir stream of data chunks
bufferedBody: attempts to buffer the entire body and return a promise for it
jsonBody: bufferedBody, but with parsing to JSON included
