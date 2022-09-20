<template>

  <div class="dropdown">
    <div class="dropbtnBackground">
      <button @click="dropdownClick" class="dropbtn">&#127760;</button>
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
/* Dropdown Button */
.dropbtn {
  background-color: #5580b4;
  border-radius: 4px;
  color: white;
  padding: 4px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.dropbtnBackground{
  background-color: #ffffff74;
  border-radius: 4px;
  padding: 3px;
}

/* Dropdown button on hover & focus */
.dropbtn:hover, .dropbtn:focus {
  background-color: #2d5a91;
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
  z-index: 3;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #a0d7f2;;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
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
  background-image: url(img/es-200.png);
}

.en:before {
  content: '';
  background-image: url(img/en-200.png);
}
.cat:before {
  content: '';
  background-image: url(img/ca-200.png);
}


</style>
