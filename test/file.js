var Store = require('../')

var tape = require('tape')
var urlFriendly = require('base64-url').escape

tape('read and write from a file', function (t) {
  var store1 = Store('/tmp/kv-file-store_test', null, urlFriendly)
  var key = 'abcd/def+123'
  var value = {random: Math.random()}
  store1.set(key, value)
  store1.onDrain(function () {
    console.log('DRAINED')
    var store2 = Store('/tmp/kv-file-store_test', null, urlFriendly)
    store2.ensure(key, function () {
      t.deepEqual(store2.get(key), value)
      t.end()
    })
  })
})
