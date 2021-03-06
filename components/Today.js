import React, { useState, useCallback, useMemo } from 'react';
import Box from './Box';
import figlet from 'figlet';
import useInterval from '@use-it/interval';
import weather from 'weather-js';
import util from 'util';
import useDeepCompareEffect from 'use-deep-compare-effect';
import chalk from 'chalk';
import gradient from 'gradient-string';

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

const useRequest = (promise, options, interval = null) => {
  const [state, setState] = useState({
    status: 'loading',
    error: null,
    data: null,
  });

  const request = useCallback(
    async (options) => {
      setState({ status: 'loading', error: null, data: null });
      let data;
      try {
        data = await promise(options);
        setState({ status: 'complete', error: null, data });
      } catch (error) {
        setState({ status: 'error', error, data: null });
      }
    },
    [promise]
  );

  useDeepCompareEffect(() => {
    request(options);
  }, [options, request]);

  useInterval(() => {
    request(options);
  }, interval);

  return state;
};

const formatWeather = ([results]) => {
  const { location, current, forecast } = results;
  const degreeType = location.degreetype;
  const temperature = `${current.temperature}°${degreeType}`;
  const conditions = current.skytext;
  const low = `${forecast[1].low}°${degreeType}`;
  const high = `${forecast[1].high}°${degreeType}`;

  return `${chalk.yellow(temperature)} and ${chalk.green(
    conditions
  )} (${chalk.blue(low)} → ${chalk.red(high)})`;
};

export default function Today({
  updateInterval = 900000,
  search = 'New York City, NY',
  degreeType = 'F',
  top,
  left,
  width,
  height,
}) {
  const boxProps = { top, left, width, height };
  const [fontIndex, setFontIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const options = useMemo(() => ({ search, degreeType }), [search, degreeType]);
  const weather = useRequest(findWeather, options, updateInterval);

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
    <Box label="Today" {...boxProps}>
      <text right={1}>{chalk.blue(date)}</text>
      <text top="center" left="center">
        {gradient.atlas.multiline(time)}
      </text>
      <text top="100%-3" left={1}>
        {weather.status === 'loading'
          ? 'Loading...'
          : weather.error
          ? `Error: ${weather.error}`
          : formatWeather(weather.data)}
      </text>
    </Box>
  );
}
