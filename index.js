"use strict";

const url = require("url");
const http = require("http");
const https = require("https");
const qs = require("querystring");
const methods = ["PUT", "POST", "PATCH", "DELETE", "GET", "HEAD", "OPTIONS"];

var InvalidProtocolError = new Error("Invalid protocol");
InvalidProtocolError.code = "invalid_protocol";

var InvalidMethodError = new Error("Invalid method");
InvalidMethodError.code = "invalid_method";

class Request {
    constructor(method, urlStr) {
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

    headers(obj) {
        Object.assign(this.options.headers, obj);
        return this;
    }

    header(key, val) {
        this.options.headers[key] = val;
        return this;
    }

    options(obj) {
        Object.assign(this.options, obj);
        return this;
    }

    option(key, val) {
        this.options[key] = val;
        return this;
    }

    query(key, val) {
        if (typeof key == "object") {
            Object.assign(this.qs, key);
        } else {
            this.qs[key] = val;
        }

        return this;
    }

    start() {
        if (Object.keys(this.qs).length > 0) this.options.path = this.url.pathname + "?" + qs.stringify(this.qs);

        // protocol switch
        switch (this.url.protocol) {
            case "https:":
                this.options.port = this.url.port || 443;
                this.req = https.request(this.options);
                break;

            case "http:":
                this.options.port = this.url.port || 80;
                this.req = http.request(this.options);
                break;

            default:
                throw InvalidProtocolError;
                break;
        }

        return this;
    }

    write(body, encoding, callback) {
        this.req.write(body, encoding, callback);
        return this;
    }

    then(onFailure, onSuccess) {
        return this.perform().then(onFailure, onSuccess);
    }

    catch(onFailure) {
        return this.perform().catch(onFailure);
    }

    end() {
        return new Promise((resolve, reject) => {
          this.req.on("response", (res) => {
              this.res = res;
              var body = [];

              res.on("data", (chunk) => {
                  body.push(chunk);
              });

              res.on("end", () => {
                  resolve(Buffer.concat(body).toString(), res);
              });

              res.on("error", (e) => {
                  reject(e);
              });
          });

          this.req.end();
        });
    }

    send(body, encoding, callback) {
        return this.start().write(body, encoding, callback).end();
    }

    perform() {
        return this.start().end();
    }

    json(object) {
        const data = qs.stringify(object);
        return this.headers({"Content-Type": "x-www-form-urlencoded", "Content-Length": data.length}).send(data);
    }
}

class HTTP {}

methods.forEach((method) => {
    HTTP[method.toLowerCase()] = (urlStr) => {
        return new Request(method, urlStr);
    }
});

module.exports = HTTP;
