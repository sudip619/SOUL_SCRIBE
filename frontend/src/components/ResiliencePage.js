import React, { useEffect, useState, useRef } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { supabase } from '../supabaseClient';
import { prepareResilienceData } from './ResilienceScore';
Chart.register(...registerables);

export default function ResiliencePage(){
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [insight, setInsight] = useState(null);

  useEffect(()=>{
    const load = async () => {
      try{
        const { data, error } = await supabase.from('mood_logs').select('*').order('timestamp', { ascending: true });
        if (error) throw error;
        const logsData = data || [];
        setLogs(logsData);
        const prepared = prepareResilienceData(logsData);
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (chartRef.current) chartRef.current.destroy();
          chartRef.current = new Chart(ctx, { type: 'line', data: { labels: prepared.labels, datasets: [{ label: 'Resilience (%)', data: prepared.values, borderColor: '#2196F3', backgroundColor: 'rgba(33,150,243,0.12)', fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } } });
        }

        const vals = prepared.values;
        const avg = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length) : 100;
        setInsight({ avg: +avg.toFixed(1), latest: vals.length ? vals[vals.length-1] : null });
      } catch(e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load mood logs', e);
      }
    };
    load();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  },[]);

  const advice = (p) => {
    if (p >= 75) return 'Great resilience — continue using positive coping strategies and reflect on what works.';
    if (p >= 50) return 'Moderate resilience — try to reinforce recovery habits like short mindfulness and social support.';
    return 'Low resilience — consider professional support and practice recovery techniques (sleep, exercise, therapy).';
  };

  return (
    <div className="glass-panel p-8">
      <button onClick={() => window.navigateToView && window.navigateToView('moodTrends')} className="mb-4 text-sm px-3 py-2 bg-gray-700 rounded">Back</button>
      <h2 className="text-2xl font-bold mb-4">Resilience Score</h2>
      <div style={{ height: 420 }} className="mb-6"><canvas ref={canvasRef} /></div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Summary</h3>
        {insight ? (
          <div>
            <p>Average resilience: <strong>{insight.avg}%</strong></p>
            <p>Latest: <strong>{insight.latest != null ? insight.latest + '%' : 'N/A'}</strong></p>
            <p className="mt-2">Advice: {advice(insight.latest != null ? insight.latest : insight.avg)}</p>
          </div>
        ) : (<p>Loading...</p>)}
      </div>

      <div>
        <h3 className="text-lg font-semibold">About this metric</h3>
        <p className="mt-2">The Resilience Score measures how often negative moods are followed by neutral or positive moods within a short window — indicating recovery and coping.</p>
      </div>
    </div>
  );
}
