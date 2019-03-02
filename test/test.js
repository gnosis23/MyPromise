var assert = require('assert');
var MyPromise = require('..');

describe('MyPromise', function() {
  it('normal promise chain', function(done) {
    var p = new MyPromise((resolve, reject) => {
      resolve(1);
    }).then(x => {
      return x + 1;
    }).then(x => {
      return x + 1;
    }).then(x => {
      assert.equal(x, 3);
      done();
    })
  });

  it('promise return promise', function(done) {
    new MyPromise((resolve, reject) => {
      resolve(1)
    }).then(x => {
      return new MyPromise((resolveInner, rejectInner) => {
        resolveInner(x + 1);
      })
    }).then(x => {
      assert.equal(x, 2);
      done();
    });
  })
});