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

If the request has not already been performed, this function will perform the request. When the request is finished without error, `callback` is called with `res` and `body`.

`res` is an object containing many things returned from the server, such as headers.

`body` is a [Buffer](https://nodejs.org/api/buffer.html) containing the response from the server

##### `Request`.fail(`callback`)

If the request has not already been performed, this function will perform the request. When the request encounters an error, `callback` will be called with that error.

##### `Request`.query(`key`/`object`, `val`)

Can be called with only one object as argument, or two arguments (key and value). This function adds to the query string of the `url` or creates a new query string that will be added to the `url` before performing the reuqest.

##### `Request`.header(`key`, `val`)

Adds a header to the request by the name of `key` and the content of `val`.

##### `Request`.headers(`object`)

Adds headers from a key/value object.

##### `Request`.json(`object`)

Translates the `object` into a key/value string and sends the request as `x-www-form-urlencoded`.

##### `Request`.write(`chunk`[, `encoding`][, `callback`])

Directly writes to the request using [this](https://nodejs.org/api/http.html#http_request_write_chunk_encoding_callback) function from Node.js.

##### `Request`.send(`chunk`)

Directly writes to the request using [this](https://nodejs.org/api/http.html#http_request_write_chunk_encoding_callback) function from Node.js, then ends the request.

##### `Request`.perform()

Performs the request without writing anything. This function is automatically called by `Request`.done() and `Request`.fail().

## Usage

#### Simple GET Request
```javascript
var http = require("es6-request");

// you can exchange "get" with "head", "delete" or "options" here
// they all have the exact same API
http.get("https://raw.githubusercontent.com/alexrsagen/node-es6-request/master/README.md")
.done((response, body) => {
    console.log(body.toString());
    // should output this README file!
});
```

#### POST Request
The following example will send a x-www-form-urlencoded request to the server containing keys and values from the json object.
```javascript
var http = require("es6-request");

// you can exchange "post" with either "put" or "patch" here
// they all have the exact same API
http.post("http://api.somewebsite.com/endpoint")
.json({somekey: "somevalue"})
.done((response, body) => {
    // ...
});
```
This example will send a raw string to the server.
```javascript
var http = require("es6-request");

// you can exchange "post" with either "put" or "patch" here
// they all have the exact same API
http.post("http://api.somewebsite.com/endpoint")
.send("i am a string, i will be sent to the server with a POST request.")
.done((response, body) => {
    // ...
});
```

#### Query string
This works the same way with any other request type.
```javascript
var http = require("es6-request");

// sends a GET request to http://api.somewebsite.com/endpoint?this=that&one=two&three=four
http.get("http://api.somewebsite.com/endpoint")
.query("this", "that")
.query({
    "one": "two",
    "three": "four"
})
.done((response, body) => {
    // ...
});
```

##### Headers
```javascript
var http = require("es6-request");

// Sends a GET request with these headers:
// {
//     "Accept": "application/json",
//     "Header-Name": "header value",
//     "Another-Header": "another value"
// }
http.get("http://api.somewebsite.com/endpoint")
.header("Accept", "application/json")
.headers({
    "Header-Name": "header value",
    "Another-Header": "another value"
})
.done((response, body) => {
    // ...
});
```