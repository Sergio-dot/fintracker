import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from '../i18n';

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const Filters = ({ month, setMonth, person, setPerson, users }) => {
    const { t } = useTranslation();
    const [openMonth, setOpenMonth] = useState(false);
    const [openPerson, setOpenPerson] = useState(false);
    const monthRef = useRef(null);
    const personRef = useRef(null);

    useEffect(() => {
        function onDocumentClick(e) {
            if (monthRef.current && !monthRef.current.contains(e.target)) {
                setOpenMonth(false);
            }
            if (personRef.current && !personRef.current.contains(e.target)) {
                setOpenPerson(false);
            }
        }

        function onEscape(e) {
            if (e.key === 'Escape') {
                setOpenMonth(false);
                setOpenPerson(false);
            }
        }

        document.addEventListener('mousedown', onDocumentClick);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onDocumentClick);
            document.removeEventListener('keydown', onEscape);
        };
    }, []);

    const selectedMonthLabel = monthNames[(Number(month) || 1) - 1] || t('month');
    const selectedPersonLabel = person === 'all' ? t('all') : (users.find(u => u.id.toString() === person)?.name || t('person'));

    return (
        <div className="mb-5 flex items-center justify-center gap-4">
            {/* Month dropdown */}
            <div className="relative inline-block text-left" ref={monthRef}>
                <button
                    type="button"
                    onClick={() => setOpenMonth(s => !s)}
                    className="inline-flex items-center gap-x-2 rounded-md bg-white text-black dark:bg-gray-800 dark:text-white px-3 py-2 text-sm font-semibold ring-1 ring-gray-200 dark:ring-white/5 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-haspopup="true"
                    aria-expanded={openMonth}
                >
                    <span className="text-sm text-black dark:text-white">{selectedMonthLabel}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400">
                        <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                    </svg>
                </button>

                {openMonth && (
                    <div className="absolute left-1/2 mt-2 w-56 transform -translate-x-1/2 origin-top rounded-md bg-white text-black dark:bg-gray-800 dark:text-white outline-1 -outline-offset-1 outline-gray-200 dark:outline-white/10 shadow-lg ring-1 ring-black/10 z-10">
                        <div className="py-1">
                            {monthNames.map((name, index) => (
                                <button
                                    key={index}
                                    onClick={() => { setMonth(index + 1); setOpenMonth(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Person dropdown */}
            <div className="relative inline-block text-left" ref={personRef}>
                <button
                    type="button"
                    onClick={() => setOpenPerson(s => !s)}
                    className="inline-flex items-center gap-x-2 rounded-md bg-white text-black dark:bg-gray-800 dark:text-white px-3 py-2 text-sm font-semibold ring-1 ring-gray-200 dark:ring-white/5 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-haspopup="true"
                    aria-expanded={openPerson}
                >
                    <span className="text-sm text-black dark:text-white">{selectedPersonLabel}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400">
                        <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                    </svg>
                </button>

                {openPerson && (
                    <div className="absolute left-1/2 mt-2 w-56 transform -translate-x-1/2 origin-top rounded-md bg-white text-black dark:bg-gray-800 dark:text-white outline-1 -outline-offset-1 outline-gray-200 dark:outline-white/10 shadow-lg ring-1 ring-black/10 z-10">
                        <div className="py-1">
                            <button
                                key="all"
                                onClick={() => { setPerson('all'); setOpenPerson(false); }}
                                className="block w-full text-left px-4 py-2 text-sm text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                            >
                                {t('all')}
                            </button>
                            {users.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => { setPerson(u.id.toString()); setOpenPerson(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                                >
                                    {u.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Filters;
