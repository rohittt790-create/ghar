import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlyReportData } from '../types/index.js';
import { formatCurrency, formatDate } from './formatters.js';

export const exportMonthlyReportToPdf = (reportData: MonthlyReportData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const { reportMetadata, summary, categoryBreakdown, tasks } = reportData;

  // Header Banner
  doc.setFillColor(12, 64, 110); // Brand navy #0c406e
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('KAILASH BHAWAN – Construction Monthly Report', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 245);
  const targetName = reportMetadata.propertyInfo
    ? `Site: ${reportMetadata.propertyInfo.name} (${reportMetadata.propertyInfo.propertyId})`
    : reportMetadata.ownerInfo
    ? `Owner: ${reportMetadata.ownerInfo.name}`
    : 'All Properties & Sites';
  doc.text(`${reportMetadata.monthName} ${reportMetadata.year} | ${targetName}`, 14, 20);

  // Report metadata details
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on: ${formatDate(new Date(), 'PPpp')} | Filter: Category [${reportMetadata.filterCategory}]`,
    14,
    34
  );

  // 1. Executive Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Project Performance & Key Metrics', 14, 42);

  const summaryRows = [
    [
      'Total Tasks Scheduled',
      String(summary.totalTasks),
      'Overall Completion',
      `${summary.progressPercentage}%`,
    ],
    [
      'Completed Tasks',
      String(summary.completedTasks),
      'In Progress Tasks',
      String(summary.inProgressTasks),
    ],
    [
      'Overdue Tasks',
      String(summary.overdueTasks),
      'Not Started / On Hold',
      `${summary.notStartedTasks} / ${summary.onHoldTasks}`,
    ],
    [
      'Estimated Budget',
      formatCurrency(summary.totalEstimatedCost),
      'Actual Expenses Spent',
      formatCurrency(summary.totalActualCost),
    ],
    [
      'Cost Variance',
      summary.costVariance <= 0
        ? `-${formatCurrency(Math.abs(summary.costVariance))} (Under Budget)`
        : `+${formatCurrency(summary.costVariance)} (Over Budget)`,
      'Budget Health Status',
      summary.budgetHealth,
    ],
  ];

  autoTable(doc, {
    startY: 46,
    theme: 'grid',
    head: [
      ['Metric', 'Value', 'Metric', 'Value'],
    ],
    body: summaryRows,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // 2. Trade Category Breakdown Table
  let currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Trade Category & Financial Breakdown', 14, currentY);

  const categoryRows = categoryBreakdown.map((c) => [
    c.category,
    `${c.completed} / ${c.total}`,
    `${c.progress}%`,
    formatCurrency(c.estimatedCost),
    formatCurrency(c.actualCost),
    c.variance <= 0
      ? `-${formatCurrency(Math.abs(c.variance))}`
      : `+${formatCurrency(c.variance)}`,
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    theme: 'striped',
    head: [
      ['Trade Category', 'Tasks (Done/Total)', 'Progress', 'Estimated Cost', 'Actual Cost', 'Variance'],
    ],
    body: categoryRows,
    headStyles: {
      fillColor: [12, 143, 233], // Brand blue #0c8fe9
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
  });

  // 3. Task Activity Log
  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Construction Tasks Record', 14, currentY);

  const taskRows = tasks.map((t) => {
    const propName = (t.property as any)?.name || 'Site';
    return [
      t.taskName,
      propName,
      t.category,
      t.assignedWorker,
      formatDate(t.dueDate),
      t.status.replace('_', ' ').toUpperCase(),
      formatCurrency(t.actualCost || 0),
    ];
  });

  autoTable(doc, {
    startY: currentY + 4,
    theme: 'grid',
    head: [
      ['Task Name', 'Property Site', 'Category', 'Assigned Contractor', 'Due Date', 'Status', 'Actual Cost'],
    ],
    body: taskRows,
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Save PDF
  doc.save(`KAILASH_BHAWAN_Monthly_Report_${reportMetadata.year}_${String(reportMetadata.month).padStart(2, '0')}.pdf`);
};
