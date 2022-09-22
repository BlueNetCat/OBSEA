<template>
  <div id="bottom-section">

    <!-- Bottom icons -->
    <!-- Above water -->
    <div class="bottom-icons" v-show="!isUnderwater">
      <button>Wave configuration icon</button>
      <button>Wind configuration icon</button>
    </div>
    <!-- Underwater -->
    <div class="bottom-icons" v-show="isUnderwater">
      <button @click="cameraButtonClicked">Camera youtube icon</button>
    </div>

    <!-- Underwater camera -->
    <camera-youtube v-show="showCamera"></camera-youtube>

    <!-- Current information available (temp, etc...)-->

  </div>
</template>



<script>
import CameraYoutube from "/OBSEA/Components/Bottom/CameraYoutube.vue"

export default {
  name:"BottomSection",
  mounted() {
    // Subscribe to camera change to hide OBSEA underwater camera
    window.eventBus.on('Canvas3D_cameraChange', (sceneManager) => {
      let camPos = sceneManager.camera.position;
      if (camPos.y < -10){
        this.isUnderwater = true;
      }
      if (camPos.y > -5)
        this.isUnderwater = false;
    });
  },
  data() {
    return {
      isUnderwater: false,
      showCamera: false
    }
  },
  methods :{
    cameraButtonClicked: function () {
      this.showCamera = !this.showCamera;
    }
  },
  components: {
    "camera-youtube": CameraYoutube,
  }
}
</script>






<style scoped>
#bottom-section {
  position: absolute;
  bottom: 0px;
  width: 100vw;
}
.bottom-icons {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>