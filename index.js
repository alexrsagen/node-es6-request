"use strict";

const url = require("url");
const http = require("http");
const https = require("https");
const crypto = require("crypto");
const util = require("util");
const path = require("path");
const qs = require("querystring");
const stream = require("stream");
const methods = ["PUT", "POST", "PATCH", "DELETE", "GET", "HEAD", "OPTIONS"];
const writeMethods = ["PUT", "POST", "PATCH"];
const mime = require("./mime.json");

var InvalidProtocolError = new Error("Invalid protocol");
InvalidProtocolError.code = "invalid_protocol";

var InvalidMethodError = new Error("Invalid method");
InvalidMethodError.code = "invalid_method";

var WriteOnReadOnlyMethodError = new Error("Write on read-only method");
WriteOnReadOnlyMethodError.code = "write_on_read_method";

class ES6Request extends stream.Duplex {
    constructor(method, urlStr, options) {
        // validate arguments
        if (typeof method !== "string") {
            throw new TypeError("Invalid type for argument \"method\"");
        }
        if (!methods.includes(method)) {
            throw InvalidMethodError;
        }
        if (typeof urlStr !== "string") {
            throw new TypeError("Invalid type for argument \"urlStr\"");
        }
        if (typeof options !== "undefined" && options !== undefined &&
            (typeof options !== "object" || Array.isArray(options))) {
            throw new TypeError("Invalid type for argument \"options\"");
        }

        // initialize duplex stream
        super();

        // parse url string
        this.url = url.parse(urlStr);

        // create base options object
        this._options = Object.assign({
            hostname: this.url.hostname,
            path: this.url.pathname,
            method: method,
            headers: {},
            custom: {
                bodyAsBuffer: false
            }
        }, options);

        this.qs = qs.parse(this.url.query) || {};

        return this;
    }
    
    headers(obj) {
        // validate arguments
        if (typeof obj !== "object" || Array.isArray(obj)) {
            throw new TypeError("Invalid type for argument \"obj\"");
        }

        Object.assign(this._options.headers, obj);
        return this;
    }
    
    header(key, value) {
        // validate arguments
        if (typeof key !== "string") {
            throw new TypeError("Invalid type for argument \"key\"");
        }
        if (typeof value !== "number" && typeof value !== "string" && (typeof value !== "object" && Array.isArray(value)) && typeof value !== "undefined") {
            throw new TypeError("Invalid type for argument \"value\"");
        }

        this._options.headers[key] = value;
        return this;
    }
    
    authBasic(username, password) {
        // validate arguments
        if (typeof username !== "string") {
            throw new TypeError("Invalid type for argument \"username\"");
        }
        if (typeof password !== "string") {
            throw new TypeError("Invalid type for argument \"password\"");
        }

        return this.header("Authorization", "Basic " + Buffer.from(username + ":" + password, "utf8").toString("base64"));
    }
    
    authBearer(bearer) {
        // validate arguments
        if (typeof bearer !== "string") {
            throw new TypeError("Invalid type for argument \"bearer\"");
        }

        return this.header("Authorization", "Bearer " + bearer);
    }
    
    options(obj) {
        // validate arguments
        if (typeof obj !== "object" || Array.isArray(obj)) {
            throw new TypeError("Invalid type for argument \"obj\"");
        }

        Object.assign(this._options, obj);
        return this;
    }

    option(key, value) {
        // validate arguments
        if (typeof key !== "string") {
            throw new TypeError("Invalid type for argument \"key\"");
        }

        this._options[key] = value;
        return this;
    }
    
    query(key, value) {
        // validate arguments
        if (typeof key !== "string") {
            throw new TypeError("Invalid type for argument \"key\"");
        }
        if (typeof value !== "string") {
            throw new TypeError("Invalid type for argument \"value\"");
        }

        if (Object(key) == key) {
            Object.assign(this.qs, key);
        } else {
            this.qs[key] = value;
        }

        return this;
    }
    
    start() {
        if (this._started) return this;

        if (Object.keys(this.qs).length > 0) this._options.path = this.url.pathname + "?" + qs.stringify(this.qs);

        // protocol switch
        switch (this.url.protocol) {
            case "https:":
            this._options.port = this.url.port || 443;
            this.req = https.request(this._options);
            this._started = true;
            break;

            case "http:":
            this._options.port = this.url.port || 80;
            this.req = http.request(this._options);
            this._started = true;
            break;

            default:
            throw InvalidProtocolError;
            break;
        }

        return this;
    }

    then(onSuccess, onFailure) {
        // validate arguments
        if (typeof onSuccess !== "undefined" &&
            onSuccess !== undefined &&
            typeof onSuccess !== "function") {
            throw new TypeError("Invalid type for argument \"onSuccess\"");
        }
        if (typeof onFailure !== "undefined" &&
            onFailure !== undefined &&
            typeof onFailure !== "function") {
            throw new TypeError("Invalid type for argument \"onFailure\"");
        }

        return this.perform().then(onSuccess, onFailure);
    }

    catch (onFailure) {
        // validate arguments
        if (typeof onFailure !== "undefined" &&
            onFailure !== undefined &&
            typeof onFailure !== "function") {
            throw new TypeError("Invalid type for argument \"onFailure\"");
        }

        return this.perform().catch(onFailure);
    }

    _destroy() {
        this._active = false;
        this._started = false;
        this.req = null;
        this.body = [];
    }

    perform() {
        return new Promise((resolve, reject) => {
            if (!this._started) {
                this.start();
            }

            this._active = true;

            this.req.on("error", e => {
                this.emit("error", e);
                this.destroy();
                reject(e);
            });

            this.req.on("response", res => {
                this.body = [];
                const responseLength = parseInt(res.headers['content-length']);
                let curLength = 0;

                res.on("data", chunk => {
                    this.emit("data", chunk);
                    this.body.push(chunk);
                    if (!isNaN(responseLength)) {
                        curLength += chunk.byteLength;
                        this.emit("progress", curLength / responseLength);
                    }
                });
                
                res.on("end", () => {
                    this.emit("end");

                    if (this._options.custom.bodyAsBuffer) {
                        resolve([Buffer.concat(this.body), res]);
                    } else {
                        resolve([Buffer.concat(this.body).toString(), res]);
                    }

                    this.destroy();
                    this.emit("close");
                });

                res.on("error", e => {
                    this.emit("error", e);
                    this.destroy();
                    reject(e);
                });
            });

            this.req.end();
        });
    }

    write(chunk, encoding, callback) {
        // validate arguments
        if (typeof chunk !== "string" && !(typeof chunk === "object" && (chunk instanceof Buffer))) {
            throw new TypeError("Invalid type for argument \"chunk\"");
        }
        if (typeof encoding !== "undefined" && encoding !== undefined && typeof encoding !== "string") {
            throw new TypeError("Invalid type for argument \"encoding\"");
        }
        if (typeof callback !== "undefined" && callback !== undefined && typeof callback !== "function") {
            throw new TypeError("Invalid type for argument \"callback\"");
        }

        if (!writeMethods.includes(this._options.method)) {
            throw WriteOnReadOnlyMethodError;
        }

        if (!this._started) {
            this.start();
        }

        this.req.write(chunk, encoding, callback);
        return this;
    }

    pipe(dest, opt) {
        // validate arguments
        if (typeof dest !== "object" || !(dest instanceof stream.Writable)) {
            throw new TypeError("Invalid type for argument \"dest\"");
        }
        if (typeof opt !== "undefined" && opt !== undefined && typeof opt !== "object" || Array.isArray(opt)) {
            throw new TypeError("Invalid type for argument \"opt\"");
        }

        stream.Duplex.prototype.pipe.call(this, dest, opt);
        this._readStreamEnabled = true;
        return this;
    }

    _read(size) {}
    _write(chunk, encoding, callback) {
        // validate arguments
        if (typeof chunk !== "string" && !(typeof chunk === "object" && (chunk instanceof Buffer))) {
            throw new TypeError("Invalid type for argument \"chunk\"");
        }
        if (typeof encoding !== "undefined" && encoding !== undefined && typeof encoding !== "string") {
            throw new TypeError("Invalid type for argument \"encoding\"");
        }
        if (typeof callback !== "undefined" && callback !== undefined && typeof callback !== "function") {
            throw new TypeError("Invalid type for argument \"callback\"");
        }

        return this.write(chunk, encoding, callback);
    }

    send(body, encoding, callback) {
        // validate arguments
        if (typeof body !== "string" && !(typeof body === "object" && (body instanceof Buffer))) {
            throw new TypeError("Invalid type for argument \"body\"");
        }
        if (typeof encoding !== "undefined" && encoding !== undefined && typeof encoding !== "string") {
            throw new TypeError("Invalid type for argument \"encoding\"");
        }
        if (typeof callback !== "undefined" && callback !== undefined && typeof callback !== "function") {
            throw new TypeError("Invalid type for argument \"callback\"");
        }

        return this.write(body, encoding, callback).perform();
    }

    sendForm(form) {
        if (typeof form !== "object" || Array.isArray(form)) {
            throw new TypeError("Invalid type for argument \"form\"");
        }

        const body = Buffer.from(qs.stringify(form), "utf8");

        return this.headers({
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": body.byteLength
        }).send(body);
    }

    sendMultipart(form, files, filesFieldNameFormat, encoding) {
        if (typeof form !== "undefined" && form !== undefined && typeof form !== "object") {
            throw new TypeError("Invalid type for argument \"form\"");
        }
        if (typeof files !== "undefined" && files !== undefined && typeof files !== "object") {
            throw new TypeError("Invalid type for argument \"files\"");
        }
        if (typeof filesFieldNameFormat !== "undefined" && filesFieldNameFormat !== undefined &&
            typeof filesFieldNameFormat !== "string") {
            throw new TypeError("Invalid type for argument \"filesFieldNameFormat\"");
        }
        if (typeof encoding !== "undefined" && encoding !== undefined &&
            (typeof encoding !== "string" || !["base64", "BASE64", "utf8", "UTF8", "utf-8", "UTF-8"].includes(encoding))) {
            throw new TypeError("Invalid type for argument \"encoding\"");
        }

        // define default file field name
        filesFieldNameFormat = filesFieldNameFormat || "files[%i]";

        // define default encoding
        encoding = encoding || "utf8";
        const transferEncoding = (["utf8", "utf-8", "UTF8", "UTF-8"].includes(encoding) ? "default" : encoding);

        // generate random multipart form boundary
        const boundary = "--------------------------" + crypto.randomBytes(6).toString("hex");
        let body = Buffer.alloc(0);

        // build multipart form body
        if (form != null) {
            Object.keys(form).forEach(fieldName => {
                if (typeof fieldName !== "string") {
                    throw new Error("Field name is not a string");
                }

                let headers = "--" + boundary + "\r\n";
                if (transferEncoding != "default") {
                    headers += "MIME-Version: 1.0\r\n";
                    headers += "Content-Transfer-Encoding: " + transferEncoding + "\r\n";
                }
                headers += "Content-Disposition: form-data; name=\"" +
                encodeURIComponent(fieldName) + "\"\r\n\r\n";

                body = Buffer.concat([
                    body,
                    Buffer.from(headers, "utf8"),
                    transferEncoding != "default" ?
                    Buffer.from(Buffer.from(form[fieldName]).toString(encoding), "utf8") :
                    Buffer.from(form[fieldName]),
                    Buffer.from("\r\n", "utf8")
                ]);
            });
        }

        // build multipart form body
        if (files != null) {
            Object.keys(files).forEach((fileName, fileIndex) => {
                if (typeof fileName !== "string") {
                    throw new Error("File name is not a string");
                }

                const fileExt = path.extname(fileName).toLowerCase();
                const mimeType = mime.hasOwnProperty(fileExt) ? mime[fileExt] : "application/octet-stream";

                let headers = "--" + boundary + "\r\n";
                if (transferEncoding != "default") {
                    headers += "MIME-Version: 1.0\r\n";
                    headers += "Content-Transfer-Encoding: " + transferEncoding + "\r\n";
                }
                headers += "Content-Type: " + mimeType + "; charset=utf-8\r\n";
                headers += "Content-Disposition: form-data; name=\"" +
                encodeURIComponent((
                    filesFieldNameFormat.includes("%") ? 
                    util.format(filesFieldNameFormat, fileIndex) : 
                    filesFieldNameFormat
                )) + "\"; filename=\"" + encodeURIComponent(fileName) + "\"\r\n\r\n";

                body = Buffer.concat([
                    body,
                    Buffer.from(headers, "utf8"),
                    transferEncoding != "default" ?
                    Buffer.from(Buffer.from(files[fileName]).toString(encoding), "utf8") :
                    Buffer.from(files[fileName]),
                    Buffer.from("\r\n", "utf8")
                ]);
            });
        }

        // append final multipart form boundary
        body = Buffer.concat([
            body,
            Buffer.from("--" + boundary + "--", "utf8")
        ]);

        return this.headers({
            "Content-Type": "multipart/form-data; boundary=" + boundary,
            "Content-Length": body.byteLength
        }).send(body);
    }

    sendJSON(data) {
        const body = Buffer.from(JSON.stringify(data), "utf8");

        return this.headers({
            "Content-Type": "application/json",
            "Content-Length": body.byteLength
        }).send(body);
    }
}

class ES6RequestMethods {}

methods.forEach(method => {
    ES6RequestMethods[method.toLowerCase()] = (urlStr, options) => {
        return new ES6Request(method, urlStr, options);
    }
});

ES6RequestMethods.Errors = {};
ES6RequestMethods.Errors.InvalidProtocol = InvalidProtocolError;
ES6RequestMethods.Errors.InvalidMethod = InvalidMethodError;
ES6RequestMethods.Errors.WriteOnReadOnlyMethod = WriteOnReadOnlyMethodError;

module.exports = ES6RequestMethods;
