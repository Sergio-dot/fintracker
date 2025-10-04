import React from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4D4F",
  "#6C5CE7",
  "#00bcd4",
  "#ff6b6b",
  "#845ef7",
  "#15aabf",
  "#e64980",
];

const CategoryChart = ({ data }) => {
  // data: [{ name: 'Category', value: number }, ...]
  if (!data || data.length === 0) return <p>No category data</p>;

  // deterministic color by hashing category name to an index
  const colorFor = (name) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = (h << 5) - h + name.charCodeAt(i);
      h |= 0;
    }
    return COLORS[Math.abs(h) % COLORS.length];
  };

  const fmt = (v) => v.toLocaleString(undefined, { style: 'currency', currency: 'EUR' });

  const rootStyles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const tickColor = rootStyles?.getPropertyValue('--chart-tick')?.trim() || '#4b5563';
  const tooltipBg = rootStyles?.getPropertyValue('--tooltip-bg')?.trim() || '#111827';
  const tooltipText = rootStyles?.getPropertyValue('--tooltip-text')?.trim() || '#f9fafb';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie dataKey="value" data={data} nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.name}: ${fmt(entry.value)}`}>
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={colorFor(entry.name)} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => fmt(value)} contentStyle={{ background: tooltipBg, border: 'none', color: tooltipText }} itemStyle={{ color: tooltipText }} />
        <Legend wrapperStyle={{ color: tickColor }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
