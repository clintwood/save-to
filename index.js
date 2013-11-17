var fs = require('fs')

module.exports = function (stream, destination, options, done) {
  if (typeof options === 'function') {
    // [stream, destination, done]
    done = options
    options = {}
  }

  if (typeof destination === 'object') {
    // [stream, options, [done]]
    options = destination
    destination = options.destination
  }

  if (!options)
    options = {}

  if (typeof destination !== 'string')
    throw new TypeError('Destination must be a string')

  if (!destination)
    throw new Error('Destination must be defined.')

  var length = toInt(options.length)
  var limit = toInt(options.limit)

  if (length !== null && limit !== null && length > limit) {
    var err = new Error('request entity too large')
    err.status = 413
    err.length = length
    err.limit = limit
    stream.resume() // dump stream
    process.nextTick(function () {
      done(err)
    })
    return defer
  }

  var writeStream = stream.pipe(fs.createWriteStream(destination))

  var received = 0
  if (length !== null || limit !== null)
    stream.on('data', onData)
  if (length !== null)
    stream.once('end', onEnd)

  stream.once('close', onClose)
  stream.once('error', onFinish)
  writeStream.once('error', onFinish)
  // shouldn't ever emit 'close' without `finish`.
  writeStream.once('close', onFinish)

  return defer

  function defer(fn) {
    done = fn
  }

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

  // If a 'close' event is emitted before the
  // readable stream has ended,
  // then we assume that it was prematurely closed
  // and we cleanup the file appropriately.
  function onClose() {
    if (!stream._readableState.ended)
      cleanup(true)
  }

  function onEnd() {
    if (received !== length) {
      var err = new Error('request size did not match content length')
      err.status = 400
      err.received = received
      err.length = length
      onFinish(err)
    }
  }

  function onFinish(err) {
    cleanup(err)
    done(err, destination)
  }

  function cleanup(err) {
    if (err) {
      if (typeof stream.destroy === 'function')
        stream.destroy()
      else if (typeof stream.close === 'function')
        stream.close()

      fs.unlink(destination, noop)
    }

    stream.removeListener('data', onData)
    stream.removeListener('end', onEnd)
    stream.removeListener('close', onClose)
    stream.removeListener('error', onFinish)
    writeStream.removeListener('error', onFinish)
    writeStream.removeListener('close', onFinish)

    stream = writeStream = null
  }
}

function toInt(x) {
  return isNaN(x) ? null : parseInt(x, 10)
}

function noop() {}