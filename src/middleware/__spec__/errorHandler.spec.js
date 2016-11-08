/*global describe, it*/
/*eslint no-unused-expressions: off*/
const {expect} = require("chai");
const {errorHandler: sut} = require("../index");
const Promise = require("bluebird");

describe("middleware: errorHandler", () => {
    const reporter = () => {};
    context("when no error occurs", () => {
        const app = () => Promise.resolve("success");
        it("should return a thenable", () => {
            sut(reporter, app, null)
                .then(s => {
                    expect(s).to.equal("success");
                });
        });
    });

    context("when an error occurs", () => {
        const app = () => {
            throw new Error("hello");
        };
        it("should not throw, but return a rejected promise", () => {
            expect(() => sut(reporter, app, null)).to.not.throw(Error);
            sut(reporter, app, null)
                .catch(e => {
                    expect(e.message).to.equal("hello");
                });
        });
    });
});
