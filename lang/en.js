let en;
export default en = {
  "Date": "Date",

  "buoyButtonTitle": "Center the camera on the surface buoy",
  "baseButtonTitle": "Center the camera on the underwater observatory",

  "waveButtonTitle": "Set the ocean swell",
  "windButtonTitle": "Set the wind",

  "externalLinkButton": "Go to the data source",
  "measuresButton": "Open/Close the data panel",

  "compassButtonTitle": "Set the camera facing north",


  "WSPD": "Wind speed",
  "WDIR": "Wind direction",
  "Hm0": "Wave height (average)",
  "Hmax": "Wave maximum height",
  "Mdir": "Wave direction (average)",
  "Spr1": "Wave directional spreading",
  "AIRT": "Air temperature",
  "TEMP": "Temperature (underwater base)",
  "PSAL": "Salinity (underwater base)",

  "Wind": "Wind",
  "Waves": "Waves",

  "Wave height": "Wave height",
  "Swell direction": "Swell direction",
  "Wave steepness": "Wave steepness",

  "Wind speed": "Wind speed",
  "Wind direction": "Wind direction",
  "Wave significant height": "Wave significant height",
  "Air temperature": "Air temperature",
  "Atmospheric pressure": "Atmospheric pressure",
  "Sea surface temperature": "Sea surface temperature",
  "Sea bottom temperature": "Sea bottom temperature",
  "Salinity": "Salinity",


  infoPanel: {
    title: "About",
    p1: `This application is a 3D simulation of the meteorological and oceanographic conditions 
        of the seafloor observatory OBSEA. The simulation is based on the data collected by the 
        observatory when available. The objective of this application is to transfer the knowledge
        and information acquiered by the observatory. This application is being developed by the
        `,
    p1_1: `in collaboration with`,
    BlueNetCat: 'Catalan Maritime Network (BlueNetCat)',
    OBSEA_UPC: 'OBSEA from Universitat Politècnica de Catalunya(UPC)',
    p1_2: `. Special thanks to the Technologies Interactive Group (GTI) at Universitat Pompeu Fabra
    for the technical support and to Emilio García for the theorical support. The code for the 
    application can be found in the `,
    github: `github repository.`,

    aboutObsea: `About OBSEA`,
    p2: `Taken from OBSEA website: "Everyday experimental marine research needs a greater volume 
    of environmental data with better resolution than what can be collected using oceanographic vessels, 
    buoys, or sensors deployed on the seabed. The seafloor observatories can acquire data with great resolution 
    uninterruptedly during long time periods. With this information, scientific community is able to analyze as 
    well annual tendencies as singular events.`,
    p2_1: `The OBSEA underwater observatory (www.obsea.es) is connected with 4 km of cable to the coast of 
    Vilanova i la Geltrú (Barcelona, Spain) and placed at a depth of 20 meters in a fishing protected area.
    The main advantage of the cabled observatory is the capacity to feed the station from land with up to 3.6kW 
    and the high bandwidth communication link of 1 Gbps. This link gives the information in real time and avoids 
    the drawbacks of battery powered systems. The implemented solution is an optical ethernet network that continuously
     transmits data from the connected oceanographic instruments. With OBSEA we can observe in real-time multiple 
     parameters of the marine environment. The Ground Station provides power to feed all the devices and the fiber 
     optic link to establish communications. At the same time from land we manage alarms and data storage. With a 
     length of 1000 meters the terrestrial cable connects the Ground Station to the Beach Manhole where the submarine
      cable begins its route to the node location at 4 km from the coast and 20 meters deep."`,

    contact: "Contact",
    p3: `For inquiries about the application, please contact Gerard Llorach (gllorach at bluenetcat.eu).
     For inquiries about the data, please contact Enoc Martínez (enoc.martinez at upc.edu ).`,

    funding: "Funding",
    p4: `The Catalan Maritime Network (BlueNetCat) is financed by 
    the Generalitat de Catalunya and by the European Regional Development Fund (ERDF).`,

  },


  seaPanel: {
    title: "Sea simulation parameters",
    p1: "This simulation is made with Gestner waves, following the",
    p1_1: "tutorial by Jasper Flick",
    p2: `The simulation generates the parameters of 16 waves according to wave measurements, such as the mean
          wave height, the maximum wave height and the direction of the swell.`,
    oceanSteepness: "Set ocean chopiness",
    waveSignificantHeight: "Set wave significant height",
    meanWaveDirection: "Set the average direction of the waves",
    swellParams: "Set swell parameters",
  },

  windPanel: {
    title: "Wind simulation parameters",
    p1: "The cloth simulation is using verlet integration (Hitman's ragdoll), following the",
    p1_1: "tutorial by Jared Counts",
    p2: `The simulation is based on the wind speed and direction measurements, which modify
        the forces affecting the cloth.`,
    windParams: 'Set wind parameters',
  },


  timeControl: {
    "timeSliderTip": "Drag to select the date",
    "dailyMax": "Daily maximum (OBSEA)",
    "halfHourly": "30min average (OBSEA)",
    "playPause": "Play/Pause",
    "stepForward": "Step forward",
    "stepBackward": "Step backward",
    "forward": "Fast-forward",
    "backward": "Rewind"
  },
  
  


  "Data": "Data",


}