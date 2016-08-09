# node-es6-request
HTTP Request library written in ES6 for Node.js

## Installation
```
npm install es6-request --save
```

## API
Functions that return a new `Request` instance:
* `es6-request`.get(`url`)
* `es6-request`.put(`url`)
* `es6-request`.post(`url`)
* `es6-request`.head(`url`)
* `es6-request`.patch(`url`)
* `es6-request`.delete(`url`)
* `es6-request`.options(`url`)

##### `Request`.done(`callback`)

Removed. Use [Promise.prototype.then()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) instead. If `.then()` is called on `Request`, it will automatically `.perform()` the request first and return the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

##### `Request`.fail(`callback`)

Removed. Use [Promise.prototype.catch()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) instead. If `.catch()` is called on `Request`, it will automatically `.perform()` the request first and return the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

##### `Request`.query(`key`/`object`, `val`)

Can be called with only one object as argument, or two arguments (key and value). This function adds to the query string of the `url` or creates a new query string that will be added to the `url` before performing the reuqest.

##### `Request`.header(`key`, `val`)

Adds a header to the request by the name of `key` and the content of `val`.

##### `Request`.headers(`object`)

Adds headers from a key/value object.

##### `Request`.options(`object`)

Adds options from a key/value object to the Node.js HTTP [options](https://nodejs.org/api/http.html#http_new_agent_options).

##### `Request`.option(`key`, `val`)

Adds an option to the Node.js HTTP [options](https://nodejs.org/api/http.html#http_new_agent_options).

##### `Request`.json(`object`)

Translates the `object` into a key/value string and sends the request as `x-www-form-urlencoded`.

##### `Request`.write(`chunk`[, `encoding`][, `callback`])

You must run `Request`.start() before running this function. Directly writes to the request using [this](https://nodejs.org/api/http.html#http_request_write_chunk_encoding_callback) function from Node.js.

##### `Request`.send(`chunk`[, `encoding`][, `callback`])

Starts a request, then directly writes to the it using [this](https://nodejs.org/api/http.html#http_request_write_chunk_encoding_callback) function from Node.js, then ends the request.

##### `Request`.perform()

Performs the request without writing anything (starts and ends the request). Returns `Request.end()`.

##### `Request`.start()

Starts a request. After this function has been called, helper functions like `Request`.headers(), `Request`.header() and `Request`.query() will no longer work until the request has ended.

##### `Request`.end()

This function ends an already started request. It should only be called after using the `Request`.write() function on a PUT/POST/PATCH request. On other requests like GET/HEAD/DELETE/OPTIONS you should use [Request.prototype.perform()](#requestperform). This function returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

## Usage

#### Simple GET Request
```javascript
const http = require("es6-request");

// you can exchange "get" with "head", "delete" or "options" here
// they all have the exact same API
http.get("https://raw.githubusercontent.com/alexrsagen/node-es6-request/master/README.md")
.then((body) => {
    console.log(body);
    // should output this README file!
});
```

#### POST Request
The following example will send a x-www-form-urlencoded request to the server containing keys and values from the json object.
```javascript
const http = require("es6-request");

// you can exchange "post" with either "put" or "patch" here
// they all have the exact same API
http.post("http://api.somewebsite.com/endpoint")
.json({somekey: "somevalue"})
.then((body) => {
    // ...
});
```
This example will send a raw string to the server.
```javascript
const http = require("es6-request");

// you can exchange "post" with either "put" or "patch" here
// they all have the exact same API
http.post("http://api.somewebsite.com/endpoint")
.send("i am a string, i will be sent to the server with a POST request.")
.then((body) => {
    // ...
});
```

#### Query string
This works the same way with any other request type.
```javascript
const http = require("es6-request");

// sends a GET request to http://api.somewebsite.com/endpoint?this=that&one=two&three=four
http.get("http://api.somewebsite.com/endpoint")
.query("this", "that")
.query({
    "one": "two",
    "three": "four"
})
.then((body) => {
    // ...
});
```

##### Headers
```javascript
const http = require("es6-request");

// Sends a GET request with these headers:
// {
//     "Accept": "application/json",
//     "Header-Name": "header value",
//     "Another-Header": "another value"
// }
http.get("http://api.somewebsite.com/endpoint");
.header("Accept", "application/json")
.headers({
    "Header-Name": "header value",
    "Another-Header": "another value"
})
.then((body, res) => {
    console.log(res.headers);
    // ...
});
```
