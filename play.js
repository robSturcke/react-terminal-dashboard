const weather = require('weather-js');

weather.find({ search: 'Nashville, TN', degreeType: 'F' }, (error, result) => {
  if (error) console.log(error);
  console.log(JSON.stringify(result, null, 2));
});
