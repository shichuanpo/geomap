<template lang="pug">
  .heatmap(:style="{'transform':transform}")
    transition(name="heatmapfade")
      canvas(:ref="heatmapId", :id="heatmapId", :width="option['real-width']", :height="option['real-height']", :style="{width:option['real-width']+'px',height:option['real-height']+'px'}", v-show="onload")
</template>
<script>
import getId from '../../utils/uniqueId.js'
import { getProjection, getMapPath } from '../../utils/map-controller.js'
import debounce from '../../utils/debounce.js'
import poly from './poly.js'
import getColorPaint from './getColorPaint.js'
export default {
  name: 'heatmap',
  props: ['option', 'geoJson', 'data'],
  data () {
    return {
      heatmapId: getId('heatmap'),
      debounceDraw: debounce(this.draw, 300, this),
      debounceTransData: debounce(this.transData, 300, this),
      polyRange: 3, // 点聚合的数据处理，每n个像素聚合
      heatmapData: [],
      onload: false
    }
  },
  watch: {
    option: {
      handler () {
        this.debounceTransData()
      },
      deep: true
    },
    data: {
      handler () {
        this.debounceTransData()
      },
      deep: true
    },
    heatmapData: {
      handler (newVal) {
        this.debounceDraw(newVal)
      },
      deep: true
    }
  },
  computed: {
    radius () {
      return Math.ceil(this.option.heatmap.radius)
    },
    transform () {
      let perspective = 'perspective(' + this.option.map.rotate.perspective + 'px)'
      let rotateX = 'rotateX(' + this.option.map.rotate.x + 'deg)'
      let rotateY = 'rotateY(' + this.option.map.rotate.y + 'deg)'
      let rotateZ = 'rotateZ(' + this.option.map.rotate.z + 'deg)'
      return perspective + ' ' + rotateX + ' ' + rotateY + ' ' + rotateZ
    }
  },
  methods: {
    getMapPath (context) {
      return getMapPath(context, this.geoJson, this.option, this.option['real-width'], this.option['real-height'])
    },
    getProjection () {
      return getProjection(this.geoJson, this.option, this.option['real-width'], this.option['real-height'])
    },
    getCanvas (id) {
      id = id || this.heatmapId
      return this.$refs[id]
    },
    getContext (id) {
      return this.getCanvas(id) && this.getCanvas(id).getContext('2d')
    },
    clearScreen () {
      let context = this.getContext()
      context && context.clearRect(0, 0, this.option['real-width'], this.option['real-height'])
    },
    draw (points) {
      this.clearScreen()
      let context = this.getContext()
      if (context) {
        let maxCount = 0
        let minCount = 0
        points.forEach(point => {
          if (maxCount < point[2]) {
            maxCount = point[2]
          }
          // minCount = minCount || point[2]
          // if (minCount > point[2]) {
          //   minCount = point[2]
          // }
        })
        points.forEach(point => {
          context.beginPath()
          let alpha = 0
          if (this.option.heatmap.max === 'auto') {
            alpha = (point[2] - minCount) / (maxCount - minCount)
          } else if (this.option.heatmap.max && typeof this.option.heatmap.max === 'number') {
            alpha = (point[2] - minCount) / (this.option.heatmap.max - minCount)
          }
          alpha = alpha > 1 ? 1 : alpha
          context.globalAlpha = alpha // 设置 Alpha 透明度
          let gradient = context.createRadialGradient(point[0], point[1], 0, point[0], point[1], this.radius)
          gradient.addColorStop(0, 'rgba(0,0,0,1)')
          gradient.addColorStop(1, 'rgba(0,0,0,0)')
          context.fillStyle = gradient
          context.arc(point[0], point[1], this.radius, 0, Math.PI * 2, true)
          context.closePath()
          context.fill()
        })
        let palette = getColorPaint
        let img = context.getImageData(0, 0, this.option['real-width'], this.option['real-height'])
        let imgData = img.data
        let len = imgData.length
        for (let i = 3; i < len; i += 4) {
          let alpha = imgData[i]
          let offset = alpha * 4
          if (!offset) {
            continue
          }
          imgData[i - 3] = palette[offset]
          imgData[i - 2] = palette[offset + 1]
          imgData[i - 1] = palette[offset + 2]
          // imgData[i] = 255
        }
        context.putImageData(img, 0, 0, 0, 0, this.option['real-width'], this.option['real-height'])
        this.onload = true
      }
    },
    transData () {
      this.onload = false
      let transdata = this.data.map(item => {
        return [item.lng, item.lat, +item.count || 0]
      })
      this.heatmapData = poly({ width: this.option['real-width'], height: this.option['real-height'] }, transdata, this.polyRange, this.getProjection())
    }
  },
  mounted () {
    // 必须加
    this.transData()
  }
}
</script>
<style lang="less" scoped>
  .heatmap{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    canvas{
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  .heatmapfade-enter-active {
    transition: opacity 1s;
  }
  .heatmapfade-enter, .heatmapfade-leave /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
