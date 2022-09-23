<template>
  <div id="central-panel">
    <div class="container">

      <!-- Closing cross -->
      <button class="closing-cross roundButton icon-svg" @click="closePanelClicked">X</button>

      <!-- Title -->
      <div class="content">
        <h2>{{$t('seaPanel.title')}}</h2>
        <p> {{$t('seaPanel.p1')}}
          <a href="https://catlikecoding.com/unity/tutorials/flow/waves/" target="_blank">{{$t('seaPanel.p1_1')}}</a>.
        </p>
        <p> {{$t('seaPanel.p2')}}</p>

        
        <!--Ocean steepness -->
        <p>Set the ocean steepness</p>
        <div style="display: flex; justify-content: center;">
          <input class="input-slider" style="width:80%" type="range" min="0.01" max="0.5" value="0.2" step="0.001" @input="steepnessSliderClicked"/>
        </div>
        

      </div>

    </div>
  </div>
</template>






<script>



export default {
  name: "CentralPanel",
  created() {

  },
  mounted() {
    // Declare events
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

    }
  },
  methods: {
    // USER ACTIONS
    closePanelClicked: function(e){
      // Send event
      // Maybe do it as "emit", as only the parent reacts to it.
    },
    steepnessSliderClicked : function(e){
      // Emit event for Canvas 3D
      window.eventBus.emit('CentralPanel_steepnessSliderClicked', parseFloat(e.target.value))
    }
    // compassButtonClicked: function (e) {
    //   window.eventBus.emit('TopRightNav_compassButtonClicked');
    // },
    // infoButtonClicked: function (e) {
    //   window.eventBus.emit('TopRightNav_infoButtonClicked');
    //   window.open('https://github.com/BlueNetCat/OBSEA', '_blank');
    // }
  },
  components: {
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
  margin: 10%;
  right: 5%;
  overflow:none;
}
@media screen and (max-width: 500px) {
  #central-panel {
    width: 100vw;
    margin: 0;
    right: 0;
    max-height: 100vh!important;
  }
}

.container {
  display:flex;
  flex-direction: column;
  justify-items: center;
  padding: 10px;
  max-height: inherit
  
}

.content {
  padding: 20px;
  overflow: auto;
}

.closing-cross {
  position:absolute;
  right: 10px;
}
</style>