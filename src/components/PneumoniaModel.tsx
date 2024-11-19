import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { rungeKutta4 } from '../utils/rk4';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Scenario {
  id: number;
  vaccinationEffectiveness: number;
  naturalDecline: number;
  color: string;
  data: { t: number[]; y: number[] };
}

const PneumoniaModel: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 1,
      vaccinationEffectiveness: 0.15,
      naturalDecline: 0.05,
      color: 'rgb(75, 192, 192)',
      data: { t: [], y: [] }
    }
  ]);

  const calculatePrediction = (vaccinationEffectiveness: number, naturalDecline: number) => {
    const initialRate = 50;
    const mortalityModel = (t: number, y: number) => {
      return -vaccinationEffectiveness * y - naturalDecline * y;
    };

    return rungeKutta4(
      mortalityModel,
      0,
      initialRate,
      1,
      10
    );
  };

  useEffect(() => {
    const updatedScenarios = scenarios.map(scenario => ({
      ...scenario,
      data: calculatePrediction(scenario.vaccinationEffectiveness, scenario.naturalDecline)
    }));
    setScenarios(updatedScenarios);
  }, []);

  const addScenario = () => {
    const colors = [
      'rgb(75, 192, 192)',
      'rgb(255, 99, 132)',
      'rgb(255, 205, 86)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)'
    ];
    
    setScenarios(prev => [
      ...prev,
      {
        id: Date.now(),
        vaccinationEffectiveness: 0.15,
        naturalDecline: 0.05,
        color: colors[prev.length % colors.length],
        data: calculatePrediction(0.15, 0.05)
      }
    ]);
  };

  const updateScenario = (id: number, field: 'vaccinationEffectiveness' | 'naturalDecline', value: number) => {
    setScenarios(prev => prev.map(scenario => {
      if (scenario.id === id) {
        const updated = {
          ...scenario,
          [field]: value
        };
        updated.data = calculatePrediction(updated.vaccinationEffectiveness, updated.naturalDecline);
        return updated;
      }
      return scenario;
    }));
  };

  const removeScenario = (id: number) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== id));
  };

  const chartData = {
    labels: scenarios[0]?.data.t.map(year => `Year ${year}`) || [],
    datasets: scenarios.map(scenario => ({
      label: `Scenario ${scenarios.indexOf(scenario) + 1}`,
      data: scenario.data.y,
      borderColor: scenario.color,
      tension: 0.1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Pneumonia Mortality Rate Prediction in Kenya',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Mortality Rate (per 1000 children)',
        },
        min: 0,
      },
      x: {
        title: {
          display: true,
          text: 'Years from Start',
        },
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Pneumonia Mortality Rate Prediction Model</h2>
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            This model uses the Runge-Kutta 4th order method to predict the reduction in child mortality
            due to pneumonia in Kenya, considering the impact of vaccination coverage.
          </p>
          
          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <div key={scenario.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Scenario {index + 1}</h3>
                  {scenarios.length > 1 && (
                    <button
                      onClick={() => removeScenario(scenario.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Vaccination Effectiveness
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={scenario.vaccinationEffectiveness}
                      onChange={(e) => updateScenario(scenario.id, 'vaccinationEffectiveness', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600">
                      {(scenario.vaccinationEffectiveness * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Natural Decline Rate
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.2"
                      step="0.01"
                      value={scenario.naturalDecline}
                      onChange={(e) => updateScenario(scenario.id, 'naturalDecline', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600">
                      {(scenario.naturalDecline * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {scenarios.length < 5 && (
              <button
                onClick={addScenario}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Scenario
              </button>
            )}
          </div>
        </div>
        <div className="h-[400px]">
          <Line options={options} data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default PneumoniaModel;