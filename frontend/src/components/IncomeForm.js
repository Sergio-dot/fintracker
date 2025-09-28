import React, { useState, useEffect } from "react";
import { postIncome } from "../api/api";
import "./ui.css";
import { useTranslation } from '../i18n';

/**
 * IncomeForm
 * Props:
 * - users: array of user objects { id, name }
 * - onAdded: callback invoked after a new income is added
 */
const IncomeForm = ({ users, onAdded }) => {
    const [amount, setAmount] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const { t } = useTranslation();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        try {
            await postIncome({ amount: Number(amount), owner_id: Number(ownerId), date });
            setAmount("");
            setSuccess(t('incomeAdded'));
            if (onAdded) onAdded();
            setTimeout(() => setSuccess(""), 2500);
        } catch (err) {
            console.error(err);
            alert("Error adding income: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    // Ensure ownerId defaults to first user when users list changes
    useEffect(() => {
        if ((!ownerId || ownerId === "") && users && users.length > 0) {
            setOwnerId(users[0].id);
        }
    }, [users, ownerId]);

    return (
        <div>
            <form onSubmit={submit}>
                <div style={{ marginBottom: 8 }}>
                    <label>
                        Amount
                        <input className="form-input" placeholder="e.g. 100.00" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" required />
                    </label>
                </div>

                <div className="form-row">
                    <div className="form-col">
                        <label>
                            User
                            <select className="form-input" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} required disabled={!users || users.length === 0}>
                                {(users || []).map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div style={{ width: 150 }}>
                        <label>
                            Date
                            <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Adding..." : "Add Income"}</button>
                    {success && <span className="muted">{success}</span>}
                </div>
            </form>
        </div>
    );
};

export default IncomeForm;
