var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var Stream = require('stream')

var saveTo = require('./')

var tmpdir = path.join(os.tmpdir(), '/save-to')

try {
  fs.mkdirSync(tmpdir)
} catch (err) {
  if (err.code !== 'EEXIST')
    throw err
}

var file = path.join(__dirname, 'index.js')
var length = fs.statSync(file).size
var string = fs.readFileSync(file, 'utf8')

function createStream() {
  return fs.createReadStream(file)
}

function createPath() {
  return path.join(tmpdir, Math.random().toString(36).slice(2) + '.js')
}

function checkFile(location) {
  assert.equal(string, fs.readFileSync(location, 'utf8'))
}

describe('Save To', function () {
  it('should work without options', function (done) {
    var location = createPath()

    saveTo(createStream(), location, function (err) {
      assert.ifError(err)
      checkFile(location)
      done()
    })
  })

  it('should work with destination as an option', function (done) {
    var location = createPath()

    saveTo(createStream(), {
      destination: location
    }, function (err) {
      assert.ifError(err)
      checkFile(location)
      done()
    })
  })

  it('should work with expected length', function (done) {
    var location = createPath()

    saveTo(createStream(), location, {
      expected: length
    }, function (err) {
      assert.ifError(err)
      checkFile(location)
      done()
    })
  })

  it('should work with limit', function (done) {
    var location = createPath()

    saveTo(createStream(), location, {
      limit: length + 1
    }, function (err) {
      assert.ifError(err)
      checkFile(location)
      done()
    })
  })

  it('should work with limit and expected length', function (done) {
    var location = createPath()

    saveTo(createStream(), location, {
      expected: length,
      limit: length + 1
    }, function (err) {
      assert.ifError(err)
      checkFile(location)
      done()
    })
  })

  it('should check options for limit and expected length', function (done) {
    var location = createPath()

    saveTo(createStream(), location, {
      expected: length,
      limit: length -1
    }, function (err) {
      assert.equal(err.status, 413)
      try {
        fs.statSync(location)
      } catch (err) {
        done()
      }
    })
  })

  it('should throw on incorrect expected length', function (done) {
    var location = createPath()

    saveTo(createStream(), location, {
      expected: 1
    }, function (err) {
      assert.equal(err.status, 400)
      done()
    })
  })

  it('should throw on length > limit', function (done) {
    var location = createPath()

    saveTo(createStream(), location, {
      limit: length - 1
    }, function (err) {
      assert.equal(err.status, 413)
      done()
    })
  })

  it('should delete the resulting file if error', function (done) {
    var location = createPath()

    saveTo(createStream(), location, {
      expected: 0
    }, function (err) {
      assert.ok(err)

      setTimeout(function () {
        try {
          fs.statSync(location)
        } catch (err) {
          done()
        }
      }, 10)
    })
  })

  it('should delete the resulting file if stream errors', function (done) {
    var location = createPath()
    var source = new Stream.PassThrough()

    setImmediate(function () {
      source.emit('error', new Error())
    })

    saveTo(source, location, function (err) {
      assert.ok(err)
      setTimeout(function () {
        try {
          fs.statSync(location)
        } catch (err) {
          done()
        }
      }, 10)
    })
  })
})