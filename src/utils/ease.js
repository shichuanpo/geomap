/****
 * t: current time（当前时间）；
b: beginning value（初始值）；
c: change in value（变化量）；
d: duration（持续时间）。
min: 最小值
max: 设定
 */
function linear (t, b, c, d, min, max) {
  let s = c * t / d + b
  if ((max !== undefined || max !== null) && s > max) return max
  if ((min !== undefined || min !== null) && s < min) return min
  return s
}
function easeIn (t, b, c, d, min, max) {
  if (c > 0) {
    let s = c * (t / d) * (t / d) + b
    if ((max !== undefined || max !== null) && s > max) return max
    if ((min !== undefined || min !== null) && s < min) return min
    return s
  } else {
    let s = c * Math.sqrt(t / d) + b
    if ((max !== undefined || max !== null) && s > max) return max
    if ((min !== undefined || min !== null) && s < min) return min
    return s
  }
}
function easeOut (t, b, c, d, min, max) {
  if (c > 0) {
    let s = c * Math.sqrt(t / d) + b
    if ((max !== undefined || max !== null) && s > max) return max
    if ((min !== undefined || min !== null) && s < min) return min
    return s
  } else {
    let s = c * (t / d) * (t / d) + b
    if ((max !== undefined || max !== null) && s > max) return max
    if ((min !== undefined || min !== null) && s < min) return min
    return s
  }
}
function easeInOut (t, b, c, d, min, max) {
  if (c > 0) {
    let easein = easeIn(d / 2, b, c / 2, d / 2, min, max)
    return t / d < 0.5 ? easeIn(t, b, c / 2, d / 2, min, max) : easeOut(t - t / 2, easein, c / 2, d / 2, min, max)
  } else {
    let easeout = easeOut(d / 2, b, c / 2, d / 2, min, max)
    return t / d < 0.5 ? easeOut(t, b, c / 2, d / 2, min, max) : easeIn(t - t / 2, easeout, c / 2, d / 2, min, max)
  }
}
export default {
  linear,
  easeIn,
  easeOut,
  easeInOut
}
