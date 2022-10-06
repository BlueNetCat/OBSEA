// https://data.obsea.es/api/

// https://data.obsea.es/FROST-Server/v1.1/ObservedProperties(1)/Datastreams?$select=description,selfLink

// https://data.obsea.es/FROST-Server/v1.1/ObservedProperties?$select=description,Datastreams

// https://data.obsea.es/api/Datastreams(27)/Observations?$select=resultTime,result

// https://data.obsea.es/api/Datastreams(27)/Observations?$select=resultTime,result&$top=1000000&$filter=resultQuality/qc_flag eq 1 and resultTime ge 2021-01-01T00:00:00z and resultTime lt 2022-01-01T00:00:00z&$orderBy=resultTime asc

const OBSEADataTypes = {
  // 3D simulation parameters
  // Wind
  'Wind direction': {
    name: 'Wind direction',
    altNames: ['WDIR', 'Wind orientation'],
    description: 'Wind from direction data from sensor Airmar_150WX deployed at OBSEA_Buoy',
    url: 'https://data.obsea.es/api/Datastreams(27)',
    units: 'º',

  },
  'Wind speed': {
    name: 'Wind speed',
    altNames: ['WSPD', 'Wind velocity'],
    description: 'Wind speed data from sensor Airmar_150WX deployed at OBSEA_Buoy', 
    url: 'https://data.obsea.es/api/Datastreams(28)',
    units: 'm/s'
  },

  // Waves
  'Wave significant height': {
    name: 'Wave significant height',
    altNames: ['Hm0', 'Wave height', 'hm0'],
    description: 'Spectral significant wave height of waves by acoustic doppler wave array',
    url: 'https://data.obsea.es/api/Datastreams(197)',
    units: 'm'
  },

  'Mean wave direction': {
    name: 'Mean wave direction',
    altNames: ['Mean wave direction', 'WDIR', 'Wave mean direction'],
    description: 'Direction(from) mean of waves(mean wave direction) on the water body by acoustic doppler wave array',
    url: 'https://data.obsea.es/api/Datastreams(206)',
    units: 'º'
  },

  'Directional spreading of waves':{
    name: 'Direction spreading of waves',
    altNames: ['WSPR', "Wave direction spreading"],
    description: 'Directional spreading of waves on the water body by acoustic doppler wave array',
    url: 'https://data.obsea.es/api/Datastreams(205)',
    units: 'º'
  },

  'Wave height maximum': {
    name: 'Wave height maximum',
    altNames: ['Hmax', 'Wave maximum'],
    description: 'Wave height maximum of waves on the water body by acoustic doppler wave array',
    url: 'https://data.obsea.es/api/Datastreams(200)',
    units: 'm'
  },

  // Current
  'Current':{
    name: 'Current',
    altNames: ['Sea water velocity', 'Sea velocity', 'CUR', 'UCUR', 'VCUR', 'ZCUR'],
    description: 'Velocity of water current in the water body',
    url: {
      baseURL: 'https://data.obsea.es/api/Datastreams(X)',
      0: {'U': '221', 'V': '222', 'Z': '223'},
      1: { 'U': '226', 'V': '227', 'Z': '228' },
      2: { 'U': '231', 'V': '232', 'Z': '233' },
      3: { 'U': '236', 'V': '237', 'Z': '238' },
      4: { 'U': '241', 'V': '242', 'Z': '243' },
      5: { 'U': '246', 'V': '247', 'Z': '248' },
      6: { 'U': '251', 'V': '252', 'Z': '253' },
      7: { 'U': '256', 'V': '257', 'Z': '258' },
      8: { 'U': '261', 'V': '262', 'Z': '263' },
      9: { 'U': '266', 'V': '267', 'Z': '268' },
      10: { 'U': '271', 'V': '272', 'Z': '273' },
      11: { 'U': '276', 'V': '277', 'Z': '278' },
      12: { 'U': '281', 'V': '282', 'Z': '283' },
      13: { 'U': '286', 'V': '287', 'Z': '288' },
      14: { 'U': '291', 'V': '292', 'Z': '293' },
      15: { 'U': '296', 'V': '297', 'Z': '298' },
      16: { 'U': '301', 'V': '302', 'Z': '303' },
      17: { 'U': '306', 'V': '307', 'Z': '308' }, 
      18: { 'U': '311', 'V': '312', 'Z': '313' },
      19: { 'U': '316', 'V': '317', 'Z': '318' },
    },
    units: 'm/s'
  },




  // Temperature
  'Sea bottom temperature': {
    name: 'Sea bottom temperature',
    altNames: ['TEMP', 'Sea underwater temperature'],
    description: 'Sea water temperature data from sensor deployed at OBSEA',
    url: ['https://data.obsea.es/api/Datastreams(1)', 'https://data.obsea.es/api/Datastreams(6)',
      'https://data.obsea.es/api/Datastreams(11)', 'https://data.obsea.es/api/Datastreams(216)',
      'https://data.obsea.es/api/Datastreams(16)'],
    units: 'ºC'
  },
  // Salinity
  'Salinity': {
    name: 'Salinity',
    altNames: ['SAL', 'PSAL', 'Sea underwater salinity', 'Sea bottom salinity', 'Sea water salinity'],
    description: 'Sea water salinity data from sensor deployed at OBSEA',
    url: ['https://data.obsea.es/api/Datastreams(4)', 'https://data.obsea.es/api/Datastreams(9)',
      'https://data.obsea.es/api/Datastreams(14)', 'https://data.obsea.es/api/Datastreams(19)'],
    units: '‰'
  },


  

}

export default OBSEADataTypes;