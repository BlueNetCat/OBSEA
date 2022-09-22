<template>
  <div id="bottom-section">

    <!-- Underwater camera -->
    <camera-youtube v-show="isUnderwater"></camera-youtube>

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
      isUnderwater: false
    }
  },
  components: {
    "camera-youtube": CameraYoutube,
  }
}
</script>






<style scoped>

</style>