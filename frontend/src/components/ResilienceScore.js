import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import { makeAuthenticatedRequest } from '../services/api';

Chart.register(...registerables);

function prepareResilienceData(logs, windowSize = 7) {
  const daily = {};
  const mapping = {
    happy: { wellbeing: 9, energy: 8 }, energized: { wellbeing: 8, energy: 9 }, calm: { wellbeing: 8, energy: 4 }, neutral: { wellbeing: 5, energy: 5 }, frustrated: { wellbeing: 3, energy: 6 }, anxious: { wellbeing: 3, energy: 7 }, sad: { wellbeing: 2, energy: 3 }, overwhelmed: { wellbeing: 2, energy: 4 }, angry: { wellbeing: 1, energy: 8 }, tired: { wellbeing: 1, energy: 1 }
  };

  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const key = date.toISOString().split('T')[0];
    const mood = log.mood_name;
    const dims = mapping[mood] || mapping['neutral'];
    const score = dims.wellbeing; // 1..9
    if (!daily[key]) daily[key] = { sum: 0, count: 0 };
    daily[key].sum += score;
    daily[key].count += 1;
  });

  const labels = Object.keys(daily).sort();
  const raw = labels.map(k => daily[k].sum / daily[k].count);
  // rolling average
  const rolled = raw.map((_, i) => {
    const start = Math.max(0, i - (windowSize - 1));
    const slice = raw.slice(start, i + 1);
    const avg = slice.reduce((a,b)=>a+b,0)/slice.length;
    // map 1..9 to 0..100
    const pct = ((avg - 1) / (9 - 1)) * 100;
    return +pct.toFixed(1);
  });
  return { labels, values: rolled };
}

export default function ResilienceScore({ windowSize = 7 }) {
  const canvasRef = useRef(null);
  const expandedRef = useRef(null);
  const chartInstance = useRef(null);
  const expandedInstance = useRef(null);
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const wrapperRef = useRef(null);

  const openModal = () => {
    if (wrapperRef.current) setAnchorRect(wrapperRef.current.getBoundingClientRect());
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setAnchorRect(null); };

  const render = useCallback((canvas, instanceRef, labels, data) => {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (instanceRef.current) instanceRef.current.destroy();

    instanceRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Resilience (%)', data, borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.18)', tension: 0.25, fill: true, pointRadius: 3 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 100, title: { display: true, text: 'Resilience (%)', color: '#E0E0E0', font: { size: 14, weight: 'bold' } }, ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(136,136,136,0.2)' } },
          x: { type: 'category', title: { display: true, text: 'Date', color: '#E0E0E0', font: { size: 14, weight: 'bold' } }, ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(136,136,136,0.2)' } }
        },
        plugins: {
          tooltip: { callbacks: { label: (ctx) => `Resilience: ${ctx.raw}%` } },
          legend: { display: false }
        }
      }
    });

    return instanceRef.current;
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await makeAuthenticatedRequest('/mood/history', 'GET');
        const data = await res.json();
        if (res.ok) {
          setLogs(data);
          const prepared = prepareResilienceData(data, windowSize);
          render(canvasRef.current, chartInstance, prepared.labels, prepared.values);
        }
      } catch (e) {}
    };
    load();
    return () => { if (chartInstance.current) chartInstance.current.destroy(); if (expandedInstance.current) expandedInstance.current.destroy(); };
  }, [render, windowSize]);

  useEffect(() => {
    if (isModalOpen && expandedRef.current && logs.length) {
      const prepared = prepareResilienceData(logs, windowSize);
      render(expandedRef.current, expandedInstance, prepared.labels, prepared.values);
    }
  }, [isModalOpen, logs, render, windowSize]);

  return (
    <>
      <div className="chart-wrapper w-full overflow-x-auto p-4 mb-8 rounded-lg shadow-inner cursor-pointer panel-surface" onClick={() => setIsModalOpen(true)}>
        <h3 className="text-xl font-semibold text-[#F0F0F0] text-center mb-4">Resilience Score</h3>
        <div style={{ height: 220 }}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative glass-panel p-8 w-[96%] max-w-[1400px] h-[88%] max-h-[900px] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-5 text-4xl">&times;</button>
            <div className="flex-grow w-full h-full overflow-x-auto p-4">
              <canvas ref={expandedRef} id="resilienceExpanded" className="min-w-[1200px] h-full rounded-md p-4 panel-surface" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
