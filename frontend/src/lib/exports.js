import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportCSV = (rows, filename = "export.csv") => {
  if (!rows?.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, filename);
};

export const exportExcel = (rows, filename = "export.xlsx", sheet = "Data") => {
  if (!rows?.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  XLSX.writeFile(wb, filename);
};

export const exportPDF = (rows, filename = "export.pdf", title = "Report") => {
  if (!rows?.length) return;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 14);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 20);
  const cols = Object.keys(rows[0]);
  autoTable(doc, {
    startY: 26,
    head: [cols],
    body: rows.map((r) => cols.map((c) => String(r[c] ?? ""))),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [15, 81, 50], textColor: [247, 244, 236] },
  });
  doc.save(filename);
};

export const printSection = () => window.print();
