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

  it('should resolve in next then', function(done) {
    new MyPromise((resolve, reject) => {
      reject(1);
    }).then(() => {
      assert.fail();
    }, (e) => {
      return e;
    }).then((x) => {
      assert.equal(x, 1);
      done();
    }, (e) => {
      assert.fail();
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

  it('catch error', function(done) {
    new MyPromise(function(resolve, reject) {
      resolve('Success');
    }).then(function() {
      throw new Error('oh, no!');
    }).catch(function(e) {
      assert.ok(e instanceof Error);
      return 'good';
    }).then(function(x){
      assert.equal(x, 'good');
      done();
    }, function () {
      assert.fail();
    });
  })
});