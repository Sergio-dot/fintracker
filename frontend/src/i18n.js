import { useContext } from 'react';
import { SettingsContext } from './contexts/SettingsContext';

const MESSAGES = {
    en: {
        addIncome: 'Add Income',
        addExpense: 'Add Expense',
        filters: 'Filters',
        show: 'Show',
        hide: 'Hide',
        incomeVsExpenses: 'Income vs Expenses',
        expensesByCategory: 'Expenses by Category',
        totals: 'Totals',
        trend: 'Trend',
        month: 'Month',
        person: 'Person',
        all: 'All',
        commonExpense: 'Common expense (to split)',
        incomeAdded: 'Income added',
        expenseAdded: 'Expense added',
        summary: 'Summary',
        loadingSummary: 'Loading summary...',
        totalExpenses: 'Total Expenses',
        totalIncomes: 'Total Incomes',
        commonExpenses: 'Common Expenses',
    },
    it: {
        addIncome: 'Aggiungi reddito',
        addExpense: 'Aggiungi spesa',
        filters: 'Filtri',
        show: 'Mostra',
        hide: 'Nascondi',
        incomeVsExpenses: 'Redditi vs Spese',
        expensesByCategory: 'Spese per categoria',
        totals: 'Totali',
        trend: 'Andamento',
        month: 'Mese',
        person: 'Persona',
        all: 'Tutti',
        commonExpense: 'Spesa comune (da dividere)',
        incomeAdded: 'Reddito aggiunto',
        expenseAdded: 'Spesa aggiunta',
        summary: 'Riepilogo',
        loadingSummary: 'Caricamento riepilogo...',
        totalExpenses: 'Spese Totali',
        totalIncomes: 'Redditi Totali',
        commonExpenses: 'Spese Comuni',
    }
};

export const useTranslation = () => {
    const { lang } = useContext(SettingsContext);
    const messages = MESSAGES[lang] || MESSAGES.en;
    const t = (key) => messages[key] || key;
    return { t, lang };
};

export default useTranslation;
