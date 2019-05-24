import * as d3 from 'd3'
function _rotateZ ([x, y, z], angle, [x0, y0]) {
  let cos = Math.cos(angle)
  let sin = Math.sin(angle)
  let z0 = 0
  let x1 = (x - x0) * cos - (y - y0) * sin + x0
  let y1 = (y - y0) * cos + (x - x0) * sin + y0
  return [x1, y1, z0]
}
function _rotateX ([x, y, z], angle, [x0, y0]) {
  let cos = Math.cos(angle)
  let sin = Math.sin(angle)
  let z0 = 0
  let y1 = (y - y0) * cos - (z - z0) * sin + y0
  let z1 = (z - z0) * cos + (y - y0) * sin + z0
  return [x, y1, z1]
}
function _rotateY ([x, y, z], angle, [x0, y0]) {
  let cos = Math.cos(angle)
  let sin = Math.sin(angle)
  let z0 = 0
  let x1 = (x - x0) * cos - (z - z0) * sin + x0
  let z1 = (z - z0) * cos + (x - x0) * sin + z0
  return [x1, y, z1]
}
function setPerspective ([x, y, z], perspective, [x0, y0]) {
  let scale = perspective / (perspective + z)
  x = x - x0
  y = y - y0
  let xp = x * scale
  let yp = y * scale
  return [xp + x0, yp + y0, 0]
}
function translate3dTo2d (center, point, config) {
  let [x0, y0] = center
  let [x, y] = point
  let z = 0
  let angleZ = config.z * Math.PI / 180
  let angleX = -config.x * Math.PI / 180
  let angleY = config.y * Math.PI / 180
  let point0 = _rotateZ([x, y, z], angleZ, [x0, y0])
  let point1 = _rotateY(point0, angleY, [x0, y0])
  let point2 = _rotateX(point1, angleX, [x0, y0])
  let point3 = setPerspective(point2, config.perspective, [x0, y0])
  return point3
}
function getProjection (geoJson, option, width, height) {
  let [left, right, bottom, top] = [0, 0, 0, 0]
  if (typeof option.map.padding === 'number') {
    left = right = bottom = top = option.map.padding
  } else {
    left = option.map.padding.left || 0
    right = option.map.padding.right || 0
    bottom = option.map.padding.bottom || 0
    top = option.map.padding.top || 0
  }
  let scalePadding = option.map.scale || 1
  let startx = left + (1 - scalePadding) * (width - left - right) / 2 + left
  let starty = top + (1 - scalePadding) * (height - top - bottom) / 2 + top
  let endx = width - (1 - scalePadding) * (width - left - right) / 2 - right
  let endy = height - (1 - scalePadding) * (height - top - bottom) / 2 - bottom
  return d3.geoMercator()
    .fitExtent([[startx, starty], [endx, endy]], geoJson)
    // .center([105.0, 37.5]) // 定位中心、缩放因子以及平移位置
    // .scale(Math.min(width, height))
    // .translate([width / 2, height / 2])
}
function getMapPath (context, geoJson, option, width, height) {
  return d3.geoPath()
    .projection(getProjection(geoJson, option, width, height))
    .context(context)
}
export {
  translate3dTo2d,
  getProjection,
  getMapPath
}
