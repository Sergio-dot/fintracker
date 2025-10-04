import React, { useEffect, useState } from 'react';
import { getExpenses, getUsers, updateExpense } from '../api/api';
import './ui.css';
import { useTranslation } from '../i18n';
import Modal from './Modal';
import Spinner from './Spinner';

const ExpensesPage = () => {
    const { t } = useTranslation();
    const [expenses, setExpenses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
        const [form, setForm] = useState({ amount: '', category: '', owner_id: '', date: '', is_common: false });
        const [showEditModal, setShowEditModal] = useState(false);
        const [showDeleteModal, setShowDeleteModal] = useState(false);
        const [toDeleteId, setToDeleteId] = useState(null);
        const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const ex = await getExpenses();
            const us = await getUsers();
            setExpenses(ex || []);
            setUsers(us || []);
            setLoading(false);
        };
        fetch();
    }, []);

    const onEdit = (e) => {
            setEditing(e);
            setForm({ amount: e.amount, category: e.category, owner_id: e.owner_id, date: e.date, is_common: !!e.is_common });
            setShowEditModal(true);
    };

    const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const onSave = async () => {
        if (!editing) return; // nothing to save when not editing
        // simple validation
        if (!form.amount || Number(form.amount) <= 0) { setToast({ type: 'error', text: t('validationAmount') || 'Amount must be > 0' }); return; }
        if (!form.owner_id) { setToast({ type: 'error', text: t('validationOwner') || 'Select owner' }); return; }
        if (!form.date) { setToast({ type: 'error', text: t('validationDate') || 'Select date' }); return; }
        const payload = { amount: Number(form.amount), category: form.category, owner_id: Number(form.owner_id), date: form.date, is_common: !!form.is_common };
        try {
            await updateExpense(editing.id, payload);
            const ex = await getExpenses();
            setExpenses(ex || []);
            setEditing(null);
            setForm({ amount: '', category: '', owner_id: '', date: '', is_common: false });
            setShowEditModal(false);
            setToast({ type: 'success', text: t('savedSuccesfully') || 'Saved' });
            setTimeout(() => setToast(null), 2500);
        } catch (err) {
            setToast({ type: 'error', text: t('saveFailed') || 'Save failed' });
        }
    };

    const onDelete = async (id) => {
            // open confirmation modal
            setToDeleteId(id);
            setShowDeleteModal(true);
    };

    return (
        <div className="card">
            {loading ? <div className="p-4 flex items-center"><Spinner size={20} /> <span className="ml-2">{t('loading') || 'Loading'}</span></div> : (
                <div>
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>{t('category') || 'Category'}</th>
                                <th>{t('amount') || 'Amount'}</th>
                                <th>{t('owner') || 'Owner'}</th>
                                <th>{t('date') || 'Date'}</th>
                                <th>{t('commonExpense') || 'Common'}</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(e => (
                                <tr key={e.id}>
                                    <td>{e.id}</td>
                                    <td>{e.category}</td>
                                    <td>{(e.amount || 0).toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</td>
                                    <td>{users.find(u => u.id === e.owner_id)?.name || e.owner_id}</td>
                                    <td>{e.date}</td>
                                    <td>{e.is_common ? 'Yes' : 'No'}</td>
                                    <td>
                                        <button onClick={() => onEdit(e)} className="bg-blue-600 text-white px-3 py-1 rounded">{t('edit') || 'Modifica'}</button>
                                        <button onClick={() => onDelete(e.id)} className="bg-red-600 text-white px-3 py-1 rounded ml-2">{t('remove') || 'Rimuovi'}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Edit modal - use Modal component */}
                    <Modal open={showEditModal && !!editing} onClose={() => { setShowEditModal(false); setEditing(null); }} ariaLabel="edit-expense">
                        <h4 className="text-lg font-semibold">{t('editExpense') || 'Edit expense'}</h4>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <label className="flex flex-col"><span className="text-sm text-gray-600">{t('amount') || 'Amount'}</span><input className="border rounded p-2" placeholder={t('amount') || 'Amount'} value={form.amount} onChange={e=>onChange('amount', e.target.value)} /></label>
                            <label className="flex flex-col"><span className="text-sm text-gray-600">{t('category') || 'Category'}</span><input className="border rounded p-2" placeholder={t('category') || 'Category'} value={form.category} onChange={e=>onChange('category', e.target.value)} /></label>
                            <label className="flex flex-col"><span className="text-sm text-gray-600">{t('owner') || 'Owner'}</span><select className="border rounded p-2" value={form.owner_id} onChange={e=>onChange('owner_id', e.target.value)}><option value="">{t('selectOwner') || 'Select owner'}</option>{users.map(u=> <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
                            <label className="flex flex-col"><span className="text-sm text-gray-600">{t('date') || 'Date'}</span><input className="border rounded p-2" type="date" value={form.date} onChange={e=>onChange('date', e.target.value)} /></label>
                            <label className="flex items-center col-span-2"><input type="checkbox" checked={form.is_common} onChange={e=>onChange('is_common', e.target.checked)} className="mr-2" />{t('commonExpense') || 'Common'}</label>
                        </div>
                        <div className="mt-4 text-right">
                            <button onClick={() => { setShowEditModal(false); setEditing(null); }} className="px-3 py-2 rounded mr-2">{t('cancel') || 'Cancel'}</button>
                            <button onClick={onSave} className="bg-blue-600 text-white px-4 py-2 rounded">{t('save') || 'Save'}</button>
                        </div>
                    </Modal>

                    {/* Delete confirmation modal - using Modal */}
                    <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setToDeleteId(null); }} ariaLabel="confirm-remove">
                        <h4 className="text-lg font-semibold">{t('confirmRemoveTitle') || 'Confirm remove'}</h4>
                        <p className="mt-2">{t('confirmRemoveMessage') || 'Are you sure you want to remove this expense?'}</p>
                        <div className="mt-4 text-right">
                            <button onClick={() => { setShowDeleteModal(false); setToDeleteId(null); }} className="bg-blue-600 text-white px-3 py-2 rounded">{t('cancel') || 'Cancel'}</button>
                            <button onClick={async () => { await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8000'}/expenses/${toDeleteId}`, { method: 'DELETE' }); setShowDeleteModal(false); setToDeleteId(null); const ex = await getExpenses(); setExpenses(ex || []); }} className="bg-red-600 text-white px-3 py-2 rounded ml-2">{t('remove') || 'Rimuovi'}</button>
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

export default ExpensesPage;
