// ===== Export Manager =====
const ExportManager = {
    // Exportar a PDF
    exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Obtener datos
        const totals = DataManager.calculateTotals();
        const incomes = DataManager.getIncomes();
        const expenses = DataManager.getExpenses();
        const { incomesByCategory, expensesByCategory } = DataManager.getByCategory();

        // Configuración
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Título
        doc.setFontSize(20);
        doc.setTextColor(30, 58, 138);
        doc.text('Reporte Financiero', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 15;

        // Resumen financiero
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text('Resumen Financiero', 14, yPos);
        yPos += 10;

        // Tabla de resumen
        doc.autoTable({
            startY: yPos,
            head: [['Concepto', 'Monto']],
            body: [
                ['Total Ingresos', `${totals.totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`],
                ['Total Egresos', `${totals.totalExpense.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`],
                ['Balance', `${totals.balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138] },
            margin: { left: 14, right: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Ingresos por categoría
        if (Object.keys(incomesByCategory).length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(30, 58, 138);
            doc.text('Ingresos por Categoría', 14, yPos);
            yPos += 5;

            const incomeCategoryData = Object.entries(incomesByCategory).map(([cat, amount]) => [
                cat,
                `${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['Categoría', 'Monto']],
                body: incomeCategoryData,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Egresos por categoría
        if (Object.keys(expensesByCategory).length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(30, 58, 138);
            doc.text('Egresos por Categoría', 14, yPos);
            yPos += 5;

            const expenseCategoryData = Object.entries(expensesByCategory).map(([cat, amount]) => [
                cat,
                `${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['Categoría', 'Monto']],
                body: expenseCategoryData,
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68] },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Nueva página para transacciones detalladas
        doc.addPage();
        yPos = 20;

        // Detalle de Ingresos
        if (incomes.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(30, 58, 138);
            doc.text('Detalle de Ingresos', 14, yPos);
            yPos += 5;

            const incomeData = incomes.map(inc => [
                new Date(inc.date).toLocaleDateString('es-PE'),
                inc.description,
                inc.category,
                `${parseFloat(inc.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
                body: incomeData,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Detalle de Egresos
        if (expenses.length > 0) {
            // Verificar si necesitamos nueva página
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(30, 58, 138);
            doc.text('Detalle de Egresos', 14, yPos);
            yPos += 5;

            const expenseData = expenses.map(exp => [
                new Date(exp.date).toLocaleDateString('es-PE'),
                exp.description,
                exp.category,
                `${parseFloat(exp.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
                body: expenseData,
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68] },
                margin: { left: 14, right: 14 }
            });
        }

        // Guardar PDF
        doc.save(`Reporte_Financiero_${new Date().toISOString().split('T')[0]}.pdf`);
    },

    // Exportar a Excel (CSV)
    exportToExcel() {
        const incomes = DataManager.getIncomes();
        const expenses = DataManager.getExpenses();
        const totals = DataManager.calculateTotals();

        // Crear contenido CSV
        let csv = 'REPORTE FINANCIERO\n';
        csv += `Generado: ${new Date().toLocaleDateString('es-PE')}\n\n`;

        // Resumen
        csv += 'RESUMEN FINANCIERO\n';
        csv += 'Concepto,Monto\n';
        csv += `Total Ingresos,${totals.totalIncome.toFixed(2)}\n`;
        csv += `Total Egresos,${totals.totalExpense.toFixed(2)}\n`;
        csv += `Balance,${totals.balance.toFixed(2)}\n\n`;

        // Ingresos
        csv += 'INGRESOS\n';
        csv += 'Fecha,Descripción,Categoría,Monto\n';
        incomes.forEach(inc => {
            csv += `${inc.date},"${inc.description}",${inc.category},${parseFloat(inc.amount).toFixed(2)}\n`;
        });
        csv += '\n';

        // Egresos
        csv += 'EGRESOS\n';
        csv += 'Fecha,Descripción,Categoría,Monto\n';
        expenses.forEach(exp => {
            csv += `${exp.date},"${exp.description}",${exp.category},${parseFloat(exp.amount).toFixed(2)}\n`;
        });

        // Crear y descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `Reporte_Financiero_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Exportar respaldo de datos
    exportBackup() {
        const data = DataManager.exportData();
        const json = JSON.stringify(data, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `Backup_FinControl_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Importar respaldo
    importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const success = DataManager.importData(data);
                    if (success) {
                        resolve(true);
                    } else {
                        reject(new Error('Error al importar datos'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer archivo'));
            reader.readAsText(file);
        });
    }
};