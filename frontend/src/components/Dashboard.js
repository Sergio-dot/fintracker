import React, { useState, useEffect, useCallback } from "react";
import { getIncomes, getExpenses, getUsers } from "../api/api";
import IncomeExpenseChart from "./BarChart";
import CategoryChart from "./CategoryChart";
import Filters from "./Filters";
import IncomeForm from "./IncomeForm";
import ExpenseForm from "./ExpenseForm";
import Collapsible from "./Collapsible";
import "./ui.css";
import MonthlySummary from "./MonthlySummary";
import { useTranslation } from '../i18n';

/**
 * Dashboard
 * Main dashboard view: fetches users, incomes and expenses for a selected month
 * and person, then renders forms, filters and charts.
 */
const Dashboard = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [person, setPerson] = useState("all");
  const [users, setUsers] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { t } = useTranslation();

  // Fetch users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usr = await getUsers();
        setUsers(usr);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);

  /**
   * Fetch filtered incomes and expenses for the selected month/person.
   * Wrapped in useCallback so it can be passed to children without
   * triggering react-hooks/exhaustive-deps warnings.
   *
   * @param {number} m - month number (1-12). Defaults to local state.
   * @param {number|string|undefined} p - person id or 'all'. Defaults to local state.
   */
  const fetchData = useCallback(async (m = month, p = person) => {
    setLoading(true);
    setError(null);
    try {
      const user_id = p === "all" ? undefined : Number(p);
      const monthNum = Number(m);

      const inc = await getIncomes(monthNum, user_id);
      const exp = await getExpenses(monthNum, user_id);

      setIncomes(inc);
      setExpenses(exp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, person]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate expenses by category for the pie chart
  const categoryAgg = Object.values(
    expenses.reduce((acc, e) => {
      const cat = e.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
      acc[cat].value += e.amount;
      return acc;
    }, {})
  );

  // Simple trend: group by day (ISO date) and sum incomes/expenses
  const trendMap = {};
  const pushToTrend = (dateStr, key, amount) => {
    if (!trendMap[dateStr]) trendMap[dateStr] = { period: dateStr, incomes: 0, expenses: 0 };
    trendMap[dateStr][key] += amount;
  };

  incomes.forEach(i => {
    const d = new Date(i.date).toISOString().slice(0, 10);
    pushToTrend(d, "incomes", i.amount || 0);
  });
  expenses.forEach(e => {
    const d = new Date(e.date).toISOString().slice(0, 10);
    pushToTrend(d, "expenses", e.amount || 0);
  });

  if (loading) return <p><span className="inline-flex items-center"><svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> <span style={{ marginLeft: 8 }}>Loading...</span></span></p>;
  if (error) return <p>Error: {error}</p>;
  const totals = {
    incomes: incomes.reduce((acc, i) => acc + (i.amount || 0), 0),
    expenses: expenses.reduce((acc, e) => acc + (e.amount || 0), 0),
  };

  const barData = [
    { name: t('totals') || 'Totals', incomes: totals.incomes, expenses: totals.expenses },
  ];

  return (
    <div className="dashboard-container">

      <div className="dashboard-grid">
        <div className="left-column">
          <Collapsible title={t('addIncome')} defaultOpen={false}>
            <IncomeForm users={users} onAdded={() => fetchData()} />
          </Collapsible>
          <Collapsible title={t('addExpense')} defaultOpen={false}>
            <ExpenseForm users={users} onAdded={() => fetchData()} />
          </Collapsible>
          <div>
            <MonthlySummary month={month} />
          </div>
        </div>


        <div className="right-column">
          <div>
            <div>
              <div className="card">
                <h3 className="card-title">{t('filters')}</h3>
                <Filters
                  month={month}
                  setMonth={setMonth}
                  person={person}
                  setPerson={setPerson}
                  users={users}
                />
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="card">
              <h3 className="card-title">{t('incomeVsExpenses')}</h3>
              <IncomeExpenseChart data={barData} />
            </div>
          </div>

          <div className="chart-card">
            <div className="card">
              <h3 className="card-title">{t('expensesByCategory')}</h3>
              <CategoryChart data={categoryAgg} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
