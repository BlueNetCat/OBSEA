let ca;
export default ca = {
  "Date": "Data",

  "buoyButtonTitle": "Centra la càmara a la boia de superficie",
  "baseButtonTitle": "Centra la càmara a l'observatori submarí",

  "waveButtonTitle": "Configura l'onatge",
  "windButtonTitle": "Modifica el vent",

  "externalLinkButton": "Ves a la font de dades",
  "measuresButton": "Obre/Tanca el panell de dades",

  "compassButtonTitle": "Orienta la càmara cap al nord",


  "WSPD": "Velocitat del vent",
  "WDIR": "Direcció del vent",
  "Hm0": "Altura d'onatge (mitja)",
  "Hmax": "Altura màxima d'onatge",
  "Mdir": "Direcció d'onatge (mitja)",
  "Spr1": "Difusió direccional d'onatge",
  "AIRT": "Temperatura de l'aire",
  "TEMP": "Temperatura (base submarina)",
  "PSAL": "Salinitat (base submarina)",

  "Wind": "Vent",
  "Waves": "Onatge",

  "Wave height": "Altura d'onatge",
  "Swell direction": "Direcció de l'onatge",
  "Wave steepness": "Període",

  "Wind speed": "Velocitat del vent",
  "Wind direction": "Direcció del vent",
  "Wave significant height": "Altura significant d'onatge",
  "Air temperature": "Temperatura de l'aire",
  "Atmospheric pressure": "Pressió atmosfèrica",
  "Sea surface temperature": "Temperatura superficial del mar",
  "Sea bottom temperature": "Temperatura del fons del mar",
  "Salinity": "Salinitat",


  infoPanel: {
    title: "Sobre l'aplicació",
    p1: `Aquesta aplicació és una simulació en 3D de les condicions meteorològiques i oceanogràfiques 
    de l'observatori del fons marí OBSEA. La simulació es basa en les dades recollides per l'observatori.
     L'objectiu d'aquesta aplicació és transferir el coneixement i la informació adquirida 
    per l'observatori. Aquesta aplicació està sent desenvolupada per la
        `,
    p1_1: `en col·laboració amb l'`,
    BlueNetCat: 'Xarxa Marítima de Catalunya (BlueNetCat)',
    OBSEA_UPC: 'OBSEA de la Universitat Politècnica de Catalunya (UPC)',
    p1_2: `. Agraïments sincers al Grup de les Tecnologies de la Interacció (GTI) de la Universitat Pompeu Fabra pel
    suport tècnic i a l'Emilio García per les consultes teòriques. El codi de l'aplicació es pot trobar al `,
    github: `repositori github.`,

    aboutObsea: `Sobre l'OBSEA`,
    p2: `De la pàgina web de l'OBSEA: "La investigació marina requereix cada dia més informació mediambiental, 
    amb millors resolucions temporals i sèries més llargues. Els mètodes tradicionals no són adequats per 
    ecosistemes marins amb dinàmiques molt lentes, amb l'adquisició continua de dades durant llargs períodes 
    és possible detectar canvis climàtics a la vegada que esdeveniments singulars.`,
    p2_1: `OBSEA és un observatori submarí cablejat a uns 4 km de la costa de Vilanova i la Geltrú a 
    la zona protegida de pesca, i interconnectat a la costa per un cable mixt d'energia i comunicacions. 
    L'avantatge principal de disposar d'un observatori cablejat és la de poder proporcionar energia als 
    instruments científics i disposar d'un enllaç de comunicació de banda ampla. D'aquesta manera es pot 
    tenir informació en temps real i s'eviten els inconvenients dels sistemes alimentats amb bateries. La 
    solució adoptada és la implementació d'una xarxa ethernet òptica que transmet contínuament les dades dels
     instruments oceanogràfics connectats a l'observatori. Amb l'OBSEA es pot realitzar una observació 
     en temps real de múltiples paràmetres del medi marí. Des de l'estació terrestre es proporciona 
     l'alimentació pels dispositius i l'enllaç de fibra òptica per les comunicacions a la vegada que es
      fa la gestió d'alarmes i s'emmagatzemen les dades. Amb un tram d'uns 1000 metres de cable terrestre 
      es connecta amb l'arqueta d'ancoratge, punt on el cable submarí inicia el seu recorregut fins la
       ubicació del node a uns 4 km de la costa i a uns 20 metres de profunditat."`,

    contact: "Contacte",
    p3: `Per a consultes sobre l'aplicació, poseu-vos en contacte amb Gerard Llorach (gllorach at bluenetcat.eu).
      Per a consultes sobre les dades, poseu-vos en contacte amb Enoc Martínez (enoc.martinez at upc.edu ).`,

    funding: "Finançament",
    p4: `La Xarxa Marítima de Catalunya (BlueNetCat) està finançada per 
    la Generalitat de Catalunya i pel Fons Europeu de Desenvolupament Regional (FEDER).`,

  },


  seaPanel: {
    title: "Paràmetres de la simulació del mar",
    p1: "Aquesta simulació està fet amb onades de Gestner, seguint el",
    p1_1: "tutorial de Jasper Flick",
    p2: `La simulació genera els paràmetres de 16 onades segons les mesures d'onatge, tals com l'altura mitjana d'onatge,
    l'altura màxima d'onatge i la direcció de l'onatge.`,
    oceanSteepness: "Modifica com de picat está el mar",
    waveSignificantHeight: "Modifica l'altura significant d'onatge",
    meanWaveDirection: "Modifica la direcció promig de les onades",
    swellParams: "Modifica els paràmetres de l'onatge principal",
  },


  windPanel: {
    title: "Paràmetres de la simulació de vent",
    p1: "La simulació de tela està feta amb verlet integration (Hitman's ragdoll), seguint el",
    p1_1: "tutorial de Jared Counts",
    p2: `La simulació està basada en les mesures de la velocitat del vent i la seva direcció, que modifiquen
        les forces que afecten la tela.`,
    windParams: 'Modifica el vent',
  },

  timeControl: {
    "timeSliderTip": "Arrossega per seleccionar la data",
    "dailyMax": "Màxim diari (OBSEA)",
    "halfHourly": "Mitjana 30min (OBSEA)",
    "playPause": "Reproduïr/Aturar",
    "stepForward": "Ves al següent punt",
    "stepBackward": "Ves al punt anterior",
    "forward": "Avanç rápid",
    "backward": "Rebobinar"
  },


    "January": "Gener",
    "February": "Febrer",
    "March": "Març",
    "April": "Abril",
    "May": "Maig",
    "June": "Juny",
    "July": "Juliol",
    "August": "Agost",
    "September": "Setembre",
    "October": "Octubre",
    "November": "Novembre",
    "December": "Desembre",
    "Jan": "Gen",
    // "Feb": ,
    // "Mar": ,
    "Apr": "Abr",
    "May": "Maig",
    // "Jun": ,
    // "Jul": ,
    "Aug": "Ago",
    "Sep": "Set",
    // "Oct": ,
    // "Nov": ,
    "Dec": "Des",
  

  "Data": "Dades",
}