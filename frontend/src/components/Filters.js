import React from "react";
import { useTranslation } from '../i18n';

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const Filters = ({ month, setMonth, person, setPerson, users }) => {
    const { t } = useTranslation();
    return (
        <div style={{ marginBottom: "20px" }}>
            <label>
                {t('month')}: {" "}
                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                >
                    {monthNames.map((name, index) => (
                        <option key={index} value={(index + 1).toString()}>
                            {name}
                        </option>
                    ))}
                </select>
            </label>

            <label style={{ marginLeft: "20px" }}>
                {t('person')}: {" "}
                <select
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                >
                    <option value="all">{t('all')}</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id.toString()}>
                            {u.name}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
};

export default Filters;
