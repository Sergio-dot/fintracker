import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const TrendChart = ({ data }) => {
  // data: [{ period: '2025-09-01', incomes: 100, expenses: 50 }, ...]
  if (!data || data.length === 0) return <p>No trend data</p>;

  const fmt = (v) => typeof v === 'number' ? v.toLocaleString(undefined, { style: 'currency', currency: 'EUR' }) : v;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip formatter={(value) => fmt(value)} />
        <Legend />
        <Line type="monotone" dataKey="incomes" stroke="#82ca9d" />
        <Line type="monotone" dataKey="expenses" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
