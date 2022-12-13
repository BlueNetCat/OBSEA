<template>
  <div id="data-streams-bar">
    <!-- A div with the same width as TimeRange -->
    <div class="streamsContainer" ref="streamsContainer">
      <canvas ref="dataStreamsCanvas" @click="streamsContainerClicked"></canvas>
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
    this.DataManager = DataManager;
    this.dailyData = this.DataManager.getDailyData();
    // Half-hourly data is on demand
    this.halfHourlyData = {};

    // Zoom level
    this.isDailyVisible = true;

    // TODO: ANOTHER OPTION IS TO USE PATH
    // CREATE BALLS FOR EVENTS? MOVING WINDOW?
    this.canvas = this.$refs.dataStreamsCanvas;
    let parentEl = this.canvas.parentElement;
    this.canvas.height = 30; // TODO: DEPENDANT ON THE NUMBER OF STREAMS TO DISPLAY
    this.canvas.width = parentEl.offsetWidth;

    window.addEventListener("resize", () =>{
      this.canvas.width = parentEl.offsetWidth;
      this.updateCanvas();
    });
    this.ctx = this.canvas.getContext('2d');

    // Event for showing daily max when is loaded from API
    window.eventBus.on('DataManager_intialAPILoad', (res) => {
      this.setHalfHourlyData(res); // Store hourly data
      this.updateCanvas();
    });

    // This number decides when to paint one point a day or 24*2 points a day
    this.maxHalfHourlyPoints = 24 * 60;
    // Memory allocation
    this.movingDate = new Date();
  },
  data() {
    return {
      startDate: new Date(2018, 7, 21),
      endDate: new Date(),
      
    }
  },
  methods: {
    // USER METHODS
    streamsContainerClicked: function(event) {
      // TODO: CHANGE RANGE SLIDER TIME
      let width = event.target.offsetWidth;
      let mouseX = 0;
      if (event.offsetX)
        mouseX = event.offsetX;
      else if (event.touches)
        mouseX = event.touches[0].offsetX;
      else
        console.log("Something went wrong");
      
      let percLeft = 100 * mouseX / width;
      this.$emit('clicked', percLeft);
    },
    
    
    // INTERNAL METHODS
    // Paint data streams on canvas
    updateCanvas: function(){
      if (this.dailyData == undefined)
        return;

      let canvas = this.canvas;
      let ctx = this.ctx;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // For daily maximum representation
      if (this.timeSpanInHours > this.maxHalfHourlyPoints || this.DataManager.OBSEADataRetriever.isLoading){ // Use daily data
        this.isDailyVisible = true;
        // Calculate number of days
        let numDays = (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 3600 * 24);
        numDays += 1; // First and end days count too
        // Calculate first day proportion
        let startOfFirstDay = new Date(this.startDate.toISOString().substring(0, 10) + 'T00:00:00.000Z');
        let dayDiff = 1 - (this.startDate.getTime()  - startOfFirstDay.getTime()) / (1000 * 3600 * 24);
        // Set this to calculate the 
        this.endDate = new Date(this.endDate.toISOString().substring(0, 10) + 'T00:00:00.000Z');
        //if (numDays != Math.floor(numDays)) console.error("Num days should be integer!!");
        // Iterate for each day
        let movingDate = this.movingDate;
        movingDate.setTime(this.startDate.getTime());
        
        for (let i = 0; i< Math.ceil(numDays); i++){
          let key = movingDate.toISOString().substring(0, 10) + 'T00:00:00.000Z'; // Daily
          let ddData = this.dailyData[key];
          if (ddData != undefined){
            // Paint
            let measures = ['Hm0', 'WSPD', 'UCUR_1m'];
            for (let j = 0; j < measures.length; j++){
              // If measure exists in dataset
              if (ddData[measures[j]]){
                // Calculate position in canvas
                let posX = ((i + dayDiff - 0.5)/(numDays-1)) * canvas.width; // Use the start day difference to position the points
                let padding = canvas.height * 0.2;
                let posY = padding + j * (canvas.height-padding) / measures.length;
                // Calculate width?
                // Calculate height (use datatypes max?)
                let factor = 1;
                let dataType = this.DataManager.OBSEADataRetriever.DataTypes[measures[j]];
                if (measures[j].includes('CUR')){
                  dataType = this.DataManager.OBSEADataRetriever.DataTypes['CUR'];
                }
                if (dataType){
                  if (dataType.signValue){
                    factor = Math.max(1,ddData[measures[j]]/dataType.signValue);
                  }
                }
                
                ctx.beginPath();
                let radius = 1;
                let radMod = Math.min(3, radius * factor * factor);
                ctx.arc(posX, posY, radMod, 1 * Math.PI, 0, false);
                ctx.fillStyle = 'darkblue';
                ctx.fill();
              }
            }

          } else {
           //console.log(movingDate.toISOString().substring(10));
          }

          // Increase one day
          movingDate.setUTCDate(movingDate.getUTCDate() + 1);
          movingDate.setUTCHours(0);
        }

        //console.log(this.dailyData);


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
        this.isDailyVisible = false;
        if (Object.keys(this.halfHourlyData).length == 0){
          console.log("Half hourly data is empty but it was loaded?");
          debugger;
          return;
        }
        // Calculate number of half hours
        let numHalfHours = (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 3600 * 0.5);
        
        // TODO
        // Here should be some time corrections maybe?
        // Calculate first half hour proportion
        //let startOfFirstDay = new Date(this.startDate.toISOString().substring(0, 10) + 'T00:00:00.000Z');
        //let dayDiff = 1 - (this.startDate.getTime() - startOfFirstDay.getTime()) / (1000 * 3600 * 24);
        // Set this to calculate the 
        //this.endDate = new Date(this.endDate.toISOString().substring(0, 10) + 'T00:00:00.000Z');

        // Set moving date
        let movingDate = this.movingDate;
        movingDate.setTime(this.startDate.getTime());
        
        // Iterate halfhours
        for (let i = 0; i < Math.ceil(numHalfHours); i++) {
          // Half hourly key
          let key = movingDate.toISOString();
          key = this.setISOStringToHalfHourly(key);
          
          let hhData = this.halfHourlyData[key];
          if (hhData != undefined) {

            // Paint
            let measures = ['Hm0', 'WSPD', 'UCUR_1m'];
            for (let j = 0; j < measures.length; j++) {
              // If measure exists in dataset
              if (hhData[measures[j]]) {
                // Calculate position in canvas
                //let posX = ((i + dayDiff - 0.5) / (numDays - 1)) * canvas.width; // Use the start day difference to position the points
                let posX = canvas.width * i / numHalfHours; // Use the start day difference to position the points
                let padding = canvas.height * 0.2;
                let posY = padding + j * (canvas.height - padding) / measures.length;
                // Calculate width?
                // Calculate height (use datatypes max?)
                let factor = 1;
                let dataType = this.DataManager.OBSEADataRetriever.DataTypes[measures[j]];
                if (measures[j].includes('CUR')) {
                  dataType = this.DataManager.OBSEADataRetriever.DataTypes['CUR'];
                }
                if (dataType) {
                  if (dataType.signValue) {
                    factor = Math.max(1, hhData[measures[j]] / dataType.signValue);
                  }
                }

                ctx.beginPath();
                let radius = 1;
                let radMod = Math.min(3, radius * factor * factor);
                ctx.arc(posX, posY, radMod, Math.PI, 0, false);
                ctx.fillStyle = 'blue';
                ctx.fill();
              }
            }






          } else {
            // console.log(key);
            // console.log(Object.keys(this.halfHourlyData));
            // console.log(Object.keys(this.DataManager.OBSEADataRetriever.halfHourlyData));
            
            // console.error("Half hourly data was not loaded??" + this.halfHourlyData);
          }


          // Increase half hour
          movingDate.setUTCMinutes(movingDate.getUTCMinutes() + 30);
          //console.log(movingDate.toISOString());
        }

      }
    },

    // Clean ISO string to have a half-hour step
    setISOStringToHalfHourly: function(isoString){
      let min = parseInt(isoString.substring(14, 16));
      let normMin = parseInt(30 * Math.floor(min / 30));
      return isoString.substring(0, 14) + String(normMin).padStart(2, '0') + ':00.000Z';
    },






    // PUBLIC METHODS
    // Set data
    setDailyData: function(data){
      this.dailyData = data;
    },
    setHalfHourlyData: function(data){
      this.halfHourlyData = data;
    },
    // Set start and end dates
    setStartEndDates: function (sDate, eDate) {
      
      this.startDate.setTime(sDate.getTime());
      this.endDate.setTime(eDate.getTime());
      this.timeSpanInHours = (this.endDate.getTime() - this.startDate.getTime()) / 36e5;

      // Load half-hourly data if timespan is smaller than X
      // Number of points should be smaller or equal than the number of pixels available, but
      // from daily points to 24*2 points per day is quite a big jump. So we set a minimum for showing the half-hourly data
      // TODO: Consider using the minimum radius of the circles here (default is 1, thus diameter is 2 pixels)
      if (this.timeSpanInHours <= Math.max(this.$refs.dataStreamsCanvas.width, this.maxHalfHourlyPoints)){ 
        // Load data (DataManager loads the file if it was not loaded already, taking into account the start and end dates).
        // TODO: in our case, the start-end date is always less than 6 months and the static files are divided into 6 months periods,
        // thus providing the start and end dates should be enough. If static files are to be partitioned into smaller parts, please revise here
        let onLoad = (res) => {
          this.setHalfHourlyData(res); // Store hourly data
          this.setDailyData(this.DataManager.getDailyData()); // Store daily maximum data (gets updated when API is used)
        if (!this.DataManager.OBSEADataRetriever.isLoading) // Update canvas once all files are loaded
            this.updateCanvas();
        }
        // Load data (half hourly)
        this.DataManager.getHalfHourlyData(this.startDate, this.endDate)
          .then(res => onLoad(res)).catch(e => console.error('DataStreamsBar.vue\n' + e));
      }

      this.updateCanvas();
      //console.log("Updating canvas and start and end dates from data streams");
    },

    updateCurrentDate: function(isoString){
      // Get data for this date
      // Check zoom level
      // Use daily data when zoom level is close and nothing is loading
      if (!this.isDailyVisible) { 
        isoString = this.setISOStringToHalfHourly(isoString);
        let hhData = this.halfHourlyData[isoString];
        if (hhData != undefined){
          window.eventBus.emit('DataStreamsBar_dataHalfHourlyUpdate', hhData);
        }
      } else {
        // Daily value
        isoString = isoString.substring(0,10) + 'T00:00:00.000Z';
        let ddData= this.dailyData[isoString];
        if (ddData != undefined){
          ddData.timestamp = isoString; // TODO: should remove this if OBSEA daily static data is regenerated
          window.eventBus.emit('DataStreamsBar_dataDailyUpdate', ddData);
        }
      }
    },



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
  pointer-events: all;
  cursor: pointer;

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