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
