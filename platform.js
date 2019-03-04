// platform code

/**
 * platform related
 * use process.nextTick in Node
 * use MutationObserver in Browser
 */
function nextTick(fn) {
  if (process && process.nextTick) {
    process.nextTick(fn);
  } else {
    // fallback to setTimeout
    setTimeout(fn, 0)
  }
}

module.exports = {
  nextTick
}