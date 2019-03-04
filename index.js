var PENDING = 'pending'
var RESOLVED = 'resolved'
var REJECTED = 'rejected'

function nextMacroTask(fn) {
  setTimeout(fn, 0)
}

function MyPromise(fn) {
  var that = this
  that.state = PENDING
  that.value = null
  that.resolvedCb = []
  that.rejectedCb = []

  function resolve(value) {
    if (value instanceof MyPromise) {
      return value.then(resolve, reject)
    }
    nextMacroTask(function() {
      if (that.state === PENDING) {
        that.state = RESOLVED
        that.value = value
        that.resolvedCb.forEach(
          function(cb) { cb.call(null, that.value) }
        )
      }
    })
  }

  function reject(value) {
    nextMacroTask(function() {
      if (that.state === PENDING) {
        that.state = REJECTED
        that.value = value
        that.rejectedCb.forEach(
          function(cb) { cb.call(null, that.value) }
        )
      }
    })
  }

  try {
    fn(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

function resolutionProcedure(promise2, x, resolve, reject) {
  if (promise2 === x) {
    reject(new TypeError('error'))
    return
  }
  else if (x instanceof MyPromise) {
    x.then(function (value) {
      resolutionProcedure(promise2, value, resolve, reject)
    }, reject)
    return
  }

  var called = false
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      var then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          function(y) {
            if (called) return
            called = true
            resolutionProcedure(promise2, y, resolve, reject)
          },
          function(e) {
            if (called) return
            called = true
            reject(e)
          })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var that = this
  var promise2

  onFulfilled = typeof onFulfilled === 'function'
    ? onFulfilled
    : function(v) { return v }
  onRejected = typeof onRejected === 'function'
    ? onRejected
    : function(r) { throw r }

  if (that.state === PENDING) {
    return (promise2 = new MyPromise(function(resolve, reject) {
      that.resolvedCb.push(function() {
        try {
          var x = onFulfilled(that.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })

      that.rejectedCb.push(function() {
        try {
          var x = onRejected(that.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })
    }))
  }
  if (that.state === RESOLVED) {
    return (promise2 = new MyPromise(function(resolve, reject) {
      nextMacroTask(function() {
        try {
          var x = onFulfilled(that.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })
    }))
  }
  if (that.state === REJECTED) {
    return (promise2 = new MyPromise(function(resolve, reject) {
      nextMacroTask(function() {
        try {
          var x = onRejected(that.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })
    }))
  }
}

MyPromise.prototype.catch = function(onRejected) {
  return this.then(undefined, onRejected)
}

MyPromise.all = function(promises) {
  if (!(promises instanceof Array)) throw new Error('bad array')
  if (promises.length === 0) {
    return new MyPromise(function(resolve) { resolve() })
  }

  return new MyPromise(function(resolve, reject) {
    var count = 0
    var result = []
    promises.forEach(function(p, id) {
      if (p instanceof MyPromise) {
        p.then(function(x) {
          count += 1
          result[id] = x
          if (count === promises.length) {
            resolve(result)
          }
        }, function(e) {
          reject(e)
        })
      } else {
        count += 1
        result[id] = p
      }
    })
  })
}

module.exports = MyPromise