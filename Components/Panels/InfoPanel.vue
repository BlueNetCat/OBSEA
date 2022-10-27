<template>
  <div id="info-panel">
    <div class="content">
      <!-- About the app -->
      <h3>{{$t('infoPanel.title')}}</h3>
      <p> {{$t('infoPanel.p1')}} 
        <a href="https://www.bluenetcat.eu" target="_blank">{{$t('infoPanel.BlueNetCat')}}</a>
        {{$t('infoPanel.p1_1')}}
        <a href="https://www.obsea.es" target="_blank">{{$t('infoPanel.OBSEA_UPC')}}</a>
        {{$t('infoPanel.p1_2')}}
        <a href="https://www.github.com/BlueNetCat/OBSEA" target="_blank">{{$t('infoPanel.github')}}</a>
      </p>
      <!-- About obsea -->
      <h4>{{$t('infoPanel.aboutObsea')}}</h4>
      <p>{{$t('infoPanel.p2')}}</p>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d22674.59644209604!2d1.743679785621899!3d41.18117490234741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a38406e50198d9%3A0x3aeb311db44b1f56!2sObsea%20Cabled%20Observatory!5e0!3m2!1ses!2ses!4v1666868675522!5m2!1ses!2ses"
        width="100%" height="300px" style="border:0;" allowfullscreen="" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"></iframe>
      <p>{{$t('infoPanel.p2_1')}}</p>
      <!-- Contact -->
      <h4>{{$t('infoPanel.contact')}}</h4>
      <p>{{$t('infoPanel.p3')}}</p>
      <!-- Funding -->
      <h4>{{$t('infoPanel.funding')}}</h4>
      <p>{{$t('infoPanel.p4')}}</p>
      <!-- Funding image -->
      <img src="/OBSEA/img/Logos.png" style="max-width: 100%">
    </div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style scoped>
p {
  text-align: justify;
}
</style>