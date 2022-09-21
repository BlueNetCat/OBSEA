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

    // Event emitters
    this.sceneManager.controls.addEventListener('change', (e) => {
      // Find orientation
      let target = this.sceneManager.controls.target;
      let camPos = this.sceneManager.camera.position;
      let xDir = camPos.x - target.x;
      let zDir = camPos.z - target.z;
      let angle = Math.atan2(xDir, zDir) * 180 / Math.PI;
      window.eventBus.emit('Canvas3D_cameraChange', angle);
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