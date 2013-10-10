# Save to ______ [![Build Status](https://travis-ci.org/stream-utils/save-to.png)](https://travis-ci.org/stream-utils/save-to)

Save a stream to a file.

You may also be interested in:

- [raw-body](https://github.com/jonathanong/raw-body)

## API

```js
var saveTo = require('save-to')
var stream = fs.createReadStream('some file.txt')
```

## saveTo(stream [, destination] [, options], callback)

- `stream` is the source stream, for example a request.
- `destination` is the path where the stream will be saved.
- `callback` only returns with an error, if any.

The options are:

- `destination` - if you don't specify destination as an argument.
- `expected` - expected byte length. Throws an error if it does not match the stream's length.
- `limit` - maximum byte length. Throws an error if the stream is larger than this size.

## License

The MIT License (MIT)

Copyright (c) 2013 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
