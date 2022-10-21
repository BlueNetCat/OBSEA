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
    // ***** INSTRUMENTS PANEL *****
    // Center on instruments
    window.eventBus.on('InstrumentsMenu_buoyButtonClicked', () => {
      this.sceneManager.focusOnBuoy();
    });
    window.eventBus.on('InstrumentsMenu_baseButtonClicked', () => {
      this.sceneManager.focusOnBase();
    });
    window.eventBus.on('InstrumentsMenu_fpsButtonClicked', () => {
      this.sceneManager.showHideFPS();
    });

    // ***** TOP-RIGHT ICONS *****
    // Face northward
    window.eventBus.on('TopRightNav_compassButtonClicked', () => {
      this.sceneManager.faceNorthward();
    });


    // ***** TIME BAR WITH DATA *****
    window.eventBus.on('DataStreamsBar_dataDailyUpdate', (dataInTimestamp) => {

      // Ocean
      if (this.sceneManager.ocean && dataInTimestamp['Hm0']){
        this.sceneManager.ocean.updateWaveSignificantHeight(dataInTimestamp['Hm0']);
        this.sceneManager.ocean.updateMeanWaveDirection(dataInTimestamp['Mdir']);
      }
      // Wind
      if (this.sceneManager.flag && dataInTimestamp['WSPD']){
        this.sceneManager.flag.setWindParameters('windSpeed', dataInTimestamp['WSPD'] * 3.6); // km/h
        this.sceneManager.flag.setWindParameters('windDirection', dataInTimestamp['WDIR']);
      }
      // Currents
      if (this.sceneManager.currents && dataInTimestamp['UCUR_0m']){
          this.sceneManager.currents.setCurrentParameters(dataInTimestamp);
      }

    });


    // ***** SEA PANEL *****
    // Change ocean steepness
    window.eventBus.on('SeaPanel_steepnessSliderClicked', (steepness) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateSteepness(steepness);
    });
    // Change wave significant height
    window.eventBus.on('SeaPanel_waveSignificantHeightSliderClicked', (hm0) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateWaveSignificantHeight(hm0);
    });
    // Change mean wave direction
    window.eventBus.on('SeaPanel_meanWaveDirectionKnobClicked', (mdir) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateMeanWaveDirection(mdir);
    });
    // Change swell 1
    window.eventBus.on('SeaPanel_swell1HeightSliderClicked', (height) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateSwell1('height',height);
    });
    window.eventBus.on('SeaPanel_swell1DirectionKnobClicked', (direction) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateSwell1('direction', direction);
    });
    window.eventBus.on('SeaPanel_swell1SteepnessSliderClicked', (steepness) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateSwell1('steepness', steepness);
    });
    // ***** WIND PANEL *****
    // Change wind
    window.eventBus.on('WindPanel_windSpeedSliderClicked', (windSpeed) => {
      if (this.sceneManager.flag)
        this.sceneManager.flag.setWindParameters('windSpeed', windSpeed);
    });
    window.eventBus.on('WindPanel_windDirectionKnobClicked', (direction) => {
      if (this.sceneManager.flag)
        this.sceneManager.flag.setWindParameters('windDirection', direction);
    });


    



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