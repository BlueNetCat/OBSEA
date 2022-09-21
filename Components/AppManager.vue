<template>
  <!-- Container -->
  <div id="app-manager">

    <!-- Canvas 3D -->
    <canvas3D></canvas3D>

    <!-- Left Icons -->
    <instruments-menu></instruments-menu>

    <!-- Bottom Bar -->

    <!-- Top right icons -->
    <top-right-nav></top-right-nav>

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
import InstrumentsMenu from "/OBSEA/Components/Instruments/InstrumentsMenu.vue"
import TopRightNav from "/OBSEA/Components/TopRight/TopRightNav.vue"

export default {
  name: "AppManager",
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
    "canvas3D": Canvas3D,
    "instruments-menu": InstrumentsMenu,
    "top-right-nav": TopRightNav
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