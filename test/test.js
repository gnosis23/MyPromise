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

  it('should MyPromise.all return array', function(done) {
    var p1 = 3;
    var p2 = 1337;
    var p3 = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        resolve("foo");
      }, 100);
    }); 

    MyPromise.all([p1, p2, p3]).then(values => {
      assert.deepEqual(values, [3, 1337, "foo"]);
      done(); 
    });
  })

  it('should MyPromise.all fail-fast', function(done) {
    var p1 = new MyPromise((resolve, reject) => { 
      setTimeout(() => resolve('one'), 10); 
    }); 
    var p2 = new MyPromise((resolve, reject) => { 
      setTimeout(() => resolve('two'), 20); 
    });
    var p3 = new MyPromise((resolve, reject) => {
      setTimeout(() => resolve('three'), 30);
    });
    var p4 = new MyPromise((resolve, reject) => {
      setTimeout(() => resolve('four'), 40);
    });
    var p5 = new MyPromise((resolve, reject) => {
      reject(new Error('reject'));
    });
    
    
    // Using .catch:
    MyPromise.all([p1, p2, p3, p4, p5])
    .then(values => { 
      assert.fail();
    })
    .catch(error => {
      assert.equal(error.message, 'reject')
      done();
    });
  })
});