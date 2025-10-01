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

  return (
    <ResponsiveContainer width={"100%"} height={300}>
      <BarChart style={{outline: 'none !important' }} data={normalized} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="expenses" fill="#5f5acaff" />
        <Bar dataKey="incomes" fill="#088036ff" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;