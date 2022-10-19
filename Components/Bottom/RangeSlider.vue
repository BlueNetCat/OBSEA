<template>
    <div id="app-rangeslider">
      <!-- https://javascript.info/mouse-drag-and-drop -->
      <div class="rangeslider">

        <!-- Left handle https://unicode-table.com/en/2039/ -->
        <button @mousedown="onMouseDownLeftHandle" class="rangeHandle rangeHandleLeft" ref="leftHandle" style="left: 25%">  	
          &#8249;
        </button>
        <!-- Right handle -->
        <button @mousedown="onMouseDownRightHandle" class="rangeHandle rangeHandleRight" ref="rightHandle" style="left: 75%">
          &#8250;
        </button>
        
        <!-- Middle handle -->
        <button @mousedown="onMouseDownMiddleHandle" class="rangeHandle rangeHandleMiddle" ref="middleHandle" style="left: 28%, width: 40%">
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
      this.leftHandleEl = this.$el.getElementsByClassName("rangeHandleLeft")[0];
      this.rightHandleEl = this.$el.getElementsByClassName("rangeHandleRight")[0];
      this.middleHandleEl = this.$el.getElementsByClassName("rangeHandleMiddle")[0];
      this.calcMiddleHandlePosition();
    },
    setup() {
        
    },
    data (){
      return {
        // HTML Elements
        leftHandleEl: undefined,
        rightHandleEl: undefined,
        middleHandleEl: undefined,

        // Spacing between side handles and middle handle
        paddingRatio: 0.1,
        maxPadding: 2,
      }
    },
    methods: {
      // USER HTML ACTIONS
      // Declare events for left handle
      onMouseDownLeftHandle: function(event){
        // Disable drag and drop support (is enabled sometimes without a reason) https://javascript.info/mouse-drag-and-drop
        event.target.ondragstart = function(){return false};
        // Create event listener for mouse move in document
        document.addEventListener('mousemove', this.onMouseMoveLeftHandle);
        // Create event listener for mouse up and remove mouse move event listener
        document.onmouseup = ()=>{
          this.$emit('mouseup',  this.getRange());
          document.removeEventListener('mousemove', this.onMouseMoveLeftHandle);
          document.onmouoseup = null;
        };
        // Emit onmousedown
        this.$emit('mousedown', this.getRange());
        // Relocate on mouse down
        this.onMouseMoveLeftHandle(event);
      },

      // Declare events for right handle
      onMouseDownRightHandle: function(event){
        // Disable drag and drop support (is enabled sometimes without a reason) https://javascript.info/mouse-drag-and-drop
        event.target.ondragstart = function(){return false};
        // Create event listener for mouse move in document
        document.addEventListener('mousemove', this.onMouseMoveRightHandle);
        // Create and remove event listener for mouse up (removes previous event listener)
        document.onmouseup = ()=>{
          this.$emit('mouseup',  this.getRange());
          document.removeEventListener('mousemove', this.onMouseMoveRightHandle);
          document.onmouoseup = null;
        };
        // Emit onmousedown
        this.$emit('mousedown', this.getRange());
        // Relocate on mouse down
        this.onMouseMoveRightHandle(event);
      },

      // Declare events for middle handle
      onMouseDownMiddleHandle: function(event) {
        // Disable drag and drop support (is enabled sometimes without a reason) https://javascript.info/mouse-drag-and-drop
        event.target.ondragstart = function(){return false};
        // Create event listener for mouse move in document
        document.addEventListener('mousemove', this.onMouseMoveMiddleHandle);
        // Create and remove event listener for mouse up (removes previous event listener)
        // Emit event with values
        document.onmouseup = ()=>{
          this.$emit('mouseup', this.getRange());
          document.removeEventListener('mousemove', this.onMouseMoveMiddleHandle);
          document.onmouoseup = null;
        };
        // Emit onmousedown
        this.$emit('mousedown', this.getRange());
        // Relocate on mouse down
        this.onMouseMoveMiddleHandle(event);
      },

      // Move left handle
      onMouseMoveLeftHandle: function(event){
        //let el = this.$refs.leftHandle; // Get element
        let el = this.leftHandleEl;
        let totalWidth = el.parentElement.offsetWidth; // Get total width of container in pixels
        let relMouseX = event.pageX - el.parentElement.offsetLeft; // Correct when container has side elements
        let percMargin = (100*(relMouseX - el.offsetWidth/2)/totalWidth); // Get margin from mouse position
        let posRightHandle = this.rightHandleEl.style.left;
        let percMarginRightHandle = parseFloat(posRightHandle.replace('%', '')); // Transform percent css format to float
        percMargin = Math.min(percMargin, percMarginRightHandle - 100*el.offsetWidth/totalWidth); // Limit on the right side
        percMargin = Math.max(percMargin, 0); // Limit on the left side
        
        this.leftHandleEl.style.left = percMargin + "%";
        // Update middle bar
        this.calcMiddleHandlePosition();
        // Emit values
        this.$emit('change', this.getRange());
      },

      
      // Move right handle
      onMouseMoveRightHandle: function(event){
        //let el = this.$refs.rightHandle; // Get element
        let el = this.rightHandleEl;
        let totalWidth = el.parentElement.offsetWidth; // Get total width of container in pixels
        let relMouseX = event.pageX - el.parentElement.offsetLeft;
        let percMargin = (100*(relMouseX - el.offsetWidth/2)/totalWidth); // Get margin from mouse position in percentage

        let posLeftHandle = this.leftHandleEl.style.left;
        let percMarginLeftHandle = parseFloat(posLeftHandle.replace('%', '')); // Get position of other handle. Transform percent css format to float
        percMargin = Math.min(percMargin, 100 - 100*el.offsetWidth/totalWidth); // Limit on the right side
        percMargin = Math.max(percMargin, percMarginLeftHandle + 100*el.offsetWidth/totalWidth); // Limit on the left side

        this.rightHandleEl.style.left = percMargin + "%";
        // Update middle bar
        this.calcMiddleHandlePosition();
        // Emit values
        this.$emit('change', this.getRange());
      },


      // Move middle handle
      onMouseMoveMiddleHandle: function(event){
        //let el = this.$refs.middleHandle;
        let el = this.middleHandleEl;
        let totalWidth = el.parentElement.offsetWidth; // Get total width of container in pixels
        let relMouseX = event.pageX - el.parentElement.offsetLeft;
        let percMargin = (100*(relMouseX - el.offsetWidth/2)/totalWidth); // Get margin from mouse position in percentage
        // Get positions of side handles in percentage
        let posLeftHandle = this.leftHandleEl.style.left;
        let posRightHandle = this.rightHandleEl.style.left;
        let percMarginLeftHandle = parseFloat(posLeftHandle.replace('%', '')); // Transform percent css format to float
        let percMarginRightHandle = parseFloat(posRightHandle.replace('%', '')); // Transform percent css format to float
        // Get width of side handles
        //let handleSideEl = this.$refs.leftHandle;
        let handleSideEl = this.leftHandleEl;
        let widthHandleLeft = 100*handleSideEl.offsetWidth/totalWidth;
        let widthHandleMiddle = 100*(el.offsetWidth)/totalWidth;
        // Limit movement
        let sidePadding = Math.min(this.paddingRatio * widthHandleMiddle * 0.5, this.maxPadding/2);
        percMargin = Math.min(percMargin, 100 - widthHandleMiddle - widthHandleLeft - sidePadding); // Right side
        percMargin = Math.max(percMargin, widthHandleLeft + sidePadding); // Left side

        // Calculate left and right handle positions (as in calcMiddleHandlePosition)
        this.leftHandleEl.style.left = percMargin - widthHandleLeft - sidePadding + "%";
        this.rightHandleEl.style.left = percMargin + widthHandleMiddle + sidePadding + "%";
        this.middleHandleEl.style.left = percMargin + '%';

        // Emit values
        this.$emit('drag', this.getRange());
      },


      // Calculate width and position of middle handle
      calcMiddleHandlePosition: function(){
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
        let posLeftHandle = this.leftHandleEl.style.left;
        let posRightHandle = this.rightHandleEl.style.left;
        let widthRigthHandle = 100*this.rightHandleEl.offsetWidth/this.rightHandleEl.parentElement.offsetWidth;
        let pLeft = parseFloat(posLeftHandle.replace('%', ''));
        let pRight = parseFloat(posRightHandle.replace('%', '')) + widthRigthHandle;
        return [pLeft, pRight];
      },


      // PUBLIC METHODS
      // Set the range
      setRange: function(inRange){
        // Set handles
        this.leftHandleEl.style.left = inRange[0] + '%';
        let widthRigthHandle = 100*this.rightHandleEl.offsetWidth/this.rightHandleEl.parentElement.offsetWidth;
        this.rightHandleEl.style.left = (inRange[1]-widthRigthHandle) + '%';
        // Set middle bar
        this.calcMiddleHandlePosition();
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
  width: 1rem; 
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
  opacity: 0.5;
  padding: 0;
  cursor: grab;
}

</style>