import React, { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { makeAuthenticatedRequest } from '../services/api';
Chart.register(...registerables);

const VOL_WEIGHTS = {
  neutral: 0,
  calm: 1,
  sad: 1,
  tired: 1,
  happy: 2,
  anxious: 2,
  frustrated: 2,
  energized: 3,
  overwhelmed: 3,
  angry: 3
};

function prepareVolatility(logs) {
  const daily = {};
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const key = date.toISOString().split('T')[0];
    const mood = log.mood_name;
    const w = VOL_WEIGHTS[mood] !== undefined ? VOL_WEIGHTS[mood] : 0;
    if (!daily[key]) daily[key] = [];
    daily[key].push(w);
  });

  const labels = Object.keys(daily).sort();
  const values = labels.map(k => {
    const arr = daily[k];
    if (!arr || arr.length === 0) return 0;
    const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
    const variance = arr.reduce((a,b)=>a + Math.pow(b-mean,2),0)/arr.length;
    const std = Math.sqrt(variance);
    return +std.toFixed(2);
  });
  return { labels, values };
}

export default function EmotionalVolatilityPage(){
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await makeAuthenticatedRequest('/mood/history', 'GET');
        const data = await res.json();
        if (res.ok) {
          setLogs(data);
          const prepared = prepareVolatility(data);
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (chartRef.current) chartRef.current.destroy();
            chartRef.current = new Chart(ctx, { type: 'bar', data: { labels: prepared.labels, datasets: [{ label: 'Volatility Score', data: prepared.values, backgroundColor: '#FF9800' }] }, options: { responsive: true, maintainAspectRatio: false } });
          }

          const avg = prepared.values.length ? (prepared.values.reduce((a,b)=>a+b,0)/prepared.values.length) : 0;
          setInsight({ avg: +avg.toFixed(2), max: Math.max(...prepared.values,0) });
        }
      } catch (e) {}
    };
    load();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  const advice = (v) => {
    if (v <= 0.5) return 'Stable day. Keep consistent routines.';
    if (v <= 1.5) return 'Mild variability — monitor stress triggers.';
    return 'High volatility — consider stress reduction strategies, seek support if persistent.';
  };

  return (
    <div className="glass-panel p-8">
      <button onClick={() => window.navigateToView && window.navigateToView('moodTrends')} className="mb-4 text-sm px-3 py-2 bg-gray-700 rounded">Back</button>
      <h2 className="text-2xl font-bold mb-4">Emotional Volatility</h2>
      <div style={{ height: 420 }} className="mb-6"><canvas ref={canvasRef} /></div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Summary</h3>
        {insight ? (
          <div>
            <p>Average volatility: <strong>{insight.avg}</strong></p>
            <p>Peak volatility: <strong>{insight.max}</strong></p>
            <p className="mt-2">Advice: {advice(insight.avg)}</p>
          </div>
        ) : (<p>Loading...</p>)}
      </div>

      <div>
        <h3 className="text-lg font-semibold">About this metric</h3>
        <p className="mt-2">Volatility measures how much the user's emotional state changes within a day. High volatility can indicate stress and poor emotional regulation.</p>
      </div>
    </div>
  );
}
