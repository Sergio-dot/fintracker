import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const TrendChart = ({ data }) => {
  // data: [{ period: '2025-09-01', incomes: 100, expenses: 50 }, ...]
  if (!data || data.length === 0) return <p>No trend data</p>;

  const fmt = (v) => typeof v === 'number' ? v.toLocaleString(undefined, { style: 'currency', currency: 'EUR' }) : v;

  const rootStyles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const axisColor = rootStyles?.getPropertyValue('--chart-axis')?.trim() || '#0f172a';
  const tickColor = rootStyles?.getPropertyValue('--chart-tick')?.trim() || '#4b5563';
  const gridStroke = 'rgba(0,0,0,0.06)';
  const tooltipBg = rootStyles?.getPropertyValue('--tooltip-bg')?.trim() || '#111827';
  const tooltipText = rootStyles?.getPropertyValue('--tooltip-text')?.trim() || '#f9fafb';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="period" stroke={axisColor} tick={{ fill: tickColor }} />
        <YAxis stroke={axisColor} tick={{ fill: tickColor }} />
        <Tooltip formatter={(value) => fmt(value)} contentStyle={{ background: tooltipBg, border: 'none', color: tooltipText }} itemStyle={{ color: tooltipText }} />
        <Legend wrapperStyle={{ color: tickColor }} />
        <Line type="monotone" dataKey="incomes" stroke="#82ca9d" />
        <Line type="monotone" dataKey="expenses" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
