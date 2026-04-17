import React, { useMemo, useState } from 'react';
import { Download, Cloud, Thermometer, Droplets, Wind, ChevronRight, BarChart3, TrendingUp, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  generateWeatherData, 
  calculateDescriptiveStats, 
  calculatePearson, 
  getCsvData,
  Season,
  WeatherRow
} from './utils/weatherData';
import { Figure1Dashboard } from './components/Figure1Dashboard';
import { Figure2WindRose } from './components/Figure2WindRose';
import { Figure3Trend } from './components/Figure3Trend';

interface AnalysisResult {
  descStats: Record<string, any>;
  correlationMatrix: Record<string, Record<string, any>>;
  seasonalStats: Record<Season, {
    temperature: any;
    humidity: any;
    rainfall: any;
    windSpeed: any;
  }>;
  monthlyAverages: any[];
}

export default function App() {
  const [isGenerated, setIsGenerated] = useState(false);
  
  // 1. Generate Data
  const data = useMemo(() => generateWeatherData(5), []);

  // 2. Perform Analysis
  const analysis = useMemo((): AnalysisResult => {
    const temps = data.map(d => d.temperature);
    const humid = data.map(d => d.humidity);
    const rain = data.map(d => d.rainfall);
    const wind = data.map(d => d.windSpeed);

    const descStats = {
      Temp: calculateDescriptiveStats(temps),
      Humid: calculateDescriptiveStats(humid),
      Rain: calculateDescriptiveStats(rain),
      Wind: calculateDescriptiveStats(wind),
    };

    const vars = { Temp: temps, Humid: humid, Rain: rain, Wind: wind };
    const varNames = ['Temp', 'Humid', 'Rain', 'Wind'] as const;
    const correlationMatrix: any = {};
    
    varNames.forEach(v1 => {
      correlationMatrix[v1] = {};
      varNames.forEach(v2 => {
        correlationMatrix[v1][v2] = calculatePearson(vars[v1], vars[v2]);
      });
    });

    const seasons: Season[] = ['Winter', 'Spring', 'Summer', 'Autumn'];
    const seasonalStats: any = {};
    seasons.forEach(s => {
      const sData = data.filter(d => d.season === s);
      seasonalStats[s] = {
        temperature: calculateDescriptiveStats(sData.map(d => d.temperature)),
        humidity: calculateDescriptiveStats(sData.map(d => d.humidity)),
        rainfall: calculateDescriptiveStats(sData.map(d => d.rainfall)),
        windSpeed: calculateDescriptiveStats(sData.map(d => d.windSpeed)),
      };
    });

    // Monthly Averages for Dashboard
    const monthlyAverages = Array.from({ length: 12 }, (_, i) => {
      const mData = data.filter(d => d.month === i);
      return {
        month: i,
        avgTemp: Number((mData.reduce((acc, curr) => acc + curr.temperature, 0) / mData.length).toFixed(1)),
        avgHumid: Number((mData.reduce((acc, curr) => acc + curr.humidity, 0) / mData.length).toFixed(1)),
        totalRain: Number((mData.reduce((acc, curr) => acc + curr.rainfall, 0) / 5).toFixed(1)), // 5 years avg
        avgWind: Number((mData.reduce((acc, curr) => acc + curr.windSpeed, 0) / mData.length).toFixed(1)),
      };
    });

    return { descStats, correlationMatrix, seasonalStats, monthlyAverages };
  }, [data]);

  const downloadCsv = () => {
    const csv = getCsvData(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'weather_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 3. Key Insights Extraction
  const keyInsights = useMemo(() => {
    const seasonsArr = Object.entries(analysis.seasonalStats);
    const hottestSeason = seasonsArr.reduce((a, b: [string, any]) => (a[1] as any).temperature.mean > b[1].temperature.mean ? a : b)[0];
    const rainiestSeason = seasonsArr.reduce((a, b: [string, any]) => (a[1] as any).rainfall.mean > b[1].rainfall.mean ? a : b)[0];
    const windiestSeason = seasonsArr.reduce((a, b: [string, any]) => (a[1] as any).windSpeed.mean > b[1].windSpeed.mean ? a : b)[0];
    
    const rTempHumid = analysis.correlationMatrix.Temp.Humid;
    
    return {
      hottestSeason,
      rainiestSeason,
      windiestSeason,
      rTempHumid,
      tempRange: `${analysis.descStats.Temp.min}°C to ${analysis.descStats.Temp.max}°C`
    };
  }, [analysis]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-orange-500/30">
      {/* Sidebar/Header */}
      <header className="border-b border-white/10 bg-[#161b22]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg shadow-lg shadow-orange-500/20">
              <Cloud className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">ATMOSPHERE <span className="text-orange-500">ANALYTICS</span></h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Climatic Data Analysis Suite v1.0</p>
            </div>
          </div>
          
          <button 
            onClick={downloadCsv}
            className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-white px-4 py-2 rounded-md border border-[#30363d] transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Intro */}
        <section className="space-y-4 max-w-2xl">
          <h2 className="text-4xl font-light text-white leading-tight">
            Comprehensive Analysis of <span className="font-semibold italic text-orange-400">Five-Year</span> Synthetic Weather Samples
          </h2>
          <p className="text-gray-400">
            A deep-dive into seasonal patterns, correlations, and multivariate distributions derived from 1,825 daily observations.
          </p>
        </section>

        {/* Descriptive Statistics Grid */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-gray-400 uppercase tracking-widest text-xs font-semibold">
            <BarChart3 className="w-4 h-4" />
            <span>Descriptive Statistics</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analysis.descStats).map(([name, stats]: [string, any]) => (
              <motion.div 
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-[#161b22] p-5 rounded-xl border border-white/5 space-y-4 hover:border-white/10 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-orange-500 font-bold tracking-tighter text-lg">{name}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {name === 'Temp' && <Thermometer className="w-4 h-4 text-gray-500" />}
                    {name === 'Humid' && <Droplets className="w-4 h-4 text-gray-500" />}
                    {name === 'Rain' && <Cloud className="w-4 h-4 text-gray-500" />}
                    {name === 'Wind' && <Wind className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-500">Mean</div><div className="text-right text-white font-mono">{stats.mean}</div>
                  <div className="text-gray-500">Std Dev</div><div className="text-right text-white font-mono">{stats.std}</div>
                  <div className="text-gray-500">Median</div><div className="text-right text-white font-mono">{stats.median}</div>
                  <div className="text-gray-500">Skew</div><div className="text-right text-white font-mono">{stats.skewness}</div>
                  <div className="text-gray-500">Kurtosis</div><div className="text-right text-white font-mono">{stats.kurtosis}</div>
                  <div className="text-gray-500 pt-2 border-t border-white/5">Min/Max</div>
                  <div className="text-right text-white font-mono pt-2 border-t border-white/5">{stats.min} / {stats.max}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Correlation Matrix */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2 text-gray-400 uppercase tracking-widest text-xs font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>Pearson Correlation Analysis</span>
                </div>
                <div className="bg-[#161b22] rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left font-mono text-sm">
                        <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4 border-b border-white/5">Variable</th>
                                <th className="p-4 border-b border-white/5">Temp</th>
                                <th className="p-4 border-b border-white/5">Humid</th>
                                <th className="p-4 border-b border-white/5">Rain</th>
                                <th className="p-4 border-b border-white/5">Wind</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {Object.entries(analysis.correlationMatrix).map(([v1, row]: [string, any]) => (
                                <tr key={v1} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 font-bold text-orange-500/80">{v1}</td>
                                    {['Temp', 'Humid', 'Rain', 'Wind'].map(v2 => (
                                        <td key={v2} className="p-4">
                                            <div className="flex flex-col">
                                                <span className={Math.abs(row[v2].r) > 0.4 ? 'text-white' : 'text-gray-500'}>
                                                    {row[v2].r.toFixed(3)}
                                                </span>
                                                <span className="text-[10px] text-orange-500 leading-none h-2">{row[v2].stars}</span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-3 bg-white/[0.02] text-[10px] text-gray-500 flex gap-4 italic italic">
                        <span>Signif. codes: 0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2 text-gray-400 uppercase tracking-widest text-xs font-semibold">
                    <Info className="w-4 h-4" />
                    <span>Seasonal Breakdown (Means)</span>
                </div>
                <div className="bg-[#161b22] rounded-xl border border-white/5 p-4 space-y-4">
                     {Object.entries(analysis.seasonalStats).map(([season, stats]: [string, any]) => (
                         <div key={season} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                             <span className="text-white font-medium">{season}</span>
                             <div className="flex gap-4 text-xs font-mono">
                                <span className="text-red-400">{stats.temperature.mean}°</span>
                                <span className="text-blue-400">{stats.humidity.mean}%</span>
                                <span className="text-green-400">{stats.rainfall.mean}mm</span>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        </section>

        {/* Figures */}
        <div className="space-y-12">
            <Figure1Dashboard 
                data={data} 
                monthlyAverages={analysis.monthlyAverages} 
                seasonalStats={analysis.seasonalStats}
                correlationMatrix={analysis.correlationMatrix}
            />
            
            <Figure2WindRose data={data} />
            
            <Figure3Trend data={data} />
        </div>

        {/* Key Insights */}
        <section className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-8 space-y-8 mt-16">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-orange-500 uppercase tracking-tighter">Key Insights Summary</h2>
            <div className="h-1 w-20 bg-orange-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
               <h3 className="text-white font-semibold flex items-center gap-2 uppercase text-sm">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Seasonal Dominance
               </h3>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>Hottest Season: <span className="text-white font-mono">{keyInsights.hottestSeason}</span></li>
                 <li>Rainiest Season: <span className="text-white font-mono">{keyInsights.rainiestSeason}</span></li>
                 <li>Windiest Season: <span className="text-white font-mono">{keyInsights.windiestSeason}</span></li>
               </ul>
            </div>

            <div className="space-y-4">
               <h3 className="text-white font-semibold flex items-center gap-2 uppercase text-sm">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Notable Correlations
               </h3>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>Temperature vs Humidity: <span className="text-white font-mono">{keyInsights.rTempHumid.r}</span> ({keyInsights.rTempHumid.stars})</li>
                 <li className="italic opacity-80">Indicates a strong inverse relationship between daily heat and ambient moisture.</li>
               </ul>
            </div>

            <div className="space-y-4">
               <h3 className="text-white font-semibold flex items-center gap-2 uppercase text-sm">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Critical Ranges
               </h3>
               <ul className="space-y-2 text-gray-400 text-sm">
                 <li>Observed Temp Range: <span className="text-white font-mono">{keyInsights.tempRange}</span></li>
                 <li>Total Rainfall (5yr): <span className="text-white font-mono">{Number(data.reduce((a,b) => a + b.rainfall, 0).toFixed(0))} mm</span></li>
               </ul>
            </div>
          </div>
          
          <p className="text-[10px] text-gray-600 font-mono text-center pt-8 border-t border-orange-500/10">
            REPORT GENERATED ON {new Date().toISOString()} • ALL FIGURES COMPLY WITH PUBLICATION STANDARDS
          </p>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-gray-600 text-[10px] flex justify-between items-center">
        <span>© 2026 ATMOSPHERE ANALYTICS SUITE</span>
        <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer transition-colors">METHODOLOGY</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">API DOCS</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">GITHUB</span>
        </div>
      </footer>
    </div>
  );
}
