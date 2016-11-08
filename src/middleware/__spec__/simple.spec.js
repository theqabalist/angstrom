/*global describe, it*/
/*eslint no-unused-expressions: off*/
const {expect} = require("chai");
const {simple: sut} = require("../index");
const Promise = require("bluebird");

describe("middleware: simple", () => {
    it("should allow you to pass back a string instead of descriptor", () => {
        sut(() => Promise.resolve("hello world"))(null)
            .then(r => {
                expect(r.status).to.equal(200);
                expect(r.body).to.equal("hello world");
            });
    });
});
