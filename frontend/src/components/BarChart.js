import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const IncomeExpenseChart = ({ data }) => {
  // data expected: [{ name: 'Month', incomes: x, expenses: y }, ...]
  // if data is in older format (single value) we map it to expenses
  const normalized = data.map((d) => ({
    name: d.name,
    incomes: d.incomes ?? 0,
    expenses: d.expenses ?? d.value ?? 0,
  }));

  // read CSS variables so chart colors match theme
  const rootStyles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const axisColor = rootStyles?.getPropertyValue('--chart-axis')?.trim() || '#0f172a';
  const tickColor = rootStyles?.getPropertyValue('--chart-tick')?.trim() || '#4b5563';
  const tooltipBg = rootStyles?.getPropertyValue('--tooltip-bg')?.trim() || '#111827';
  const tooltipText = rootStyles?.getPropertyValue('--tooltip-text')?.trim() || '#f9fafb';
  const expensesColor = '#5f5acaff';
  const incomesColor = '#088036ff';

  return (
    <ResponsiveContainer width={"100%"} height={300}>
      <BarChart data={normalized} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="name" stroke={axisColor} tick={{ fill: tickColor }} />
        <YAxis stroke={axisColor} tick={{ fill: tickColor }} />
        <Tooltip
          contentStyle={{ background: tooltipBg, border: 'none', color: tooltipText }}
          itemStyle={{ color: tooltipText }}
          cursor={{ fill: 'rgba(0,0,0,0.06)' }}
        />
        <Legend wrapperStyle={{ color: tickColor }} />
        <Bar dataKey="expenses" fill={expensesColor} />
        <Bar dataKey="incomes" fill={incomesColor} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;