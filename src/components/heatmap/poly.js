/*
  [lng, lat, count]
*/
function heatmapPoly (viewPort, datas, interval = 5, transFun) {
  let clientW = viewPort.width
  let clientH = viewPort.height // 可视窗口像素宽高
  let xNum = Math.ceil(clientW / interval)
  let yNum = Math.ceil(clientH / interval) // 格子数
  let mapDataGrid = new Array(xNum * yNum)
  datas.forEach(data => {
    let point = transFun ? transFun(data.slice(0, 2)) : data.slice(0, 2)
    let gridinfo = findGridinfo(viewPort, interval, point)
    let idx = gridinfo.idx
    let center = gridinfo.center
    mapDataGrid[idx] = mapDataGrid[idx] || [0, 0, 0]
    mapDataGrid[idx][2] += +data[2] || 0
    mapDataGrid[idx][0] = center[0]
    mapDataGrid[idx][1] = center[1]
  })
  return mapDataGrid.filter(data => !!data[2])
}
function findGridinfo (viewPort, interval, point) {
  let clientW = viewPort.width
  let xNum = Math.ceil(clientW / interval)
  let x = Math.floor(point[0] / interval)
  let y = Math.floor(point[1] / interval)
  return {
    idx: y * xNum + x,
    center: [
      interval * x + Math.random() * interval, // 随机偏移
      interval * y + Math.random() * interval
    ]
  }
}
export default heatmapPoly
