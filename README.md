# geomap

## Demo

[迁徙图+热力图实例](https://shichuanpo.github.io/geomap/demo)

## Props
```javascript
option: {
  "background": "rgba(11,21,56,1)", // 整个容器的背景色
  "width": "auto", // 支持数值 比如1000 暂不支持百分比 auto的时候为撑满父容器
  "height": "auto", // 同上
  "map": {
    "show": true,
    "padding": { // 支持对象写法，上下左右，也支持直接数值，比如 10，代表上下左右都为10
      "left": 0, // 左边距
      "right": 0, // 右边距
      "top": 0, // 上边距
      "bottom": 0 // 下边距
    },
    "scale": 0.9, // 地图相对容器的比例， 1为铺满
    "background": "rgba(4, 20, 51, 0.8)", // 地图背景颜色
    "rotate": {
      "x": 35, // 地图的x轴旋转角度
      "y": -3, // 地图的y轴旋转角度
      "z": 9, // 地图的z轴旋转角度
      "perspective": 1000 // 地图的透视距离
    },
    "pattern": { // 地图纹理
      "show": true,
      "img": "http://orxxyc255.bkt.clouddn.com/map-pattern2.png"
    },
    "stroke": {
      "color": "rgba(0, 199, 243, 0.3)", // 地图边框颜色
      "width": 1 // 边框粗细
    },
    "border": {
      "show": true,
      "color": "rgba(46, 183, 230, 0.25)", // 发光层地图发光颜色
      "offset": {
        "x": -3, // 发光层地图发光横向偏移
        "y": 5 // 发光层地图发光纵向偏移
      },
      "blur": 2 // 发光层地图发光模糊值
    },
    "shadow": {
      "show": true,
      "color": "rgba(0,0,0,0.3)", // 地图阴影颜色
      "offset": {
        "x": -10, // 地图阴影横向偏移
        "y": 40 // 地图阴影纵向偏移
      },
      "blur": 30 // 地图阴影模糊值
    },
    "label": {
      "show": false, // 是否显示省份名称
      "font": "11px Arial", // 字体大小和名称
      "color": "rgba(4, 204, 239, .5)" // 字体颜色
    }
  },
  "lines": {
    "show": false,
    "speed": {
      "type": "linear", // 缓动函数类型，目前支持 linear/easeIn/easeOut/easeInOut
      "initial": 1.5, // 初始速度
      "duration": 2000, // 速度达到增量数需要的时间(ms)
      "variable": 5, // 速度的变量，变量为0的时候为匀速
      "min": 1, // 最小速度设定 null置空
      "max": 10 // 最大速度设定 null置空
    },
    "colors": ["#FF6420", "#FF58C0", "#FFF366", "#5C48FF", "#39FF84", "#39C7FF", {
      "0": "transparent",
      "0.33": "#0073f5",
      "0.66": "#00f6ff",
      "1": "#93f1ff"
    }], // 线条颜色, 如果线条数大于配置的颜色数，就循环, 支持16进制或者rgb或者rgba颜色，也支持对象渐变颜色
    "width": 3, // 线条的粗细
    "curvature": 0.5, // 弯曲的程度， 0 - 1
    "ripple": {
      "show": true,
      "speed": {
        "type": "linear",
        "initial": 1.5,
        "duration": 500,
        "variable": 0,
        "min": 1,
        "max": 10
      },
      "radius": 25 // 飞线到达终点后圆点扩散的最大半径
    },
    "delay": 350, // 发射线的延时事件，以及光影效果的时间
    "randomDelay": 0 // 每条发射线的随机延时（用于错峰发射）
  },
  "points": {
    "show": true,
    "width": 50, // logo宽
    "height": 50, // logo高
    "label": {
      "show": true,
      "style": {
        "color": "#fff",
        "font-size": "16px",
        "font-weight": "600",
        "margin-top": "43px",
        "text-shadow": "0px 0px 15px #005ce6,0px 0px 20px #005ce6"
      }
    },
    "ripple": {
      "show": true, // 是否显示波纹
      "width": 50, // 波纹的宽度 用以改变圆形为椭圆
      "height": 50, // 波纹的高度
      "options": [
        {
          "scale": 1, // 每一圈的波纹占全部半径的百分比
          "style": { // 支持样式
            "background": "rgba(255,255,255, 0.3)"
          },
          "animate": true // 是否要呼吸动画
        },
        {
          "scale": 0.6,
          "style": {
            "background": "rgba(255, 255, 255, 0.4)"
          },
          "animate": false
        },
        {
          "scale": 0.3,
          "style": {
            "background": "rgba(255, 255, 255, 0.6)"
          },
          "animate": false
        },
        {
          "scale": 0.1,
          "style": {
            "background": "rgba(255, 255, 255, 1)"
          },
          "animate": false
        }
      ]
    },
    "illuminant": {
      "show": true, // logo底部的发光源效果
      "width": 400, // 宽高配置
      "height": 240, // 宽高配置
      "img": "http://orxxyc255.bkt.clouddn.com/illuminant.png", // 发光源贴图，如果不填，将采用默认光源
      "animate": true // 光源的呼吸效果
    },
    "enterAnima": true, // logo进场动画
    "loopAnima": true // logo循环动画
  },
  "heatmap": {
    "show": false, // 是否显示热力图
    "radius": 10, // 热力图半径（像素级别, 如果是浮点数，向上取整）
    "max": 1000, // 热力图高峰值可以设置为‘auto’ 或者 数字，如 500（如果设置为auto，则max为数据中的最大值）
  }
}
```
