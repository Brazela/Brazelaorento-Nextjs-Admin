import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function getTimestamp() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export function exportUsersToPDF(data: any[], type: 'user' | 'product' = 'user') {
  const doc = new jsPDF();
  const timestamp = getTimestamp();
  const columns = type === 'user'
    ? [
        { header: 'Username', dataKey: 'username' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Permission', dataKey: 'permission' },
      ]
    : [
        { header: 'Product Name', dataKey: 'product_name' },
        { header: 'Price', dataKey: 'price' },
        { header: 'Category', dataKey: 'category_name' },
        { header: 'Uploaded Date', dataKey: 'uploaded_date' },
      ];
  // Build body as array of arrays for autoTable
  let body;
  if (data.length === 0) {
    body = [
      type === 'user'
        ? ['No users found', '', '']
        : ['No products found', '', '', '']
    ];
  } else {
    body = data.map((item: any) => {
      if (type === 'user') {
        return [
          item.username ?? '',
          item.email ?? '',
          item.permission ?? '',
        ];
      } else {
        return [
          item.product_name ?? '',
          item.price !== undefined && item.price !== null ? `$${Number(item.price).toFixed(2)}` : '',
          item.category_name ?? '',
          item.uploaded_date ?? '',
        ];
      }
    });
  }
  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 184, 217);
  doc.text(type === 'user' ? 'Brazelaorento User List' : 'Brazelaorento Product List', 14, 18);
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body,
    styles: { fontSize: 10, cellPadding: 3, lineWidth: 0.2, lineColor: [180, 180, 180] },
    headStyles: { fillColor: [0, 184, 217], textColor: 255, fontStyle: 'bold' },
    margin: { top: 28 },
    startY: 28,
    theme: 'grid',
    pageBreak: 'auto',
  });
  // Add timestamp
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const timeStr = `Generated on: ${now.toLocaleString()} (${tz})`;
  const finalY = (doc as any).lastAutoTable.finalY || 30;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(timeStr, 14, finalY + 10);
  doc.save(`${type === 'user' ? 'users' : 'products'}_${timestamp}_Brazelaorento.pdf`);
}

export function exportUsersToExcel(data: any[], type: 'user' | 'product' = 'user') {
  const timestamp = getTimestamp();
  let wsData;
  if (type === 'user') {
    wsData = [
      ['Brazelaorento User List'],
      ['Username', 'Email', 'Permission'],
      ...(Array.isArray(data) && data.length === 0
        ? [['No users found', '', '']]
        : Array.isArray(data) ? data.map((item: any) => [item.username, item.email, item.permission]) : [])
    ];
  } else {
    wsData = [
      ['Brazelaorento Product List'],
      ['Product Name', 'Price', 'Category', 'Uploaded Date'],
      ...(Array.isArray(data) && data.length === 0
        ? [['No products found', '', '', '']]
        : Array.isArray(data) ? data.map((item: any) => [
            item.product_name ?? '',
            item.price !== undefined && item.price !== null ? `$${Number(item.price).toFixed(2)}` : '',
            item.category_name ?? '',
            item.uploaded_date ?? ''
          ]) : [])
    ];
  }
  // Add timestamp row
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  wsData.push([`Generated on: ${now.toLocaleString()} (${tz})`]);
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // Style: merge title row
  if (ws['!merges'] === undefined) ws['!merges'] = [];
  ws['!merges'].push({ s: { r:0, c:0 }, e: { r:0, c: (type==='user'?2:3) } });
  // Style: set column widths (ColInfo objects)
  ws['!cols'] = (type==='user' 
    ? [{ wch: 20 }, { wch: 30 }, { wch: 15 }]
    : [{ wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 22 }]);
  // Add beautiful styles: header bg color, border, font
  const range = XLSX.utils.decode_range(ws['!ref']!);
  // Title row style
  for (let C = 0; C <= range.e.c; ++C) {
    const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cell_address]) continue;
    ws[cell_address].s = {
      font: { bold: true, sz: 16, color: { rgb: '00B8D9' } },
      alignment: { horizontal: 'left', vertical: 'center' },
    };
  }
  // Header row style
  for (let C = 0; C <= range.e.c; ++C) {
    const cell_address = XLSX.utils.encode_cell({ r: 1, c: C });
    if (!ws[cell_address]) continue;
    ws[cell_address].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '00B8D9' } },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }
  // Data rows style
  for (let R = 2; R <= range.e.r; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cell_address]) continue;
      if (!ws[cell_address].s) ws[cell_address].s = {};
      ws[cell_address].s.border = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      };
      ws[cell_address].s.alignment = { horizontal: 'left', vertical: 'center' };
    }
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type === 'user' ? 'Users' : 'Products');
  XLSX.writeFile(wb, `${type === 'user' ? 'users' : 'products'}_${timestamp}_Brazelaorento.xlsx`);
}