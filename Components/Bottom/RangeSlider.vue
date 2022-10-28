<template>
    <div id="time-slider">
      <!-- https://javascript.info/mouse-drag-and-drop -->
      <div class="timeSliderContainer" ref="timeSliderContainer">
        
        <!-- Time handle -->
        <div>
          <!-- Arrow -->
          
          <!-- Button -->
          <button @mousedown="onMouseDownMiddleHandle" @touchstart="onMouseDownMiddleHandle" @touchend="removeEventListeners" 
            class="timeHandle timeHandle" ref="middleHandle" 
            :title="$i18n.t('timeControl.timeSliderTip')"
            style="left: 50%">
            {{message}}
            <div class="timeHandlePointer"></div>
          </button>
        </div>
        

      </div>
    </div>
</template>






<script>

export default {
    name: "time-slider",
    created (){
      // Non-reactive variables this.$options.
      
    },
    mounted (){
      // Find HTML elements
      this.handleEl = this.$el.getElementsByClassName("timeHandle")[0];
      this.calcMiddleHandlePosition();
    },
    setup() {
        
    },
    data (){
      return {
        // HTML Elements
        handleEl: undefined,

        // Spacing between side handles and middle handle
        paddingRatio: 0.5,
        maxPadding: 2,

        // Percentage value
        value: 50,
        // Slider message
        message: this.$i18n.t('timeControl.timeSliderTip'),
      }
    },
    methods: {
      // USER HTML ACTIONS
      // Declare events for middle handle
      onMouseDownMiddleHandle: function(event) {

        event.preventDefault();
        
        // Disable drag and drop support (is enabled sometimes without a reason) https://javascript.info/mouse-drag-and-drop
        event.target.ondragstart = function(){return false};
        

        // Mouse move
        document.addEventListener("mousemove", this.onMouseMoveMiddleHandle);
        document.addEventListener("touchmove", this.onMouseMoveMiddleHandle);
        // TODO: RELOCATE TO CENTER
        // ACTIVATE CSS LEFT TRANSITION
        // CENTERONDATE WHILE IT CHANGES?
        // Mouse up removes event listeners
        document.addEventListener("mouseup", this.removeEventListeners);
        document.addEventListener("touchend", this.removeEventListeners);
        // Emit onmousedown
        this.$emit('mouseIsDown', this.getRange());
        // Relocate on mouse down
        // TODO?
        //this.onMouseMoveMiddleHandle(event);
      },
      removeEventListeners: function(){
        // Slider event
        document.removeEventListener("mousemove", this.onMouseMoveMiddleHandle);
        document.removeEventListener("touchmove", this.onMouseMoveMiddleHandle);
        // Document event
        document.removeEventListener("mouseup", this.removeEventListeners);
        document.removeEventListener("touchend", this.removeEventListeners);
        // TODO: isDragging = false?
        this.$emit('mouseIsUp');
      },


      // Move middle handle
      onMouseMoveMiddleHandle: function(event){

        let el = this.handleEl;
        let containerEl = this.$refs.timeSliderContainer;
        let totalWidth = containerEl.offsetWidth; // Get total width of container in pixels
        let pageX = event.pageX ? event.pageX : event.touches[0].pageX;
        let relMouseX = pageX - containerEl.offsetLeft;
        let percMargin = (100*(relMouseX - el.offsetWidth/2)/totalWidth); // Get margin from mouse position in percentage

        let widthHandleMiddle = 100*(el.offsetWidth)/totalWidth;
        // Limit movement
        let sidePadding = Math.min(this.paddingRatio * widthHandleMiddle * 0.5, this.maxPadding/2);
        percMargin = Math.min(percMargin, 100 - widthHandleMiddle - sidePadding); // Right side
        percMargin = Math.max(percMargin, sidePadding); // Left side
        this.handleEl.style.left = percMargin + '%';

        // Emit values
        this.$emit('isDragging', this.getRange());
      },


      // Calculate width and position of middle handle
      calcMiddleHandlePosition: function(){
        return;
        //let el = this.$refs.leftHandle;
        let el = this.leftHandleEl;
        let totalWidth = el.parentElement.offsetWidth;
        let widthHandleLeft = 100*el.offsetWidth/totalWidth;

        let posRightHandle = this.rightHandleEl.style.left;
        let posLeftHandle = this.leftHandleEl.style.left;

        let pRight = parseFloat(posRightHandle.replace('%', ''));
        let pLeft = parseFloat(posLeftHandle.replace('%', ''));
        
        let width = pRight - pLeft - widthHandleLeft;

        this.handleEl.style.left = pLeft + widthHandleLeft + Math.min(this.paddingRatio * width * 0.5, this.maxPadding/2) + '%';
        this.handleEl.style.width = width - Math.min(width * this.paddingRatio, this.maxPadding) + '%';
      },



      // Get range in floats
      getRange: function(){
        
        let totalWidth = this.handleEl.parentElement.offsetWidth; // Get total width of container in pixels
        let widthHandleMiddle = 100 * (this.handleEl.offsetWidth) / totalWidth;

        let pLeft = parseFloat(this.handleEl.style.left.replace('%', ''));
        let pRight = pLeft + widthHandleMiddle;

        this.value = ((pLeft + pRight)/2).toFixed(1);
        // TODO: RETURN VALUE
        return [pLeft, pRight];
      },



      // USER INPUT
      // TODO: KEYBOARD LEFT-RIGHT



      // PUBLIC METHODS
      setSliderPosition: function(perc) {

        let totalWidth = this.handleEl.parentElement.offsetWidth; // Get total width of container in pixels
        let percWidthHandleMiddle = 100 * (this.handleEl.offsetWidth) / totalWidth;
        //percWidthHandleMiddle -= 1; // HACK to position cursor exactly where mouse is

        this.handleEl.style.left = (perc - percWidthHandleMiddle/2) + '%';

      },
      // Set the range
      // TODO: SHOULD BE A SINGLE VALUE
      setRange: function(inRange){
        return;
        // Set handles
        this.leftHandleEl.style.left = inRange[0] + '%';
        let widthRigthHandle = 100*this.rightHandleEl.offsetWidth/this.rightHandleEl.parentElement.offsetWidth;
        this.rightHandleEl.style.left = (inRange[1]-widthRigthHandle) + '%';
        // Set middle bar
        this.calcMiddleHandlePosition();
      },
      // Set message
      setMessage: function(inMessage){
        this.message = inMessage;
      }

    },
    components: {

    },
    computed: {

    },
    
}
</script>




<style scoped>
.timeSliderContainer {
  position: relative; 
  width: 100%;
  height: 50px;
  max-height: 50px;
  padding: 1rem 1.25rem;
  display: inline-block;
  /* background-color: rgba(198, 239, 255, 0.8); */
  /* border-top-right-radius: 0.25rem;
  border-top-left-radius: 0.25rem; */
  /* border: 1px solid rgba(0,0,0,.125); */
}

.timeHandle {
  position: absolute;  
  top: 0.5rem; 
  bottom: 0.5rem; 
  border:none;
  cursor: ew-resize;
  border-radius: 0.2rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
  background-color: rgba(4, 85, 117,1);
  
  user-select: none;

  opacity: 0.95;
  padding-left: 6px;
  padding-right: 6px;
  cursor: grab;
  font-size: 13px;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;
}

.timeHandle:hover {
  /* background-color: rgba(84, 159, 189, 0.9); */
  background-color: rgba(2, 54, 74, 1);
  
}


.timeHandlePointer{
  background-color: white;
    width: 10px;
    height: 10px;
    position: absolute;
    bottom: -5px;
    transform: rotate(45deg);
    border-top-left-radius: 10px;
}
</style>