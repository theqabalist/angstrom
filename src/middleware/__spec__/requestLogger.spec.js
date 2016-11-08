/*global describe, it*/
/*eslint no-unused-expressions: off*/
const {expect} = require("chai");
const {requestLogger: sut} = require("../index");
const {always} = require("ramda");
const {spy} = require("sinon");
const Promise = require("bluebird");
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

describe("middleware: requestLogger", () => {
    let reporter;
    const ctx = {req: {method: "GET", url: "/", connection: {remoteAddress: "remote"}}};

    beforeEach(() => {
        reporter = spy();
    });

    context("when a custom id generator is provided", () => {
        it("should log to a reporter", () => {
            sut({genId: always(1), reporter}, (ctx) => {
                ctx.log({msg: "hello"});
                return Promise.resolve({status: 200});
            }, ctx).then(() => {
                expect(reporter.calledThrice).to.be.true;
                expect(reporter.firstCall.args[0]).to.contain("REQUEST_START");
                expect(reporter.firstCall.args[0]).to.contain("req=1");
                expect(reporter.secondCall.args[0]).to.contain("REQUEST_LOG");
                expect(reporter.secondCall.args[0]).to.contain("msg=hello");
                expect(reporter.thirdCall.args[0]).to.contain("REQUEST_SERVICE");
                expect(reporter.thirdCall.args[0]).to.contain("status=200");
            });
        });
    });

    context("when a custom id generator is not provided", () => {
        it("should default to UUIDv4", () => {
            sut({reporter}, () => Promise.resolve({status: 200}), ctx)
                .then(() => {
                    expect(reporter.calledTwice).to.be.true;
                    expect(reporter.firstCall.args[0]).to.match(UUID_RE);
                    expect(reporter.secondCall.args[0]).to.match(UUID_RE);
                });
        });
    });
});
