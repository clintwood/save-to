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

  var expected = parseInt(options.expected, 10) || null
  var limit = parseInt(options.limit, 10) || null

  if (expected !== null && limit !== null && expected > limit) {
    var err = new Error('request entity too large')
    err.status = 413
    err.expected = expected
    err.limit = limit
    callback(err)
    stream.resume() // dump stream
    cleanup()
    return
  }

  var writeStream = stream.pipe(fs.createWriteStream(destination))

  var received = 0
  if (expected !== null && limit !== null)
    stream.on('data', onData)
  if (expected !== null)
    stream.once('end', onEnd)

  stream.once('error', onFinish)
  writeStream.once('error', onFinish)
  writeStream.once('finish', onFinish)

  return writeStream

  function onData(chunk) {
    received += chunk.length

    if (limit !== null && received > limit) {
      var err = new Error('request entity too large.')
      err.status = 413
      err.received = received
      err.limit = limit
      callback(err)
      cleanup()
    }
  }

  function onEnd() {
    if (received !== expected) {
      var err = new Error('request size did not match content length')
      err.status = 400
      err.received = received
      err.expected = expected
      callback(err)
      cleanup()
    }
  }

  function onFinish(err) {
    cleanup()
    callback(err)
  }

  function cleanup() {
    stream.removeListener('data', onData)
    stream.removeListener('end', onEnd)
    stream.removeListener('error', onFinish)
    writeStream.removeListener('error', onFinish)
    writeStream.removeListener('finish', onFinish)
  }
}