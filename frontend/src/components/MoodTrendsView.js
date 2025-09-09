// frontend/src/components/MoodTrendsView.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import { supabase } from '../supabaseClient';
import ProductivityChart from './ProductivityChart';
import ResilienceScore from './ResilienceScore';
import EmotionalVolatility from './EmotionalVolatility';
Chart.register(...registerables);


const moodDimensions = {
  'happy': { wellbeing: 9, energy: 8, color: '#4CAF50' },
  'energized': { wellbeing: 8, energy: 9, color: '#00BCD4' },
  'calm': { wellbeing: 8, energy: 4, color: '#8BC34A' },
  'neutral': { wellbeing: 5, energy: 5, color: '#607D8B' },
  'frustrated': { wellbeing: 3, energy: 6, color: '#FFC107' },
  'anxious': { wellbeing: 3, energy: 7, color: '#FF5722' },
  'sad': { wellbeing: 2, energy: 3, color: '#673AB7' },
  'overwhelmed': { wellbeing: 2, energy: 4, color: '#795548' },
  'angry': { wellbeing: 1, energy: 8, color: '#F44336' },
  'tired': { wellbeing: 1, energy: 1, color: '#9E9E9E' }
};

const prepareChartData = (logs) => {
  const labels = [];
  const wellbeingDataPoints = [];
  const energyDataPoints = [];
  const dailyAggregates = {};
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const dateKey = date.toISOString().split('T')[0];
    const mood = log.mood_name;
    const dimensions = moodDimensions[mood] || moodDimensions['neutral'];
    if (!dailyAggregates[dateKey]) {
      dailyAggregates[dateKey] = { sumWellbeing: 0, sumEnergy: 0, count: 0 };
    }
    dailyAggregates[dateKey].sumWellbeing += dimensions.wellbeing;
    dailyAggregates[dateKey].sumEnergy += dimensions.energy;
    dailyAggregates[dateKey].count += 1;
  });
  const sortedDates = Object.keys(dailyAggregates).sort();
  sortedDates.forEach(dateKey => {
    const dailyData = dailyAggregates[dateKey];
    labels.push(dateKey);
    wellbeingDataPoints.push(dailyData.sumWellbeing / dailyData.count);
    energyDataPoints.push(dailyData.sumEnergy / dailyData.count);
  });
  return { labels, wellbeingDataPoints, energyDataPoints };
};

const prepareStackedBarData = (logs) => {
  const labels = [];
  const dailyMoodCounts = {};
  const allMoodNames = Object.keys(moodDimensions);
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const dateKey = date.toISOString().split('T')[0];
    const mood = log.mood_name;
    if (!dailyMoodCounts[dateKey]) {
      dailyMoodCounts[dateKey] = {};
      allMoodNames.forEach(m => dailyMoodCounts[dateKey][m] = 0);
    }
    dailyMoodCounts[dateKey][mood] = (dailyMoodCounts[dateKey][mood] || 0) + 1;
  });
  const sortedDates = Object.keys(dailyMoodCounts).sort();
  sortedDates.forEach(dateKey => labels.push(dateKey));
  const datasets = allMoodNames.map(moodName => {
    return {
      label: moodName.charAt(0).toUpperCase() + moodName.slice(1),
      data: sortedDates.map(dateKey => dailyMoodCounts[dateKey][moodName] || 0),
      backgroundColor: moodDimensions[moodName].color,
    };
  });
  return { labels, datasets };
};


function MoodTrendsView({ showAlert, onOpenGraph }) {
  const [moodLogs, setMoodLogs] = useState([]);
  const chartRef = useRef(null);
  const stackedBarChartRef = useRef(null);
  const myMoodChartInstance = useRef(null);
  const myStackedBarChartInstance = useRef(null);

  const renderChart = useCallback((canvasElement, chartRefObject, labels, wellbeingDataPoints, energyDataPoints) => {
    if (!canvasElement) return null;
    const ctx = canvasElement.getContext('2d');
    if (chartRefObject.current) {
      chartRefObject.current.destroy();
    }
    const allDataPoints = [...wellbeingDataPoints, ...energyDataPoints];
    const minDataValue = allDataPoints.length > 0 ? Math.min(...allDataPoints) : 0;
    const maxDataValue = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 10;
    const yAxisMinAdjusted = Math.max(0, minDataValue - (minDataValue > 0 ? 0.3 : 0));
    const yAxisMaxAdjusted = Math.min(10, maxDataValue + (maxDataValue < 10 ? 0.3 : 0));
    const newChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Wellbeing Score',
            data: wellbeingDataPoints,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            tension: 0.3,
            fill: false,
            pointBackgroundColor: '#4CAF50',
            pointBorderColor: '#fff',
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#4CAF50',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointRadius: 5,
            pointHitRadius: 10,
          },
          {
            label: 'Energy Level',
            data: energyDataPoints,
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            tension: 0.3,
            fill: false,
            pointBackgroundColor: '#2196F3',
            pointBorderColor: '#fff',
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#2196F3',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointRadius: 5,
            pointHitRadius: 10,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { left: 20, right: 20, top: 10, bottom: 10 } },
        scales: {
          y: {
            beginAtZero: false,
            min: yAxisMinAdjusted,
            max: yAxisMaxAdjusted,
            title: { display: true, text: 'Score (0-10)', color: '#E0E0E0', font: { size: 16, weight: 'bold' } },
            ticks: {
              stepSize: 0.5,
              color: '#E0E0E0',
              padding: 10,
              callback: function (value) {
                if (value === 0) return 'Very Low';
                if (value === 5) return 'Neutral';
                if (value === 10) return 'Very High';
                if (value < 0 || value > 10) return '';
                if (Number.isInteger(value) || (value * 2) % 1 === 0) return value;
                return '';
              }
            },
            grid: { color: 'rgba(136,136,136,0.2)', drawBorder: false }
          },
          x: {
            type: 'category',
            title: { display: true, text: 'Date', color: '#E0E0E0', font: { size: 16, weight: 'bold' } },
            ticks: {
              color: '#E0E0E0',
              autoSkip: true,
              maxRotation: 45,
              minRotation: 0,
              callback: function (val, index) {
                const dateStr = labels[index];
                if (!dateStr) return '';
                if (labels.length <= 5) return dateStr;
                const date = new Date(dateStr);
                if (index % 2 === 0) return `${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
                return '';
              }
            },
            grid: { color: 'rgba(136,136,136,0.2)', drawBorder: false }
          }
        },
        plugins: {
          legend: { display: true, position: 'top', align: 'center', labels: { color: '#F0F0F0', padding: 20 } },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                return label + context.raw.toFixed(1);
              }
            }
          }
        }
      }
    });
    return newChartInstance;
  }, []);

  const renderStackedBarChart = useCallback((canvasElement, chartRefObject, labels, datasets) => {
    if (!canvasElement) return null;
    const ctx = canvasElement.getContext('2d');
    if (chartRefObject.current) {
      chartRefObject.current.destroy();
    }
    const newChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: datasets, },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { left: 20, right: 20, top: 10, bottom: 10 } },
        scales: {
          x: {
            stacked: true,
            title: { display: true, text: 'Date', color: '#E0E0E0', font: { size: 16, weight: 'bold' } },
            ticks: {
              color: '#E0E0E0',
              autoSkip: true,
              maxRotation: 45,
              minRotation: 0,
              callback: function (val, index) {
                const dateStr = labels[index];
                if (!dateStr) return '';
                if (labels.length <= 7) return dateStr;
                const date = new Date(dateStr);
                if (index % 2 === 0) return `${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
                return '';
              }
            },
            grid: { color: 'rgba(136,136,136,0.2)', drawBorder: false }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: { display: true, text: 'Number of Moods Logged', color: '#E0E0E0', font: { size: 16, weight: 'bold' } },
            ticks: { stepSize: 1, color: '#E0E0E0', padding: 10, },
            grid: { color: 'rgba(136,136,136,0.2)', drawBorder: false }
          }
        },
        plugins: {
          legend: { display: true, position: 'top', align: 'center', labels: { color: '#F0F0F0', padding: 10, boxWidth: 20 } },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                return label + context.formattedValue + ' log(s)';
              },
              title: function (context) {
                const dateLabel = context[0].label;
                const totalLogs = context.reduce((sum, item) => sum + item.parsed.y, 0);
                return `${dateLabel} (Total: ${totalLogs} logs)`;
              }
            }
          }
        }
      }
    });
    return newChartInstance;
  }, []);

  useEffect(() => {
    const loadMoodTrends = async () => {
      try {
        const { data, error } = await supabase
          .from('mood_logs')
          .select('mood_name, timestamp')
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          setMoodLogs([]);
          return;
        }

        setMoodLogs(data);

      } catch (error) {
        console.error('Error loading mood trends:', error);
        showAlert(error.message || 'Failed to load mood trends.', false);
      }
    };

    loadMoodTrends();
  }, [showAlert]);

  useEffect(() => {
    if (moodLogs.length > 0) {
      const lineChartData = prepareChartData(moodLogs);
      myMoodChartInstance.current = renderChart(chartRef.current, myMoodChartInstance, lineChartData.labels, lineChartData.wellbeingDataPoints, lineChartData.energyDataPoints);

      const stackedBarChartData = prepareStackedBarData(moodLogs);
      myStackedBarChartInstance.current = renderStackedBarChart(stackedBarChartRef.current, myStackedBarChartInstance, stackedBarChartData.labels, stackedBarChartData.datasets);
    }

    return () => {
      if (myMoodChartInstance.current) {
        myMoodChartInstance.current.destroy();
        myMoodChartInstance.current = null;
      }
      if (myStackedBarChartInstance.current) {
        myStackedBarChartInstance.current.destroy();
        myStackedBarChartInstance.current = null;
      }
    };
  }, [moodLogs, renderChart, renderStackedBarChart]);

  return (
    <div className="w-full max-w-4xl p-8">
      {moodLogs.length === 0 ? (
        <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Your Mood Trends</h2>
          <p>No mood logs yet. Log some moods in the chat view to see your trends!</p>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-center mb-4">Daily Average: Wellbeing & Energy</h3>
            <div className="chart-wrapper w-full overflow-x-auto p-4 rounded-lg shadow-inner panel-surface flex justify-start items-center pl-6">
              <canvas ref={chartRef} className="w-full max-w-[1100px] h-[400px]"></canvas>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-center mb-4">Daily Mood Distribution</h3>
            <div className="chart-wrapper w-full overflow-x-auto p-4 rounded-lg shadow-inner panel-surface flex justify-start items-center pl-6">
              <canvas ref={stackedBarChartRef} className="w-full max-w-[1100px] h-[400px]"></canvas>
            </div>
          </div>

          {/* Summary charts stacked vertically */}
          <div className="mt-8 space-y-8">
            <div className="mb-8">
              <ProductivityChart logs={moodLogs} onOpenGraph={onOpenGraph} />
            </div>
            <div className="mb-8">
              <ResilienceScore onOpenGraph={onOpenGraph} />
            </div>
            <div className="mb-8">
              <EmotionalVolatility onOpenGraph={onOpenGraph} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MoodTrendsView;
