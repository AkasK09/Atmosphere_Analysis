import React, { useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, 
  Cell, Legend, ComposedChart
} from 'recharts';
import * as ss from 'simple-statistics';
import { WeatherRow, Season } from '../utils/weatherData';

interface Figure1Props {
  data: WeatherRow[];
  monthlyAverages: any[];
  seasonalStats: any;
  correlationMatrix: any;
}

export const Figure1Dashboard: React.FC<Figure1Props> = ({ 
  data, 
  monthlyAverages, 
  seasonalStats,
  correlationMatrix 
}) => {
  // Regression line calculation
  const regressionLine = useMemo(() => {
    const points = data.slice(0, 500).map(d => [d.temperature, d.humidity]);
    const l = ss.linearRegression(points);
    const lineFunc = ss.linearRegressionLine(l);
    const minX = Math.min(...points.map(p => p[0]));
    const maxX = Math.max(...points.map(p => p[0]));
    return [
      { temperature: minX, humidity: lineFunc(minX) },
      { temperature: maxX, humidity: lineFunc(maxX) }
    ];
  }, [data]);
  // 1. Monthly Averages (4-panel time series)
  // 2. Correlation Heatmap
  // 3. Seasonal Boxplot (Simplified as Bar with error bars or just mean/std)
  // 4. Monthly Rainfall
  // 5. Scatter with regression

  // Heatmap rendering
  const variables = ['Temp', 'Humid', 'Rain', 'Wind'];
  const heatmapData = variables.flatMap((v1, i) => 
    variables.map((v2, j) => ({
      x: v1,
      y: v2,
      value: correlationMatrix[v1][v2].r
    }))
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-[#0d1117] rounded-xl border border-white/10 shadow-2xl">
      <div className="col-span-full mb-4 border-b border-white/10 pb-2">
        <h2 className="text-2xl font-bold text-white tracking-tight italic">Figure 1: Atmospheric Dashboard</h2>
        <p className="text-gray-400 text-sm">Comprehensive multi-variable climatic overview</p>
      </div>

      {/* 1. Monthly Temperature & Humidity Averages */}
      <div className="bg-[#161b22] p-4 rounded-lg border border-white/5 h-[300px]">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Monthly Temp & Humidity</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={monthlyAverages}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis dataKey="month" stroke="#8b949e" fontSize={10} tickFormatter={(v) => ['J','F','M','A','M','J','J','A','S','O','N','D'][v]} />
            <YAxis yAxisId="left" stroke="#8b949e" fontSize={10} domain={['auto', 'auto']} />
            <YAxis yAxisId="right" orientation="right" stroke="#8b949e" fontSize={10} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', fontSize: '12px' }}
              itemStyle={{ color: '#c9d1d9' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="avgTemp" stroke="#ff7b72" strokeWidth={2} dot={false} name="Temp (°C)" />
            <Line yAxisId="right" type="monotone" dataKey="avgHumid" stroke="#79c0ff" strokeWidth={2} dot={false} name="Humidity (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Monthly Rainfall & Wind */}
      <div className="bg-[#161b22] p-4 rounded-lg border border-white/5 h-[300px]">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Monthly Rain & Wind</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={monthlyAverages}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis dataKey="month" stroke="#8b949e" fontSize={10} tickFormatter={(v) => ['J','F','M','A','M','J','J','A','S','O','N','D'][v]} />
            <YAxis yAxisId="left" stroke="#8b949e" fontSize={10} />
            <YAxis yAxisId="right" orientation="right" stroke="#8b949e" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', fontSize: '12px' }}
              itemStyle={{ color: '#c9d1d9' }}
            />
            <Bar yAxisId="left" dataKey="totalRain" fill="#3fb950" name="Rain (mm)" radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" type="step" dataKey="avgWind" stroke="#d2a8ff" strokeWidth={2} dot={false} name="Wind (km/h)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Correlation Heatmap */}
      <div className="bg-[#161b22] p-4 rounded-lg border border-white/5 h-[300px] flex flex-col">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Correlation (Pearson r)</h3>
        <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-1">
          {heatmapData.map((d, i) => {
            const opacity = Math.abs(d.value);
            const color = d.value > 0 ? `rgba(255, 123, 114, ${opacity})` : `rgba(121, 192, 255, ${opacity})`;
            return (
              <div 
                key={i} 
                className="flex items-center justify-center text-[10px] font-mono text-white/80 rounded"
                style={{ backgroundColor: color, border: '1px solid rgba(255,255,255,0.05)' }}
                title={`${d.x} vs ${d.y}: ${d.value}`}
              >
                {d.value.toFixed(2)}
              </div>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1 text-[8px] uppercase tracking-tighter text-gray-500 text-center">
            {variables.map(v => <div key={v}>{v}</div>)}
        </div>
      </div>

      {/* 4. Seasonal Temperature Distribution (Boxplot substitute) */}
      <div className="bg-[#161b22] p-4 rounded-lg border border-white/5 h-[300px]">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Seasonal Temperature Range</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={Object.entries(seasonalStats).map(([k, v]: [string, any]) => ({ name: k, mean: v.temperature.mean, min: v.temperature.min, max: v.temperature.max }))}>
            <XAxis dataKey="name" stroke="#8b949e" fontSize={10} />
            <YAxis stroke="#8b949e" fontSize={10} unit="°C" />
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', fontSize: '10px' }} />
            <Bar dataKey="mean" fill="#f27d26" radius={[4, 4, 0, 0]}>
              {Object.entries(seasonalStats).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#79c0ff', '#aff5b4', '#ffa657', '#ff7b72'][index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Temp vs Humidity Scatter */}
      <div className="bg-[#161b22] p-4 rounded-lg border border-white/5 h-[300px] col-span-1 md:col-span-2">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Temp vs Humidity + Regression</h3>
        <ResponsiveContainer width="100%" height="85%">
          <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis type="number" dataKey="temperature" name="Temp" unit="°C" stroke="#8b949e" fontSize={10} />
            <YAxis type="number" dataKey="humidity" name="Humid" unit="%" stroke="#8b949e" fontSize={10} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', fontSize: '10px' }} />
            <Scatter name="Days" data={data.slice(0, 500)} fill="#ff7b72" opacity={0.3} />
            <Line data={regressionLine} dataKey="humidity" stroke="#ffa657" strokeWidth={2} dot={false} name="Regression" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
