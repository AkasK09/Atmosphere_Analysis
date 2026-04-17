import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Brush
} from 'recharts';
import { WeatherRow, movingAverage } from '../utils/weatherData';

interface Figure3Props {
  data: WeatherRow[];
}

export const Figure3Trend: React.FC<Figure3Props> = ({ data }) => {
  const temps = data.map(d => d.temperature);
  const sma30 = movingAverage(temps, 30);
  const sma365 = movingAverage(temps, 365);

  const trendData = data.map((d, i) => ({
    date: d.date,
    temp: d.temperature,
    sma30: Number(sma30[i].toFixed(1)),
    sma365: Number(sma365[i].toFixed(1)),
  }));

  return (
    <div className="p-6 bg-[#0d1117] rounded-xl border border-white/10 shadow-2xl h-[500px] flex flex-col mt-8">
      <div className="mb-6 border-b border-white/10 pb-2">
        <h2 className="text-2xl font-bold text-white tracking-tight italic uppercase">Figure 3: Temperature Trend Analysis</h2>
        <p className="text-gray-400 text-sm">Long-term variations with 30-day and 365-day simple moving averages (SMA)</p>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              stroke="#8b949e" 
              fontSize={10} 
              tickFormatter={(v) => v.split('-')[0]} 
              interval={364}
            />
            <YAxis stroke="#8b949e" fontSize={10} unit="°C" domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', fontSize: '10px' }}
              labelStyle={{ color: '#8b949e' }}
            />
            <Legend verticalAlign="top" height={36} />
            
            <Line 
              type="monotone" 
              dataKey="temp" 
              stroke="#444c56" 
              strokeWidth={1} 
              dot={false} 
              name="Daily Temp" 
              opacity={0.4}
            />
            <Line 
              type="monotone" 
              dataKey="sma30" 
              stroke="#ff7b72" 
              strokeWidth={2} 
              dot={false} 
              name="30-day SMA" 
            />
            <Line 
              type="monotone" 
              dataKey="sma365" 
              stroke="#79c0ff" 
              strokeWidth={3} 
              dot={false} 
              name="365-day SMA"
            />
            
            <Brush dataKey="date" height={30} stroke="#30363d" fill="#161b22" tickFormatter={() => ''} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
