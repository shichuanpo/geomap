function getColorPaint () {
  let paletteCanvas = document.createElement('canvas')
  let paletteCtx = paletteCanvas.getContext('2d')
  let gradientConfig = {
    '0.2': 'rgba(80,10,192,0.2)',
    '0.3': 'rgba(43,111,231,0.3)',
    '0.4': 'rgba(2,192,241,0.4)',
    '0.6': 'rgba(44,222,148,0.6)',
    '0.8': 'rgba(254,237,83,0.8)',
    '0.9': 'rgba(255,118,50,0.9)',
    '1.0': 'rgba(255,64,28,1)'
  }
  paletteCanvas.width = 256
  paletteCanvas.height = 1
  let gradient = paletteCtx.createLinearGradient(0, 0, 256, 1)
  for (let key in gradientConfig) {
    gradient.addColorStop(key, gradientConfig[key])
  }
  paletteCtx.fillStyle = gradient
  paletteCtx.fillRect(0, 0, 256, 1)
  return paletteCtx.getImageData(0, 0, 256, 1).data
}
export default getColorPaint()
