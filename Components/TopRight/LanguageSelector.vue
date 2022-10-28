<template>

  <div class="dropdown">
    <div class="dropbtnBackground">
      <button @click="dropdownClick" class="dropbtn">
        <!-- <svg class="icon-svg nopointerevents" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <path class="cls-1" d="M249,42h8V469h-8V42Z" />
          <path class="cls-1" d="M466,251v10H41V251H466Zm0,0v10H41V251H466Z" />
          <path class="cls-1" d="M435,144l5,10H66l5-10H435Zm2.01,0v10.011H69V144H437.01Z" />
          <path class="cls-1" d="M445,347l-3,10H64l-3-10H445Zm-3-.011V357H64V346.989H442Z" />
          <circle class="cls-2" cx="253.5" cy="255.5" r="216.5" />
          <ellipse class="cls-2" cx="254" cy="257" rx="145" ry="218" />
          <ellipse class="cls-2" cx="255" cy="256" rx="72" ry="218" />
        </svg> -->

        <img class="lang-icon" src="/OBSEA/lang/en-200.png" v-show="$i18n.locale.includes('en')">
        <img class="lang-icon" src="/OBSEA/lang/es-200.png" v-show="$i18n.locale.includes('es')">
        <img class="lang-icon" src="/OBSEA/lang/ca-200.png" v-show="$i18n.locale.includes('ca')">
      
      </button>
    </div>
    <div id="myDropdown" class="dropdown-content">
      <div class="lgItem cat" value='ca' @click='changeLanguage' href="#">Català</div>
      <div class="lgItem es" value='es' @click='changeLanguage' href="#">Español</div>
      <div class="lgItem en" value='en' @click='changeLanguage' href="#">English</div>
    </div>
  </div>

</template>



<script>
export default {
  name: "app-manager",
  created(){
    // Set default navigator language
    this.$i18n.locale = navigator.language;
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }
  },
  mounted () {

  },
  data () {
    return {
      
    }
  },
  methods: {
    // INTERNAL EVENTS
    dropdownClick: function(){
      document.getElementById("myDropdown").classList.toggle("show");
    },
    // Change language
    changeLanguage: function(el){
      this.$i18n.locale = el.target.getAttribute('value');
    },
  },
  components: {

  },
  computed: {
  
  }
}

</script>


<style scoped>
/* SVG */
/* Limit SVG size */
.nopointerevents {
  pointer-events: none;
}
.cls-1 {
  fill: #1a1a1a;
  stroke-width: 8px;
  fill-rule: evenodd;
}
.cls-1,
.cls-2 {
  stroke: #1a1a1a;
}
.cls-2 {
  fill: none;
  stroke-width: 20px;
}



/* Dropdown Button */
.dropbtn {
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 50%;
  border-width: 0;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}


.dropbtnBackground{
  /* background-color: #ffffff74; */
  border-radius: 50%;
  padding: 3px;
  display: flex;
  justify-content: flex-end;
}

/* Dropdown button on hover & focus */
.dropbtn:hover, .dropbtn:focus {
  /* background-color: #2d5a91; */
  border-width: 2px;
  border-color: black;
  border-style: solid;
  border-radius: 50%;
  background-color: rgb(176, 176, 176);
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
  z-index: 0;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  display: none;
  /* position: absolute; */
  background-color: #a0d7f2;;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  margin-bottom: 10px;
}

/* Links inside the dropdown */
.dropdown-content .lgItem {
  color: black;
  padding: 4px 4px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.dropdown-content .lgItem:hover {
  background-color: #63c0ee;
  cursor: pointer;
}

/* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
.show {display:block;}

.lgItem:before {
  content: '';
  display: inline-block;
  width: 25px;
  height: 25px;
  vertical-align: middle;
  margin-right: 10px;
  margin-left: 10px;
  background-size: contain;
  background-repeat: no-repeat;
}

.es:before {
  content: '';
  background-image: url(/OBSEA/lang/es-200.png);
}

.en:before {
  content: '';
  background-image: url(/OBSEA/lang/en-200.png);
}
.cat:before {
  content: '';
  background-image: url(/OBSEA/lang/ca-200.png);
}

.lang-icon {
  width: 25px;
  pointer-events: none;
  box-shadow: 0px 0px 2px rgb(0, 0, 0);
}
</style>
