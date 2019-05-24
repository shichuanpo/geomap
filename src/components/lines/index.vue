<template lang="pug">
  .lines
    canvas(:ref="lineId", :width="option['real-width']", :height="option['real-height']", :style="{width:option['real-width']+'px',height:option['real-height']+'px'}")
</template>
<script>
import getId from '../../utils/uniqueId.js'
import { getProjection, translate3dTo2d } from '../../utils/map-controller.js'
import easeFun from '../../utils/ease.js'
import debounce from '../../utils/debounce.js'
import { colorRgba, colorLight } from '../../utils/trans-color.js'
export default {
  name: 'lines',
  props: ['option', 'geoJson', 'data'],
  data () {
    return {
      lineId: getId('lines'),
      lines: {},
      startPoints: [],
      time: 0,
      animateFrame: null,
      vertaxR: 5,
      debounceDraw: debounce(this.draw, 100, this)
    }
  },
  watch: {
    data: {
      handler (newVal) {
        if (newVal && newVal.length) {
          this.debounceDraw()
        }
      },
      deep: true
    },
    option: {
      handler () {
        this.debounceDraw()
      },
      deep: true
    }
  },
  computed: {
    context () {
      if (!this.lineId || !this.$refs[this.lineId]) return null
      return this.$refs[this.lineId].getContext('2d')
    }
  },
  methods: {
    destroy () {
      this.lines = {}
      this.startPoints = []
      this.time = 0
      this.clearScreen()
      if (this.animateFrame) {
        window.cancelAnimationFrame(this.animateFrame)
        this.animateFrame = null
      }
    },
    pause () {
      if (this.animateFrame) {
        window.cancelAnimationFrame(this.animateFrame)
        this.animateFrame = null
      }
    },
    replay () {
      this.animateFrame = window.requestAnimationFrame(this.drawEffectLines)
    },
    getProjection () {
      return getProjection(this.geoJson, this.option, this.option['real-width'], this.option['real-height'])
    },
    clearScreen () {
      this.context.clearRect(0, 0, this.option['real-width'], this.option['real-height'])
    },
    draw () {
      this.destroy()
      let projection = this.getProjection()
      let points = this.data.map(({ from, to }) => {
        let proFrom = projection(from)
        let proTo = projection(to)
        let transF = translate3dTo2d([this.option['real-width'] / 2, this.option['real-height'] / 2], proFrom, this.option.map.rotate)
        let transT = translate3dTo2d([this.option['real-width'] / 2, this.option['real-height'] / 2], proTo, this.option.map.rotate)
        return { from, to, transF, transT }
      })
      points.forEach(({ from, to, transF, transT }) => {
        let id = getId()
        this.lines[id] = this.lines[id] || {}
        this.lines[id].points = [transF, transT]
        this.lines[id].curveness = this.getCurveness(from, to, this.option.lines.curvature, this.option.map.rotate.z)
      })
      Object.keys(this.lines).forEach(id => {
        let inArray = this.startPoints.find(_id => {
          return this.lines[id].points[0][0] === this.lines[_id].points[0][0] && this.lines[id].points[0][1] === this.lines[_id].points[0][1]
        }) // 起点去重
        !inArray && this.startPoints.push(id)
      })
      this.drawEffectLines()
    },
    drawEffectLines (timestamp = 0) {
      this.clearScreen()
      Object.keys(this.lines).forEach((id, idx) => {
        this.lines[id].lineprogress = this.lines[id].lineprogress || 0
        this.lines[id].rippleprogress = this.lines[id].rippleprogress || 0
        this.lines[id].times = this.lines[id].times || 0
        let randomDelay = timestamp ? timestamp + Math.floor(Math.random() * this.option.lines.randomDelay) : 0 // 飞线目的点的随机落下
        this.lines[id].delay = this.lines[id].delay || randomDelay
        if (timestamp - this.lines[id].delay > this.option.lines.delay) {
          this.lines[id].linetime = this.lines[id].linetime || timestamp
          let lineincrement = easeFun[this.option.lines.speed.type](timestamp - this.lines[id].linetime, this.option.lines.speed.initial, this.option.lines.speed.variable, this.option.lines.speed.duration, this.option.lines.speed.min, this.option.lines.speed.max)
          this.lines[id].lineprogress += lineincrement
          if (this.lines[id].lineprogress > 100) {
            this.lines[id].rippletime = this.lines[id].rippletime || timestamp
            let ripplepincrement = easeFun[this.option.lines.ripple.speed.type](timestamp - this.lines[id].rippletime, this.option.lines.ripple.speed.initial, this.option.lines.ripple.speed.variable, this.option.lines.ripple.speed.duration, this.option.lines.ripple.speed.min, this.option.lines.ripple.speed.max)
            this.lines[id].rippleprogress += ripplepincrement
            if (this.lines[id].lineprogress > 100 * 2 && this.lines[id].rippleprogress > 100) {
              this.lines[id].times += 1
              this.lines[id].lineprogress = 0
              this.lines[id].rippleprogress = 0
              this.lines[id].delay = timestamp + Math.floor(Math.random() * this.option.lines.randomDelay)
              this.lines[id].linetime = this.lines[id].delay
              this.lines[id].rippletime = 0
            }
          }
          this.drawEffectLine(this.lines[id].points[0], this.lines[id].points[1], id, idx)
        }
      })
      let time = Math.max.apply(null, Object.keys(this.lines).map(key => this.lines[key].times))
      if (this.time !== time) {
        this.time = time
        this.$emit('flytimes', this.time)
      }
      this.animateFrame = window.requestAnimationFrame(this.drawEffectLines)
    },
    drawEffectLine (from, to, id, idx) {
      const colors = this.option.lines.colors
      let color = colors[idx % colors.length]
      let linePercent = this.lines[id].lineprogress
      let [, endq, end] = this.getPointPosition(from, to, this.lines[id].curveness, linePercent > 100 ? 100 : linePercent)
      let start = from
      if (linePercent >= 200) {
        start = end
      } else if (linePercent > 100) {
        start = this.getPointPosition(from, to, -this.option.lines.curvature, linePercent - 100)[2]
      }
      const bezier = this.getPointPosition(from, to, this.lines[id].curveness, linePercent > 100 ? 100 : linePercent)
      let angel = Math.atan((end[1] - endq[1]) / (end[0] - endq[0]))
      if ((end[1] - endq[1]) > 0 && (end[0] - endq[0]) < 0) {
        angel += Math.PI
      } else if ((end[1] - endq[1]) < 0 && (end[0] - endq[0]) < 0) {
        angel -= Math.PI
      }
      angel += Math.PI
      if (this.lines[id].rippleprogress && this.option.lines.ripple.show) {
        this.drawRipple(end, color, this.lines[id].rippleprogress)
      }
      this.drawCurvePath(start, end, bezier, color)
      this.drawVertax(end, angel, color, linePercent)
    },
    drawVertax (point, angel, color, percent) {
      if (typeof color === 'object') {
        let maxkey = Math.max.apply(null, Object.keys(color))
        color = color[maxkey]
      }
      let _radius = this.option.lines.width * this.vertaxR
      let _height = this.option.lines.width * this.vertaxR * 0.8
      if (percent > 200 || percent === 0) {
        return
      } else if (percent > 100) {
        // _radius += (percent - 100) / (this.option.lines.length * 100) * this.option.lines.width * this.vertaxR
        _height -= (percent - 100) / 100 * this.option.lines.width * this.vertaxR * 0.8
      }
      // this.context.shadowColor = color
      // this.context.shadowBlur = _radius * 3 / 4
      let alpha = percent <= 100 ? 1 : 1 - (percent - 100) / 100
      if (_height > 0) {
        this.context.save()
        this.context.translate(point[0], point[1])
        this.context.rotate(angel)
        this.context.translate(-point[0], -point[1])
        this.context.fillStyle = colorLight('#fff', alpha, 1)
        this.context.lineWidth = 0
        this.context.strokeStyle = colorLight('#fff', alpha, 1)
        this.context.beginPath()
        this.context.moveTo(point[0], point[1])
        this.context.lineTo(point[0], point[1] + _radius / 8)
        this.context.lineTo(point[0] + _height, point[1])
        this.context.lineTo(point[0], point[1] - _radius / 8)
        this.context.lineTo(point[0], point[1])
        this.context.closePath()
        this.context.fill()
        this.context.stroke()
        this.context.restore()
      }
      let gradient = this.context.createRadialGradient(point[0], point[1], 0, point[0], point[1], _radius * 2)
      gradient.addColorStop(0, colorLight('#fff', alpha, 1))
      gradient.addColorStop(0.05, colorLight(color, 0.9 * alpha, 1))
      gradient.addColorStop(0.07, colorLight(color, 0.9 * alpha, 0.9))
      gradient.addColorStop(0.075, colorLight(color, 0.9 * alpha, 0.8))
      gradient.addColorStop(0.08, colorLight(color, 0.9 * alpha, 0.7))
      gradient.addColorStop(0.085, colorLight(color, 0.9 * alpha, 0.6))
      gradient.addColorStop(0.09, colorLight(color, 0.9 * alpha, 0.55))
      gradient.addColorStop(0.12, colorLight(color, 0.75 * alpha, 0.4))
      gradient.addColorStop(1, 'transparent')
      this.context.fillStyle = gradient
      this.context.arc(point[0], point[1], _radius * 2, 0, Math.PI * 2)
      this.context.fill()
      this.context.restore()
    },
    drawRipple (point, color, progress) {
      if (typeof color === 'object') {
        let maxkey = Math.max.apply(null, Object.keys(color))
        color = color[maxkey]
      }
      this.context.save()
      this.context.scale(1, 0.6)
      let extendR = this.option.lines.ripple.radius * progress / 100
      let gradient2 = this.context.createRadialGradient(point[0], point[1] / 0.6, 0, point[0], point[1] / 0.6, this.option.lines.width * this.vertaxR + extendR / 3)
      gradient2.addColorStop(0, colorRgba(color, 0.7))
      gradient2.addColorStop(0.6, 'transparent')
      gradient2.addColorStop(1, 'transparent')
      this.context.fillStyle = gradient2
      if (progress / 100 < 0.2) {
        this.context.globalAlpha = 1
      } else if (progress / 100 >= 0.2 && progress / 100 < 1) {
        this.context.globalAlpha = (this.option.lines.ripple.radius - extendR) / (0.8 * this.option.lines.ripple.radius)
      } else {
        this.context.globalAlpha = 0
      }
      this.context.beginPath()
      this.context.arc(point[0], point[1] / 0.6, this.option.lines.width * this.vertaxR + extendR / 3, 0, 2 * Math.PI)
      this.context.fill()
      let gradient3 = this.context.createRadialGradient(point[0], point[1] / 0.6, 0, point[0], point[1] / 0.6, this.option.lines.width * this.vertaxR + extendR)
      gradient3.addColorStop(0, 'transparent')
      gradient3.addColorStop(0.6, 'transparent')
      gradient3.addColorStop(1, colorRgba(color, 0.9))
      this.context.fillStyle = gradient3
      this.context.beginPath()
      this.context.arc(point[0], point[1] / 0.6, this.option.lines.width * this.vertaxR + extendR, 0, 2 * Math.PI)
      this.context.fill()
      this.context.restore()
    },
    drawCurvePath (start, end, bezier, color) {
      const [bezierS, bezierQ, bezierE] = bezier
      this.context.save()
      let gradient = this.context.createLinearGradient(start[0], start[1], end[0], end[1])
      let shadowGradient = '#fff'
      if (typeof color === 'object') {
        Object.keys(color).forEach(per => {
          gradient.addColorStop(Number(per), color[per])
        })
        let maxkey = Math.max.apply(null, Object.keys(color))
        shadowGradient = colorLight(color[maxkey], 1, 0.6)
      } else {
        shadowGradient = colorLight(color, 1, 0.6)
        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.9, color)
        gradient.addColorStop(1, color)
      }
      this.context.lineWidth = this.option.lines.width
      this.context.strokeStyle = gradient
      this.context.shadowColor = shadowGradient
      this.context.shadowBlur = this.option.lines.width * 1.5
      this.context.beginPath()
      this.context.moveTo(bezierS[0], bezierS[1])
      this.context.quadraticCurveTo(
        bezierQ[0], bezierQ[1],
        bezierE[0], bezierE[1]
      )
      this.context.stroke()
      this.context.restore()
    },
    getPointPosition (from, to, curveness, percent) {
      var cp = [
        (from[0] + to[0]) / 2 - (from[1] - to[1]) * curveness,
        (from[1] + to[1]) / 2 - (to[0] - from[0]) * curveness
      ]
      var t = percent / 100
      var p0 = from
      var p1 = cp
      var p2 = to
      var v01 = [p1[0] - p0[0], p1[1] - p0[1]] // 向量<p0, p1>
      var v12 = [p2[0] - p1[0], p2[1] - p1[1]] // 向量<p1, p2>
      var q0 = [p0[0] + v01[0] * t, p0[1] + v01[1] * t]
      var q1 = [p1[0] + v12[0] * t, p1[1] + v12[1] * t]
      var v = [q1[0] - q0[0], q1[1] - q0[1]] // 向量<q0, q1>
      var b = [q0[0] + v[0] * t, q0[1] + v[1] * t]
      return [p0, q0, b]
    },
    // 算出透视的弧度（根据Math.cos算出）
    getCurveness (from, to, curveness, angel) {
      let oldAngel = Math.atan((to[1] - from[1]) / (to[0] - from[0]))
      // 第二象限、第三象限 atan返回的值为-PI/2 ~ PI/2
      if ((to[1] - from[1] >= 0 && to[0] - from[0] <= 0) || (to[1] - from[1] <= 0 && to[0] - from[0] <= 0)) {
        oldAngel = oldAngel + Math.PI
      }
      let newAngel = oldAngel + angel * Math.PI / 180
      return curveness / 2 * (Math.cos(newAngel) + 0.5)
    }
  },
  mounted () {
    // 必须加
    this.$nextTick(() => {
      this.debounceDraw()
    })
  },
  beforeDestroy () {
    this.destroy()
  }
}
</script>
<style lang="less" scoped>
.lines {
  position: absolute;
  left: 0;
  top: 0;
}
canvas {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
