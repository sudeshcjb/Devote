import React from 'react';
import { Candidate } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsChartProps {
  candidates: Candidate[];
}

export const ResultsChart: React.FC<ResultsChartProps> = ({ candidates }) => {
  const data = candidates.map(c => ({
    name: c.name.split(' ')[0], // First name for label
    votes: c.votes,
    fullParams: c
  }));

  const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'];

  return (
    <div className="h-64 w-full bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Live Results</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: '#334155', opacity: 0.2 }}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
          />
          <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
