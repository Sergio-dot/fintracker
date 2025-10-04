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
  // Build per-user map from allocations
  const userMap = {};
  summary.allocations.forEach((a) => {
    userMap[a.user_id] = {
      user_id: a.user_id,
      name: a.name,
      income: a.income,
      alloc_quota: a.alloc_quota,
      paid_common: 0, // will be filled below if expenses detail present
    };
  });

  // If API returns who paid common expenses, aggregate paid_common per user
  // The summary endpoint currently does not include per-expense list, so try
  // to use summary.common_payers if available (backwards-compatible).
  if (summary.common_payers && Array.isArray(summary.common_payers)) {
    summary.common_payers.forEach((p) => {
      if (!userMap[p.user_id]) {
        userMap[p.user_id] = { user_id: p.user_id, name: p.name || `User ${p.user_id}`, income: 0, alloc_quota: 0, paid_common: 0 };
      }
      userMap[p.user_id].paid_common += p.amount;
    });
  }

  // Fallback: if API does not provide payers, try to use summary.paid_common_by (compat)
  if (summary.paid_common_by && Array.isArray(summary.paid_common_by)) {
    summary.paid_common_by.forEach((p) => {
      if (!userMap[p.user_id]) {
        userMap[p.user_id] = { user_id: p.user_id, name: p.name || `User ${p.user_id}`, income: 0, alloc_quota: 0, paid_common: 0 };
      }
      userMap[p.user_id].paid_common += p.amount;
    });
  }

  // Convert map to array
  const users = Object.values(userMap);

  // Compute net balance: positive means user should receive money, negative means owes
  // net = paid_common - alloc_quota
  users.forEach((u) => {
    u.net = +( (u.paid_common || 0) - (u.alloc_quota || 0) ).toFixed(2);
  });

  // Build suggested transfers (greedy algorithm)
  const creditors = users.filter(u => u.net > 0).sort((a,b) => b.net - a.net).map(u => ({ ...u }));
  const debtors = users.filter(u => u.net < 0).sort((a,b) => a.net - b.net).map(u => ({ ...u }));
  const transfers = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const owe = Math.min(Math.abs(debtor.net), creditor.net);
    if (owe <= 0.009) { // ignore negligible amounts
      if (Math.abs(debtor.net) <= 0.009) i++;
      if (creditor.net <= 0.009) j++;
      continue;
    }
    transfers.push({ from: debtor.name, to: creditor.name, amount: +owe.toFixed(2) });
    debtor.net += owe; // debtor.net is negative
    creditor.net -= owe;
    if (Math.abs(debtor.net) <= 0.009) i++;
    if (creditor.net <= 0.009) j++;
  }

  return (
    <div>
      <div className="card">
        <h3 className="card-title">{t('summary')} {summary.month}/{summary.year}</h3>
        <div className="muted">{t('totalExpenses')}: {summary.total_expenses.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>
        <div className="muted">{t('commonExpenses')}: {summary.total_common_expenses.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>
        <div className="muted">{t('totalIncomes')}: {summary.total_income.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>

        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid var(--card-border, #e5e7eb)` }}>
              <th>{t('user')}</th>
              <th>{t('income')}</th>
              <th>{t('commonShare')}</th>
              <th>{t('paidCommon') || 'Paid common'}</th>
              <th>{t('net') || 'Net'}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((a) => (
              <tr key={a.user_id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                <td style={{ padding: '8px 6px', color: 'var(--text, inherit)' }}>{a.name}</td>
                <td style={{ padding: '8px 6px', color: 'var(--text, inherit)' }}>{(a.income || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
                <td style={{ padding: '8px 6px', color: 'var(--text, inherit)' }}>{(a.alloc_quota || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
                <td style={{ padding: '8px 6px', color: 'var(--text, inherit)' }}>{(a.paid_common || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
                <td style={{ padding: '8px 6px', color: 'var(--text, inherit)' }}>{( ((a.paid_common||0) - (a.alloc_quota||0)) ).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 className="card-title">{t('settlements') || 'Settlements'}</h3>
        {transfers.length === 0 ? (
          <div className="muted">{t('noSettlementsNeeded') || 'No settlements needed'}</div>
        ) : (
          <ul>
            {transfers.map((tfr, idx) => (
              <li key={idx} style={{ padding: '6px 0' }}>{tfr.from} → {tfr.to}: {tfr.amount.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MonthlySummary;
