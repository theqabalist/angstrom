/*global describe, it*/
/*eslint no-unused-expressions: off*/
const {expect} = require("chai");
const sut = require("../jsonApi");
const Promise = require("bluebird");
const {Readable} = require("stream");

describe("middleware: jsonApi", () => {
    context("when request is missing content-type, but has body", () => {
        const headers = {"content-length": 5};
        it("should return bad request", () => {
            sut(() => Promise.resolve({status: 200}), {req: {headers}})
                .then(res => {
                    expect(res.status).to.equal(400);
                });
        });
    });

    context("when request has the wrong content-type, and a body", () => {
        const headers = {
            "content-length": 5,
            "content-type": "text/plain"
        };
        it("should return bad request", () => {
            sut(() => Promise.resolve({status: 200}), {req: {headers}})
                .then(res => {
                    expect(res.status).to.equal(400);
                });
        });
    });

    context("when request has no body", () => {
        it("should run the app with no body handler", () => {
            sut(() => Promise.resolve({status: 200}), {req: {headers: {}}})
                .then(res => {
                    expect(res.status).to.equal(200);
                });
        });
    });

    context("when request has a body, and correct content-type", () => {
        const req = new Readable();
        req._read = () => {};
        req.push("{\"hello\": \"goodbye\"}");
        req.headers = {
            "content-type": "application/json",
            "content-length": 20
        };
        it("should provide the body parsed as json synchronously to the handler", () => {
            sut((ctx) => Promise.resolve({status: 200, body: {yo: ctx.body.hello}}), {req})
                .then(res => {
                    expect(res.status).to.equal(200);
                    console.log(res);
                    expect(JSON.parse(res.body).yo).to.equal("goodbye");
                    expect(res.headers["Content-Type"]).to.equal("application/json");
                });
        });
    });
});
