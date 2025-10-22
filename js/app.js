// ===== Application Main =====
const App = {
    currentSection: 'dashboard',
    editingIncome: null,
    editingExpense: null,

    // Inicializar aplicación
    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.updateCurrentDate();
        this.loadDashboard();
        this.updateAllData();
    },

    // Cargar tema
    loadTheme() {
        const theme = SettingsManager.getTheme();
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            const icon = document.querySelector('#themeToggle i');
            if (icon) icon.className = 'fas fa-sun';
        }
    },

    // Configurar event listeners
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Menú móvil
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Tema
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        const toggleThemeBtn = document.getElementById('toggleTheme');
        if (toggleThemeBtn) {
            toggleThemeBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Filtros del dashboard
        const applyFilter = document.getElementById('applyFilter');
        if (applyFilter) {
            applyFilter.addEventListener('click', () => this.applyDateFilter());
        }

        const clearFilter = document.getElementById('clearFilter');
        if (clearFilter) {
            clearFilter.addEventListener('click', () => this.clearDateFilter());
        }

        // Ingresos
        const btnNewIncome = document.getElementById('btnNewIncome');
        if (btnNewIncome) {
            btnNewIncome.addEventListener('click', () => this.showIncomeForm());
        }

        const incomeForm = document.getElementById('incomeForm');
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => this.handleIncomeSubmit(e));
        }

        const cancelIncome = document.getElementById('cancelIncome');
        if (cancelIncome) {
            cancelIncome.addEventListener('click', () => this.hideIncomeForm());
        }

        // Egresos
        const btnNewExpense = document.getElementById('btnNewExpense');
        if (btnNewExpense) {
            btnNewExpense.addEventListener('click', () => this.showExpenseForm());
        }

        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        }

        const cancelExpense = document.getElementById('cancelExpense');
        if (cancelExpense) {
            cancelExpense.addEventListener('click', () => this.hideExpenseForm());
        }

        // Reportes
        const generateReport = document.getElementById('generateReport');
        if (generateReport) {
            generateReport.addEventListener('click', () => this.generateReport());
        }

        const exportPDF = document.getElementById('exportPDF');
        if (exportPDF) {
            exportPDF.addEventListener('click', () => {
                ExportManager.exportToPDF();
                this.showToast('Reporte PDF generado exitosamente', 'success');
            });
        }

        const exportExcel = document.getElementById('exportExcel');
        if (exportExcel) {
            exportExcel.addEventListener('click', () => {
                ExportManager.exportToExcel();
                this.showToast('Reporte Excel generado exitosamente', 'success');
            });
        }

        // Configuración
        const backupData = document.getElementById('backupData');
        if (backupData) {
            backupData.addEventListener('click', () => {
                ExportManager.exportBackup();
                this.showToast('Respaldo creado exitosamente', 'success');
            });
        }

        const restoreData = document.getElementById('restoreData');
        if (restoreData) {
            restoreData.addEventListener('click', () => this.restoreData());
        }

        const clearData = document.getElementById('clearData');
        if (clearData) {
            clearData.addEventListener('click', () => this.confirmClearData());
        }
    },

    // Navegación entre secciones
    navigateToSection(sectionId) {
        // Actualizar secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Actualizar navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Actualizar título
        const titles = {
            dashboard: 'Dashboard',
            ingresos: 'Gestión de Ingresos',
            egresos: 'Gestión de Egresos',
            reportes: 'Reportes y Análisis',
            configuracion: 'Configuración'
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionId] || 'Dashboard';
        }

        // Cargar datos de la sección
        this.loadSectionData(sectionId);
        this.currentSection = sectionId;

        // Cerrar sidebar en móvil
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    },

    // Cargar datos de sección
    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'ingresos':
                this.loadIncomesTable();
                break;
            case 'egresos':
                this.loadExpensesTable();
                break;
            case 'reportes':
                this.loadReports();
                break;
        }
    },

    // Actualizar fecha actual
    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('es-PE', options);
        }
    },

    // Actualizar todos los datos
    updateAllData() {
        this.updateDashboardCards();
        this.loadRecentTransactions();
    },

    // Cargar dashboard
    loadDashboard() {
        this.updateDashboardCards();
        this.loadRecentTransactions();
        ChartsManager.updateDashboardCharts();
    },

    // Actualizar tarjetas del dashboard
    updateDashboardCards() {
        const totals = DataManager.calculateTotals();
        
        const totalBalance = document.getElementById('totalBalance');
        const totalIncome = document.getElementById('totalIncome');
        const totalExpense = document.getElementById('totalExpense');

        if (totalBalance) {
            totalBalance.textContent = this.formatCurrency(totals.balance);
            totalBalance.style.color = totals.balance >= 0 ? '#10b981' : '#ef4444';
        }

        if (totalIncome) {
            totalIncome.textContent = this.formatCurrency(totals.totalIncome);
        }

        if (totalExpense) {
            totalExpense.textContent = this.formatCurrency(totals.totalExpense);
        }
    },

    // Cargar transacciones recientes
    loadRecentTransactions() {
        const transactions = DataManager.getAllTransactions().slice(0, 10);
        const container = document.getElementById('recentList');
        
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No hay transacciones</h3>
                    <p>Comienza agregando ingresos o egresos</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(trans => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${trans.type}">
                        <i class="fas fa-arrow-${trans.type === 'income' ? 'up' : 'down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${trans.description}</h4>
                        <p>${trans.category} • ${this.formatDate(trans.date)}</p>
                    </div>
                </div>
                <div class="transaction-amount ${trans.type}">
                    ${trans.type === 'income' ? '+' : '-'}${this.formatCurrency(trans.amount)}
                </div>
            </div>
        `).join('');
    },

    // Aplicar filtro de fechas
    applyDateFilter() {
        const dateFrom = document.getElementById('filterDateFrom').value;
        const dateTo = document.getElementById('filterDateTo').value;

        if (!dateFrom || !dateTo) {
            this.showToast('Por favor seleccione ambas fechas', 'warning');
            return;
        }

        if (new Date(dateFrom) > new Date(dateTo)) {
            this.showToast('La fecha inicial debe ser menor a la final', 'error');
            return;
        }

        ChartsManager.updateDashboardCharts(dateFrom, dateTo);
        this.updateDashboardCards();
        this.showToast('Filtro aplicado correctamente', 'success');
    },

    // Limpiar filtro
    clearDateFilter() {
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        ChartsManager.updateDashboardCharts();
        this.updateDashboardCards();
        this.showToast('Filtro eliminado', 'info');
    },

    // INGRESOS - Mostrar formulario
    showIncomeForm() {
        this.editingIncome = null;
        document.getElementById('incomeFormTitle').textContent = 'Agregar Ingreso';
        document.getElementById('incomeForm').reset();
        document.getElementById('incomeId').value = '';
        document.getElementById('incomeDate').valueAsDate = new Date();
        document.getElementById('incomeFormContainer').style.display = 'block';
        document.getElementById('incomeFormContainer').scrollIntoView({ behavior: 'smooth' });
    },

    // Ocultar formulario de ingresos
    hideIncomeForm() {
        document.getElementById('incomeFormContainer').style.display = 'none';
        document.getElementById('incomeForm').reset();
        this.editingIncome = null;
    },

    // Manejar envío de formulario de ingresos
    handleIncomeSubmit(e) {
        e.preventDefault();
        
        const income = {
            description: document.getElementById('incomeDescription').value.trim(),
            amount: document.getElementById('incomeAmount').value,
            date: document.getElementById('incomeDate').value,
            category: document.getElementById('incomeCategory').value
        };

        const incomeId = document.getElementById('incomeId').value;

        if (incomeId) {
            // Actualizar
            DataManager.updateIncome(incomeId, income);
            this.showToast('Ingreso actualizado exitosamente', 'success');
        } else {
            // Crear
            DataManager.addIncome(income);
            this.showToast('Ingreso agregado exitosamente', 'success');
        }

        this.hideIncomeForm();
        this.loadIncomesTable();
        this.updateAllData();
        ChartsManager.updateDashboardCharts();
    },

    // Cargar tabla de ingresos
    loadIncomesTable() {
        const incomes = DataManager.getIncomes();
        const tbody = document.getElementById('incomeTableBody');
        
        if (!tbody) return;

        if (incomes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem;">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <h3>No hay ingresos registrados</h3>
                            <p>Comienza agregando tu primer ingreso</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = incomes.sort((a, b) => new Date(b.date) - new Date(a.date)).map(income => `
            <tr>
                <td>${this.formatDate(income.date)}</td>
                <td>${income.description}</td>
                <td>${income.category}</td>
                <td style="color: #10b981; font-weight: 600;">${this.formatCurrency(income.amount)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="App.editIncome('${income.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="App.deleteIncome('${income.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Editar ingreso
    editIncome(id) {
        const incomes = DataManager.getIncomes();
        const income = incomes.find(inc => inc.id === id);
        
        if (!income) return;

        this.editingIncome = id;
        document.getElementById('incomeFormTitle').textContent = 'Editar Ingreso';
        document.getElementById('incomeId').value = id;
        document.getElementById('incomeDescription').value = income.description;
        document.getElementById('incomeAmount').value = income.amount;
        document.getElementById('incomeDate').value = income.date;
        document.getElementById('incomeCategory').value = income.category;
        document.getElementById('incomeFormContainer').style.display = 'block';
        document.getElementById('incomeFormContainer').scrollIntoView({ behavior: 'smooth' });
    },

    // Eliminar ingreso
    deleteIncome(id) {
        if (!confirm('¿Está seguro de eliminar este ingreso?')) return;

        DataManager.deleteIncome(id);
        this.showToast('Ingreso eliminado exitosamente', 'success');
        this.loadIncomesTable();
        this.updateAllData();
        ChartsManager.updateDashboardCharts();
    },

    // EGRESOS - Mostrar formulario
    showExpenseForm() {
        this.editingExpense = null;
        document.getElementById('expenseFormTitle').textContent = 'Agregar Egreso';
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseId').value = '';
        document.getElementById('expenseDate').valueAsDate = new Date();
        document.getElementById('expenseFormContainer').style.display = 'block';
        document.getElementById('expenseFormContainer').scrollIntoView({ behavior: 'smooth' });
    },

    // Ocultar formulario de egresos
    hideExpenseForm() {
        document.getElementById('expenseFormContainer').style.display = 'none';
        document.getElementById('expenseForm').reset();
        this.editingExpense = null;
    },

    // Manejar envío de formulario de egresos
    handleExpenseSubmit(e) {
        e.preventDefault();
        
        const expense = {
            description: document.getElementById('expenseDescription').value.trim(),
            amount: document.getElementById('expenseAmount').value,
            date: document.getElementById('expenseDate').value,
            category: document.getElementById('expenseCategory').value
        };

        const expenseId = document.getElementById('expenseId').value;

        if (expenseId) {
            // Actualizar
            DataManager.updateExpense(expenseId, expense);
            this.showToast('Egreso actualizado exitosamente', 'success');
        } else {
            // Crear
            DataManager.addExpense(expense);
            this.showToast('Egreso agregado exitosamente', 'success');
        }

        this.hideExpenseForm();
        this.loadExpensesTable();
        this.updateAllData();
        ChartsManager.updateDashboardCharts();
    },

    // Cargar tabla de egresos
    loadExpensesTable() {
        const expenses = DataManager.getExpenses();
        const tbody = document.getElementById('expenseTableBody');
        
        if (!tbody) return;

        if (expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem;">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <h3>No hay egresos registrados</h3>
                            <p>Comienza agregando tu primer egreso</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => `
            <tr>
                <td>${this.formatDate(expense.date)}</td>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td style="color: #ef4444; font-weight: 600;">${this.formatCurrency(expense.amount)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="App.editExpense('${expense.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="App.deleteExpense('${expense.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Editar egreso
    editExpense(id) {
        const expenses = DataManager.getExpenses();
        const expense = expenses.find(exp => exp.id === id);
        
        if (!expense) return;

        this.editingExpense = id;
        document.getElementById('expenseFormTitle').textContent = 'Editar Egreso';
        document.getElementById('expenseId').value = id;
        document.getElementById('expenseDescription').value = expense.description;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseFormContainer').style.display = 'block';
        document.getElementById('expenseFormContainer').scrollIntoView({ behavior: 'smooth' });
    },

    // Eliminar egreso
    deleteExpense(id) {
        if (!confirm('¿Está seguro de eliminar este egreso?')) return;

        DataManager.deleteExpense(id);
        this.showToast('Egreso eliminado exitosamente', 'success');
        this.loadExpensesTable();
        this.updateAllData();
        ChartsManager.updateDashboardCharts();
    },

    // Cargar reportes
    loadReports() {
        const now = new Date();
        const reportMonth = document.getElementById('reportMonth');
        if (reportMonth && !reportMonth.value) {
            reportMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        this.generateReport();
    },

    // Generar reporte
    generateReport() {
        const reportType = document.getElementById('reportType').value;
        const totals = DataManager.calculateTotals();
        const { incomesByCategory, expensesByCategory } = DataManager.getByCategory();
        
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;

        let html = `
            <div class="report-stats">
                <div class="report-stat">
                    <h4>Total Ingresos</h4>
                    <p style="color: #10b981;">${this.formatCurrency(totals.totalIncome)}</p>
                </div>
                <div class="report-stat">
                    <h4>Total Egresos</h4>
                    <p style="color: #ef4444;">${this.formatCurrency(totals.totalExpense)}</p>
                </div>
                <div class="report-stat">
                    <h4>Balance</h4>
                    <p style="color: ${totals.balance >= 0 ? '#10b981' : '#ef4444'};">${this.formatCurrency(totals.balance)}</p>
                </div>
            </div>
        `;

        reportContent.innerHTML = html;
        ChartsManager.updateReportCharts();
        this.showToast('Reporte generado exitosamente', 'success');
    },

    // Cambiar tema
    toggleTheme() {
        const newTheme = SettingsManager.toggleTheme();
        document.body.classList.toggle('dark-theme');
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        this.showToast(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    },

    // Restaurar datos
    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                await ExportManager.importBackup(file);
                this.showToast('Datos restaurados exitosamente', 'success');
                this.updateAllData();
                this.loadSectionData(this.currentSection);
                ChartsManager.updateDashboardCharts();
            } catch (error) {
                this.showToast('Error al restaurar datos: ' + error.message, 'error');
            }
        };
        
        input.click();
    },

    // Confirmar limpieza de datos
    confirmClearData() {
        if (!confirm('¿Está seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.')) return;
        
        if (!confirm('Esta es su última advertencia. ¿Realmente desea eliminar todos los datos?')) return;

        DataManager.clearAllData();
        this.showToast('Todos los datos han sido eliminados', 'warning');
        this.updateAllData();
        this.loadSectionData(this.currentSection);
        ChartsManager.updateDashboardCharts();
    },

    // Formatear moneda
     formatCurrency(amount) {
        const value = parseFloat(amount) || 0;
        return value.toLocaleString('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },


    // Formatear fecha
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Mostrar notificación toast
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exponer App globalmente para funciones onclick
window.App = App;