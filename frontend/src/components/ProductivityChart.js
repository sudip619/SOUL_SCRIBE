import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import { makeAuthenticatedRequest } from '../services/api';

Chart.register(...registerables);

function prepareProductivityData(logs) {
  const daily = {};
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const key = date.toISOString().split('T')[0];
    const mood = log.mood_name;
    // Use existing mapping if present in moodDimensions in MoodTrendsView; fallback to neutral mapping
    const mapping = {
      happy: { wellbeing: 9, energy: 8 }, energized: { wellbeing: 8, energy: 9 }, calm: { wellbeing: 8, energy: 4 }, neutral: { wellbeing: 5, energy: 5 }, frustrated: { wellbeing: 3, energy: 6 }, anxious: { wellbeing: 3, energy: 7 }, sad: { wellbeing: 2, energy: 3 }, overwhelmed: { wellbeing: 2, energy: 4 }, angry: { wellbeing: 1, energy: 8 }, tired: { wellbeing: 1, energy: 1 }
    };
    const dims = mapping[mood] || mapping['neutral'];
    const prod = (dims.wellbeing + dims.energy) / 2; // scale 1..9
    if (!daily[key]) daily[key] = { sum: 0, count: 0 };
    daily[key].sum += prod;
    daily[key].count += 1;
  });

  const labels = Object.keys(daily).sort();
  const values = labels.map(k => {
    const avg = daily[k].sum / daily[k].count; // 1..9
    // Map to -5..+5 where 5 maps to 0: index = avg - 5
    return +(avg - 5).toFixed(2);
  });
  return { labels, values };
}

export default function ProductivityChart() {
  const canvasRef = useRef(null);
  const expandedRef = useRef(null);
  const chartInstance = useRef(null);
  const expandedInstance = useRef(null);
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const wrapperRef = useRef(null);

  const openModal = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setAnchorRect(rect);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAnchorRect(null);
  };

  const render = useCallback((canvas, instanceRef, labels, data) => {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (instanceRef.current) instanceRef.current.destroy();

    const min = Math.min(...data, -5);
    const max = Math.max(...data, 5);

    instanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Productivity & Focus Index',
          data,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76,175,80,0.1)',
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: -5,
            max: 5,
            title: { display: true, text: 'Index Score', color: '#E0E0E0', font: { size: 14, weight: 'bold' } },
            ticks: { color: '#E0E0E0' },
            grid: { color: 'rgba(136,136,136,0.2)' }
          },
          x: {
            type: 'category',
            title: { display: true, text: 'Date', color: '#E0E0E0', font: { size: 14, weight: 'bold' } },
            ticks: { color: '#E0E0E0' },
            grid: { color: 'rgba(136,136,136,0.2)' }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `Focus Index: ${ctx.raw >= 0 ? '+' : ''}${ctx.raw.toFixed(2)}`
            }
          },
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
          const prepared = prepareProductivityData(data);
          render(canvasRef.current, chartInstance, prepared.labels, prepared.values);
        }
      } catch (e) {
        // ignore here
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
      const prepared = prepareProductivityData(logs);
      render(expandedRef.current, expandedInstance, prepared.labels, prepared.values);
    }
  }, [isModalOpen, logs, render]);

  return (
    <>
      <div className="chart-wrapper w-full overflow-x-auto p-4 mb-8 rounded-lg shadow-inner cursor-pointer panel-surface" onClick={() => setIsModalOpen(true)}>
        <h3 className="text-xl font-semibold text-[#F0F0F0] text-center mb-4">Productivity & Focus Index</h3>
        <div style={{ height: 220 }}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative glass-panel p-8 w-[96%] max-w-[1400px] h-[88%] max-h-[900px] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-5 text-4xl">&times;</button>
            <div className="flex-grow w-full h-full overflow-x-auto p-4">
              <canvas ref={expandedRef} id="productivityExpanded" className="min-w-[1200px] h-full rounded-md p-4 panel-surface" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
