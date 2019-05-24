// 十六进制颜色值的正则表达式
const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
/* RGB颜色转换为16进制 */
function colorHex (color) {
  if (/^(rgb|RGB)/.test(color)) {
    let aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
    let strHex = '#'
    for (let i = 0; i < aColor.length; i++) {
      let hex = Number(aColor[i]).toString(16)
      if (hex === '0') {
        hex += hex
      }
      strHex += hex
    }
    if (strHex.length !== 7) {
      strHex = color
    }
    return strHex
  } else if (reg.test(color)) {
    let aNum = color.replace(/#/, '').split('')
    if (aNum.length === 6) {
      return color
    } else if (aNum.length === 3) {
      let numHex = '#'
      for (let i = 0; i < aNum.length; i += 1) {
        numHex += aNum[i] + aNum[i]
      }
      return numHex
    }
  } else {
    return color
  }
}

/* 16进制颜色转为RGB格式 */
function colorRgba (color, alpha) {
  let sColor = color.toLowerCase()
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    // 处理六位的颜色值
    let sColorChange = []
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
    }
    if (alpha) {
      sColorChange.push(alpha)
    }
    return 'RGBA(' + sColorChange.join(',') + ')'
  } else {
    return sColor
  }
}
function hslToRgb (h, s, l) {
  let r = 0
  let g = 0
  let b = 0
  if (s === 0) {
    r = g = b = l
  } else {
    let hue2rgb = function hue2rgb (p, q, t) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s
    var p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}
function rgbToHsl (color) {
  let aColor = color.replace(/(?:\(|\)|rgba|RGBA|rgb|RGB)*/g, '').split(',')
  let r = aColor[0] / 255
  let g = aColor[1] / 255
  let b = aColor[2] / 255
  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)
  let h
  let s
  let l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [h, s, l]
}
/* 发光颜色 */
function colorLight (color, alpha = 1, l = 1) {
  let rgba = colorRgba(color)
  let hsl = rgbToHsl(rgba)
  let transRGB = hslToRgb(hsl[0], hsl[1], l)
  return 'RGBA(' + transRGB.join(',') + ',' + alpha + ')'
}
export {
  colorHex,
  colorRgba,
  colorLight
}
