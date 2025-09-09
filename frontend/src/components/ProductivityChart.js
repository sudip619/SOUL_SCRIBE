// frontend/src/components/ProductivityChart.js
import React, { useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// This data preparation function can stay here as it's specific to this chart
export function prepareProductivityData(logs) {
  const daily = {};
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const key = date.toISOString().split('T')[0];
    const mood = log.mood_name;
    const mapping = {
      happy: { wellbeing: 9, energy: 8 }, energized: { wellbeing: 8, energy: 9 }, calm: { wellbeing: 8, energy: 4 }, neutral: { wellbeing: 5, energy: 5 }, frustrated: { wellbeing: 3, energy: 6 }, anxious: { wellbeing: 3, energy: 7 }, sad: { wellbeing: 2, energy: 3 }, overwhelmed: { wellbeing: 2, energy: 4 }, angry: { wellbeing: 1, energy: 8 }, tired: { wellbeing: 1, energy: 1 }
    };
    const dims = mapping[mood] || mapping['neutral'];
    const prod = (dims.wellbeing + dims.energy) / 2;
    if (!daily[key]) daily[key] = { sum: 0, count: 0 };
    daily[key].sum += prod;
    daily[key].count += 1;
  });

  const labels = Object.keys(daily).sort();
  const values = labels.map(k => (daily[k].sum / daily[k].count - 5)); // Center around 0
  return { labels, values };
}

// The component now accepts 'logs' as a prop
export default function ProductivityChart({ logs, onOpenGraph }) {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);
  const wrapperRef = useRef(null);

  const render = useCallback((canvasElement, instanceRef, labels, values) => {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext('2d');
    if (instanceRef.current) {
      instanceRef.current.destroy();
    }
    instanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{ label: 'Productivity & Focus Index', data: values, borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.12)', tension: 0.25, fill: true }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { min: -5, max: 5, title: { display: true, text: 'Focus Index', color: '#E0E0E0', font: { size: 14, weight: 'bold' } }, ticks: { color: '#E0E0E0' }, grid: { color: 'rgba(136,136,136,0.2)' } },
          x: { type: 'category', title: { display: false }, ticks: { display: false }, grid: { color: 'rgba(136,136,136,0.2)' } }
        },
        plugins: {
          tooltip: { callbacks: { label: (ctx) => `Focus Index: ${ctx.raw >= 0 ? '+' : ''}${ctx.raw.toFixed(2)}` } },
          legend: { display: false }
        }
      }
    });
    return instanceRef.current;
  }, []);

  // useEffect now runs when the 'logs' prop changes, instead of fetching its own data
  useEffect(() => {
    if (logs && logs.length > 0) {
        const prepared = prepareProductivityData(logs);
        render(canvasRef.current, chartInstance, prepared.labels, prepared.values);
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [logs, render]);

  const inst = chartInstance.current;

  return (
    <>
      <div ref={wrapperRef} className="chart-wrapper w-full overflow-x-auto p-4 mb-8 rounded-lg shadow-inner cursor-pointer panel-surface flex justify-start items-center" onClick={() => onOpenGraph('productivity')}>
        <h3 className="text-lg font-semibold mb-2">Productivity & Focus Index</h3>
        <div className="h-40 w-full flex items-center justify-start">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
    </>
  );
}
