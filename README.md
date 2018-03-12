# node-es6-request
HTTP Request library written in ES6 for Node.js. Now with TypeScript definitions!

**Warning! Only supports Node.js >=8.0.0** (See "Added in" [here](https://nodejs.org/api/stream.html#stream_writable_destroy_error))

## Installation
```
npm i es6-request
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

##### `Request`

##### `Request`.query(`key`, `value`)

Alternatively, **`Request`.query(`object`)**

* `key` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Query string key
* `value` &lt;any&gt; Query string value
* `object` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Query string key/value object

This function adds to the query string of the `url` or creates a new query string that will be added to the `url` before performing the reuqest.

Returns `Request`

##### `Request`.header(`key`, `value`)

Alternatively, **`Request`.headers(`object`)**

* `key` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Header name
* `value` &lt;any&gt; Header value
* `object` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Header key/value object

Adds a header to the request by the name of `key` and the content of `val` or adds the key/value headers from `object`.

Returns `Request`

##### `Request`.authBasic(`username`, `password`)

* `username` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Username
* `password` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Password

Adds an `Authorization: Basic <token>` header to your request.

Returns `Request`

##### `Request`.authBearer(`bearer`)

* `bearer` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Bearer token

Adds an `Authorization: Bearer <bearer>` header to your request.

Adds options from a key/value object to the Node.js HTTP [options](https://nodejs.org/api/http.html#http_new_agent_options).

Returns `Request`

##### `Request`.option(`key`, `value`)

Alternatively, **`Request`.options(`object`)**

* `key` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Option name
* `value` &lt;any&gt; Option value
* `object` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Option key/value object

Adds an option or a key/value object of options to the Node.js HTTP [options](https://nodejs.org/api/http.html#http_new_agent_options).

Returns `Request`

##### `Request`.sendForm(`form`)

* `form` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Form key/value object

Transforms the `form` object into a querystring and sends the request as `application/x-www-form-urlencoded`.

Returns a [&lt;Promise&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

##### `Request`.sendMultipart([`form`][, `files`][, `filesFieldNameFormat`][, `encoding`])

* `form` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Form key/value object (field name/contents)
* `files` [&lt;Object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Files key/value object (filename/contents)
* `filesFieldNameFormat`[&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Multipart file field name (defaults to `files[%i]`)
* `encoding` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Multipart entity Content-Transfer-Encoding (defaults to `utf8`)

Transforms the `form` and `files` into multipart form fields and sends the request as `multipart/form-data`.

Returns a [&lt;Promise&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

##### `Request`.sendJSON(`data`)

* `data` &lt;any&gt; Data that will be transformed into JSON

Transforms the `data` into a JSON string and sends the request as `application/json`.

Returns a [&lt;Promise&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

##### `Request`.write(`chunk`[, `encoding`][, `callback`])

* `chunk` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) | [&lt;Buffer&gt;](https://nodejs.org/api/buffer.html#buffer_class_buffer)
* `encoding` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

You must run `Request`.start() before running this function. Directly writes to the request using [this](https://nodejs.org/api/http.html#http_request_write_chunk_encoding_callback) function from Node.js.

Returns `Request`

##### `Request`.send(`chunk`[, `encoding`][, `callback`])

* `chunk` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) | [&lt;Buffer&gt;](https://nodejs.org/api/buffer.html#buffer_class_buffer)
* `encoding` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

Starts a request, then directly writes to the it using [this](https://nodejs.org/api/http.html#http_request_write_chunk_encoding_callback) function from Node.js, then performs the request.

Returns a [&lt;Promise&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

##### `Request`.start()

Starts a request. After this function has been called, helper functions like `Request`.headers(), `Request`.header() and `Request`.query() will no longer work until the request has ended.

Returns `Request`

##### `Request`.pipe(`destination`)

Starts the request if it is not already started. Pipes the response chunks to the destination stream using [this](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options) function from Node.js, then performs the request.

Returns `Request`

##### `Request`.perform()

This function ends a request. It is called by other functions like [Request.send()](#requestsend) and [Request.pipe()](#requestpipe).

Returns a [&lt;Promise&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## Usage

#### Simple GET Request
```javascript
const request = require("es6-request");

// you can exchange "get" with "head", "delete" or "options" here
// they all have the exact same API
request.get("https://raw.githubusercontent.com/alexrsagen/node-es6-request/master/README.md")
.then(([body, res]) => {
    console.log(body);
    // should output this README file!
});
```

#### POST Request
The following example will send a x-www-form-urlencoded request to the server containing keys and values from the json object.
```javascript
const request = require("es6-request");

// you can exchange "post" with either "put" or "patch" here
// they all have the exact same API
request.post("http://api.somewebsite.com/endpoint")
.sendForm({
  somekey: "somevalue"
})
.then(([body, res]) => {
    // ...
});
```
This example will send a raw string to the server.
```javascript
const request = require("es6-request");

// you can exchange "post" with either "put" or "patch" here
// they all have the exact same API
request.post("http://api.somewebsite.com/endpoint")
.send("i am a string, i will be sent to the server with a POST request.")
.then(([body, res]) => {
    // ...
});
```

#### Query string
This works the same way with any other request type.
```javascript
const request = require("es6-request");

// sends a GET request to http://api.somewebsite.com/endpoint?this=that&one=two&three=four
request.get("http://api.somewebsite.com/endpoint")
.query("this", "that")
.query({
    "one": "two",
    "three": "four"
})
.then(([body, res]) => {
    // ...
});
```

#### Headers
```javascript
const request = require("es6-request");

// Sends a GET request with these headers:
// {
//     "Accept": "application/json",
//     "Header-Name": "header value",
//     "Another-Header": "another value"
// }
request.get("http://api.somewebsite.com/endpoint");
.header("Accept", "application/json")
.headers({
    "Header-Name": "header value",
    "Another-Header": "another value"
})
.then(([body, res]) => {
    console.log(res.headers);
    // ...
});
```

#### Pipes
The following example POSTs all data you enter to STDIN to the local server we create, which then logs the data back to the console.
```javascript
const request = require("es6-request");
const server = require("http").createServer((req, res) => {
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    console.log(chunk);
  });
  req.on('end', () => {
    res.end();
  });
}).listen(1337);

process.stdin.pipe(request.post("http://localhost:1337"));
```

This example pipes the GitHub logo to a file named `logo.png`.
```javascript
const request = require("es6-request");
const fs = require("fs");

request.get("https://github.com/images/modules/logos_page/GitHub-Mark.png").pipe(fs.createWriteStream("logo.png")).perform();
```

#### Multipart forms
The following example POSTs a field and a file to a server using `multipart/form-data`
```javascript
const request = require("es6-request");
const fs = require("es6-fs");

fs.readFile("logo.png")
.then(contents =>
  request.post("http://api.somewebsite.com/endpoint")
  .sendMultipart({
    somekey: "somevalue"
  }, {
    "logo.png": contents
  }, "files[%i]", "base64")
);
```

Sample multipart form body that gets sent to the server:
```
----------------------------151a08730e1f
MIME-Version: 1.0
Content-Transfer-Encoding: base64
Content-Disposition: form-data; name="somekey"

c29tZXZhbHVl
----------------------------151a08730e1f
MIME-Version: 1.0
Content-Transfer-Encoding: base64
Content-Disposition: form-data; name="files[0]"; filename="logo.png"

iVBORw0KGgoAAAA(trimmed 19073 characters...)
----------------------------151a08730e1f--
```