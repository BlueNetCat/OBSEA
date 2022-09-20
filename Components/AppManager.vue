<template>
  <!-- Container -->
  <div id="app-manager">

    <!-- Canvas 3D -->
    <canvas3D></canvas3D>

    <!-- Left Icons -->

    <!-- Bottom Bar -->

    <!-- Top right icons -->

    <!-- OBSEA Title -->

  </div>
</template>



<script>
/*
                                APP MANAGER
              /            /          \            \             \
    LEFT MENU        CANVAS       RIGHTTOPICONS    CURRENTDATA    LANGUAGE-SELECTOR
        |
    LEFT PANEL

*/

// Import components
import Canvas3D from "/OBSEA/Components/Canvas3D.vue"

export default {
  created() {
    
  },
  mounted() {

  },
  data (){
    return {

    }
  },
  methods: {
    //onclick: function(e){},
  },
  components: {
    "canvas3D": Canvas3D
  }
}
</script>


<style scoped>
  #app-manager {
    width: 100vw;
    height: 100vh;
    position: absolute;
  }

</style>