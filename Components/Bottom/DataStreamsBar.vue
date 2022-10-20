<template>
  <div id="data-streams-bar">
    <!-- A div with the same width as TimeRange -->
    <div class="streamsContainer" ref="streamsContainer">
      <canvas ref="dataStreamsCanvas"></canvas>
      <!-- <div class="trackMark" :class="{active: ff.selected}" @click="onTrackClicked" :id="ff.properties.id"
        :key="ff.properties.id" v-for="ff in features" :style="setFeatureStyle(ff)">
        &#11044;
      </div> -->
    </div>


  </div>
</template>


<script>
// REQUIERES palette.js
// Import components here

export default {
  name: "data-streams-bar",
  created() {

  },
  mounted() {
    // Data manager
    this.dataManager = new DataManager();
    this.dailyData = this.dataManager.getDailyData();


    // TODO: ANOTHER OPTION IS TO USE PATH
    // CREATE BALLS FOR EVENTS? MOVING WINDOW?
    this.canvas = this.$refs.dataStreamsCanvas;
    let parentEl = this.canvas.parentElement;
    this.canvas.height = 30; // TODO: DEPENDANT ON THE NUMBER OF STREAMS TO DISPLAY
    this.canvas.width = parentEl.offsetWidth;
    this.ctx = this.canvas.getContext('2d');
    //this.ctx.fillStyle = 'red';
    //this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
  },
  data() {
    return {
      startDate: new Date(2018, 7, 21),
      endDate: new Date(),
      
    }
  },
  methods: {
    // INTERNAL METHODS
    // Paint data streams on canvas
    updateCanvas: function(){
      if (this.dailyData == undefined)
        return;

      let canvas = this.canvas;
      let ctx = this.ctx;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (this.timeSpanInHours > 0){ // Use daily data
        // Read data
        // Set start and end date to T00:00:00.000Z
        this.startDate = new Date(this.startDate.toISOString().substring(0, 10) + 'T00:00:00.000Z');
        this.endDate = new Date(this.endDate.toISOString().substring(0, 10) + 'T00:00:00.000Z');
        // Calculate number of days
        let numDays = (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 3600 * 24);
        if (numDays != Math.floor(numDays)) console.error("Num days should be integer!!");
        // Iterate for each day
        let movingDate = new Date(this.startDate.toISOString());
        for (let i = 0; i<numDays; i++){
          let ddData = this.dailyData[movingDate.toISOString()];
          if (ddData != undefined){
            // Paint
            // Calculate position in canvas
            let posX = (i/numDays) * canvas.width;
            let posY = canvas.height/2;
            // Calculate width?
            // Calculate height (use datatypes max?)
            
            ctx.beginPath();
            let radius = 1;
            ctx.arc(posX, posY, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'red';
            ctx.fill();

          }

          // Increase one day
          movingDate.setDate(movingDate.getDate() + 1);
        }

        
        // Start index
        // let sIdx = DataManager.getHourlyDataIndex(this.startDate);
        // End index
        // let eIdx = DataManager.getHourlyDataIndex(this.endDate);

        // Count number of days

        // First and last days may not have full width (does it matter, on over 500 days?)

        // Divide total width with number of days to get width per day

        // Paint bars
        // Get max per data type

        
      } else { // Use hourly data
        // Load data in DataManager.js (async)
        // await DataManager.getData(this.startDate, this.endDate);

      }
    },



    setFeatureStyle: function (ff) {
      // Current date
      let currDate = new Date(ff.properties.info.Date);
      // Visibility
      let visible = currDate > this.startDate && currDate < this.endDate;

      // Left position according to start and end date
      let leftPercentage = -1 + 100 * (currDate.getTime() - this.startDate.getTime()) / (this.endDate.getTime() - this.startDate.getTime());
      // Limit on the sides to avoid overflow
      leftPercentage = Math.min(97, leftPercentage);
      leftPercentage = Math.max(0, leftPercentage);
      // Opacity on the edges
      let opacity = 0.5;
      if (leftPercentage < 10)
        opacity *= leftPercentage / 10;
      else if (leftPercentage > 90)
        opacity *= (100 - leftPercentage) / 10;
      // Port
      let port = ff.properties.info.Port;
      // Top position according to port
      let top = this.portOrder[port];

      // Color according to port from palette.js
      let colorPort = palette ? palette[port].color : [0, 255, 0];

      if (visible) {
        return {
          color: 'rgba(' + colorPort + ', 1.0)',
          left: leftPercentage + '%',
          top: (8 + top * 5) + '%',
          opacity: opacity,
          '-webkit-text-stroke-width': '0.5px',
          '-webkit-text-stroke-color': 'black',
          transition: 'left 0.3s, opacity 0.5s',
        }
        // If it is not visible, hide it
      } else {
        return {
          color: 'rgba(' + colorPort + ', 1.0)',
          left: leftPercentage + '%',//'0%',
          top: (8 + top * 5) + '%',
          opacity: 0,
        }
      }
    },


    onTrackClicked: function (event) {
      let id = event.target.id;
      //this.showSelectedTrack(id); // It is already called from Map.vue
      this.$emit('clickTrackMark', id);
    },




    // PUBLIC METHODS
    // Set data
    setDailyData: function(data){
      this.dailyData = data;
    },
    setHourlyData: function(data){
      this.hourlyData = data;
    },
    // Set start and end dates
    setStartEndDates: function (sDate, eDate) {
      
      this.startDate.setTime(sDate.getTime());
      this.endDate.setTime(eDate.getTime());
      this.timeSpanInHours = (this.endDate.getTime() - this.startDate.getTime()) / 36e5;

      this.updateCanvas();
      console.log("Updating canvas and start and end dates from data streams");
    },




    // Set the geojson features
    setFeatures: function (inFeatures) {
      this.features = inFeatures;
    },
    // Show selected track
    showSelectedTrack: function (id) {
      this.features.forEach(ff => {
        if (ff.properties.info.Id == id) {
          ff.selected = true;
        } else
          ff.selected = false;
      });
    },
    // Hides the selected track (none selected)
    hideSelectedTrack: function () {
      this.features.forEach(ff => {
        ff.selected = false;
      });
    }

  },
  components: {
  },
  computed: {

  }
}


</script>





<style scoped>
#data-streams-bar {
  position: relative;
  width: calc(100% - 130px);
  height: 30px;
}

.streamsContainer {
  height: 100%;
  position: relative;
  border-radius: 1rem;
  user-select: none;

  background: linear-gradient(90deg, rgba(160, 215, 242, 0) 0%, rgba(160, 215, 242, 0.8) 10%, rgba(160, 215, 242, 0.8) 90%, rgba(160, 215, 242, 0) 100%);
  box-shadow: 0 -1px 2px rgba(160, 215, 242, 0.8);
}

.trackMark {
  position: absolute;
  font-size: 0.5rem;
  cursor: pointer;
}

@keyframes selectedTrackAnimation {
  0% {
    text-shadow: 0px 0px 4px black;
  }

  50% {
    text-shadow: 0px 0px 0px black;
  }

  100% {
    text-shadow: 0px 0px 4px black;
  }
}

.trackMark.active {
  font-size: 1rem;
  opacity: 1 !important;
  z-index: 1;
  margin-top: -6.5px;
  margin-left: -4px;
  text-shadow: 0px 0px 4px black;
  animation: selectedTrackAnimation 1s infinite;
}
</style>