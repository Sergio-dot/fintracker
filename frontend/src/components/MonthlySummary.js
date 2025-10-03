import React, { useEffect, useState } from "react";
import { getMonthlySummary } from "../api/api";
import "./ui.css";
import { useTranslation } from '../i18n';

/**
 * MonthlySummary component
 * Fetches and displays a summary of expenses/incomes and the allocation
 * of common expenses per user for the selected month/year.
 *
 * Props:
 * - month: number (1-12)
 * - year: number (optional)
 */
const MonthlySummary = ({ month, year }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMonthlySummary(month, year);
        setSummary(res);
      } catch (err) {
        setError(err.message || err);
      } finally {
        setLoading(false);
      }
    };
    if (month) fetch();
  }, [month, year]);

  const { t } = useTranslation();
  if (loading) return <div className="card">{t('loadingSummary')}</div>;
  if (error) return <div className="card">Error: {error}</div>;
  if (!summary) return null;

  return (
    <div className="card">
  <h3 className="card-title">{t('summary')} {summary.month}/{summary.year}</h3>
      <div className="muted">{t('totalExpenses')}: {summary.total_expenses.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>
      <div className="muted">{t('commonExpenses')}: {summary.total_common_expenses.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>
      <div className="muted">{t('totalIncomes')}: {summary.total_income.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>

      <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
            <th>User</th>
            <th>Income</th>
            <th>Common share</th>
          </tr>
        </thead>
        <tbody>
          {summary.allocations.map((a) => (
            <tr key={a.user_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px 6px' }}>{a.name}</td>
              <td style={{ padding: '8px 6px' }}>{a.income.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
              <td style={{ padding: '8px 6px' }}>{a.alloc_quota.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySummary;
