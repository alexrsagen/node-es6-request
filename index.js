"use strict";

const url = require("url");
const http = require("http");
const https = require("https");
const qs = require("querystring");
const EventEmitter = require('events');
const extend = require("util")._extend;
const methods = ["PUT", "POST", "PATCH", "DELETE", "GET", "HEAD", "OPTIONS"];

var InvalidProtocolError = new Error("Invalid protocol");
InvalidProtocolError.code = "invalid_protocol";

var InvalidMethodError = new Error("Invalid method");
InvalidMethodError.code = "invalid_method";

class Request extends EventEmitter {
    constructor(method, urlStr) {
        super();

        // parse url string
        this.url = url.parse(urlStr);

        // create base options object
        this.options = {
            hostname: this.url.host,
            path: this.url.pathname,
            method: method,
            headers: {}
        };

        this.qs = qs.parse(this.url.query) || {};

        // validate method
        if (methods.indexOf(this.options.method) == -1) {
            throw InvalidMethodError;
        }

        return this;
    }

    // response handler
    _res(res) {
        this.res = res;

        var body = [];
        res.on("data", (chunk) => {
            body.push(chunk);
        });

        res.on("end", () => {
            this.body = Buffer.concat(body);
            this.emit("done", this.res, this.body);
        });
    }

    headers(obj) {
        extend(this.options.headers, obj);
        return this;
    }

    header(key, val) {
        this.options.headers[key] = val;
        return this;
    }

    query(key, val) {
        if (typeof key == "object") {
            extend(this.qs, key);
        } else {
            this.qs[key] = val;
        }

        return this;
    }

    done(callback) {
        if (!this.res) this.perform();
        if (this.body) return callback(this.res, this.body);
        return this.on("done", callback);
    }

    fail(callback) {
        if (!this.res) this.perform();
        if (this.error) return callback(this.error);
        return this.on("fail", callback);
    }

    start() {
        if (Object.keys(this.qs).length > 0) this.options.path = this.url.pathname + "?" + qs.stringify(this.qs);

        // protocol switch
        switch (this.url.protocol) {
            case "https:":
                this.options.port = this.url.port || 443;
                var req = https.request(this.options, (res) => this._res(res));
                break;

            case "http:":
                this.options.port = this.url.port || 80;
                var req = http.request(this.options, (res) => this._res(res));
                break;

            default:
                throw InvalidProtocolError;
                break;
        }

        req.on("error", (e) => {
            this.error = e;
            this.emit("fail", e);
        });

        this.req = req;
        return this;
    }

    write(body, encoding, callback) {
        this.req.write(body, encoding, callback);
        return this;
    }

    end() {
        this.req.end();
        return this;
    }

    send(body, encoding, callback) {
        return this.start().write(body, encoding, callback).end();
    }

    perform() {
        return this.start().end();
    }

    json(object) {
        const data = new Buffer(JSON.stringify(object));
        return this.headers({"Content-Type": "application/json", "Content-Length": data.byteLength}).send(data);
    }
}

class HTTP {}

methods.forEach((method) => {
    HTTP[method.toLowerCase()] = (urlStr) => {
        return new Request(method, urlStr);
    }
});

module.exports = HTTP;