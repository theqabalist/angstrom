# Ångstrom
Å minimalist server thought experiment.  Feel free to use in production, as you have to provide nearly all functionality yourself.

## Åssumptions
Ångstrom makes a few assumptions about you as a developer.  First, it assumes that you are largely regimented.  For example, routing is done using regular expressions in the raw, so you should know not to create two routes that overlap in keyspace unless you are absolutely sure you know what you're doing.

It also assumes you are familiar with promises, and streams (Kefir/Bacon interface in this case).  The basic interface lies in a Kleisli category, and thus if you are familiar with category theory (or the muddy derivative that is the promise interface), then that is all you need to know to build infinitely large or small applications.  Åll applications meet the same contract, which is `Context -> Promise ResponseDescriptor`.  Middleware extends applications by enveloping around this and meeting the same contract, or by Kleisli pre or post composing (Ramda's `composeP`).  The only thing that is guaranteed to be in the context, at least in the most naked application, is the request object.  The response descriptor can provide a body string (property "body") or a body stream (property "body$"), headers, and the response code (response message is optional).

## The bottom line.
**_Functional composition will set you free._**

# Examples

## Basic Example
```javascript
const Å = require("angstrom");
Å.serve(() => "hello world", "localhost", 5000);
```

## Åsync Example
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
* **streamingBody**: turns the body into a kefir stream of data chunks
* **bufferedBody**: attempts to buffer the entire body and return a promise for it
* **jsonBody**: bufferedBody, but with parsing to JSON included

### Streaming responses
You may send a kefir or bacon stream (requires "onValue") as body$ instead of body in the response promise, and will consume the stream into the response body.

## Åpp example
```javascript
const {serve, router: {compile, get}, apps: {fileServer}} = require("angstrom");
const {identity} = require("ramda");
const app = compile(
  get("^/(.*)$", {path: identity}, fileServer(".")) // serves files out of CWD; streams off disk, not buffered
);
serve(app, "localhost", 5000);
```
### List of current apps
* **fileServer**: expects to run inside a router that provides the path completion, root is provided during construction.
