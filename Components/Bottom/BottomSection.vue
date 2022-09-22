<template>
  <div id="bottom-section">

    <!-- Bottom icons -->
    <div class="bottom-icons">
      <div>hello</div>
      <div>hello</div>
      <div>hello</div>
      <div>hello</div>
    </div>

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
      isUnderwater: true
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