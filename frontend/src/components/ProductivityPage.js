import React, { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { makeAuthenticatedRequest } from '../services/api';
import { prepareProductivityData } from './ProductivityChart';
Chart.register(...registerables);

export default function ProductivityPage() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await makeAuthenticatedRequest('/mood/history', 'GET');
        const data = await res.json();
        if (res.ok) {
          setLogs(data);
          const prepared = prepareProductivityData(data);

          // render chart
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (chartRef.current) chartRef.current.destroy();
            chartRef.current = new Chart(ctx, {
              type: 'line',
              data: { labels: prepared.labels, datasets: [{ label: 'Productivity & Focus Index', data: prepared.values, borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.12)', tension: 0.25, fill: true }] },
              options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: -5, max: 5, title: { display: true, text: 'Index (-5..+5)' } } } }
            });
          }

          // basic insights
          const vals = prepared.values;
          const avg = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
          const latest = vals.length ? vals[vals.length-1] : null;
          const prev = vals.length > 1 ? vals[vals.length-2] : null;
          const trend = (latest != null && prev != null) ? (latest - prev) : null;

          setInsights({ avg: +avg.toFixed(2), latest, trend });
        }
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  const adviceForScore = (s) => {
    if (s >= 2) return 'Great focus — keep this up. Maintain routines that support energy (sleep, breaks, and focused blocks).';
    if (s >= 0.5) return 'Moderate focus — you can boost productivity with short deep-work sessions and minimizing distractions.';
    if (s >= -1) return 'Low focus — prioritize rest, short walks, and reduce multitasking.';
    return 'Very low focus — consider a break, delegate tasks, or focus on recovery activities (sleep, mindfulness).';
  };

  return (
    <div className="glass-panel p-8">
      <button onClick={() => window.navigateToView && window.navigateToView('moodTrends')} className="mb-4 text-sm px-3 py-2 bg-gray-700 rounded">Back</button>
      <h2 className="text-2xl font-bold mb-4">Productivity & Focus Index</h2>
      <div style={{ height: 420 }} className="mb-6">
        <canvas ref={canvasRef} />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Summary</h3>
        {insights ? (
          <div>
            <p>Average index: <strong>{insights.avg}</strong></p>
            <p>Latest day: <strong>{insights.latest != null ? insights.latest : 'N/A'}</strong> {insights.trend != null ? (<span>({insights.trend >= 0 ? '+' : ''}{insights.trend.toFixed(2)} day-over-day)</span>) : null}</p>
            <p className="mt-2">Advice: {adviceForScore(insights.latest != null ? insights.latest : insights.avg)}</p>
          </div>
        ) : (<p>Loading insights...</p>)}
      </div>

      <div>
        <h3 className="text-lg font-semibold">What this score means</h3>
        <p className="mt-2">This index aggregates moods into a single productivity-oriented score. Positive values indicate days likely to have higher focus and output; negative values suggest days where attention and productivity were impaired.</p>
      </div>
    </div>
  );
}
