<template lang="pug">
  transition(name="mapfade")
    .geomap(:style="{'transform':transform}", v-show="onload")
      canvas(:ref="shadowId", :id="shadowId", :width="option['real-width']", :height="option['real-height']", :style="{width:option['real-width']+'px',height:option['real-height']+'px'}")
      canvas(:ref="mapId", :id="mapId", :width="option['real-width']", :height="option['real-height']", :style="{width:option['real-width']+'px',height:option['real-height']+'px'}")
</template>
<script>
import * as d3 from 'd3'
import getId from '../../utils/uniqueId.js'
import { getProjection, getMapPath } from '../../utils/map-controller.js'
import debounce from '../../utils/debounce.js'
import defaultPatternImg from './base64/pattern.js'
export default {
  name: 'geomap',
  props: ['option', 'geoJson'],
  data () {
    return {
      mapId: getId('geomap'),
      shadowId: getId('shadow'),
      debounceDraw: debounce(this.draw, 100, this),
      loaders: this.initLoaders(),
      patternImg: null
    }
  },
  watch: {
    option: {
      handler () {
        this.clearScreen()
        this.debounceDraw()
      },
      deep: true
    },
    shadowAndBorderOnloaded (newVal) {
      newVal && this.drawMapAndLabel()
    },
    onload (newVal) {
      this.$emit('onload', newVal)
    },
    patternImg: {
      handler (newVal) {
        if (newVal && this.option.map.pattern.show && this.shadowAndBorderOnloaded) {
          this.drawMapAndLabel()
        }
      },
      deep: true
    }
  },
  computed: {
    transform () {
      let perspective = 'perspective(' + this.option.map.rotate.perspective + 'px)'
      let rotateX = 'rotateX(' + this.option.map.rotate.x + 'deg)'
      let rotateY = 'rotateY(' + this.option.map.rotate.y + 'deg)'
      let rotateZ = 'rotateZ(' + this.option.map.rotate.z + 'deg)'
      return perspective + ' ' + rotateX + ' ' + rotateY + ' ' + rotateZ
    },
    onload () {
      return Object.keys(this.loaders).every(key => {
        return this.loaders[key] === this.geoJson.features.length || !this.option.map[key].show
      })
    },
    shadowAndBorderOnloaded () {
      return ['shadow', 'border'].every(key => {
        return this.loaders[key] === this.geoJson.features.length || !this.option.map[key].show
      })
    }
  },
  methods: {
    initLoaders () {
      return {
        border: 0,
        shadow: 0,
        label: 0,
        pattern: 0
      }
    },
    getMapPath (context) {
      return getMapPath(context, this.geoJson, this.option, this.option['real-width'], this.option['real-height'])
    },
    getProjection () {
      return getProjection(this.geoJson, this.option, this.option['real-width'], this.option['real-height'])
    },
    getCanvas (id) {
      id = id || this.mapId
      return this.$refs[id]
    },
    getContext (id) {
      return this.getCanvas(id) && this.getCanvas(id).getContext('2d')
    },
    clearScreen (id) {
      this.loaders = this.initLoaders()
      let contexts = id ? [this.getContext(id)] : [this.getContext(this.mapId), this.getContext(this.shadowId)]
      contexts.forEach(context => {
        context && context.clearRect(0, 0, this.option['real-width'], this.option['real-height'])
      })
    },
    draw () {
      this.drawShadowAndBorder()
    },
    drawShadowAndBorder () {
      this.geoJson.features.forEach(d => {
        this.option.map.shadow.show && this.drawMapShadow(d)
        this.option.map.border.show && this.drawMapBorder(d)
      })
    },
    drawMapAndLabel () {
      this.geoJson.features.forEach(d => {
        this.drawMapPattern(d, this.patternImg)
        this.option.map.label.show && this.drawMapLabel(d)
      })
    },
    drawMapPattern (d, img) {
      let context = this.getContext()
      if (context) {
        this.getMapPath(context)(d)
        context.save()
        context.fillStyle = img ? context.createPattern(img, 'repeat') : this.option.map.background
        context.fill()
        context.lineWidth = this.option.map.stroke.width
        context.strokeStyle = this.option.map.stroke.color
        context.stroke()
        context.restore()
        if (img) {
          this.loaders.pattern += 1
        }
      }
    },
    drawMapBorder (d) {
      let context = this.getContext()
      if (context) {
        this.getMapPath(context)(d)
        context.save()
        context.fillStyle = this.option.map.border.color
        context.shadowColor = this.option.map.border.color
        context.shadowOffsetX = this.option.map.border.offset.x
        context.shadowOffsetY = this.option.map.border.offset.y
        context.shadowBlur = this.option.map.border.blur
        context.fill()
        context.restore()
        this.loaders.border += 1
      }
    },
    drawMapShadow (d) {
      let context = this.getContext(this.shadowId)
      if (context) {
        this.getMapPath(context)(d)
        context.save()
        context.fillStyle = this.option.map.shadow.color
        context.shadowColor = this.option.map.shadow.color
        context.shadowOffsetX = this.option.map.shadow.offset.x
        context.shadowOffsetY = this.option.map.shadow.offset.y
        context.shadowBlur = this.option.map.shadow.blur
        context.fill()
        context.restore()
        this.loaders.shadow += 1
      }
    },
    drawMapLabel (d) {
      let context = this.getContext()
      if (context) {
        context.save()
        context.beginPath()
        context.fillStyle = this.option.map.label.color
        let translateCoordinate = this.getProjection()(d3.geoCentroid(d))
        context.font = this.option.map.label.font
        context.textAlign = 'center'
        context.fillText(
          d.properties.name,
          translateCoordinate[0], translateCoordinate[1]
        )
        context.closePath()
        context.restore()
        this.loaders.label += 1
      }
    }
  },
  mounted () {
    if (this.option.map.pattern.show) {
      let img = new Image()
      img.src = this.option.map.pattern.img || defaultPatternImg
      img.onload = () => { // 防止后面的被覆盖
        this.patternImg = img
      }
    }
    // 必须加
    this.$nextTick(() => {
      this.debounceDraw()
    })
  }
}
</script>
<style lang="less" scoped>
  .geomap{
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
  .mapfade-enter-active {
    transition: opacity 1s;
  }
  .mapfade-enter, .mapfade-leave /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
