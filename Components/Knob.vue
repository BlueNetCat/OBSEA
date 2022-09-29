<template>
  <div id="knob">
    <!-- https://www.youtube.com/watch?v=ELUSz0L8vTA&ab_channel=QuickCodingTuts -->
    <div class="slider">
      <div class="knob" ref="knob" @mousedown="knobMouseDown">
      </div>
    </div>
  </div>
</template>




<script>

export default {
  name: "Knob",
  created() {

  },
  mounted() {
    // Declare listening events
  },
  data() {
    return {
      // hidePanel: true,
      size: this.sizeIn || "70px"
    }
  },
  props: {
    sizeIn: String
  },
  methods: {
    // Remove event listeners
    removeEventListeners: function(){
      // Knob event
      document.removeEventListener("mousemove", this.mouseMoveRotateKnob);
      // Document event
      document.removeEventListener("mouseup", this.removeEventListeners);
    },
    mouseMoveRotateKnob: function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Get the center of the knob
      let bbox = this.$refs.knob.getBoundingClientRect();
      let centerX = bbox.x + bbox.width/2;
      let centerY = bbox.y + bbox.height/2;
      // Get the vector from the mouse to the center of the knob
      let vecX = centerX - e.clientX;
      let vecY = centerY - e.clientY;
      // Calculate angle
      let angleRad = Math.atan2(vecY, vecX);
      let angle = angleRad * 180 / Math.PI - 90;
      // Emit event
      this.$emit("change", angle);
      // Rotate knob
      this.$refs.knob.style.transform = `rotate(${angle}deg)`;
    },
    // USER ACTIONS
    knobMouseDown: function (e) {
      // Create event listeners 
      e.preventDefault();
      e.stopPropagation();
      // Mouse move changes angle
      document.addEventListener("mousemove", this.mouseMoveRotateKnob);
      // Mouse up removes event listeners
      document.addEventListener("mouseup", this.removeEventListeners);
    },
  },
  components: {
  }
}
</script>






<style scoped>
.slider::before {
    width: v-bind('size');
    height: v-bind('size');
    border-radius: 50%;
    background: #00608d;
  }

  .slider::before, .knob {
    width: v-bind('size');
    height: v-bind('size'); 
    position: relative;
    cursor: pointer;
  }

  .knob::before, .knob::after, .slider::before {
    content: '';
    position: absolute;
    border-radius: 50%;
  }

  .knob::before {
    top: calc(v-bind('size')/7);
    left: 50%;
    transform:translateX(-50%);
    width: calc(v-bind('size')/7);;
    height: calc(v-bind('size')/7);;
    background: white;
  }

  .knob:hover::before {
    background: #ddedff;
  }
</style>