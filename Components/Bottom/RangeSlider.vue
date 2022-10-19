<template>
    <div id="app-rangeslider">
      <!-- https://javascript.info/mouse-drag-and-drop -->
      <div class="rangeslider">
        
        <!-- Middle handle -->
        <button @mousedown="onMouseDownMiddleHandle" @touchstart="onMouseDownMiddleHandle" class="rangeHandle rangeHandleMiddle" ref="middleHandle" style="left: 50%">
        {{message}}
        </button>

      </div>
    </div>
</template>






<script>

export default {
    name: "app-rangeslider",
    created (){
      // Non-reactive variables this.$options.
      
    },
    mounted (){
      // Find HTML elements
      // this.leftHandleEl = this.$el.getElementsByClassName("rangeHandleLeft")[0];
      // this.rightHandleEl = this.$el.getElementsByClassName("rangeHandleRight")[0];
      this.middleHandleEl = this.$el.getElementsByClassName("rangeHandleMiddle")[0];
      this.calcMiddleHandlePosition();
    },
    setup() {
        
    },
    data (){
      return {
        // HTML Elements
        middleHandleEl: undefined,

        // Spacing between side handles and middle handle
        paddingRatio: 0.5,
        maxPadding: 2,

        // Percentage value
        value: 50,
        // Slider message
        message: 'Hello',
      }
    },
    methods: {
      // USER HTML ACTIONS
      // Declare events for middle handle
      onMouseDownMiddleHandle: function(event) {
        
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
        this.$emit('mousedown', this.getRange());
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
      },


      // Move middle handle
      onMouseMoveMiddleHandle: function(event){

        let el = this.middleHandleEl;
        let totalWidth = el.parentElement.offsetWidth; // Get total width of container in pixels
        let pageX = event.pageX ? event.pageX : event.touches[0].pageX;
        let relMouseX = pageX - el.parentElement.offsetLeft;
        let percMargin = (100*(relMouseX - el.offsetWidth/2)/totalWidth); // Get margin from mouse position in percentage

        let widthHandleMiddle = 100*(el.offsetWidth)/totalWidth;
        // Limit movement
        let sidePadding = Math.min(this.paddingRatio * widthHandleMiddle * 0.5, this.maxPadding/2);
        percMargin = Math.min(percMargin, 100 - widthHandleMiddle - sidePadding); // Right side
        percMargin = Math.max(percMargin, sidePadding); // Left side
        this.middleHandleEl.style.left = percMargin + '%';

        // Emit values
        this.$emit('drag', this.getRange());
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

        this.middleHandleEl.style.left = pLeft + widthHandleLeft + Math.min(this.paddingRatio * width * 0.5, this.maxPadding/2) + '%';
        this.middleHandleEl.style.width = width - Math.min(width * this.paddingRatio, this.maxPadding) + '%';
      },



      // Get range in floats
      getRange: function(){
        
        let totalWidth = this.middleHandleEl.parentElement.offsetWidth; // Get total width of container in pixels
        let widthHandleMiddle = 100 * (this.middleHandleEl.offsetWidth) / totalWidth;

        let pLeft = parseFloat(this.middleHandleEl.style.left.replace('%', ''));
        let pRight = pLeft + widthHandleMiddle;

        this.value = ((pLeft + pRight)/2).toFixed(1);
        // TODO: RETURN VALUE
        return [pLeft, pRight];
      },



      // USER INPUT
      // TODO: KEYBOARD LEFT-RIGHT



      // PUBLIC METHODS
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
.rangeslider {
  position: relative;
  background-color: rgba(198, 239, 255, 0.8);
  width: 100%;
  height: 50px;
  max-height: 50px;
  border-top-right-radius: 0.25rem;
  border-top-left-radius: 0.25rem;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(0,0,0,.125);
  display: inline-block;
}

.rangeHandle {
  position: absolute;  
  top: 0.5rem; 
  bottom: 0.5rem; 
  border:none;
  /* width: 1rem;  */
  cursor: ew-resize;
  border-radius: 0.2rem;
  background-color: rgba(107, 193, 228, 0.8);
  color: rgba(4, 85, 117, 0.8);
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;
}

.rangeHandle:hover {
  background-color: rgba(84, 159, 189, 0.9);
}

.rangeHandleMiddle {
  opacity: 0.8;
  padding-left: 6px;
  padding-right: 6px;
  cursor: grab;
  font-size: 13px;
  color: black;
}
</style>