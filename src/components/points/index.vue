<template lang="pug">
transition(name="fade")
  .points(v-show="(pointsShow || !option.points.enterAnima) && isplay")
    .point(v-for="point in points",
      @click="pointHandler('click', point)",
      @mousedown="pointHandler('mousedown', point)",
      :style="{width:logoWidth+'px',height:pointHeight+'px',left:point.location[0]-logoWidth/2+'px',top:point.location[1]-pointHeight+'px'}"
      @mouseenter="mouseIn=point",
      @mouseleave="mouseIn=false"
      )
      .circle(
        v-if="option.points.ripple.show",
        v-for="opt in option.points.ripple.options",
        :style="getRippleStyle(opt)",
        :class="{'animation': mouseIn!==point && opt.animate}")
      .illuminant(
        v-if="option.points.illuminant.show",
        :style="{width:illuminantWidth+'px',height:illuminantHeight+'px',bottom:(-illuminantHeight/2)+'px',left:(logoWidth-illuminantWidth)/2+'px'}"
      )
        img(:src="option.points.illuminant.img || illuminantImg", :class="{'animation': mouseIn!==point && option.points.illuminant.animate}")
      .img(:class="{'animation': mouseIn!==point && option.points.loopAnima, 'show': point.loaded}")
        label.logotext(:style="option.points.label.style", v-if="option.points.label.show") {{point.name}}
        img(:src="point.img", :style="{width:logoWidth+'px',height:logoHeight+'px'}")
</template>
<script>
import getId from '../../utils/uniqueId.js'
import pointImg from './base64/point.js'
import illuminantImg from './base64/illuminant.js'
import { getProjection, translate3dTo2d } from '../../utils/map-controller.js'
import deepClone from '../../utils/deepClone.js'
export default {
  name: 'points',
  props: ['option', 'geoJson', 'data'],
  data () {
    return {
      jumpHeight: 20, // 跟下面keyframe统一
      rippleWidth: this.option.points.ripple.width || 50,
      rippleHeight: this.option.points.ripple.height || 50,
      illuminantWidth: this.option.points.illuminant.width || 50,
      illuminantHeight: this.option.points.illuminant.height || 50,
      mouseIn: false,
      pointId: getId('points'),
      pointsShow: false,
      isplay: true,
      illuminantImg: illuminantImg,
      points: []
    }
  },
  watch: {
    data: {
      handler (dat) {
        this.resetPoints(dat)
      },
      deep: true
    }
  },
  computed: {
    logoWidth () {
      return this.option.points.width
    },
    logoHeight () {
      return this.option.points.height
    },
    pointHeight () {
      return this.logoHeight + this.jumpHeight
    }
  },
  mounted () {
    setTimeout(() => {
      this.pointsShow = this.option.points.enterAnima
    }, 1000)
  },
  methods: {
    pointHandler (type, point) {
      this.$emit(type, point)
    },
    resetPoints (data) {
      let projection = this.getProjection()
      let iconPoints = []
      this.points = []
      data.forEach(point => {
        let projectPoint = projection(point.point)
        let transPoint = translate3dTo2d([this.option['real-width'] / 2, this.option['real-height'] / 2], projectPoint, this.option.map.rotate)
        iconPoints.push(deepClone({
          location: transPoint,
          loaded: false
        }, point))
      })
      iconPoints.forEach(point => {
        point.img = point.img || pointImg
        let image = new Image()
        image.src = point.img
        image.onerror = image.onload = () => {
          point.loaded = true
        }
        let isExist = this.points.find(item => {
          return item.img && item.point[0] === point.point[0] && item.point[1] === point.point[1] && item.img === point.img
        }) // 去重
        !isExist && this.points.push(point)
      })
      this.isplay = true
    },
    getRippleStyle (option = {}) {
      let scale = 1.2 * option.scale
      let styleOpt = {
        width: (this.rippleWidth * scale) + 'px',
        height: (this.rippleHeight * scale) + 'px',
        bottom: (-this.rippleHeight * scale * 0.5) + 'px',
        left: ((this.logoWidth - this.rippleWidth * scale) / 2) + 'px'
      }
      return Object.assign({}, styleOpt, option.style)
    },
    getProjection () {
      return getProjection(this.geoJson, this.option, this.option['real-width'], this.option['real-height'])
    }
  },
  created () {
    this.resetPoints(this.data)
  }
}
</script>
<style lang="less" scoped>
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
  .fade-leave,
  .fade-enter-to {
    opacity: 1;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: all 2.5s;
  }
  .points{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    .point{
      position: absolute;
      cursor: pointer;
      &:hover{
        img{
          transform: scale(1.05, 1.05);
        }
      }
      .img{
        position: absolute;
        bottom: 5px;
        opacity: 0;
        &.animation{
          animation:jump 3s infinite;
        }
        &.show{
          opacity: 1;
        }
        img{
          display: block;
        }
        .logotext{
          position: absolute;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          text-shadow: 0px 0px 15px #005ce6,0px 0px 20px #005ce6;
          /* text-align: center; */
          margin-left: 50%;
          margin-top: -20px;
          white-space: nowrap;
          transform: translate(-50%, 0);
        }
      }
      .circle{
        position: absolute;
        border-radius: 100%;
        box-sizing: border-box;
        &.animation{
          animation: expand 3s infinite;
        }
      }
      .illuminant{
        position: absolute;
        overflow: hidden;
        .animation{
          animation: expand 3s infinite;
        }
        img{
          display: block;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  @keyframes expand
  {
    0%   { transform: scale(0.95, 0.95); opacity: 0.6; }
    10%  { transform: scale(0.95056, 0.95056); opacity: 0.6032; }
    20%  { transform: scale(0.95448, 0.95448); opacity: 0.6256; }
    30%  { transform: scale(0.96512, 0.96512); opacity: 0.6864; }
    40%  { transform: scale(0.98584, 0.98584); opacity: 0.8048; }
    50%  { transform: scale(1.02, 1.02); opacity: 1; }
    60%  { transform: scale(0.98584, 0.98584); opacity: 0.8048; }
    70%  { transform: scale(0.96512, 0.96512); opacity: 0.6864; }
    80%  { transform: scale(0.95448, 0.95448); opacity: 0.6256; }
    90%  { transform: scale(0.95056, 0.95056); opacity: 0.6032; }
    100% { transform: scale(0.95, 0.95); opacity: 0.6; }
  }
  @keyframes jump
  {
    0%   { transform: translateY(-15px); }
    10%  { transform: translateY(-14.88px); }
    20%  { transform: translateY(-14.04px); }
    30%  { transform: translateY(-11.76px); }
    40%  { transform: translateY(-7.32px); }
    50%  { transform: none; }
    60%  { transform: translateY(-7.32px); }
    70%  { transform: translateY(-11.76px); }
    80%  { transform: translateY(-14.04px); }
    90%  { transform: translateY(-14.88px); }
    100% { transform: translateY(-15px); }
  }
</style>
