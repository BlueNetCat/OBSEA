<template>
  <div id="data-ticker">

    <!-- Current information available (temp, etc...)-->
    <div class="bottom-bar" v-show="true">
      <div class="data-title">
        {{$t('timeControl.' + dataOrigin)}}
      </div>
      <div class="data-text">
        <div>
          <template v-for="(value, key) in dataOnTimeInstant"><!-- Avoids creating a HTML element -->
            {{$t(key)}}: {{value}} , 
          </template>
          <!-- TODO: Duplicate this section to have continuous text https://www.fridaandfolks.com/ -->
          <!-- {{$t("Date")}}: {{date.toLocaleString()}},

          {{$t("Wind speed")}}: {{WSPD}} m/s,
          {{$t("Wind direction")}}: {{WDIR}}º,
          {{$t("Wave significant height")}}: {{HM0}} m,

          {{$t("Air temperature")}}: {{AIRT}}ºC,
          {{$t("Atmospheric pressure")}}: {{APRES}} bars,

          {{$t("Sea surface temperature")}}: {{TEMP}}ºC,
          {{$t("Sea bottom temperature")}}(~20m): {{TEMPBOTTOM}}ºC,
          {{$t("Salinity")}}: {{PSAL}} ‰, -->
        </div>

      </div>
    </div>

  </div>
</template>



<script>

export default {
  name: "dataTicker",
  mounted() {
    // Subscribe to camera change to hide OBSEA underwater camera
    window.eventBus.on('Canvas3D_cameraChange', (sceneManager) => {
      let camPos = sceneManager.camera.position;
      if (camPos.y < -10) {
        this.isUnderwater = true;
      }
      if (camPos.y > -5)
        this.isUnderwater = false;
    });

    window.eventBus.on('DataStreamsBar_dataDailyUpdate', (params) => { this.dataOrigin = "dailyMax"; this.updateDataTicker(params)});
    window.eventBus.on('DataStreamsBar_dataHalfHourlyUpdate', (params) => { this.dataOrigin = "halfHourly"; this.updateDataTicker(params) });
  },
  data() {
    return {
      isUnderwater: false,
      showCamera: false,

      DataManager: DataManager,
      date: new Date(),
      dataOrigin: "dailyMax",

      dataOnTimeInstant: {},


    }
  },
  methods: {
    // TODO: instantaneous when it is loaded
    updateDataTicker: function(params){

      this.dataOnTimeInstant = {}; // Reset
      
      Object.keys(params).forEach((key) => {
        // Measures
        let dataType = this.DataManager.OBSEADataRetriever.DataTypes[key];
        // Date
        // if (key == "timestamp"){
        //   this.dataOnTimeInstant.Date = params[key].toLocaleString();
        // }
        if (dataType){
          this.dataOnTimeInstant[key] = params[key].toFixed(1) + " " + dataType.units;
        } 
      });
    }

  },
  components: {

  }
}
</script>






<style scoped>
#data-ticker {
  bottom: 0px;
  width: 100vw;
}



/* Bottom bar with data */
.bottom-bar {
  /* background-color: #acd1ffc7; */
  background-color: rgba(16, 112, 150, 0.9);
  font-size: small;
  color: white;

  pointer-events: auto;
  user-select: none;

  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.bottom-bar>div {
  padding: 5px;
}

.data-title {
  white-space: nowrap;
  border-radius: 0.2rem;
  border: 2px solid rgba(255, 255, 255, 0.7);
  background-color: rgba(4, 85, 117, 1);
  color: white;
  padding-right: 2px;
  z-index: 1;
}

.data-text {
  z-index: 0;
  white-space: nowrap;
  animation: tickerh linear 20s infinite;
  transform-style: preserve-3d;
  will-change: transform;
}

.data-text:hover {
  animation-play-state: paused;
}

/* Data text ticker animation */
@keyframes tickerh {
  0% {
    transform: translate3d(75%, 0px, 0px);

  }

  100% {
    transform: translate3d(-100%, 0px, 0px);
  }
}
</style>