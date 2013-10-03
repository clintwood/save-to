var fs = require('fs')

module.exports = function (stream, destination, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  if (typeof destination === 'object') {
    options = destination
    destination = options.destination
  }

  if (typeof destination !== 'string')
    throw new TypeError('Destination must be a string')

  if (!destination)
    throw new Error('Destination must be defined.')

  var expected = toInt(options.expected)
  var limit = toInt(options.limit)

  if (expected !== null && limit !== null && expected > limit) {
    var err = new Error('request entity too large')
    err.status = 413
    err.expected = expected
    err.limit = limit
    stream.resume() // dump stream
    callback(err)
    return
  }

  var writeStream = stream.pipe(fs.createWriteStream(destination))

  var received = 0
  if (expected !== null || limit !== null)
    stream.on('data', onData)
  if (expected !== null)
    stream.once('end', onEnd)

  stream.once('error', onFinish)
  writeStream.once('error', onFinish)
  writeStream.once('close', onFinish)

  return writeStream

  function onData(chunk) {
    received += chunk.length

    if (limit !== null && received > limit) {
      var err = new Error('request entity too large')
      err.status = 413
      err.received = received
      err.limit = limit
      onFinish(err)
    }
  }

  function onEnd() {
    if (received !== expected) {
      var err = new Error('request size did not match content length')
      err.status = 400
      err.received = received
      err.expected = expected
      onFinish(err)
    }
  }

  function onFinish(err) {
    cleanup(err)
    callback(err, destination)
  }

  function cleanup(err) {
    if (err)
      fs.unlink(destination, noop)

    stream.removeListener('data', onData)
    stream.removeListener('end', onEnd)
    stream.removeListener('error', onFinish)
    writeStream.removeListener('error', onFinish)
    writeStream.removeListener('close', onFinish)
    
    stream = writeStream = null
  }
}

function toInt(x) {
  return isNaN(x)
    ? null
    : parseInt(x, 10)
}

function noop() {}
