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
    this.sceneManager = new window.SceneManager(this.$refs.canvas3D);
    this.sceneManager.startRender();

    // Event listeners
    // Center on instruments
    window.eventBus.on('InstrumentsMenu_buoyButtonClicked', () => {
      this.sceneManager.focusOnBuoy();
    });
    window.eventBus.on('InstrumentsMenu_baseButtonClicked', () => {
      this.sceneManager.focusOnBase();
    });
    // Face northward
    window.eventBus.on('TopRightNav_compassButtonClicked', () => {
      this.sceneManager.faceNorthward();
    });
    // Change ocean steepness
    window.eventBus.on('CentralPanel_steepnessSliderClicked', (steepness) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateSteepness(steepness);
    })

    // Event emitters
    // Listeners: TopRightNav, BottomSection
    this.sceneManager.controls.addEventListener('change', (e) => {
      window.eventBus.emit('Canvas3D_cameraChange', this.sceneManager);
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