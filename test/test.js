var assert = require('assert');
var MyPromise = require('..');

describe('MyPromise', function() {
  it('should reject in constructor', function(done) {
    new MyPromise((resolve, reject) => {
      throw new Error('...');
    }).then(null, e => {
      assert.ok(e instanceof Error, 'bad e');
      assert.equal(e.message, '...');
      done();
    })
  })

  it('should reject in then', function(done) {
    new MyPromise((resolve) => {
      resolve(1);
    }).then(() => {
      throw new Error('...');
    }, () => {
      assert.fail()
    }).then(() => {
      assert.fail();
    }, (e) => {
      assert.ok(e instanceof Error, 'bad e');
      assert.equal(e.message, '...');
      done();
    });
  })

  it('should reject in then2', function(done) {
    new MyPromise((resolve, reject) => {
      reject(1);
    }).then(() => {
      assert.fail();
    }, () => {
      throw new Error('...');
    }).then(() => {
      assert.fail();
    }, (e) => {
      assert.ok(e instanceof Error, 'bad e');
      assert.equal(e.message, '...');
      done();
    });
  })

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