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
            <input class="input-slider" style="width:80%" type="range" min="0.01" max="36" value="0.2" step="0.001"
              @input="windSpeedSliderClicked" />
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
</style>