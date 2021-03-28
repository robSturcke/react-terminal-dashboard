import React, { useState, useEffect, useCallback } from 'react';
import figlet from 'figlet';
import useInterval from '@use-it/interval';
import weather from 'weather-js';
import util from 'util';

const findWeather = util.promisify(weather.find);

const FONTS = [
  'Straight',
  'ANSI Shadow',
  'Shimrod',
  'doom',
  'Big',
  'Ogre',
  'Small',
  'Standard',
  'Bigfig',
  'Mini',
  'Small Script',
  'Small Shadow',
];

const formatWeather = ([results]) => {
  const { location, current, forecast } = results;
  const degreeType = location.degreetype;
  const temperature = `${current.temperature}°${degreeType}`;
  const conditions = current.skytext;
  const low = `${forecast[1].low}°${degreeType}`;
  const high = `${forecast[1].high}°${degreeType}`;

  return `${temperature} and ${conditions} (${low} → ${high})`;
};

export default function Today({
  updateInterval = 900000,
  search = 'New York City, NY',
  degreeType = 'F',
}) {
  const [fontIndex, setFontIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState({
    status: 'loading',
    error: null,
    data: null,
  });

  const fetchWeather = useCallback(async () => {
    setWeather({ status: 'loading', error: null, data: null });
    let data;
    try {
      data = await findWeather({ search, degreeType });
      setWeather({ status: 'complete', error: null, data });
    } catch (error) {
      setWeather({ status: 'error', error, data: null });
    }
  }, [search, degreeType]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  useInterval(() => {
    fetchWeather();
  }, updateInterval);

  useInterval(() => {
    setNow(new Date());
  }, 60000);

  const date = now.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const time = figlet.textSync(
    now.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    {
      font: FONTS[fontIndex % FONTS.length],
    }
  );

  return (
    <box
      top="center"
      left="center"
      width="65%"
      height="65%"
      border={{ type: 'line' }}
      style={{
        border: { fg: 'blue' },
      }}
    >
      {`${date}
${time}
${
  weather.status === 'loading'
    ? 'Loading...'
    : weather.error
    ? `Error: ${weather.error}`
    : formatWeather(weather.data)
}`}
    </box>
  );
}
