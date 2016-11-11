/*global describe, it*/
const {expect} = require("chai");
const r = require("../router");
const {compile, get} = r;
const Promise = require("bluebird");
const {partialRight} = require("ramda");
const parseHex = partialRight(parseInt, [16]);

function buildBasicMethodTest(method) {
    return () => {
        let req = null;
        before(() => {
            req = {
                method: method.toUpperCase(),
                url: "/hello"
            };
        });

        it(`should match ${method.toUpperCase()} requests`, () => {
            const router = compile(r[method]("^/hel", {}, () => Promise.resolve({status: 200})));
            router({req}).then(res => {
                expect(res.status).to.equal(200);
            });
        });
    };
}

describe("router", () => {
    ["get", "post", "put", "patch", "delete"].forEach(item => {
        describe(`basic ${item} request`, buildBasicMethodTest(item));
    });

    describe("extracting route params", () => {
        it("should allow you to assign parsing functions and names to route params", () => {
            const req = {
                method: "GET",
                url: "/hello/deadbeef/brandon"
            };

            const router = compile(
                get("^/hello/([0-9a-fA-F]+)/brandon",
                    {id: parseHex},
                    (ctx) => Promise.resolve({body: ctx.params.id.toString()}))
            );
            router({req}).then(res => {
                expect(res.body).to.equal("3735928559");
            });
        });
    });

    describe("route ordering", () => {
        it("should match top to bottom", () => {
            const req = {
                method: "GET",
                url: "/hello"
            };

            const router = compile(
                get("^/hel", {}, () => Promise.resolve({body: "got hel"})),
                get("^/hello", {}, () => Promise.resolve({body: "got hello"}))
            );

            router({req}).then(res => {
                expect(res.body).to.equal("got hel");
            });
        });
    });

    describe("no match found", () => {
        it("should return 404", () => {
            const router = compile(
                get("^/hello", {}, () => Promise.resolve())
            );
            router({req: {method: "GET", url: "/"}}).then(res => {
                expect(res.status).to.equal(404);
            });
        });
    });
});
