# angstrom
A minimalist server thought experiment.

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
