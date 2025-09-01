// frontend/src/components/MoodTrendsView.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';

import { makeAuthenticatedRequest } from '../services/api';

// Register all necessary Chart.js components once outside the component
Chart.register(...registerables);

const moodDimensions = {
  'happy':       { wellbeing: 9, energy: 8, color: '#4CAF50', category: 'positive-high' },
  'energized':   { wellbeing: 8, energy: 9, color: '#00BCD4', category: 'positive-high' },
  'calm':        { wellbeing: 8, energy: 4, color: '#8BC34A', category: 'calm-neutral' },
  'neutral':     { wellbeing: 5, energy: 5, color: '#607D8B', category: 'calm-neutral' },
  'frustrated':  { wellbeing: 3, energy: 6, color: '#FFC107', category: 'negative-activated' },
  'anxious':     { wellbeing: 3, energy: 7, color: '#FF5722', category: 'negative-activated' },
  'sad':         { wellbeing: 2, energy: 3, color: '#673AB7', category: 'low-energy-sad' },
  'overwhelmed': { wellbeing: 2, energy: 4, color: '#795548', category: 'overwhelmed' },
  'angry':       { wellbeing: 1, energy: 8, color: '#F44336', category: 'negative-activated' },
  'tired':       { wellbeing: 1, energy: 1, color: '#9E9E9E', category: 'low-energy-sad' }
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
      borderColor: moodDimensions[moodName].color,
      borderWidth: 1,
    };
  });

  return { labels, datasets };
};


function MoodTrendsView({ showAlert }) {
  const chartRef = useRef(null); // Canvas DOM element ref
  const stackedBarChartRef = useRef(null); // Ref for Stacked Bar Chart
  const expandedChartRef = useRef(null); // Expanded Canvas DOM element ref

  const myMoodChartInstance = useRef(null); // Ref to hold the Chart.js instance for line chart
  const myExpandedMoodChartInstance = useRef(null); // Ref to hold the Chart.js instance for expanded line chart
  const myStackedBarChartInstance = useRef(null); // Ref to hold the Chart.js instance for stacked bar chart

  const [moodLogs, setMoodLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NEW: renderChart function wrapped with useCallback and moved inside component
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
        layout: {
          padding: {
            left: 20, right: 20, top: 10, bottom: 10
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: yAxisMinAdjusted,
            max: yAxisMaxAdjusted,
            suggestedMin: 0,
            suggestedMax: 10,

            title: {
              display: true,
              text: 'Score (0-10)',
              color: '#E0E0E0',
              font: { size: 16, weight: 'bold' }
            },
            ticks: {
              stepSize: 0.5,
              color: '#E0E0E0',
              padding: 10,
              callback: function(value) {
                if (value === 0) return 'Very Low';
                if (value === 5) return 'Neutral';
                if (value === 10) return 'Very High';
                if (value < 0 || value > 10) return '';
                if (Number.isInteger(value) || (value * 2) % 1 === 0) return value;
                return '';
              }
            },
            grid: {
              color: 'rgba(136,136,136,0.2)',
              drawBorder: false
            }
          },
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Date',
              color: '#E0E0E0',
              font: { size: 16, weight: 'bold' }
            },
            ticks: {
              color: '#E0E0E0',
              autoSkip: true,
              maxRotation: 45,
              minRotation: 0,
              callback: function(val, index) {
                  const dateStr = labels[index];
                  if (labels.length <= 5) {
                      return dateStr;
                  } else {
                      const date = new Date(dateStr);
                      if (index % 2 === 0) return `${date.getMonth() + 1}-${date.getDate()}`;
                      return '';
                  }
              }
            },
            grid: {
              color: 'rgba(136,136,136,0.2)',
              drawBorder: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'start',
            labels: {
              color: '#F0F0F0',
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                return label + context.raw.toFixed(1);
              }
            }
          }
        }
      }
    }); // This curly brace closes the options object
    return newChartInstance; // This is the ONLY return statement for renderChart
  }, []); // Dependencies for useCallback: None, as all external data is passed via arguments or is static

  // NEW: renderStackedBarChart function wrapped with useCallback and moved inside component
  const renderStackedBarChart = useCallback((canvasElement, chartRefObject, labels, datasets) => {
    if (!canvasElement) return null;

    const ctx = canvasElement.getContext('2d');

    if (chartRefObject.current) {
      chartRefObject.current.destroy();
    }

    const newChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 20, right: 20, top: 10, bottom: 10
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Date',
              color: '#E0E0E0',
              font: { size: 16, weight: 'bold' }
            },
            ticks: {
              color: '#E0E0E0',
              autoSkip: true,
              maxRotation: 45,
              minRotation: 0,
              callback: function(val, index) {
                  const dateStr = labels[index];
                  if (labels.length <= 7) {
                      return dateStr;
                  } else {
                      const date = new Date(dateStr);
                      if (index % 2 === 0) return `${date.getMonth() + 1}-${date.getDate()}`;
                      return '';
                  }
              }
            },
            grid: {
              color: 'rgba(136,136,136,0.2)',
              drawBorder: false
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Moods Logged',
              color: '#E0E0E0',
              font: { size: 16, weight: 'bold' }
            },
            ticks: {
              stepSize: 1,
              color: '#E0E0E0',
              padding: 10,
            },
            grid: {
              color: 'rgba(136,136,136,0.2)',
              drawBorder: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'start',
            labels: {
              color: '#F0F0F0',
              padding: 10,
              boxWidth: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                return label + context.formattedValue + ' log(s)';
              },
              title: function(context) {
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
  }, []); // Dependencies for useCallback: None, as all external data is passed via arguments or is static


  useEffect(() => {
    const loadMoodTrends = async () => {
      try {
        const response = await makeAuthenticatedRequest('/mood/history', 'GET');
        const data = await response.json();

        if (response.ok) {
          if (data.length === 0) {
            showAlert('No mood logs yet. Log some moods to see your trends!', false);
            setMoodLogs([]);
            if (myMoodChartInstance.current) myMoodChartInstance.current.destroy();
            if (myStackedBarChartInstance.current) myStackedBarChartInstance.current.destroy();
            return;
          }
          setMoodLogs(data);

          const lineChartData = prepareChartData(data);
          console.log('Processed Chart Data (Line Chart):', lineChartData);
          const lineChartInstance = renderChart(chartRef.current, myMoodChartInstance,
                                                lineChartData.labels, lineChartData.wellbeingDataPoints, lineChartData.energyDataPoints);
          myMoodChartInstance.current = lineChartInstance;

          const stackedBarChartData = prepareStackedBarData(data);
          console.log('Processed Chart Data (Stacked Bar Chart):', stackedBarChartData);
          const stackedBarChartInstance = renderStackedBarChart(stackedBarChartRef.current, myStackedBarChartInstance,
                                                                stackedBarChartData.labels, stackedBarChartData.datasets);
          myStackedBarChartInstance.current = stackedBarChartInstance;


          setTimeout(() => {
            const chartWrapper = document.getElementById('moodChartWrapper');
            if (chartWrapper) {
              chartWrapper.scrollLeft = chartWrapper.scrollWidth;
            }
          }, 100);

        } else {
          showAlert(data.message || 'Failed to load mood trends.', false);
        }
      } catch (error) {
        console.error('Error loading mood trends:', error);
        showAlert('Network error or failed to load mood trends.', false);
      }
    };

    loadMoodTrends();

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
  }, [showAlert]);


  const openChartModal = () => {
    if (!moodLogs.length) {
      showAlert('No chart data to expand. Please log some moods first.', false);
      return;
    }
    setIsModalOpen(true);
  };

  const closeChartModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen && expandedChartRef.current && moodLogs.length) {
      const chartData = prepareChartData(moodLogs);
      const chartInstance = renderChart(expandedChartRef.current, myExpandedMoodChartInstance,
                                       chartData.labels, chartData.wellbeingDataPoints, chartData.energyDataPoints);
      myExpandedMoodChartInstance.current = chartInstance;

      setTimeout(() => {
        const modalChartContainer = document.getElementById('modalChartContainer');
        if (modalChartContainer) {
          modalChartContainer.scrollLeft = modalChartContainer.scrollWidth;
        }
      }, 150);
    }

    return () => {
      if (myExpandedMoodChartInstance.current) {
        myExpandedMoodChartInstance.current.destroy();
        myExpandedMoodChartInstance.current = null;
      }
    };
  }, [isModalOpen, moodLogs]);

  const primaryBg = "#1A1A2E";
  const secondaryBg = "#16213E";
  const textColorPrimary = "#E0E0E0";
  const textColorLighter = "#F0F0F0";
  const accentColor = "#00ADB5";
  const borderColor = "#00ADB5";
  const textMuted = "#888888";


  return (
    <div className={`w-full bg-[${secondaryBg}] p-8 rounded-lg shadow-xl border border-[${borderColor}]/20`}>
      <h2 className={`text-3xl font-bold text-center text-[${accentColor}] mb-8`}>Your Mood Trends</h2>

      {moodLogs.length === 0 ? (
        <p className={`text-center text-[${textColorPrimary}] mb-4`}>No mood logs yet. Log some moods in the chat view to see your trends!</p>
      ) : (
        <>
          {/* Line Chart: Wellbeing & Energy */}
          <h3 className={`text-xl font-semibold text-[${textColorLighter}] text-center mb-4`}>Daily Average: Wellbeing & Energy</h3>
          <div
            id="moodChartWrapper"
            className="chart-wrapper w-full overflow-x-auto p-4 mb-8 rounded-lg shadow-inner cursor-pointer"
            onClick={openChartModal}
          >
            <canvas
              id="moodChart"
              ref={chartRef}
              className={`min-w-[700px] h-[350px] bg-[${primaryBg}] rounded-md p-4`}
            ></canvas>
          </div>

          {/* NEW: Stacked Bar Chart: Daily Mood Distribution */}
          <h3 className={`text-xl font-semibold text-[${textColorLighter}] text-center mb-4`}>Daily Mood Distribution</h3>
          <div
            id="stackedBarChartWrapper"
            className="chart-wrapper w-full overflow-x-auto p-4 rounded-lg shadow-inner" // Not clickable for modal
          >
            <canvas
              id="stackedBarChart"
              ref={stackedBarChartRef}
              className={`min-w-[700px] h-[350px] bg-[${primaryBg}] rounded-md p-4`}
            ></canvas>
          </div>
        </>
      )}

      {/* Fullscreen Modal for Expanded Chart */}
      {isModalOpen && (
        <div
          id="chart-modal"
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 ease-out"
          onClick={closeChartModal}
        >
          <div
            className={`relative bg-[${secondaryBg}] p-8 rounded-lg shadow-2xl w-[90%] max-w-[1200px] h-[80%] max-h-[800px]
                       flex flex-col transform translate-y-5 scale-95 transition-transform duration-300 ease-in-out`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeChartModal}
              className={`absolute top-3 right-5 text-4xl font-bold text-[${textMuted}] hover:text-[${accentColor}] transition-colors duration-200 focus:outline-none`}
            >
              &times;
            </button>
            <div id="modalChartContainer" className="flex-grow w-full h-full overflow-x-auto p-4">
              <canvas
                id="expandedMoodChart"
                ref={expandedChartRef}
                className={`min-w-[1000px] h-full bg-[${primaryBg}] rounded-md p-4`}
              ></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoodTrendsView;