const {serve} = require("../index");
const Promise = require("bluebird");

serve(() => new Promise((resolve) => setTimeout(() => resolve("hello world"), 2000)), "localhost", "5000");
