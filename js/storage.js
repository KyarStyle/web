// ===== Storage Management =====
const Storage = {
    // Obtener datos de localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al obtener datos:', error);
            return null;
        }
    },

    // Guardar datos en localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error);
            return false;
        }
    },

    // Eliminar datos
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error al eliminar datos:', error);
            return false;
        }
    },

    // Limpiar todo
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error al limpiar datos:', error);
            return false;
        }
    }
};

// ===== Data Manager =====
const DataManager = {
    // Obtener todos los ingresos
    getIncomes() {
        return Storage.get('incomes') || [];
    },

    // Guardar ingresos
    saveIncomes(incomes) {
        return Storage.set('incomes', incomes);
    },

    // Agregar ingreso
    addIncome(income) {
        const incomes = this.getIncomes();
        income.id = Date.now().toString();
        income.type = 'income';
        incomes.push(income);
        return this.saveIncomes(incomes);
    },

    // Actualizar ingreso
    updateIncome(id, updatedIncome) {
        const incomes = this.getIncomes();
        const index = incomes.findIndex(inc => inc.id === id);
        if (index !== -1) {
            incomes[index] = { ...incomes[index], ...updatedIncome };
            return this.saveIncomes(incomes);
        }
        return false;
    },

    // Eliminar ingreso
    deleteIncome(id) {
        const incomes = this.getIncomes();
        const filtered = incomes.filter(inc => inc.id !== id);
        return this.saveIncomes(filtered);
    },

    // Obtener todos los egresos
    getExpenses() {
        return Storage.get('expenses') || [];
    },

    // Guardar egresos
    saveExpenses(expenses) {
        return Storage.set('expenses', expenses);
    },

    // Agregar egreso
    addExpense(expense) {
        const expenses = this.getExpenses();
        expense.id = Date.now().toString();
        expense.type = 'expense';
        expenses.push(expense);
        return this.saveExpenses(expenses);
    },

    // Actualizar egreso
    updateExpense(id, updatedExpense) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(exp => exp.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updatedExpense };
            return this.saveExpenses(expenses);
        }
        return false;
    },

    // Eliminar egreso
    deleteExpense(id) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(exp => exp.id !== id);
        return this.saveExpenses(filtered);
    },

    // Obtener todas las transacciones
    getAllTransactions() {
        const incomes = this.getIncomes();
        const expenses = this.getExpenses();
        return [...incomes, ...expenses].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
    },

    // Calcular totales
    calculateTotals(dateFrom = null, dateTo = null) {
        let incomes = this.getIncomes();
        let expenses = this.getExpenses();

        // Filtrar por fechas si se proporcionan
        if (dateFrom) {
            incomes = incomes.filter(inc => new Date(inc.date) >= new Date(dateFrom));
            expenses = expenses.filter(exp => new Date(exp.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            incomes = incomes.filter(inc => new Date(inc.date) <= new Date(dateTo));
            expenses = expenses.filter(exp => new Date(exp.date) <= new Date(dateTo));
        }

        const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
        const totalExpense = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const balance = totalIncome - totalExpense;

        return { totalIncome, totalExpense, balance };
    },

    // Obtener datos por categoría
    getByCategory() {
        const incomes = this.getIncomes();
        const expenses = this.getExpenses();

        const incomesByCategory = {};
        const expensesByCategory = {};

        incomes.forEach(inc => {
            if (!incomesByCategory[inc.category]) {
                incomesByCategory[inc.category] = 0;
            }
            incomesByCategory[inc.category] += parseFloat(inc.amount);
        });

        expenses.forEach(exp => {
            if (!expensesByCategory[exp.category]) {
                expensesByCategory[exp.category] = 0;
            }
            expensesByCategory[exp.category] += parseFloat(exp.amount);
        });

        return { incomesByCategory, expensesByCategory };
    },

    // Obtener datos mensuales
    getMonthlyData(year, month) {
        const incomes = this.getIncomes();
        const expenses = this.getExpenses();

        const filteredIncomes = incomes.filter(inc => {
            const date = new Date(inc.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });

        const filteredExpenses = expenses.filter(exp => {
            const date = new Date(exp.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });

        return { incomes: filteredIncomes, expenses: filteredExpenses };
    },

    // Exportar datos
    exportData() {
        return {
            incomes: this.getIncomes(),
            expenses: this.getExpenses(),
            exportDate: new Date().toISOString()
        };
    },

    // Importar datos
    importData(data) {
        try {
            if (data.incomes) {
                this.saveIncomes(data.incomes);
            }
            if (data.expenses) {
                this.saveExpenses(data.expenses);
            }
            return true;
        } catch (error) {
            console.error('Error al importar datos:', error);
            return false;
        }
    },

    // Limpiar todos los datos
    clearAllData() {
        this.saveIncomes([]);
        this.saveExpenses([]);
        return true;
    }
};

// ===== Settings Manager =====
const SettingsManager = {
    getTheme() {
        return Storage.get('theme') || 'light';
    },

    setTheme(theme) {
        return Storage.set('theme', theme);
    },

    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }
};