import React, { useEffect, useState } from "react";
import { getMonthlySummary } from "../api/api";
import "./ui.css";
import { useTranslation } from '../i18n';
import Spinner from './Spinner';

const MonthlySummary = ({ month, year }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { t } = useTranslation();

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

  if (loading) return <div className="card"><div className="p-4 flex items-center"><Spinner size={20} /><span className="ml-2">{t('loadingSummary')}</span></div></div>;
  if (error) return <div className="card">Error: {error}</div>;
  if (!summary) return null;

  const allocations = Array.isArray(summary.allocations) ? summary.allocations : [];
  const commonPayers = Array.isArray(summary.common_payers) ? summary.common_payers : [];
  const paidCommonBy = Array.isArray(summary.paid_common_by) ? summary.paid_common_by : [];

  // Build per-user map
  const userMap = {};
  allocations.forEach((a) => {
    userMap[a.user_id] = {
      user_id: a.user_id,
      name: a.name,
      income: a.income,
      alloc_quota: a.alloc_quota,
      paid_common: 0,
    };
  });

  // Aggregate paid common expenses
  (commonPayers.length ? commonPayers : paidCommonBy).forEach((p) => {
    if (!userMap[p.user_id]) {
      userMap[p.user_id] = { user_id: p.user_id, name: p.name || `User ${p.user_id}`, income: 0, alloc_quota: 0, paid_common: 0 };
    }
    userMap[p.user_id].paid_common += p.amount || 0;
  });

  const users = Object.values(userMap);

  users.forEach((u) => {
    u.net = +((u.paid_common || 0) - (u.alloc_quota || 0)).toFixed(2);
  });

  // Suggested transfers
  const creditors = users.filter(u => u.net > 0).sort((a,b) => b.net - a.net).map(u => ({ ...u }));
  const debtors = users.filter(u => u.net < 0).sort((a,b) => a.net - b.net).map(u => ({ ...u }));
  const transfers = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const owe = Math.min(Math.abs(debtor.net), creditor.net);
    if (owe <= 0.009) {
      if (Math.abs(debtor.net) <= 0.009) i++;
      if (creditor.net <= 0.009) j++;
      continue;
    }
    transfers.push({ from: debtor.name, to: creditor.name, amount: +owe.toFixed(2) });
    debtor.net += owe;
    creditor.net -= owe;
    if (Math.abs(debtor.net) <= 0.009) i++;
    if (creditor.net <= 0.009) j++;
  }

  return (
    <div>
      {summary.debug_mismatch && summary.debug_mismatch.mismatch && (
        <div className="card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: 12 }}>
          <h4 style={{ margin: 0 }}>Warning: data mismatch</h4>
          <div className="muted" style={{ marginTop: 6 }}>
            Sum of common payers: {(summary.debug_mismatch.sum_common_payers || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}
            {' '}vs total common expenses: {(summary.debug_mismatch.total_common_expenses || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            {t('debugMismatchSuggestion') || 'There is a discrepancy between recorded "paid common" amounts and the total common expenses. Inspect individual common expenses for the month.'}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">{t('summary')} {summary.month}/{summary.year}</h3>
        <div className="muted">{t('totalExpenses')}: {(summary.total_expenses || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>
        <div className="muted">{t('commonExpenses')}: {(summary.total_common_expenses || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>
        <div className="muted">{t('totalIncomes')}: {(summary.total_income || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>

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
                <td style={{ padding: '8px 6px', color: 'var(--text, inherit)' }}>{(((a.paid_common || 0) - (a.alloc_quota || 0))).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
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

