# Ångstrom
Å minimalist server thought experiment.  Feel free to use in production, as you have to provide nearly all functionality yourself.  Ångstrom is very small.  The server core is less than 60 SLOC, the router is less than 40 SLOC.  Middleware and apps are unnecessary, but are provided as examples in consumption patterns and for convenience.  If your server is going to be slow, it's because you shot yourself in the foot, not because Ångstrom got in your way.

## Installation
```
npm install angstrom
```

## Åssumptions
Ångstrom makes a few assumptions about you as a developer.  First, it assumes that you are largely regimented.  For example, routing is done using regular expressions in the raw, so you should know not to create two routes that overlap in keyspace unless you are absolutely sure you know what you're doing.

It also assumes you are familiar with promises, and streams (Kefir/Bacon interface in this case).  The basic interface lies in a Kleisli category, and thus if you are familiar with category theory (or the muddy derivative that is the promise interface), then that is all you need to know to build infinitely large or small applications.  Åll applications meet the same contract, which is `Context -> Promise ResponseDescriptor`.  Middleware extends applications by enveloping around this and meeting the same contract, or by Kleisli pre or post composing (Ramda's `composeP`).  The only thing that is guaranteed to be in the context, at least in the most naked application, is the request object.  The response descriptor can provide a body string (property `body`) or a body stream (property `body$`), headers, and the response code and message.

### Initial Context State
```
{
  req: http.IncomingMessage
}
```

### Response Descriptor
```
{
  status?: int,
  headers?: {string: string},
  body?: string,
  body$?: {onValue: (f: Function) -> ()},
  message?: string
}
```

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
Router mapping adds `params: {string: a}` to context.

## Middleware
The middleware provided with the server is mostly provided in a manner that demonstrates the power of the abstraction.  This is to say that the choices I have made for the way the middlewares work, especially certain things that people may disagree with, such as global error handling, are provided for illustrative purposes.  If they work for you that's great.  If they don't, the whole point of this server is that it's extremely easy to extend in just the way you need.

### Middleware example
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
* **streamingBody**: turns the body into a kefir stream of data chunks.  Adds `body$: kefir.Observable` to context.
* **bufferedBody**: attempts to buffer the entire body and return a promise for it. Adds `body: Promise String` to context.
* **jsonBody**: bufferedBody, but with parsing to JSON included. Adds `body: Promise Object` to context.
* **jsonApi**: jsonBody, but with parsing from and serializing to JSON included. Adds `body: Promise Object` to context.  Checks if incoming headers are application/json, and sets outgoing headers to application/json.
* **errorHandler**: listens for crashes in the contained app and converts to server friendly responses, also logs the error to stdout.  Implemented with try/catch, so beware nesting with other try/catch.
* **requestLogger**: requires a parameter which generates a unique ID for each request (null to default to UUIDv4, can be synchronous or thenable).  Logs to stdout.  Logs beginning of request, and after service is complete.  Provides function `log` on `ctx` which takes arbitrary Key-Value pair object and turns it into log data.

### Stacking middleware
Functions are your friend, so just compose them.  Beware that order of side effects matters.
```javascript
const stack = compose(
  errorHandler,
  requestLogger(null)
);
serve(stack(() => "hello world"), "localhost", 5000);
```
will be different from
```javascript
const stack = compose(
  requestLogger(null),
  errorHandler
);
serve(stack(() => "hello world"), "localhost", 5000);
```
In the first example, request logging will begin, but logging does not handle exceptions, so crashes in an app will propagate past the logger to the error handler.  This will look, in the log, like the request wasn't serviced even though the error handler services the request.  In the second example, the error handler coerces errors into responses, so the logger can appropriately log them like in other instances.  Pick whichever ordering of middleware makes sense for your endpoints/application.

## Streaming responses
You may send a kefir or Baconjs stream (duck types to `onValue: (f: Function) -> ()`) as `body$` instead of `body` in the promise for the response descriptor, and it will consume the stream into the response body.

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
* **fileServer**: expects to run inside a router that provides the path completion (on context), root is provided during construction.
