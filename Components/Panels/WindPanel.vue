<template>
  <div id="wind-panel">
    
    <div class="content">
      <h2>{{$t('windPanel.title')}}</h2>
      <p> {{$t('windPanel.p1')}}
        <a href="https://gamedevelopment.tutsplus.com/tutorials/simulate-tearable-cloth-and-ragdolls-with-simple-verlet-integration--gamedev-519" target="_blank">{{$t('windPanel.p1_1')}}</a>.
      </p>
      <p> {{$t('windPanel.p2')}}</p>
    
    
      <!--Ocean steepness -->
      <p>{{$t('windPanel.windParams')}}:</p>
      <div class="container-columns">
        <!-- Wind speed -->
        <div class="container-rows">
          <p>{{$t('Wind speed')}}</p>
          <div class="container-slider">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512">
              <path id="Wave" class="svg-wavePath"
                d="M91,345a148.964,148.964,0,0,0,39-34c18.237-22.738,21.847-41.833,31.9-66.57C180.68,198.242,210.248,167.907,225,159c24.989-15.088,68.213-28.479,112-10,45.368,19.146,74.013,67.228,65,79-10.978,14.338-66.772-22.893-88-2-16.914,16.647-8.635,64.768,21,90,17.036,14.5,39.538,20.066,62,18" />
            </svg>
            <input class="input-slider" style="width:80%" type="range" min="0.01" max="36" value="0.2" step="0.001"
              @input="windSpeedSliderClicked" />
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
              <path id="Wave" class="svg-wavePath"
                d="M91,345a148.964,148.964,0,0,0,39-34c18.237-22.738,21.847-41.833,31.9-66.57C180.68,198.242,210.248,167.907,225,159c24.989-15.088,68.213-28.479,112-10,45.368,19.146,74.013,67.228,65,79-10.978,14.338-66.772-22.893-88-2-16.914,16.647-8.635,64.768,21,90,17.036,14.5,39.538,20.066,62,18" />
            </svg>
          </div>
        </div>
      
        <!-- Wind direction -->
        <div class="container-rows">
          <p>{{$t('Wind direction')}}</p>
          <div class="container-slider">
            <input class="input-slider" style="width:80%" type="range" min="0" max="360" value="0.2" step="0.001"
              @input="windDirectionSliderClicked" />
          </div>
        </div>
      
      </div>
    
    
    
    </div>

  </div>
</template>






<script>



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
    windSpeedSliderClicked: function (e) {
      // Emit event for Canvas 3D
      window.eventBus.emit('WindPanel_windSpeedSliderClicked', parseFloat(e.target.value));
    },
    // Swell 1
    windDirectionSliderClicked: function (e) {
      // Emit event for Canvas 3D
      window.eventBus.emit('WindPanel_windDirectionSliderClicked', parseFloat(e.target.value));
    },


    // compassButtonClicked: function (e) {
    //   window.eventBus.emit('TopRightNav_compassButtonClicked');
    // },
    // infoButtonClicked: function (e) {
    //   window.eventBus.emit('TopRightNav_infoButtonClicked');
    //   window.open('https://github.com/BlueNetCat/OBSEA', '_blank');
    // }
  },
  components: {
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
.cls-1 {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 20px;
  fill-rule: evenodd;
}
</style>