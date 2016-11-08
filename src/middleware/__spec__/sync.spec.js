/*global describe, it*/
/*eslint no-unused-expressions: off*/
const {expect} = require("chai");
const {sync: sut} = require("../index");

describe("middleware: sync", () => {
    it("should allow you to pass back a synchronous value", () => {
        sut(() => ({status: 200}))(null)
            .then(r => {
                expect(r.status).to.equal(200);
            });
    });
});
