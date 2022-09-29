<template>
  <div id="top-right-nav">

    <div class="top-right vertical-container">

      <!-- Information button -->
      <button class="roundButton">
        <div class="icon-svg infoDiv" @click="infoButtonClicked">info</div>
      </button>

      <!-- Language selector -->
      <language-selector></language-selector>
    
      <!-- Compass button -->
      <button class="roundButton" @click="compassButtonClicked" :title="$i18n.t('compassButtonTitle')">
        <svg ref="compass-icon" class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <path id="South" class="south"
            d="M332.782,253.277a25.947,25.947,0,0,1,0,15.446L261.812,461.8c-1.567,4.265-4.109,4.265-5.677,0l-70.97-193.073a25.947,25.947,0,0,1,0-15.446H332.782Z" />
          <path id="North" class="north"
            d="M261.812,52.2l70.97,193.073a25.947,25.947,0,0,1,0,15.446H185.165a25.947,25.947,0,0,1,0-15.446L256.135,52.2C257.7,47.939,260.245,47.939,261.812,52.2Z" />
          <circle id="Center" class="center" cx="260" cy="257" r="10" />
        </svg>
      </button>


      
    
  
    </div>
  </div>
</template>





<script>
import LanguageSelector from '/OBSEA/Components/TopRight/LanguageSelector.vue'


export default {
  name: "TopRightNav",
  created() {

  },
  mounted() {
    // Declare events
    // Listen to the camera orientation
    window.eventBus.on('Canvas3D_cameraChange', (sceneManager) => {
      // Find orientation
      let target = sceneManager.controls.target;
      let camPos = sceneManager.camera.position;
      let xDir = camPos.x - target.x;
      let zDir = camPos.z - target.z;
      let angle = Math.atan2(xDir, zDir) * 180 / Math.PI;
      // Rotate compass in the opposite direction
      this.$refs["compass-icon"].style.transform = "rotate(" + angle + "deg)";
    })

  },
  data() {
    return {

    }
  },
  methods: {
    // USER ACTIONS
    compassButtonClicked: function (e) {
      window.eventBus.emit('TopRightNav_compassButtonClicked');
    },
    infoButtonClicked: function(e){
      //window.eventBus.emit('TopRightNav_infoButtonClicked');
      window.eventBus.emit('OpenCentralPanel', 'infoPanel');
      //window.open('https://github.com/BlueNetCat/OBSEA', '_blank');
    }
  },
  components: {
    "language-selector": LanguageSelector
  }
}
</script>













<style scoped>
.top-right {
    margin: 0;
    position: absolute;
    top: 50px;
    right: 10px;
  }

  .vertical-container {
    display: flex;
    flex-direction: column;
    width: fit-content;
    padding: 0;
    align-items: flex-end;
  }

  .roundButton {
    border-style: none;
    padding: 0;
    margin-bottom: 10px;
    border-radius:50%;
  }

  .roundButton:hover {
    background-color: rgb(176, 176, 176);
  }

  .infoDiv {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-svg:hover{
    border-width: 2px;
    border-color: black;
    border-style: solid;
    border-radius: 50%;
  }


  .north {
    stroke: #1a1a1a;
    stroke-width: 20px;
    fill-rule: evenodd;
    fill: #ed1c24;
  }
  .south {
    stroke: #1a1a1a;
    stroke-width: 20px;
    fill-rule: evenodd;
    fill: #ebebeb;
  }
  .center{
    stroke: #1a1a1a;
    stroke-width: 20px;
    fill: #1a1a1a;
  }
</style>