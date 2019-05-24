<template>
  <div id="app">
    <geomap/>
  </div>
</template>

<script>
import geomap from './views/index.vue'

export default {
  name: 'app',
  components: {
    geomap
  }
}
</script>

<style>
html,body{
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
