<template>
  <div id="data-ticker">

    <!-- Current information available (temp, etc...)-->
    <div class="bottom-bar" v-show="true">
      <div class="data-title">
        {{$t(dataOrigin)}}
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

    window.eventBus.on('DataStreamsBar_dataDailyUpdate', this.updateDailyDataTicker);
  },
  data() {
    return {
      isUnderwater: false,
      showCamera: false,

      DataManager: new DataManager(),
      date: new Date(),
      dataOrigin: "Daily maximum (OBSEA)",

      dataOnTimeInstant: {},


    }
  },
  methods: {
    // TODO: instantaneous when it is loaded
    updateDailyDataTicker: function(params){

      this.dataOrigin = "Daily maximum (OBSEA)";

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
        } else {
          console.log("Measure not shown: " + key);
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
  background-color: #acd1ffc7;
  font-size: small;

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
  background-color: #8dc0fe;
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