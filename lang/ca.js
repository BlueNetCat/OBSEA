let ca;
export default ca = {
  "Date": "Data",

  "buoyButtonTitle": "Centra la càmara a la boia de superficie",
  "baseButtonTitle": "Centra la càmara a l'observatori submarí",

  "waveButtonTitle": "Configura l'onatge",
  "windButtonTitle": "Modifica el vent",

  "compassButtonTitle": "Orienta la càmara cap al nord",

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


  "Data": "Dades",
}