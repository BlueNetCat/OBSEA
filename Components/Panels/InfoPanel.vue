<template>
  <div id="info-panel">
    <div class="content">
      <!-- About the app -->
      <h3>{{$t('infoPanel.title')}}</h3>
      <p> {{$t('infoPanel.p1')}} 
        <a href="https://www.bluenetcat.eu" target="_blank">{{$t('infoPanel.BlueNetCat')}}</a>
        {{$t('infoPanel.p1_1')}}
        <a href="https://www.obsea.es" target="_blank">{{$t('infoPanel.OBSEA_UPC')}}</a>
        . {{$t('infoPanel.p1_2')}}
        <a href="https://www.github.com/BlueNetCat/OBSEA" target="_blank">{{$t('infoPanel.github')}}</a>
        .
      </p>
      <!-- About obsea -->
      <h4>{{$t('infoPanel.aboutObsea')}}</h4>
      <p>{{$t('infoPanel.p2')}}</p>
      <p>{{$t('infoPanel.p2_1')}}</p>
      <!-- Contact -->
      <h4>{{$t('infoPanel.contact')}}</h4>
      <p>{{$t('infoPanel.p3')}}</p>
      <!-- Funding -->
      <h4>{{$t('infoPanel.funding')}}</h4>
      <p>{{$t('infoPanel.p4')}}</p>
      <!-- Funding image -->
      <img src="/OBSEA/img/logos.png" style="max-width: 100%">
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