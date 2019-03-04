// platform code
var isBrowser = !!window
/**
 * platform related
 * use process.nextTick in Node
 * use MutationObserver in Browser
 */
var nextTick = (function() {
  var handler
  if (!isBrowser) {
    handler = process.nextTick
  } 
  else if (typeof MutationObserver !== 'undefined') {
    var counter = 1
    var callbacks = []
    function nextTickHandler () {
      var copies = callbacks.slice(0)
      callbacks = []
      for (var i = 0; i < copies.length; i++) {
        copies[i]()
      }
    }
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(counter)
    observer.observe(textNode, {
      characterData: true
    })
    var timerFunc = function () {
      counter = (counter + 1) % 2
      textNode.data = counter
    }
    handler = function (fn) {
      callbacks.push(fn)
      timerFunc()
    }
  } 
  else {
    // fallback to setTimeout
    handler = function(fn) { setTimeout(fn, 0) }
  }

  return function(fn) { handler(fn) }
})()

module.exports = {
  nextTick
}
