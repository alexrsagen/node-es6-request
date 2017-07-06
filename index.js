"use strict";

const url = require("url");
const http = require("http");
const https = require("https");
const crypto = require("crypto");
const util = require("util");
const qs = require("querystring");
const {Duplex} = require("stream");
const methods = ["PUT", "POST", "PATCH", "DELETE", "GET", "HEAD", "OPTIONS"];
const writeMethods = ["PUT", "POST", "PATCH"];

var InvalidProtocolError = new Error("Invalid protocol");
InvalidProtocolError.code = "invalid_protocol";

var InvalidMethodError = new Error("Invalid method");
InvalidMethodError.code = "invalid_method";

var WriteOnReadOnlyMethodError = new Error("Write on read-only method");
WriteOnReadOnlyMethodError.code = "write_on_read_method";

class Request extends Duplex {
  constructor(method, urlStr, options) {
    // initialize duplex stream
    super();

    // parse url string
    this.url = url.parse(urlStr);

    // create base options object
    this.options = Object.assign({
      hostname: this.url.hostname,
      path: this.url.pathname,
      method: method,
      headers: {},
      custom: {
        bodyAsBuffer: false,
        getProgress: false
      }
    }, options);

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

  header(key, value) {
    this.options.headers[key] = value;
    return this;
  }

  authBasic(username, password) {
    return this.header("Authorization", "Basic " + Buffer.from(String(username) + ":" + String(password), "utf8").toString("base64"));
  }

  authBearer(bearer) {
    return this.header("Authorization", "Bearer " + String(bearer));
  }

  options(obj) {
    Object.assign(this.options, obj);
    return this;
  }

  option(key, value) {
    this.options[key] = value;
    return this;
  }

  query(key, value) {
    if (Object(key) == key) {
      Object.assign(this.qs, key);
    } else {
      this.qs[key] = value;
    }

    return this;
  }

  start() {
    if (this._started) return this;

    if (Object.keys(this.qs).length > 0) this.options.path = this.url.pathname + "?" + qs.stringify(this.qs);

    // protocol switch
    switch (this.url.protocol) {
      case "https:":
        this.options.port = this.url.port || 443;
        this.req = https.request(this.options);
        this._started = true;
        break;

      case "http:":
        this.options.port = this.url.port || 80;
        this.req = http.request(this.options);
        this._started = true;
        break;

      default:
        throw InvalidProtocolError;
        break;
    }

    return this;
  }

  then(onSuccess, onFailure) {
    return this.perform().then(onSuccess, onFailure);
  }

  catch(onFailure) {
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
        this.destroy();
        reject(e);
      });

      this.req.on("response", res => {
        this.body = [];
        const responseLength = parseInt(res.headers['content-length']);
        let curLength = 0;

        res.on("data", chunk => {
          this.push(chunk);
          this.emit("readable");

          this.body.push(chunk);
          this.emit("data", chunk);
          if (this.options.custom.getProgress && !isNaN(responseLength)) {
            curLength += chunk.byteLength;
            this.emit("progress", curLength / responseLength);
          }
        });

        res.on("end", () => {
          this.push(null);
          this.emit("end");

          if (this.options.custom.bodyAsBuffer) {
            resolve([Buffer.concat(this.body), res]);
          } else {
            resolve([Buffer.concat(this.body).toString(), res]);
          }

          this.destroy();
          this.emit("close");
        });

        res.on("error", e => {
          this.destroy();
          reject(e);
        });
      });

      this.req.end();
    });
  }

  write(chunk, encoding, callback) {
    if (!writeMethods.includes(this.options.method)) {
      throw WriteOnReadOnlyMethodError;
    }

    if (!this._started) {
      this.start();
    }

    this.req.write(chunk, encoding, callback);
    return this;
  }

  pipe(dest, opt) {
    Duplex.prototype.pipe.call(this, dest, opt);
    return this;
  }

  _read(size) {}
  _write(chunk, encoding, callback) {
    return this.write(chunk, encoding, callback);
  }

  send(body, encoding, callback) {
    return this.write(body, encoding, callback).perform();
  }

  sendForm(form) {
    if (Object(form) !== form) {
      throw new Error("Argument passed to sendForm is not an object");
    }

    const body = qs.stringify(form);

    return this.headers({
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": body.length
    }).send(body);
  }

  sendMultipart(form, files, filesFieldNameFormat) {
    if (form != null && Object(form) !== form) {
      throw new Error("First argument (form) passed to sendMultipart is not an object");
    }
    if (files != null && Object(files) !== files) {
      throw new Error("Second argument (files) passed to sendMultipart is not an object");
    }

    // define default file field name
    filesFieldNameFormat = filesFieldNameFormat || "files[%i]";

    // generate random multipart form boundary
    const boundary = "----------------------------" + crypto.randomBytes(6).toString("hex");
    let body = "";

    // build multipart form body
    if (form != null) {
      Object.keys(form).forEach(fieldName => {
        if (typeof fieldName !== "string") {
          throw new Error("Field name is not a string");
        }

        body += boundary + "\n";
        body += "MIME-Version: 1.0\n";
        body += "Content-Transfer-Encoding: base64\n";
        body += "Content-Disposition: form-data; name=" + JSON.stringify(fieldName) + "\n\n";
        body += Buffer.from(form[fieldName]).toString("base64") + "\n";
      });
    }

    // build multipart form body
    if (files != null) {
      Object.keys(files).forEach((fileName, fileIndex) => {
        if (typeof fileName !== "string") {
          throw new Error("File name is not a string");
        }

        body += boundary + "\n";
        body += "MIME-Version: 1.0\n";
        body += "Content-Transfer-Encoding: base64\n";
        body += "Content-Disposition: form-data; name=" + JSON.stringify(util.format(filesFieldNameFormat, fileIndex)) + "; filename=" + JSON.stringify(fileName) + "\n\n";
        body += Buffer.from(files[fileName]).toString("base64") + "\n";
      });
    }

    // append final multipart form boundary
    body += boundary + "--";

    return this.headers({
      "Content-Type": "multipart/form-data; boundary=" + boundary,
      "Content-Length": body.length
    }).send(body);
  }

  sendJSON(data) {
    const body = JSON.stringify(data);

    return this.headers({
      "Content-Type": "application/json",
      "Content-Length": data.length
    }).send(body);
  }
}

class HTTP {}

methods.forEach(method => {
  HTTP[method.toLowerCase()] = (urlStr, options) => {
    return new Request(method, urlStr, options);
  }
});

module.exports = HTTP;
