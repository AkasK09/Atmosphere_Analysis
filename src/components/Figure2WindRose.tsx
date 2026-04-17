import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { WeatherRow } from '../utils/weatherData';

interface Figure2Props {
  data: WeatherRow[];
}

export const Figure2WindRose: React.FC<Figure2Props> = ({ data }) => {
  // We'll bin wind speeds for each season
  const seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
  const bins = ['0-5', '5-10', '10-15', '15-20', '20-25', '25+'];
  
  const windDist = seasons.map(season => {
    const seasonData = data.filter(d => d.season === season);
    const count = seasonData.length;
    
    return {
      season,
      '0-5': (seasonData.filter(d => d.windSpeed <= 5).length / count) * 100,
      '5-10': (seasonData.filter(d => d.windSpeed > 5 && d.windSpeed <= 10).length / count) * 100,
      '10-15': (seasonData.filter(d => d.windSpeed > 10 && d.windSpeed <= 15).length / count) * 100,
      '15-20': (seasonData.filter(d => d.windSpeed > 15 && d.windSpeed <= 20).length / count) * 100,
      '20-25': (seasonData.filter(d => d.windSpeed > 20 && d.windSpeed <= 25).length / count) * 100,
      '25+': (seasonData.filter(d => d.windSpeed > 25).length / count) * 100,
    };
  });

  // Reformat for Radar Chart: each point is a bin, multiple lines for seasons
  const radarData = bins.map(bin => {
    const obj: any = { bin };
    windDist.forEach(d => {
      obj[d.season] = d[bin as keyof typeof d];
    });
    return obj;
  });

  return (
    <div className="p-6 bg-[#0d1117] rounded-xl border border-white/10 shadow-2xl h-[500px] flex flex-col mt-8">
      <div className="mb-6 border-b border-white/10 pb-2">
        <h2 className="text-2xl font-bold text-white tracking-tight italic uppercase">Figure 2: Wind Rose Distribution</h2>
        <p className="text-gray-400 text-sm">Polar analysis of seasonal wind speed intensity (frequency %)</p>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#30363d" />
            <PolarAngleAxis dataKey="bin" tick={{ fill: '#8b949e', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#8b949e', fontSize: 10 }} stroke="#30363d" />
            
            <Radar name="Winter" dataKey="Winter" stroke="#79c0ff" fill="#79c0ff" fillOpacity={0.1} strokeWidth={2} />
            <Radar name="Spring" dataKey="Spring" stroke="#aff5b4" fill="#aff5b4" fillOpacity={0.1} strokeWidth={2} />
            <Radar name="Summer" dataKey="Summer" stroke="#ffa657" fill="#ffa657" fillOpacity={0.1} strokeWidth={2} />
            <Radar name="Autumn" dataKey="Autumn" stroke="#ff7b72" fill="#ff7b72" fillOpacity={0.1} strokeWidth={2} />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', fontSize: '12px' }}
              itemStyle={{ fontSize: '11px' }}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
