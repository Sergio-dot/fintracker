import React, { useEffect, useMemo, useState } from 'react';
import { getIncomes, getUsers, postIncome, updateIncome } from '../api/api';
import { useTranslation } from '../i18n';
import Modal from './Modal';
import Spinner from './Spinner';
import './ui.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const defaultForm = { amount: '', owner_id: '', date: '' };

const IncomesPage = () => {
    const { t } = useTranslation();

    const [incomes, setIncomes] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [ownerFilter, setOwnerFilter] = useState('');

    const [form, setForm] = useState(defaultForm);
    const [editing, setEditing] = useState(null);

    const [modal, setModal] = useState({ add: false, edit: false, delete: false });
    const [toDeleteId, setToDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    // ---- Fetch data ----
    const fetchData = async () => {
        setLoading(true);
        try {
            const [inc, us] = await Promise.all([getIncomes(), getUsers()]);
            setIncomes(inc || []);
            setUsers(us || []);
        } catch (err) {
            showToast('error', err.message || t('loadFailed') || 'Load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
        if (!form.owner_id && users.length > 0)
            setForm(prev => ({ ...prev, owner_id: users[0].id }));
    }, [users]);

    // ---- Helpers ----
    const showToast = (type, text) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 2500);
    };

    const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const validateForm = () => {
        if (!form.amount || Number(form.amount) <= 0)
            return showToast('error', t('validationAmount') || 'Amount must be > 0'), false;
        if (!form.owner_id)
            return showToast('error', t('validationOwner') || 'Select owner'), false;
        if (!form.date)
            return showToast('error', t('validationDate') || 'Select date'), false;
        return true;
    };

    // ---- CRUD ----
    const addIncome = async () => {
        if (!validateForm()) return;
        try {
            await postIncome({
                amount: Number(form.amount),
                owner_id: Number(form.owner_id),
                date: form.date
            });
            await fetchData();
            setForm(defaultForm);
            setModal(m => ({ ...m, add: false }));
            showToast('success', t('incomeAdded') || 'Income added');
        } catch {
            showToast('error', t('saveFailed') || 'Save failed');
        }
    };

    const saveEdit = async () => {
        if (!editing || !validateForm()) return;
        try {
            await updateIncome(editing.id, {
                amount: Number(form.amount),
                owner_id: Number(form.owner_id),
                date: form.date
            });
            await fetchData();
            setEditing(null);
            setForm(defaultForm);
            setModal(m => ({ ...m, edit: false }));
            showToast('success', t('savedSuccesfully') || 'Saved');
        } catch {
            showToast('error', t('saveFailed') || 'Save failed');
        }
    };

    const handleDelete = (id) => {
        setToDeleteId(id);
        setModal(m => ({ ...m, delete: true }));
    };

    const confirmDelete = async () => {
        if (!toDeleteId) return showToast('error', t('removeFailed') || 'Remove failed');
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/incomes/${toDeleteId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            await fetchData();
            setModal(m => ({ ...m, delete: false }));
            showToast('success', t('removedSuccessfully') || 'Removed successfully');
        } catch {
            showToast('error', t('removeFailed') || 'Remove failed');
        } finally {
            setDeleting(false);
            setToDeleteId(null);
        }
    };

    // ---- Derived values ----
    const filtered = useMemo(
        () => ownerFilter ? incomes.filter(i => String(i.owner_id) === String(ownerFilter)) : incomes,
        [incomes, ownerFilter]
    );

    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);

    const total = filtered.length;
    const from = total ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, total);

    // ---- Render ----
    if (loading) {
        return (
            <div className="card p-4 flex items-center">
                <Spinner size={20} />
                <span className="ml-2">{t('loading') || 'Loading'}</span>
            </div>
        );
    }

    return (
        <div className="card">
            {/* Header controls */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <label className="text-sm text-gray-600">{t('rowsPerPage') || 'Rows'}:</label>
                    <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }} className="border rounded p-1">
                        {[10, 20, 30, 40, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>

                    <label className="text-sm text-gray-600 ml-4">{t('filterOwner') || 'Owner'}:</label>
                    <select value={ownerFilter} onChange={e => { setOwnerFilter(e.target.value); setPage(1); }} className="border rounded p-1">
                        <option value="">{t('all') || 'All'}</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>

                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setModal(m => ({ ...m, add: true }))}>
                    {t('addIncome') || 'Add Income'}
                </button>
            </div>

            {/* Table */}
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>{t('amount') || 'Amount'}</th>
                        <th>{t('owner') || 'Owner'}</th>
                        <th>{t('date') || 'Date'}</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.map(i => (
                        <tr key={i.id}>
                            <td>{i.id}</td>
                            <td>{(i.amount || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
                            <td>{users.find(u => u.id === i.owner_id)?.name || i.owner_id}</td>
                            <td>{i.date}</td>
                            <td>
                                <button onClick={() => {
                                    setEditing(i);
                                    setForm({ amount: i.amount, owner_id: i.owner_id, date: i.date });
                                    setModal(m => ({ ...m, edit: true }));
                                }} className="bg-blue-600 text-white px-3 py-1 rounded">{t('edit') || 'Edit'}</button>

                                <button onClick={() => handleDelete(i.id)} className="bg-red-600 text-white px-3 py-1 rounded ml-2">
                                    {t('remove') || 'Remove'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-600">{`${from}-${to} / ${total}`}</span>
                <div>
                    <button className="px-3 py-1 border rounded mr-2" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                        {t('prev') || 'Prev'}
                    </button>
                    <button className="px-3 py-1 border rounded" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>
                        {t('next') || 'Next'}
                    </button>
                </div>
            </div>

            {/* --- Modals --- */}
            <Modal open={modal.add} onClose={() => setModal(m => ({ ...m, add: false }))} ariaLabel="add-income">
                <h4 className="text-lg font-semibold">{t('addIncome') || 'Add Income'}</h4>
                <IncomeForm users={users} form={form} onChange={handleChange} />
                <div className="mt-4 text-right">
                    <button onClick={() => setModal(m => ({ ...m, add: false }))} className="px-3 py-2 rounded mr-2">{t('cancel') || 'Cancel'}</button>
                    <button onClick={addIncome} className="bg-blue-600 text-white px-4 py-2 rounded">{t('save') || 'Save'}</button>
                </div>
            </Modal>

            <Modal open={modal.edit && !!editing} onClose={() => setModal(m => ({ ...m, edit: false }))} ariaLabel="edit-income">
                <h4 className="text-lg font-semibold">{t('editIncome') || 'Edit Income'}</h4>
                <IncomeForm users={users} form={form} onChange={handleChange} />
                <div className="mt-4 text-right">
                    <button onClick={() => setModal(m => ({ ...m, edit: false }))} className="px-3 py-2 rounded mr-2">{t('cancel') || 'Cancel'}</button>
                    <button onClick={saveEdit} className="bg-blue-600 text-white px-4 py-2 rounded">{t('save') || 'Save'}</button>
                </div>
            </Modal>

            <Modal open={modal.delete} onClose={() => setModal(m => ({ ...m, delete: false }))} ariaLabel="confirm-remove">
                <h4 className="text-lg font-semibold">{t('confirmRemoveTitle') || 'Confirm remove'}</h4>
                <p className="mt-2">{t('confirmRemoveMessage') || 'Are you sure you want to remove this income?'}</p>
                <div className="mt-4 text-right">
                    <button onClick={() => setModal(m => ({ ...m, delete: false }))} className="bg-blue-600 text-white px-3 py-2 rounded">
                        {t('cancel') || 'Cancel'}
                    </button>
                    <button onClick={confirmDelete} className="bg-red-600 text-white px-3 py-2 rounded ml-2" disabled={deleting}>
                        {deleting ? <span className="flex items-center"><Spinner size={14} /><span className="ml-2">{t('removing') || 'Removing...'}</span></span> : (t('remove') || 'Remove')}
                    </button>
                </div>
            </Modal>

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 p-3 rounded ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'} text-white`}>
                    {toast.text}
                </div>
            )}
        </div>
    );
};

// --- Subcomponent: Form ---
const IncomeForm = ({ users, form, onChange }) => (
    <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="flex flex-col">
            <span className="text-sm text-gray-600">Amount</span>
            <input className="border rounded p-2" type="number" step="0.01" value={form.amount} onChange={e => onChange('amount', e.target.value)} />
        </label>

        <label className="flex flex-col">
            <span className="text-sm text-gray-600">Owner</span>
            <select className="border rounded p-2" value={form.owner_id} onChange={e => onChange('owner_id', e.target.value)}>
                <option value="">Select owner</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
        </label>

        <label className="flex flex-col">
            <span className="text-sm text-gray-600">Date</span>
            <input className="border rounded p-2" type="date" value={form.date} onChange={e => onChange('date', e.target.value)} />
        </label>
    </div>
);

export default IncomesPage;
