export default function debounce (fn, delay, ctx) {
  let timer = null
  return function () {
    let context = ctx || this
    let args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}
