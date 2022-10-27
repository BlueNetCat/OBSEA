<template>
  <div id="wind-panel">
    
    <div class="content">
      <h2>{{$t('windPanel.title')}}</h2>
      <p> {{$t('windPanel.p1')}}
        <a href="https://gamedevelopment.tutsplus.com/tutorials/simulate-tearable-cloth-and-ragdolls-with-simple-verlet-integration--gamedev-519" target="_blank">{{$t('windPanel.p1_1')}}</a>.
      </p>
      <p> {{$t('windPanel.p2')}}</p>
    
    
      <!-- Wind parameters -->
      <p>{{$t('windPanel.windParams')}}:</p>
      <div class="container-columns">
        <!-- Wind speed -->
        <div class="container-rows">
          <p>{{$t('Wind speed')}}</p>
          <div class="container-slider">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
               <path id="WindMiddle" class="svg-windPath"
                d="M64.388,323.7c66.094,22.349,138.154,32.108,178.1,0,13.8-11.092,18.094-21.2,17.81-28.148-0.733-17.966-25.226-36.257-43.155-30.894-6.291,1.882-16.286,8.04-15.756,17.163,0.413,7.1,7.129,14.085,17.126,15.791" />
            </svg>
            <input class="input-slider" style="width:80%" type="range" min="0.01" max="120" value="0.2" step="0.1"
              @input="windSpeedSliderClicked" />
            <div class="tip" ref="windSpeedSliderTip"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
              <path id="WindTop" class="svg-windPath"
                d="M117,178c96.486,32.553,201.682,46.769,260,0,20.145-16.156,26.414-30.873,26-41-1.07-26.169-36.825-52.812-63-45-9.183,2.741-23.774,11.71-23,25,0.6,10.338,10.406,20.516,25,23" />
              <path id="WindMiddle" class="svg-windPath"
                d="M64.388,323.7c66.094,22.349,138.154,32.108,178.1,0,13.8-11.092,18.094-21.2,17.81-28.148-0.733-17.966-25.226-36.257-43.155-30.894-6.291,1.882-16.286,8.04-15.756,17.163,0.413,7.1,7.129,14.085,17.126,15.791" />
              <path id="WindBottom" class="svg-windPath"
                d="M149,391c96.486,32.553,201.682,46.769,260,0,20.145-16.156,26.414-30.873,26-41-1.07-26.169-36.825-52.812-63-45-9.183,2.741-23.774,11.71-23,25,0.6,10.338,10.406,20.516,25,23" />
            </svg>
          </div>
        </div>
      
        <!-- Wind direction -->
        <div class="container-rows">
          <p>{{$t('Wind direction')}}</p>
          <knob @change="windDirectionKnobClicked" size="50px"></knob>
        </div>

        
      
      </div>
    
    
    
    </div>

  </div>
</template>






<script>
import Knob from "/OBSEA/Components/Knob.vue";



export default {
  name: "WindPanel",
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
    // Wind speed
    windSpeedSliderClicked: function (e) {
      // Emit event for Canvas 3D
      window.eventBus.emit('WindPanel_windSpeedSliderClicked', parseFloat(e.target.value));
      // Show tip
      let sliderEl = e.target;
      let percent = (parseFloat(sliderEl.value) - parseFloat(sliderEl.min)) / (parseFloat(sliderEl.max) - parseFloat(sliderEl.min));
      let tipEl = this.$refs.windSpeedSliderTip;
      // Displacement
      let displacement = - sliderEl.clientWidth/2 + sliderEl.clientWidth * percent;
      tipEl.style = "transform: translateX(" + displacement + "px) translateY(" + -20 + "px)";
      
      // Get beaufort color
      let scale = 0;
      let upperLimBeaufort = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 300];
      let colorScale = ['0099FE', '67CBFF', '78CFC1', '00E401', '66FF33','CBFE32',
        'E2FE99', 'FFFF99', 'FBDD55', 'FEC000', 'FF9A65', 'FF6600', 'CC3300'];
      for (let i = 0; i < upperLimBeaufort.length; i++) {
        if (sliderEl.value < upperLimBeaufort[i]) {
          scale = i;
          i = upperLimBeaufort.length; // Exit loop
        }
      }
      // Add color point
      tipEl.innerHTML = '<div style="width:10px; height:10px; border-radius: 50%; margin: 2px; background-color: #'+colorScale[scale]+';"></div>'
      // Add value
      tipEl.innerHTML += parseFloat(e.target.value).toFixed(1) + "km/h ";
      // Add color point
      tipEl.innerHTML += '<div style="width:10px; height:10px; border-radius: 50%; margin: 2px; background-color: #' + colorScale[scale] + ';"></div>'
    },
    // Wind direction
    windDirectionKnobClicked: function(angle){
      // Emit event for Canvas 3D
      window.eventBus.emit('WindPanel_windDirectionKnobClicked', parseFloat(angle));
    },
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


/* SVG line */
.svg-windPath {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 20px;
  fill-rule: evenodd;
}


.tip {
  position: absolute;
  display:flex;
  align-items: center;
  font-size: small;
  pointer-events: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>