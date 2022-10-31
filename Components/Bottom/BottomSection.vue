<template>
  <div id="bottom-section">

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

    <!-- Show/Hide data bar button-->
    <div class="bottom-icons" :class="showDataBar ? 'dataBarContainerOn' : ''">

      <!-- External link-->
      <button v-show="showDataBar" @click="externalLinkButtonClicked" :title="$i18n.t('externalLinkButton')">
        <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-128 -128 768 768">
          <path class="externalLink1" d="M254,87H63V446H423V261" />
          <path class="externalLink2"
            d="M244.261,247.638l155.1-155.276L344.774,60.889c42.943,8.955,78.55.356,117.958-13.66-14.537,38.916-20.81,74.931-13.626,118.109l-32.423-56.1L261.348,264.745Z" />
        </svg>
      </button>

      <!-- Show/Hide measures-->
      <button @click="dataBarButtonClicked" ref="dataBarButton" class="dataBarButton" :class="showDataBar ? 'dataBarButtonOn' : ''" :title="$i18n.t('measuresButton')">
        <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <path id="Rounded_Rectangle_1" data-name="Rounded Rectangle 1" class="meter-1"
            d="M411,180c48.294,61.225,52.951,127.51,3,208a10,10,0,0,1-10,10H108a10,10,0,0,1-10-10c-49.951-80.49-45.294-146.775,3-208C174.661,86.616,337.339,86.616,411,180Z" />
          <path class="meterArrow"
            d="M272.717,391.993L225.1,274.9c-3.683,5.536-7.734,10.417-10.349,9.664-3.565-1.026-2.839-12.053-2.277-20.454,0.707-10.548,1.185-21.149,1.474-32.106q11.97,11.724,23.86,22.77c6.46,5.992,14.888,13.879,12.892,16.991-1.5,2.342-8.4,1.187-15.4-.7l47.687,117.273Z" />
          <path class="meter-3"
            d="M84.052,348.56l-4.1-9.12,40-18,4.1,9.12Zm0,0-4.1-9.12,40-18,4.1,9.12ZM76.075,229.818l2.89-9.573,41.992,12.676-2.89,9.573Zm0,0,2.89-9.573,41.992,12.676-2.89,9.573Zm74.194-87.382,8.331-5.531,24.263,36.542-8.331,5.531-2.8-4.222Q161,158.6,150.269,142.436Zm0,0,8.331-5.531,24.263,36.542-8.331,5.531ZM84.052,348.56l-4.1-9.12,40-18,4.1,9.12ZM76.075,229.818l2.89-9.573,41.992,12.676-2.89,9.573Zm74.194-87.382,8.331-5.531,24.263,36.542-8.331,5.531ZM428,349l4.111-9.134-40.071-18.029-4.111,9.134Zm0,0,4.111-9.134-40.071-18.029-4.111,9.134Zm7.991-118.934-2.895-9.589-42.066,12.7,2.9,9.589Zm0,0-2.895-9.589-42.066,12.7,2.9,9.589Zm-74.325-87.524L353.318,137l-24.306,36.6,8.346,5.54,2.808-4.229Zm0,0L353.318,137l-24.306,36.6,8.346,5.54ZM428,349l4.111-9.134-40.071-18.029-4.111,9.134Zm7.991-118.934-2.895-9.589-42.066,12.7,2.9,9.589Zm-74.325-87.524L353.318,137l-24.306,36.6,8.346,5.54ZM250,115h10v43H250V115Z" />
        </svg>
      </button>
    </div>


    <!-- Time Range Bar -->
    <Transition><!-- Vue transition -->
      <time-range-bar v-show="showDataBar"></time-range-bar>
    </Transition>
      <!-- Current information available (temp, etc...)-->
    <Transition>
      <data-ticker v-show="showDataBar"></data-ticker>
    </Transition>

  </div>
</template>



<script>
import DataTicker from '/OBSEA/Components/Bottom/DataTicker.vue';
import CameraYoutube from "/OBSEA/Components/Bottom/CameraYoutube.vue"
import TimeRangeBar from "/OBSEA/Components/Bottom/TimeRangeBar.vue"

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

      showDataBar: true,

      date: new Date(),
      
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
    },
    dataBarButtonClicked: function (e) {
      this.showDataBar = !this.showDataBar;
    },
    externalLinkButtonClicked: function(e) {
      window.open('https://www.obsea.es/dashboard/', '_blank');
    },
  },
  components: {
    "camera-youtube": CameraYoutube,
    "time-range-bar": TimeRangeBar,
    "data-ticker": DataTicker,
  }
}
</script>



    DataTicker



<style scoped>
#bottom-section {
  position: absolute;
  bottom: 0px;
  width: 100vw;
  pointer-events: none;
}
.bottom-icons {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 10px;
  transition: all 0.3s ease;
}

button {
  border-style: none;
  padding: 0;
  margin-bottom: 10px;
  border-radius: 50%;
}


.dataBarButton {
  position: relative;
}
.dataBarButtonOn, .dataBarButtonOn > svg{
  border-bottom-left-radius: 0%;
  border-bottom-right-radius: 0%;
}
.dataBarContainerOn {
  transform: translateY(70px);
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


.externalLink1 {
  fill: none;
  stroke-width: 31.35px;
}

.externalLink1,
.externalLink2 {
  stroke: #000;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill-rule: evenodd;
}

.externalLink2 {
  stroke-width: 14.04px;
}
    





/* Meter style */
.meter-1 {
  fill: none;
  stroke-width: 20px;
}

.meter-1,
.meterArrow,
.meter-3 {
  stroke: #1a1a1a;
  fill-rule: evenodd;
}

.meterArrow,
.meter-3 {
  fill: #1a1a1a;
}

.meterArrow {
  stroke-width: 30px;
}

.meter-3 {
  stroke-width: 8px;
}

/* Meter animation */
.meterArrow {
  animation: meterArrow 6s alternate infinite ease-in-out;
  transform-origin: 50% 70%;
}

@keyframes meterArrow {
  0% {
    transform: rotate(20deg);
  }

  50% {
    transform: rotate(-20deg);
  }

  100% {
    transform: rotate(20deg);
  }
}









/* Transitions for elements */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  height: 0;
  transform: translateY(20px);
}
</style>