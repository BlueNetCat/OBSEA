<template>
  <div id="central-panel">
    <div class="container" v-show="!hidePanel">

      <!-- Closing cross -->
      <button class="closing-cross roundButton icon-svg" @click="closePanelClicked">X</button>

      <!-- Sea panel -->
      <sea-panel v-show="panelName == 'seaPanel'"></sea-panel>

      <!-- Wind panel -->
      

    </div>
  </div>
</template>






<script>

import SeaPanel from "/OBSEA/Components/Panels/SeaPanel.vue"

export default {
  name: "CentralPanel",
  created() {

  },
  mounted() {
    // Declare listening events
    
    window.eventBus.on('CloseCentralPanel', () => {
      this.hidePanel = true;
    });
    window.eventBus.on('OpenCentralPanel', (panelName) => {
      this.hidePanel = !this.hidePanel;
      this.panelName = panelName;
    });
    // Listen to the camera orientation
    // window.eventBus.on('Canvas3D_cameraChange', (sceneManager) => {
    //   // Find orientation
    //   let target = sceneManager.controls.target;
    //   let camPos = sceneManager.camera.position;
    //   let xDir = camPos.x - target.x;
    //   let zDir = camPos.z - target.z;
    //   let angle = Math.atan2(xDir, zDir) * 180 / Math.PI;
    //   // Rotate compass in the opposite direction
    //   this.$refs["compass-icon"].style.transform = "rotate(" + angle + "deg)";
    // })

  },
  data() {
    return {
      hidePanel: true,
    }
  },
  methods: {
    // USER ACTIONS
    closePanelClicked: function(e){
      // Send event
      // Maybe do it as "emit", as only the parent reacts to it.
      // TODO: arrange events better
      window.eventBus.emit('CloseCentralPanel');
    },


    // compassButtonClicked: function (e) {
    //   window.eventBus.emit('TopRightNav_compassButtonClicked');
    // },
    // infoButtonClicked: function (e) {
    //   window.eventBus.emit('TopRightNav_infoButtonClicked');
    //   window.open('https://github.com/BlueNetCat/OBSEA', '_blank');
    // }
  },
  components: {
    "sea-panel": SeaPanel
  }
}
</script>



<style scoped>
#central-panel {
  z-index: 2;
  position: absolute;
  background-color: #d7effab3;
  max-width: 600px;
  max-height: 90vh!important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow:none;
}
@media screen and (max-width: 800px) {
  #central-panel {
    width: 100vw;
    margin: 0;
    right: 0;
    max-height: 100vh!important;
  }
}

.closing-cross {
  position: absolute;
  right: 10px;
  margin-top: 10px;
}
</style>