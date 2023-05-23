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
    this.sceneManager.windowWasResized();

    // Event listeners
    // Window resize
    window.addEventListener('resize', (e) => {
      this.sceneManager.windowWasResized();
    });
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
    const updateData = (dataInTimestamp) => {
      // Ocean
      if (this.sceneManager.ocean){
        if (dataInTimestamp['Hm0']){
          // TODO: THIS CALLS GENERATEWAVES 3 TIMES (PARAMETERS COULD BE SET AT ONCE)
          this.sceneManager.ocean.updateWaveSignificantHeight(dataInTimestamp['Hm0']);
          this.sceneManager.ocean.updateMeanWaveDirection(dataInTimestamp['Mdir']);
          this.sceneManager.ocean.updateDirectionalSpread(dataInTimestamp['Spr1']);
          // Generate swell
          generateSwell(dataInTimestamp['Hm0'], dataInTimestamp['Mdir']);
          // Calculate steepness
          let steepness = 0.1 + 0.3 * Math.min(1, dataInTimestamp['Hm0'] / 6);
          this.sceneManager.ocean.updateSteepness(steepness);
        } else { // No ocean data
          this.sceneManager.ocean.updateWaveSignificantHeight(0.1);
          this.sceneManager.ocean.updateMeanWaveDirection(0);
          this.sceneManager.ocean.updateDirectionalSpread(180);
          this.sceneManager.ocean.updateSteepness(0.05);
          // Reset swell
          generateSwell(0.05, 180);
        }
      }
      // Wind
      if (this.sceneManager.flag){
        if (dataInTimestamp['WSPD']){
          this.sceneManager.flag.showFlag();
          this.sceneManager.flag.setWindParameters('windSpeed', dataInTimestamp['WSPD'] * 3.6); // km/h
          this.sceneManager.flag.setWindParameters('windDirection', dataInTimestamp['WDIR']);
          // Ocean steepness
          if (this.sceneManager.ocean){
            let windKMH = dataInTimestamp['WSPD'] * 3.6;
            let steepness = 0.05 + 0.25 * Math.min(1, windKMH / 25);
            this.sceneManager.ocean.updateSteepness(steepness);
          }
        } else { // Hide flag when there is no wind data
          this.sceneManager.flag.hideFlag();
        }
      }// Wind text
      if (this.sceneManager.windText){
        if (dataInTimestamp['WSPD']) {
          let text = (dataInTimestamp['WSPD'] * 3.6).toFixed(1);
          this.sceneManager.windText.updateText(text + " km/h");
        } else
          this.sceneManager.windText.removeText();
      }
      // Currents
      if (this.sceneManager.currents && dataInTimestamp['UCUR_0m']){
        this.sceneManager.currents.showCurrents();
        this.sceneManager.currents.setCurrentParameters(dataInTimestamp);
      } else {
        this.sceneManager.currents.hideCurrents();
      }

      // Temperature and salinity texts
      if (this.sceneManager.tempText)
        if (dataInTimestamp['TEMP'])
          this.sceneManager.tempText.updateText(dataInTimestamp['TEMP'].toFixed(1) + " C");
        else
          this.sceneManager.tempText.removeText();
      if (this.sceneManager.salText)
        if (dataInTimestamp['PSAL'])
          this.sceneManager.salText.updateText(dataInTimestamp['PSAL'].toFixed(1) + " psu");
        else
          this.sceneManager.salText.removeText();

    };
    const generateSwell = (Hm0, Mdir) => {
      // Calculate steepness
      let steepness = 0.1 + 0.2 * Math.min(1, Hm0/3);
      if (Hm0 < 0.1) steepness = 0.05;
      this.sceneManager.ocean.updateSwell('height', Hm0, 0);
      this.sceneManager.ocean.updateSwell('direction', Mdir, 0);
      this.sceneManager.ocean.updateSwell('steepness', steepness, 0);
    }
    window.eventBus.on('DataStreamsBar_dataDailyUpdate', updateData);
    window.eventBus.on('DataStreamsBar_dataHalfHourlyUpdate', updateData);

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
        this.sceneManager.ocean.updateSwell('height',height, 0);
    });
    window.eventBus.on('SeaPanel_swell1DirectionKnobClicked', (direction) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateSwell('direction', direction, 0);
    });
    window.eventBus.on('SeaPanel_swell1SteepnessSliderClicked', (steepness) => {
      if (this.sceneManager.ocean)
        this.sceneManager.ocean.updateSwell('steepness', steepness, 0);
    });
    // ***** WIND PANEL *****
    // Change wind
    window.eventBus.on('WindPanel_windSpeedSliderClicked', (windSpeed) => {
      if (this.sceneManager.flag)
        this.sceneManager.flag.setWindParameters('windSpeed', windSpeed);
      if (this.sceneManager.windText)
        this.sceneManager.windText.updateText(windSpeed.toFixed(1) + ' km/h');
    });
    window.eventBus.on('WindPanel_windDirectionKnobClicked', (direction) => {
      if (this.sceneManager.flag)
        this.sceneManager.flag.setWindParameters('windDirection', direction);
    });


    



    // Event emitters
    // Listeners: TopRightNav, BottomSection
    this.sceneManager.controls.addEventListener('change', (e) => {
      window.eventBus.emit('Canvas3D_cameraChange', this.sceneManager);

      // Update text mesh
      if (this.sceneManager.scene){
        if (this.sceneManager.windText){
          this.sceneManager.windText.faceCamera();
        }
      }

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