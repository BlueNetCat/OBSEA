<template>
  <div id="data-streams-bar">
    <!-- A div with the same width as TimeRange -->
    <div class="streamsContainer" ref="streamsContainer">
      hello
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
  name: "tracks-timeline",
  created() {


  },
  mounted() {

  },
  data() {
    return {
      startDate: new Date(2018, 7, 21),
      endDate: new Date(),
      
    }
  },
  methods: {
    // INTERNAL METHODS
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
    // Set the geojson features
    setFeatures: function (inFeatures) {
      this.features = inFeatures;
    },
    // Set start and end dates
    setStartEndDates: function (sDate, eDate) {
      this.startDate.setTime(sDate.getTime());
      this.endDate.setTime(eDate.getTime());
      //this.features.pop();
      this.features.push([]); // TODO: FIX TRICK, DIRTY HACK. FORCES setFeaturesStyle() in Vue
      this.features.pop();
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
#tracks-timeline {
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