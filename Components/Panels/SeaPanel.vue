<template>
  <div id="sea-panel">
    
    <div class="content">
      <h2>{{$t('seaPanel.title')}}</h2>
      <p> {{$t('seaPanel.p1')}}
        <a href="https://catlikecoding.com/unity/tutorials/flow/waves/" target="_blank">{{$t('seaPanel.p1_1')}}</a>.
      </p>
      <p> {{$t('seaPanel.p2')}}</p>

      <!--Ocean wave significant height -->
      <p class="p-center">{{$t('seaPanel.waveSignificantHeight')}}:</p>
      <div class="container-slider">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512">
          <path id="Wave" class="svg-wavePath"
            d="M91,345a148.964,148.964,0,0,0,39-34c18.237-22.738,21.847-41.833,31.9-66.57C180.68,198.242,210.248,167.907,225,159c24.989-15.088,68.213-28.479,112-10,45.368,19.146,74.013,67.228,65,79-10.978,14.338-66.772-22.893-88-2-16.914,16.647-8.635,64.768,21,90,17.036,14.5,39.538,20.066,62,18" />
        </svg>
        <input class="input-slider" style="width:80%" type="range" min="0.01" max="8" value="0.2" step="0.001"
          @input="waveSignificantHeightSliderClicked"/>
        <div class="tip" ref="waveSignificantHeightSliderTip"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
          <path id="Wave" class="svg-wavePath"
            d="M91,345a148.964,148.964,0,0,0,39-34c18.237-22.738,21.847-41.833,31.9-66.57C180.68,198.242,210.248,167.907,225,159c24.989-15.088,68.213-28.479,112-10,45.368,19.146,74.013,67.228,65,79-10.978,14.338-66.772-22.893-88-2-16.914,16.647-8.635,64.768,21,90,17.036,14.5,39.538,20.066,62,18" />
        </svg>
      </div>

      <!--Ocean mean wave direction -->
      <p class="p-center">{{$t('seaPanel.meanWaveDirection')}}:</p>
      <div class="container-slider">
        <knob @change="meanWaveDirectionKnobClicked"></knob>
      </div>
    
      <!--Ocean steepness -->
      <p class="p-center">{{$t('seaPanel.oceanSteepness')}}:</p>
      <div class="container-slider">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
          <path class="cls-1"
            d="M28,293a133.341,133.341,0,0,0,27-15c16.434-11.858,30.861-38.588,47.282-39.979,29.911-2.534,47.232,57.186,77.548,55.6C207.919,292.152,217.46,239.943,245,239c28.894-.989,43.742,55.748,72.623,54.621,26.662-1.04,37.236-51.667,63.444-51.323,15.072,0.2,31.4,24.757,44.933,33.7a122.8,122.8,0,0,0,29,14" />
          <path class="cls-1"
            d="M51,207a134.528,134.528,0,0,0,35-18c12.505-9.035,27.692-33.243,43.647-34.982,31.631-3.446,50.672,52.751,82.6,51.3,27.619-1.255,35.412-49.047,63.21-50.313,29.569-1.347,51.86,51.311,83.553,50.313,29.321-.923,42.325-49.815,67.575-47.354C442.7,159.535,453.464,185.063,473,198a108.234,108.234,0,0,0,19,10" />
          <path class="cls-1"
            d="M43,380c16.079-5.677,29.7-13.642,41-24,7.492-6.864,20.733-30.959,33.852-32.98,29.615-4.561,51.992,60.06,84.474,58.413,28.248-1.432,36.217-55.845,64.647-57.29,30.246-1.536,53.037,58.429,85.453,57.29,30.208-1.061,45.652-57.095,69.111-53.92C436.8,329.579,441.359,355.776,462,367c8.842,4.808,18.881,7.053,30,7" />
        </svg>
        <input class="input-slider" style="width:80%" type="range" min="0.01" max="0.5" value="0.2" step="0.001"
          @input="steepnessSliderClicked" />
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
          <path class="cls-1"
            d="M24,286.773a225.519,225.519,0,0,0,27-18.752,259.006,259.006,0,0,0,47-50.007c10.2,44.4,43.477,73.054,77.83,69.535C205.6,284.5,231.993,257.663,241,219.264c8.71,42.428,39.805,70.7,72.623,68.285,28.823-2.12,54.622-27.64,63.377-64.534a238.807,238.807,0,0,0,45,42.505,209.249,209.249,0,0,0,29,17.5" />
          <path class="cls-1"
            d="M47,179.259a229.727,229.727,0,0,0,35-22.5A261.784,261.784,0,0,0,126,113c13.841,43.644,48.34,69.279,82.244,64.156,27.879-4.213,52.018-28.635,62.756-62.906,15.7,42.009,49.733,66.564,84.007,62.906C384.18,174.042,409.751,151.059,423,118c13.124,19.924,28.542,36.772,46,50.006a168.685,168.685,0,0,0,19,12.5" />
          <path class="cls-1"
            d="M39,395.537a193.04,193.04,0,0,0,41-30,226.545,226.545,0,0,0,34-41.255c11.386,48.49,48.1,78.6,84.326,73.051,29.506-4.517,55.566-32.31,64.674-71.8,13.193,46.795,49.055,75.69,85.426,71.8,30.462-3.257,57.633-29.092,69.574-66.8,8.723,21.509,22.528,38.9,40,48.756a67.46,67.46,0,0,0,30,8.751" />
        </svg>
      </div>
    
      
      <p class="p-center" style="color: #00608d">________________________________</p>

      <!-- SWELL 1 -->
      <p class="p-center">{{$t('seaPanel.swellParams')}}:</p>
      <div class="container-columns">
        <!-- Wave height -->
        <div class="container-rows">
          <p class="p-center">{{$t('Wave height')}}</p>
          <div class="container-slider">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512">
              <path id="Wave" class="svg-wavePath"
                d="M91,345a148.964,148.964,0,0,0,39-34c18.237-22.738,21.847-41.833,31.9-66.57C180.68,198.242,210.248,167.907,225,159c24.989-15.088,68.213-28.479,112-10,45.368,19.146,74.013,67.228,65,79-10.978,14.338-66.772-22.893-88-2-16.914,16.647-8.635,64.768,21,90,17.036,14.5,39.538,20.066,62,18" />
            </svg>
            <input class="input-slider" style="width:80%" type="range" min="0.01" max="8" value="0.2" step="0.001"
              @input="swell1HeightSliderClicked" />
            <div class="tip" ref="swell1HeightSliderTip"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
              <path id="Wave" class="svg-wavePath"
                d="M91,345a148.964,148.964,0,0,0,39-34c18.237-22.738,21.847-41.833,31.9-66.57C180.68,198.242,210.248,167.907,225,159c24.989-15.088,68.213-28.479,112-10,45.368,19.146,74.013,67.228,65,79-10.978,14.338-66.772-22.893-88-2-16.914,16.647-8.635,64.768,21,90,17.036,14.5,39.538,20.066,62,18" />
            </svg>
          </div>
        </div>
    
        <!-- Wave orientation -->
        <div class="container-rows">
          <p class="p-center">{{$t('Swell direction')}}</p>
          <!-- <div class="container-slider">
            <input class="input-slider" style="width:80%" type="range" min="0" max="360" value="0.2" step="0.001"
              @input="swell1DirectionSliderClicked" />
          </div> -->
          <knob @change="swell1DirectionKnobClicked" size="40px"></knob>
        </div>
    
        <!-- Wave steepness -->
        <div class="container-rows">
          <p class="p-center">{{$t('Wave steepness')}}</p>
          <div class="container-slider">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
              <path class="cls-1"
                d="M28,293a133.341,133.341,0,0,0,27-15c16.434-11.858,30.861-38.588,47.282-39.979,29.911-2.534,47.232,57.186,77.548,55.6C207.919,292.152,217.46,239.943,245,239c28.894-.989,43.742,55.748,72.623,54.621,26.662-1.04,37.236-51.667,63.444-51.323,15.072,0.2,31.4,24.757,44.933,33.7a122.8,122.8,0,0,0,29,14" />
              <path class="cls-1"
                d="M51,207a134.528,134.528,0,0,0,35-18c12.505-9.035,27.692-33.243,43.647-34.982,31.631-3.446,50.672,52.751,82.6,51.3,27.619-1.255,35.412-49.047,63.21-50.313,29.569-1.347,51.86,51.311,83.553,50.313,29.321-.923,42.325-49.815,67.575-47.354C442.7,159.535,453.464,185.063,473,198a108.234,108.234,0,0,0,19,10" />
              <path class="cls-1"
                d="M43,380c16.079-5.677,29.7-13.642,41-24,7.492-6.864,20.733-30.959,33.852-32.98,29.615-4.561,51.992,60.06,84.474,58.413,28.248-1.432,36.217-55.845,64.647-57.29,30.246-1.536,53.037,58.429,85.453,57.29,30.208-1.061,45.652-57.095,69.111-53.92C436.8,329.579,441.359,355.776,462,367c8.842,4.808,18.881,7.053,30,7" />
            </svg>
            <input class="input-slider" style="width:80%" type="range" min="0.01" max="0.8" value="0.1" step="0.001"
              @input="swell1SteepnessSliderClicked" />
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
              <path class="cls-1"
                d="M24,286.773a225.519,225.519,0,0,0,27-18.752,259.006,259.006,0,0,0,47-50.007c10.2,44.4,43.477,73.054,77.83,69.535C205.6,284.5,231.993,257.663,241,219.264c8.71,42.428,39.805,70.7,72.623,68.285,28.823-2.12,54.622-27.64,63.377-64.534a238.807,238.807,0,0,0,45,42.505,209.249,209.249,0,0,0,29,17.5" />
              <path class="cls-1"
                d="M47,179.259a229.727,229.727,0,0,0,35-22.5A261.784,261.784,0,0,0,126,113c13.841,43.644,48.34,69.279,82.244,64.156,27.879-4.213,52.018-28.635,62.756-62.906,15.7,42.009,49.733,66.564,84.007,62.906C384.18,174.042,409.751,151.059,423,118c13.124,19.924,28.542,36.772,46,50.006a168.685,168.685,0,0,0,19,12.5" />
              <path class="cls-1"
                d="M39,395.537a193.04,193.04,0,0,0,41-30,226.545,226.545,0,0,0,34-41.255c11.386,48.49,48.1,78.6,84.326,73.051,29.506-4.517,55.566-32.31,64.674-71.8,13.193,46.795,49.055,75.69,85.426,71.8,30.462-3.257,57.633-29.092,69.574-66.8,8.723,21.509,22.528,38.9,40,48.756a67.46,67.46,0,0,0,30,8.751" />
            </svg>
          </div>
        </div>
    
      </div>
    
    
      <br />
    
      <!-- TODO: wave parameters generation, wave graphs (direction and distribution)-->
    
    
    
    
    
    
    
    </div>

  </div>
</template>






<script>
import Knob from '/OBSEA/Components/Knob.vue';

// TODO: Wave height tip: http://jsfiddle.net/Zu59F/

export default {
  name: "SeaPanel",
  created() {

  },
  mounted() {
    // Declare listening events


  },
  data() {
    return {
      hidePanel: true,
    }
  },
  methods: {
    // USER ACTIONS
    steepnessSliderClicked: function (e) {
      // Emit event for Canvas 3D
      window.eventBus.emit('SeaPanel_steepnessSliderClicked', parseFloat(e.target.value));
    },
    // Wave significant height
    waveSignificantHeightSliderClicked: function(e){
      // Emit event for Canvas 3D
      window.eventBus.emit('SeaPanel_waveSignificantHeightSliderClicked', parseFloat(e.target.value));
      // Show tip
      let sliderEl = e.target;
      let percent = (parseFloat(sliderEl.value) - parseFloat(sliderEl.min)) / (parseFloat(sliderEl.max) - parseFloat(sliderEl.min));
      let tipEl = this.$refs.waveSignificantHeightSliderTip;
      // Displacement
      let displacement = -tipEl.clientWidth / 2 - sliderEl.clientWidth + sliderEl.clientWidth * percent;
      tipEl.style = "transform: translateX(" + displacement + "px) translateY(" + -20 + "px)";
      tipEl.innerText = parseFloat(e.target.value).toFixed(1) + "m";
    },
    // Mean wave direction
    meanWaveDirectionKnobClicked: function(angle){
      // Emit event for Canvas 3D
      window.eventBus.emit('SeaPanel_meanWaveDirectionKnobClicked', angle);
    },
    // Swell 1
    swell1HeightSliderClicked: function (e) {
      // Emit event for Canvas 3D
      window.eventBus.emit('SeaPanel_swell1HeightSliderClicked', parseFloat(e.target.value));
      // Show tip
      let sliderEl = e.target;
      let percent = (parseFloat(sliderEl.value) - parseFloat(sliderEl.min)) / (parseFloat(sliderEl.max) - parseFloat(sliderEl.min));
      let tipEl = this.$refs.swell1HeightSliderTip;
      // Displacement
      let displacement = -sliderEl.clientWidth/2 + sliderEl.clientWidth * percent;
      tipEl.style = "position:absolute; transform: translateX(" + displacement + "px) translateY(" + -20 + "px)";
      tipEl.innerText = parseFloat(e.target.value).toFixed(1) + "m";
    },
    swell1DirectionKnobClicked: function (angle) {
      // Emit event for Canvas 3D
      window.eventBus.emit('SeaPanel_swell1DirectionKnobClicked', angle);
    },
    swell1SteepnessSliderClicked: function (e) {
      // Emit event for Canvas 3D
      window.eventBus.emit('SeaPanel_swell1SteepnessSliderClicked', parseFloat(e.target.value))
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
    knob: Knob
  }
}
</script>



<style scoped>
.content {
  padding: 20px;
  overflow: auto;
}

.container-slider {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.container-columns {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}

.container-rows {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: nowrap;
}

.p-center {
  text-align: center;
}

.tip {
  font-size: small;
  pointer-events: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}


/* SVG line */
.cls-1 {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 20px;
  fill-rule: evenodd;
}
</style>