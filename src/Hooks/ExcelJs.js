import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // Importing the saveAs function from file-saver

const useExcelJs = () => {
  // Excel export function
  const excelExport = async (obj, title) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const headerNames = Object.keys(obj[0]);

    // Add headers to the worksheet
    worksheet.addRow(headerNames);

    // Format headers (bold, blue background, white text, centered)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "2C3639" } }; // Vladimir font
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "f9aa33" } }; // Vladimir background
      cell.alignment = { horizontal: "center", vertical: "middle" };

      // Add borders to the header cells
      cell.border = {
        top: { style: "medium", color: { argb: "000000" } }, // Top border
        left: { style: "medium", color: { argb: "000000" } }, // Left border
        bottom: { style: "medium", color: { argb: "000000" } }, // Bottom border
        right: { style: "medium", color: { argb: "000000" } }, // Right border
      };
    });

    // Add data rows to the worksheet
    obj.forEach((row) => {
      const rowData = headerNames.map((header) => row[header] ?? "");
      const newRow = worksheet.addRow(rowData);

      // Apply alignment and borders to each data cell
      newRow.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" }; // Centering each cell
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "f1f1f1" } }; // Vladimir background
      });
    });

    // Auto-adjust column widths
    headerNames.forEach((header, index) => {
      let maxLength = header.length;

      obj.forEach((row) => {
        const cellValue = row[header];
        maxLength = Math.max(maxLength, (cellValue != null ? cellValue.toString() : "").length);
      });

      worksheet.getColumn(index + 1).width = maxLength + 2; // Add padding
    });

    // Generate the file buffer
    const fileName = `${title} ${moment().format("MMM-DD-YYYY")}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer(); // Get the Excel file as a buffer

    // Create a Blob and trigger the download using FileSaver.js
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, fileName); // Trigger the download
  };

  // Function to filter headers by trimming and replacing spaces with underscores
  const filterHeader = async (jsonData) => {
    return jsonData.map((row) => {
      Object.keys(row).forEach((key) => {
        const newKey = key.trim().toLowerCase().replace(/ /g, "_");
        if (key !== newKey) {
          row[newKey] = row[key];
          delete row[key];
        }
      });
      return row;
    });
  };

  // Excel import function
  const excelImport = async (file) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file); // Load the file

    const worksheet = workbook.getWorksheet(1); // Get the first sheet
    const jsonData = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = worksheet.getRow(1).getCell(colNumber).value;
        rowData[header] = cell.value;
      });

      // Only push rows that contain data
      if (Object.values(rowData).some((value) => value !== "")) {
        jsonData.push(rowData);
      }
    });

    // Filter headers by trimming and replacing spaces with underscores
    return await filterHeader(jsonData);
  };

  return { excelExport, excelImport };
};

export default useExcelJs;
