const {serve} = require("../index");
const Promise = require("bluebird");

serve(() => Promise.resolve("hello world"), "localhost", 5000);
