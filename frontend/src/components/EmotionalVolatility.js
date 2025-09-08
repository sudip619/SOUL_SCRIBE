import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import { makeAuthenticatedRequest } from '../services/api';

Chart.register(...registerables);

function prepareVolatilityData(logs) {
  const daily = {};
  const mapping = {
    happy: { wellbeing: 9, energy: 8 }, energized: { wellbeing: 8, energy: 9 }, calm: { wellbeing: 8, energy: 4 }, neutral: { wellbeing: 5, energy: 5 }, frustrated: { wellbeing: 3, energy: 6 }, anxious: { wellbeing: 3, energy: 7 }, sad: { wellbeing: 2, energy: 3 }, overwhelmed: { wellbeing: 2, energy: 4 }, angry: { wellbeing: 1, energy: 8 }, tired: { wellbeing: 1, energy: 1 }
  };

  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const key = date.toISOString().split('T')[0];
    const mood = log.mood_name;
    const dims = mapping[mood] || mapping['neutral'];
    const score = (dims.wellbeing + dims.energy) / 2;
    if (!daily[key]) daily[key] = [];
    daily[key].push(score);
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

export default function EmotionalVolatility() {
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
      type: 'bar',
      data: { labels, datasets: [{ label: 'Volatility', data, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '#4CAF50', borderColor: 'transparent' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Date', color: '#E0E0E0', font: { size: 14, weight: 'bold' } }, ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(136,136,136,0.2)' } },
          y: { title: { display: true, text: 'Volatility Score', color: '#E0E0E0', font: { size: 14, weight: 'bold' } }, ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(136,136,136,0.2)' } }
        },
        plugins: {
          tooltip: { callbacks: { label: (ctx) => `Volatility: ${ctx.raw}` } },
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
          const prepared = prepareVolatilityData(data);
          render(canvasRef.current, chartInstance, prepared.labels, prepared.values);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
      if (expandedInstance.current) expandedInstance.current.destroy();
    };
  }, [render]);

  useEffect(() => {
    if (isModalOpen && expandedRef.current && logs.length) {
      const prepared = prepareVolatilityData(logs);
      render(expandedRef.current, expandedInstance, prepared.labels, prepared.values);
    }
  }, [isModalOpen, logs, render]);

  return (
    <>
      <div ref={wrapperRef} className="chart-wrapper w-full overflow-x-auto p-4 mb-8 rounded-lg shadow-inner cursor-pointer panel-surface" onClick={openModal}>
        <h3 className="text-xl font-semibold text-[#F0F0F0] text-center mb-4">Emotional Volatility</h3>
        <div style={{ height: 220 }}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50" onClick={closeModal}>
          <div
            className="relative glass-panel p-8 w-[96%] max-w-[1600px] h-[88%] max-h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={anchorRect ? { position: 'fixed', left: Math.max(8, anchorRect.left) + 'px', top: Math.max(8, anchorRect.top) + 'px', transform: 'none' } : {}}
          >
            <button onClick={closeModal} className="absolute top-3 right-5 text-4xl">&times;</button>
            <div className="flex-grow w-full h-full overflow-x-auto p-4" id="volatilityModalContainer">
              <canvas ref={expandedRef} id="volatilityExpanded" className="min-w-[800px] h-full rounded-md p-4 panel-surface" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
