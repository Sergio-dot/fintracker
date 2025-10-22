import React, { useEffect, useState } from 'react';
import { getIncomes, getUsers, postIncome, updateIncome } from '../api/api';
import './ui.css';
import { useTranslation } from '../i18n';
import Modal from './Modal';
import Spinner from './Spinner';

const IncomesPage = () => {
    const { t } = useTranslation();

    const [incomes, setIncomes] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [ownerFilter, setOwnerFilter] = useState('');

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ amount: '', owner_id: '', date: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    // Fetch users and incomes
    const fetchData = async () => {
        setLoading(true);
        try {
            const inc = await getIncomes();
            const us = await getUsers();
            setIncomes(inc || []);
            setUsers(us || []);
        } catch (err) {
            setToast({ type: 'error', text: err.message || t('loadFailed') || 'Load failed' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // default owner when users load
    useEffect(() => {
        if ((!form.owner_id || form.owner_id === '') && users.length > 0) {
            setForm(prev => ({ ...prev, owner_id: users[0].id }));
        }
    }, [users]);

    const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const validateForm = () => {
        if (!form.amount || Number(form.amount) <= 0) {
            setToast({ type: 'error', text: t('validationAmount') || 'Amount must be > 0' });
            return false;
        }
        if (!form.owner_id) {
            setToast({ type: 'error', text: t('validationOwner') || 'Select owner' });
            return false;
        }
        if (!form.date) {
            setToast({ type: 'error', text: t('validationDate') || 'Select date' });
            return false;
        }
        return true;
    };

    const onAddIncome = async () => {
        if (!validateForm()) return;
        try {
            await postIncome({ amount: Number(form.amount), owner_id: Number(form.owner_id), date: form.date });
            await fetchData();
            setForm({ amount: '', owner_id: '', date: '' });
            setShowAddModal(false);
            setToast({ type: 'success', text: t('incomeAdded') || 'Income added' });
            setTimeout(() => setToast(null), 2500);
        } catch (err) {
            setToast({ type: 'error', text: t('saveFailed') || 'Save failed' });
        }
    };

    const onEdit = (income) => {
        setEditing(income);
        setForm({ amount: income.amount, owner_id: income.owner_id, date: income.date });
        setShowEditModal(true);
    };

    const onSaveEdit = async () => {
        if (!editing || !validateForm()) return;
        try {
            await updateIncome(editing.id, { amount: Number(form.amount), owner_id: Number(form.owner_id), date: form.date });
            await fetchData();
            setEditing(null);
            setForm({ amount: '', owner_id: '', date: '' });
            setShowEditModal(false);
            setToast({ type: 'success', text: t('savedSuccesfully') || 'Saved' });
            setTimeout(() => setToast(null), 2500);
        } catch (err) {
            setToast({ type: 'error', text: t('saveFailed') || 'Save failed' });
        }
    };

    const onDelete = (id) => {
        setToDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async (idArg) => {
        const id = idArg ?? toDeleteId;
        if (!id) {
            setToast({ type: 'error', text: t('removeFailed') || 'Remove failed' });
            return;
        }
        setDeleting(true);
        try {
            await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8000'}/incomes/${id}`, { method: 'DELETE' });
            await fetchData();
            setToDeleteId(null);
            setShowDeleteModal(false);
            setToast({ type: 'success', text: t('removedSuccessfully') || 'Removed successfully' });
            setTimeout(() => setToast(null), 2500);
        } catch (err) {
            setToast({ type: 'error', text: t('removeFailed') || 'Remove failed' });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="card">
            {loading ? (
                <div className="p-4 flex items-center">
                    <Spinner size={20} />
                    <span className="ml-2">{t('loading') || 'Loading'}</span>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <label className="text-sm text-gray-600">{t('rowsPerPage') || 'Rows'}:</label>
                            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded p-1">
                                {[10,20,30,40,50].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>

                            <label className="text-sm text-gray-600 ml-4">{t('filterOwner') || 'Owner'}:</label>
                            <select value={ownerFilter} onChange={e => { setOwnerFilter(e.target.value); setPage(1); }} className="border rounded p-1">
                                <option value="">{t('all') || 'All'}</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>

                        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowAddModal(true)}>
                            {t('addIncome') || 'Add Income'}
                        </button>
                    </div>

                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
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
                            {(() => {
                                const filtered = ownerFilter ? incomes.filter(i => String(i.owner_id) === String(ownerFilter)) : incomes;
                                const start = (page - 1) * pageSize;
                                const pageItems = filtered.slice(start, start + pageSize);
                                return pageItems.map(i => (
                                    <tr key={i.id}>
                                        <td>{i.id}</td>
                                        <td>{(i.amount || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
                                        <td>{users.find(u => u.id === i.owner_id)?.name || i.owner_id}</td>
                                        <td>{i.date}</td>
                                        <td>
                                            <button onClick={() => onEdit(i)} className="bg-blue-600 text-white px-3 py-1 rounded">{t('edit') || 'Edit'}</button>
                                            <button onClick={() => onDelete(i.id)} className="bg-red-600 text-white px-3 py-1 rounded ml-2">{t('remove') || 'Remove'}</button>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>

                    {/* Pagination controls */}
                    <div className="flex items-center justify-between mt-3">
                        <div className="text-sm text-gray-600">
                            {(() => {
                                const filtered = ownerFilter ? incomes.filter(i => String(i.owner_id) === String(ownerFilter)) : incomes;
                                const total = filtered.length;
                                const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
                                const to = Math.min(page * pageSize, total);
                                return `${from}-${to} / ${total}`;
                            })()}
                        </div>
                        <div>
                            <button className="px-3 py-1 border rounded mr-2" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page===1}>{t('prev') || 'Prev'}</button>
                            <button className="px-3 py-1 border rounded" onClick={() => setPage(p => p + 1)} disabled={(page)*pageSize >= (ownerFilter ? incomes.filter(i => String(i.owner_id) === String(ownerFilter)).length : incomes.length)}>{t('next') || 'Next'}</button>
                        </div>
                    </div>

                    {/* Add Modal */}
                    <Modal open={showAddModal} onClose={() => setShowAddModal(false)} ariaLabel="add-income">
                        <h4 className="text-lg font-semibold">{t('addIncome') || 'Add Income'}</h4>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <label className="flex flex-col">
                                <span className="text-sm text-gray-600">{t('amount') || 'Amount'}</span>
                                <input className="border rounded p-2" placeholder={t('amount') || 'Amount'} type="number" step="0.01" value={form.amount} onChange={e => onChange('amount', e.target.value)} />
                            </label>
                            <label className="flex flex-col">
                                <span className="text-sm text-gray-600">{t('owner') || 'Owner'}</span>
                                <select className="border rounded p-2" value={form.owner_id} onChange={e => onChange('owner_id', e.target.value)}>
                                    <option value="">{t('selectOwner') || 'Select owner'}</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </label>
                            <label className="flex flex-col">
                                <span className="text-sm text-gray-600">{t('date') || 'Date'}</span>
                                <input className="border rounded p-2" type="date" value={form.date} onChange={e => onChange('date', e.target.value)} />
                            </label>
                        </div>
                        <div className="mt-4 text-right">
                            <button onClick={() => { setShowAddModal(false); setEditing(null); }} className="px-3 py-2 rounded mr-2">{t('cancel') || 'Cancel'}</button>
                            <button onClick={editing ? onSaveEdit : onAddIncome} className="bg-blue-600 text-white px-4 py-2 rounded">{t('save') || 'Save'}</button>
                        </div>
                    </Modal>

                    {/* Edit Modal */}
                    <Modal open={showEditModal && !!editing} onClose={() => { setShowEditModal(false); setEditing(null); }} ariaLabel="edit-income">
                        <h4 className="text-lg font-semibold">{t('editIncome') || 'Edit Income'}</h4>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <label className="flex flex-col">
                                <span className="text-sm text-gray-600">{t('amount') || 'Amount'}</span>
                                <input className="border rounded p-2" type="number" step="0.01" value={form.amount} onChange={e => onChange('amount', e.target.value)} />
                            </label>
                            <label className="flex flex-col">
                                <span className="text-sm text-gray-600">{t('owner') || 'Owner'}</span>
                                <select className="border rounded p-2" value={form.owner_id} onChange={e => onChange('owner_id', e.target.value)}>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </label>
                            <label className="flex flex-col">
                                <span className="text-sm text-gray-600">{t('date') || 'Date'}</span>
                                <input className="border rounded p-2" type="date" value={form.date} onChange={e => onChange('date', e.target.value)} />
                            </label>
                        </div>
                        <div className="mt-4 text-right">
                            <button onClick={() => { setShowEditModal(false); setEditing(null); }} className="px-3 py-2 rounded mr-2">{t('cancel') || 'Cancel'}</button>
                            <button onClick={onSaveEdit} className="bg-blue-600 text-white px-4 py-2 rounded">{t('save') || 'Save'}</button>
                        </div>
                    </Modal>

                    {/* Delete Modal */}
                    <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setToDeleteId(null); }} ariaLabel="confirm-remove">
                        <h4 className="text-lg font-semibold">{t('confirmRemoveTitle') || 'Confirm remove'}</h4>
                        <p className="mt-2">{t('confirmRemoveMessage') || 'Are you sure you want to remove this income?'}</p>
                        <div className="mt-4 text-right">
                            <button onClick={() => { setShowDeleteModal(false); setToDeleteId(null); }} className="bg-blue-600 text-white px-3 py-2 rounded">{t('cancel') || 'Cancel'}</button>
                            <button onClick={() => confirmDelete()} className="bg-red-600 text-white px-3 py-2 rounded ml-2" disabled={deleting}>
                                {deleting ? <span className="flex items-center"><Spinner size={14} /> <span className="ml-2">{t('removing') || 'Removing...'}</span></span> : (t('remove') || 'Remove')}
                            </button>
                        </div>
                    </Modal>

                    {/* Toast */}
                    {toast && (
                        <div className={`fixed top-4 right-4 p-3 rounded ${toast.type==='error'? 'bg-red-500 text-white':'bg-green-600 text-white'}`}>
                            {toast.text}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IncomesPage;
