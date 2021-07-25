'use strict'
var json = require('./json')
var Store = require('./store')
var atomic = require('atomic-file-rw')
var path = require('path')
var mkdirp = require('mkdirp')

module.exports = function (dir, codec, keyCodec) {
  if(!dir) {
    console.error('lossy store missing dir, skipping persistence')

    return Store(
      function (v, cb) { cb() },
      function (k,v,cb) { cb() }
    )
  }

  codec = codec || json
  var keyEncode = keyCodec
    ? keyCodec.encode || keyCodec
    : function (e) { return e }

  var ready = false
  function mkdir (cb) {
    if(ready) cb()
    else mkdirp(dir, function () {
      ready = true
      cb()
    })
  }

  function toPath(id) {
    return path.join(dir, keyEncode(id))
  }

  return Store(function read (id, cb) {
    atomic.readFile(toPath(id), function (err, value) {
      if(err) return cb(err)
      try { value = codec.decode(value) }
      catch (err) { return cb(err) }
      return cb(null, value)
    })
  }, function write (id, value, cb) {
    try { value = codec.encode(value) }
    catch (err) { return cb(err) }
    mkdir(function () {
      atomic.writeFile(toPath(id), value, cb)
    })
  })
}
