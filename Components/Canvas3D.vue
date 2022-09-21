<template>
  <!-- Container -->
  <div id="canvas3Dcontainer">
    <canvas id="canvas3D" ref="canvas3D"></canvas>



  </div>
</template>



<script>
// Import components

//import Map from "Map.vue";

export default {
  name: "Canvas3D",
  created() {
    
  },
  mounted() {
    let sceneManager = new window.SceneManager(this.$refs.canvas3D);
    sceneManager.startRender();

    // Events
    window.eventBus.on('InstrumentsMenu_buoyButtonClicked', () => {
      sceneManager.focusOnBuoy();
    });
    window.eventBus.on('InstrumentsMenu_baseButtonClicked', () => {
      sceneManager.focusOnBase();
    });
  },
  data() {
    return {

    }
  },
  methods: {
    //onclick: function(e){},
  },
  components: {
    //"ol-map": Map,
  }
}
</script>


<style scoped>
#canvas3D {
  width: 100vw;
  height: 100vh;
  position: absolute;
  background-color: red;
  z-index: 0;
}
</style>