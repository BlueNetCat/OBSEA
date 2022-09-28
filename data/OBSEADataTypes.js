// https://data.obsea.es/api/

// https://data.obsea.es/FROST-Server/v1.1/ObservedProperties(1)/Datastreams?$select=description,selfLink

// https://data.obsea.es/FROST-Server/v1.1/ObservedProperties?$select=description,Datastreams

const dataTypes = {
  'Wind direction': {
    name: 'Wind direction',
    url: 'https://data.obsea.es/api/Datastreams(27)/Observations?$select=resultTime,result',
    units: 'º',

  },
  'Wind speed': {
    name: 'Wind speed',
    url: 'https://data.obsea.es/api/Datastreams(28)',
    units: 'm/s'
  },
  

}

export default dataTypes;