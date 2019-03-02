const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

function nextMacroTask(fn) {
  setTimeout(() => {
    fn()
  }, 0)
}

function MyPromise(fn) {
  const that = this
  that.state = PENDING
  that.value = null
  that.resolvedCb = []
  that.rejectedCb = []

  function resolve(value) {
    if (value instanceof MyPromise) {
      return value.then(resolve, reject)
    }
    nextMacroTask(() => {
      if (that.state === PENDING) {
        that.state = RESOLVED
        that.value = value
        that.resolvedCb.forEach(
          cb => cb.call(null, that.value)
        )
      }
    })
  }

  function reject(value) {
    nextMacroTask(() => {
      if (that.state === PENDING) {
        that.state = REJECTED
        that.value = value
        that.rejectedCb.forEach(
          cb => cb(that.value)
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

  let called = false
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolutionProcedure(promise2, y, resolve, reject)
          },
          e => {
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
  const that = this
  var promise2

  onFulfilled = typeof onFulfilled === 'function'
    ? onFulfilled
    : v => v
  onRejected = typeof onRejected
    ? onRejected
    : r => { throw r }

  if (that.state === PENDING) {
    return (promise2 = new MyPromise((resolve, reject) => {
      that.resolvedCb.push(() => {
        try {
          const x = onFulfilled(that.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })

      that.rejectedCb.push(() => {
        try {
          const x = onRejected(that.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })
    }))
  }
  if (that.state === RESOLVED) {
    return (promise2 = new MyPromise((resolve, reject) => {
      nextMacroTask(() => {
        try {
          const x = onFulfilled(that.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })
    }))
  }
  if (that.state === REJECTED) {
    return (promise2 = new MyPromise((resolve, reject) => {
      nextMacroTask(() => {
        try {
          const x = onRejected(that.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })
    }))
  }
}

module.exports = MyPromise