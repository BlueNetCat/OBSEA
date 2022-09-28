<template>
  <div id="bottom-section" style="margin-right: 10px">

    <!-- Bottom icons -->
    <!-- Above water -->
    <div class="bottom-icons" v-show="!isUnderwater">
      <button @click="waveIconClicked" :title="$i18n.t('waveButtonTitle')">
        <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
            <path id="Wave" class="svg-wavePath"
              d="M91,345a148.964,148.964,0,0,0,39-34c18.237-22.738,21.847-41.833,31.9-66.57C180.68,198.242,210.248,167.907,225,159c24.989-15.088,68.213-28.479,112-10,45.368,19.146,74.013,67.228,65,79-10.978,14.338-66.772-22.893-88-2-16.914,16.647-8.635,64.768,21,90,17.036,14.5,39.538,20.066,62,18" />
        </svg>
      </button>
      <button @click="windIconClicked" :title="$i18n.t('windButtonTitle')">
        <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <path id="WindTop" class="svg-windPath"
            d="M117,178c96.486,32.553,201.682,46.769,260,0,20.145-16.156,26.414-30.873,26-41-1.07-26.169-36.825-52.812-63-45-9.183,2.741-23.774,11.71-23,25,0.6,10.338,10.406,20.516,25,23" />
          <path id="WindMiddle" class="svg-windPath"
            d="M64.388,323.7c66.094,22.349,138.154,32.108,178.1,0,13.8-11.092,18.094-21.2,17.81-28.148-0.733-17.966-25.226-36.257-43.155-30.894-6.291,1.882-16.286,8.04-15.756,17.163,0.413,7.1,7.129,14.085,17.126,15.791" />
          <path id="WindBottom" class="svg-windPath"
            d="M149,391c96.486,32.553,201.682,46.769,260,0,20.145-16.156,26.414-30.873,26-41-1.07-26.169-36.825-52.812-63-45-9.183,2.741-23.774,11.71-23,25,0.6,10.338,10.406,20.516,25,23" />
        </svg>

      </button>
    </div>
    <!-- Underwater -->
    <div class="bottom-icons" v-show="isUnderwater">
      <button @click="cameraButtonClicked">
        <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <path id="Rounded_Rectangle_1" data-name="Rounded Rectangle 1" class="cls-1"
            d="M209.385,243.21H396a10,10,0,0,1,10,10V355.955a10,10,0,0,1-10,10H209.385a10,10,0,0,1-10-10V253.21A10,10,0,0,1,209.385,243.21Z" />
          <path class="cls-1" d="M100,225.5l98.968,44.811v63.764L101.62,373.99Z" />
          <circle class="cls-2" cx="242.078" cy="190" r="55.047" />
          <circle class="cls-2" cx="352.953" cy="190" r="55.047" />
        </svg>
      </button>
    </div>

    <!-- Underwater camera -->
    <camera-youtube v-show="showCamera"></camera-youtube>

    <!-- Current information available (temp, etc...)-->
    <div class="bottom-bar" v-show="false">
      <div class="data-title">
        {{$t("Data ")}}
      </div>
      <div class="data-text">
        <div> <!-- TODO: Duplicate this section to have continuous text https://www.fridaandfolks.com/ -->
          {{$t("Date")}}: {{date.toLocaleString()}},

          {{$t("Wind speed")}}: {{WSPD}} m/s, 
          {{$t("Wind direction")}}: {{WDIR}}º,
          {{$t("Wave significant height")}}: {{HM0}} m,

          {{$t("Air temperature")}}: {{AIRT}}ºC,
          {{$t("Atmospheric pressure")}}: {{APRES}} bars,

          {{$t("Sea surface temperature")}}: {{TEMP}}ºC,
          {{$t("Sea bottom temperature")}}(~20m): {{TEMPBOTTOM}}ºC,
          {{$t("Salinity")}}: {{PSAL}} ‰,
        </div>
        


      </div>
    </div>

  </div>
</template>



<script>
import CameraYoutube from "/OBSEA/Components/Bottom/CameraYoutube.vue"

export default {
  name:"BottomSection",
  mounted() {
    // Subscribe to camera change to hide OBSEA underwater camera
    window.eventBus.on('Canvas3D_cameraChange', (sceneManager) => {
      let camPos = sceneManager.camera.position;
      if (camPos.y < -10){
        this.isUnderwater = true;
      }
      if (camPos.y > -5)
        this.isUnderwater = false;
    });
  },
  data() {
    return {
      isUnderwater: false,
      showCamera: false,

      date: new Date(),

      WSPD: 15,
      WDIR: 30,
      HM0: 1,
      TEMP: 22,
      TEMPBOTTOM: 13,
      PSAL: 35,

      
    }
  },
  methods :{
    waveIconClicked: function() {
      // Open central panel
      // Add information about which panel to open
      window.eventBus.emit('OpenCentralPanel', "seaPanel");
    },
    windIconClicked: function () {
      // Open central panel
      // Add information about which panel to open
      window.eventBus.emit('OpenCentralPanel', "windPanel");
    },
    cameraButtonClicked: function () {
      this.showCamera = !this.showCamera;
    }
  },
  components: {
    "camera-youtube": CameraYoutube,
  }
}
</script>






<style scoped>
#bottom-section {
  position: absolute;
  bottom: 0px;
  width: 100vw;
}
.bottom-icons {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 10px;
}

button {
  border-style: none;
  padding: 0;
  margin-bottom: 10px;
  border-radius: 50%;
}


/* Bottom bar with data */
.bottom-bar {
  background-color: #acd1ffc7;
  font-size: small;

  display:flex;
  flex-direction: row;
  overflow: hidden;
}
.bottom-bar > div {
  padding: 5px;
}
.data-title {
  white-space: nowrap;
  background-color: #8dc0fe;
  padding-right: 2px;
  z-index: 1;
}
.data-text{
  z-index: 0;
  white-space: nowrap;
  animation: tickerh linear 15s infinite;
  transform-style: preserve-3d;
  will-change: transform;
}
.data-text:hover {
  animation-play-state: paused;
}
/* Data text ticker animation */
@keyframes tickerh {
  0% {
    transform: translate3d(100%, 0px, 0px);
    
  }
  100% {
    transform: translate3d(-100%, 0px, 0px);
  }
}



/* Wave SVG */
.svg-wavePath {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 20px;
  fill-rule: evenodd;
}

/* Wind SVG */
.svg-windPath {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 20px;
  fill-rule: evenodd;
}


/* Camera SVG */
.cls-1,
.cls-2 {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 25px;
}

.cls-2 {
  fill-rule: evenodd;
}
</style>