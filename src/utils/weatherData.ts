import * as ss from 'simple-statistics';

export interface WeatherRow {
  date: string;
  temperature: number; // °C
  humidity: number;    // %
  rainfall: number;    // mm
  windSpeed: number;   // km/h
  season: string;
  month: number;
  year: number;
}

export type Season = 'Winter' | 'Spring' | 'Summer' | 'Autumn';

const getSeason = (month: number): Season => {
  if (month === 11 || month === 0 || month === 1) return 'Winter'; // Dec, Jan, Feb
  if (month >= 2 && month <= 4) return 'Spring'; // Mar, Apr, May
  if (month >= 5 && month <= 7) return 'Summer'; // Jun, Jul, Aug
  return 'Autumn'; // Sep, Oct, Nov
};

export const generateWeatherData = (years: number = 5): WeatherRow[] => {
  const data: WeatherRow[] = [];
  const startDate = new Date(2020, 0, 1);
  const rows = years * 365 + Math.floor(years / 4); // basic leap year handling if needed, but 1825 is requested

  for (let i = 0; i < 1825; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dayOfYear = i % 365;
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const season = getSeason(month);

    // 1. Temperature: Seasonal sine wave + noise
    // Peak mid-summer (day ~200), min mid-winter (day ~20)
    const seasonalTemp = 15 + 12 * Math.sin((2 * Math.PI * (dayOfYear - 100)) / 365);
    const tempNoise = (Math.random() - 0.5) * 6;
    const temperature = Number((seasonalTemp + tempNoise).toFixed(1));

    // 2. Humidity: Correlated negatively with temp, with some seasonality
    // Higher in winter, lower in summer
    const baseHumidity = 65 - 15 * Math.sin((2 * Math.PI * (dayOfYear - 100)) / 365);
    const humidityNoise = (Math.random() - 0.5) * 20;
    const humidity = Math.min(100, Math.max(20, Number((baseHumidity + humidityNoise).toFixed(1))));

    // 3. Rainfall: Probabilistic based on humidity
    const rainProb = humidity / 150; // Higher humidity -> higher chance
    let rainfall = 0;
    if (Math.random() < rainProb) {
      rainfall = Number((Math.random() * (humidity / 5)).toFixed(1));
    }

    // 4. Wind Speed: Weibull-like distribution (random skewing)
    const baseWind = 12 + 4 * Math.sin((2 * Math.PI * (dayOfYear - 280)) / 365); // windier in autumn/spring
    const windSpeed = Number((baseWind + (Math.pow(Math.random(), 2) * 20)).toFixed(1));

    data.push({
      date: currentDate.toISOString().split('T')[0],
      temperature,
      humidity,
      rainfall,
      windSpeed,
      season,
      month,
      year
    });
  }

  return data;
};

export interface DescriptiveStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
  skewness: number;
  kurtosis: number;
}

export const calculateDescriptiveStats = (data: number[]): DescriptiveStats => {
  return {
    mean: Number(ss.mean(data).toFixed(2)),
    std: Number(ss.standardDeviation(data).toFixed(2)),
    min: Number(ss.min(data).toFixed(2)),
    max: Number(ss.max(data).toFixed(2)),
    median: Number(ss.median(data).toFixed(2)),
    skewness: Number(ss.sampleSkewness(data).toFixed(2)),
    kurtosis: Number(ss.sampleKurtosis(data).toFixed(2)),
  };
};

export const calculatePearson = (x: number[], y: number[]) => {
  const r = ss.sampleCorrelation(x, y);
  const n = x.length;
  // Approximation for t-score and p-value
  const t = Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r));
  // Very rough p-value approximation for large N (which 1825 is)
  // At N=1825, any R > 0.05 is usually p < 0.05
  let p = 1;
  if (t > 3.29) p = 0.001;
  else if (t > 2.58) p = 0.01;
  else if (t > 1.96) p = 0.05;
  else p = 0.5;

  let stars = '';
  if (p <= 0.001) stars = '***';
  else if (p <= 0.01) stars = '**';
  else if (p <= 0.05) stars = '*';

  return { r: Number(r.toFixed(3)), p, stars };
};

export const getCsvData = (data: WeatherRow[]): string => {
  const headers = ['date', 'temperature', 'humidity', 'rainfall', 'windSpeed'];
  const rows = data.map(r => [r.date, r.temperature, r.humidity, r.rainfall, r.windSpeed].join(','));
  return [headers.join(','), ...rows].join('\n');
};

export const movingAverage = (data: number[], window: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    result.push(ss.mean(subset));
  }
  return result;
};
