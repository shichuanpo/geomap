<template lang="pug">
  .map-container(:style="{background:mergeOption['background']}")
    geomap(:option="mergeOption", :geo-json="chinaJson", v-if="mergeOption.map.show", @onload="mapOnLoadHandler")
    heatmap(:option="mergeOption", :geo-json="chinaJson", v-if="mergeOption.heatmap.show && mapOnLoad", :data="heatmapData")
    lines(:option="mergeOption", ref="lines", :geo-json="chinaJson", v-if="mergeOption.lines.show && mapOnLoad", :data="lineData", @flytimes="flytimes")
    points(:option="mergeOption", ref="points", :geo-json="chinaJson", v-if="mergeOption.points.show && mapOnLoad", :data="pointData", @click="pointHandler('click', $event)", @mousedown="pointHandler('mousedown', $event)")
</template>
<script>
import chinaJson from '../utils/china_diaoyudao.json'
import config from '../config/config.json'
import geomap from '../components/map'
import points from '../components/points'
import lines from '../components/lines'
import heatmap from '../components/heatmap'
import deepClone from '../utils/deepClone.js'
import data from '../mock/data.js'
export default {
  name: 'd3-map',
  components: { geomap, points, lines, heatmap },
  data () {
    return {
      chinaJson: deepClone({}, chinaJson),
      lineData: [],
      pointData: [],
      heatmapData: [],
      width: 0,
      height: 0,
      mapOnLoad: false
    }
  },
  props: ['option'],
  computed: {
    mergeOption () {
      let mqopt = deepClone({}, config.option, this.option || {})
      return deepClone({}, mqopt, {
        'real-width': mqopt.width === 'auto' ? this.width : mqopt.width,
        'real-height': mqopt.height === 'auto' ? this.height : mqopt.height
      })
    }
  },
  watch: {
    dsChange: {
      handler () {
        this.getData()
      },
      deep: true
    }
  },
  methods: {
    mapOnLoadHandler (onload) {
      this.mapOnLoad = onload
      this.$emit('mapOnload', onload)
    },
    pause () {
      this.$refs.lines.pause()
      this.$refs.points.isplay = false
    },
    replay () {
      this.$refs.lines.replay()
      this.$refs.points.isplay = true
    },
    flytimes (times) {
      this.$emit('flytimes', times)
    },
    pointHandler (type, point) {
      this.$emit(type, point)
    },
    getData () {
      this.lineData = data.lines || []
      this.pointData = data.points || []
      this.heatmapData = data.heatmap || []
    },
    resize () {
      this.width = this.$parent.$el.clientWidth
      this.height = this.$parent.$el.clientHeight
    }
  },
  mounted () {
    this.resize()
    this.getData()
    window.addEventListener('resize', this.resize)
  },
  // 如果有keep-alive resize会让宽高变0
  activated () {
    this.resize()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resize)
  }
}
</script>
<style lang="less">
html,
body {
  height: 100%;
}
.map-container {
  position: relative;
  overflow: hidden;
  height: 100%;
}
.icon {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 999;
}
.map {
  position: relative;
  z-index: 998;
}
</style>
