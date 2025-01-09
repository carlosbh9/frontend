import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {

  constructor() { }
  async downloadQuotationAsExcel(data: any, fileName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Quotation');

    let currentRow = 1;
    const startColumn = 5;
    const maxPrices =data.number_paxs.length + 1 // Calcula la cantidad máxima de precios
    for (let i = 0; i < maxPrices; i++) {
      const columnIndex = startColumn + i; // Calcula la columna dinámica (F, G, H, ...)
      worksheet.getColumn(columnIndex).numFmt = '$#,##0.00'; // Aplica formato numérico de moneda
    }

    // **1. Información General**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'General Information';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    const generalInfo = [
      { field: 'Guest', value: data.guest },
      { field: 'File Code', value: data.FileCode },
      { field: 'Accommodation', value: data.accomodations },
      { field: 'Total Nights', value: data.totalNights },
      { field: 'Travel Agent', value: data.travel_agent },
      { field: 'Start Date', value: data.travelDate.start },
      { field: 'End Date', value: data.travelDate.end },
      { field: 'Number of Paxs', value: data.number_paxs.join(', ') },
    ];

    generalInfo.forEach((info) => {
      worksheet.getCell(`A${currentRow}`).value = info.field;
      worksheet.getCell(`B${currentRow}`).value = info.value;
      currentRow++;
    });

    currentRow++; // Salto de línea

    // **2. Tabla de Servicios**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Services';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    // Encabezados de la tabla
    const serviceHeaders = ['Day', 'Date', 'City', 'Service Name', 'Price Base'];
    const maxServicePrices = Math.max(...data.services.flatMap((s: any) => s.services.flatMap((srv: any) => srv.prices.length)));
    for (let i = 0; i < maxServicePrices; i++) {
      serviceHeaders.push(`Price ${i + 1}`);
    }
    serviceHeaders.push('Notes');

    serviceHeaders.forEach((header, index) => {
      worksheet.getCell(currentRow, index + 1).value = header;
      worksheet.getCell(currentRow, index + 1).font = { bold: true };
      worksheet.getCell(currentRow, index + 1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    currentRow++;

    // Filas de servicios
    data.services.forEach((serviceDay: any) => {
      serviceDay.services.forEach((service: any) => {
        const row = [
          serviceDay.day,
          serviceDay.date,
          service.city,
          service.name_service,
          service.price_base,
        ];
        row.push(...service.prices);
        while (row.length < serviceHeaders.length - 1) {
          row.push('');
        }
        row.push(service.notes);
        worksheet.addRow(row);
        currentRow++;
      });
    });


    // Totales de servicios
    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'TOTAL SERVICES', '', ...data.total_prices.total_services]);
    currentRow += 2;

    // **3. Tabla de Hoteles**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Hotels';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    // Encabezados de la tabla
    const hotelHeaders = ['Day', 'Date', 'City', 'Hotel Name','Price Base'];
    const maxHotelPrices = Math.max(...data.hotels.map((hotel: any) => hotel.prices.length));
    for (let i = 0; i < maxHotelPrices; i++) {
      hotelHeaders.push(`Price ${i + 1}`);
    }
    hotelHeaders.push( 'Accommodation Category','Notes');

    hotelHeaders.forEach((header, index) => {
      worksheet.getCell(currentRow, index + 1).value = header;
      worksheet.getCell(currentRow, index + 1).font = { bold: true };
      worksheet.getCell(currentRow, index + 1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    currentRow++;

    // Filas de hoteles
    data.hotels.forEach((hotel: any) => {
      const row = [
        hotel.day,
        hotel.date,
        hotel.city,
        hotel.name_hotel,
        hotel.price_base,
      ];
      row.push(...hotel.prices);
      // while (row.length < hotelHeaders.length - 1) {
      //   row.push('');
      // }
      row.push(hotel.accomodatios_category);
      row.push(hotel.notes);
      worksheet.addRow(row);
      currentRow++;
    });

    // Totales de hoteles
    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'TOTAL HOTELS', '', ...data.total_prices.total_hoteles]);
    worksheet.addRow(['', '', '', 'Total Cost', '', ...data.total_prices.total_cost]);
    worksheet.addRow(['', '', '', 'External Utility', '', ...data.total_prices.external_utility]);
    worksheet.addRow(['', '', '', 'Cost External Taxes', '', ...data.total_prices.cost_external_taxes]);
    worksheet.addRow(['', '', '', 'Total Cost External', '', ...data.total_prices.total_cost_external]);
    worksheet.addRow([]);
    currentRow += 7;

    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Flights';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;
    
    // Cabeceras y configuración en bucle
    const headers = [
      { cell: `A${currentRow}:B${currentRow}`, value: 'Date' },
      { cell: `C${currentRow}:D${currentRow}`, value: 'Route' },
      { cell: `E${currentRow}`, value: 'Price Conf.' },
    ];
    
    headers.forEach(header => {
      worksheet.mergeCells(header.cell);
      const cell = worksheet.getCell(header.cell.split(':')[0]); // Obtener celda inicial
      cell.value = header.value;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    
    // Cabeceras dinámicas para "Price" y "Notes"
    const maxFlightPrices = Math.max(...data.flights.map((flight: any) => flight.prices.length));
    for (let i = 0; i < maxFlightPrices; i++) {
      const column = worksheet.getCell(currentRow, 6 + i);
      column.value = `Price ${i + 1}`;
      column.font = { bold: true };
      column.alignment = { horizontal: 'center', vertical: 'middle' };
      column.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    }
    
    // Agregar "Notes" columna
    const notesColumn = worksheet.getCell(currentRow, 6 + maxFlightPrices);
    notesColumn.value = 'Notes';
    notesColumn.font = { bold: true };
    notesColumn.alignment = { horizontal: 'center', vertical: 'middle' };
    notesColumn.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    
       currentRow++;
   
       // Filas de flights (si existen)
      data.flights.forEach((flight: any) => {
        worksheet.mergeCells(`A${currentRow}:B${currentRow}`); // Combina columnas para "Date"
        worksheet.getCell(`A${currentRow}`).value = flight.date || '';
      
        worksheet.mergeCells(`C${currentRow}:D${currentRow}`); // Combina columnas para "Route"
        worksheet.getCell(`C${currentRow}`).value = flight.route || '';
      
        worksheet.getCell(`E${currentRow}`).value = flight.price_conf || ''; // Price Conf.
      
        // Agregar precios dinámicos
        flight.prices.forEach((price: any, index: number) => {
          worksheet.getCell(currentRow, 6 + index).value = price; // Coloca cada precio en una columna dinámica
        });
      
        worksheet.getCell(currentRow, 6 + flight.prices.length).value = flight.notes || ''; // Notes
        currentRow++;
      });
       worksheet.addRow(['', '', '', 'Total Flights',  '', ...data.total_prices.total_flights]);
       worksheet.addRow([]);
      currentRow += 3;

    // **5. Tabla de Operadores**
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Operators';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    
    currentRow++;

    // Cabeceras principales
const operatorHeaders = [
  { cell: `A${currentRow}:B${currentRow}`, value: 'Country' },
  { cell: `C${currentRow}:D${currentRow}`, value: 'Operator Name' },
  { cell: `E${currentRow}`, value: 'Price Base' },
];

operatorHeaders.forEach(header => {
  worksheet.mergeCells(header.cell);
  const cell = worksheet.getCell(header.cell.split(':')[0]); // Obtener la celda inicial
  cell.value = header.value;
  cell.font = { bold: true };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
});



// Cabeceras dinámicas para "Price" y "Notes"
const maxOperatorPrices = Math.max(...data.operators.map((op: any) => op.prices.length));
for (let i = 0; i < maxOperatorPrices; i++) {
  const column = worksheet.getCell(currentRow, 6 + i);
  column.value = `Price ${i + 1}`;
  column.font = { bold: true };
  column.alignment = { horizontal: 'center', vertical: 'middle' };
  column.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
}

// Agregar "Notes" columna
const notesColumn2 = worksheet.getCell(currentRow, 6 + maxOperatorPrices);
notesColumn2.value = 'Notes';
notesColumn2.font = { bold: true };
notesColumn2.alignment = { horizontal: 'center', vertical: 'middle' };
notesColumn2.border = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

currentRow++;
    // Filas de operadores
    data.operators.forEach((operator: any) => {
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`); // Combina columnas para "Country"
      worksheet.getCell(`A${currentRow}`).value = operator.country || '';
    
      worksheet.mergeCells(`C${currentRow}:D${currentRow}`); // Combina columnas para "Operator Name"
      worksheet.getCell(`C${currentRow}`).value = operator.name_operator || '';
    
      worksheet.getCell(`E${currentRow}`).value = operator.price_base || ''; // Price Base
    
      // Agregar precios dinámicos
      operator.prices.forEach((price: any, index: number) => {
        worksheet.getCell(currentRow, 6 + index).value = price;
      });
    
      worksheet.getCell(currentRow, 6 + operator.prices.length).value = operator.notes || ''; // Notes
      currentRow++;
    });
  
    worksheet.addRow(['', '', '', 'Total Operators', '', ...data.total_prices.total_ext_operator]);
    currentRow += 3;

      // **6. Tabla de Cruises**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Cruises';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    // Encabezados
    const cruiseHeaders = [
      { cell: `A${currentRow}:B${currentRow}`, value: 'Cruise' },
      { cell: `C${currentRow}:D${currentRow}`, value: 'Operator' },
      { cell: `E${currentRow}`, value: 'Price Confirmation' },
    ];
    
    // Aplicar propiedades a las cabeceras principales
    cruiseHeaders.forEach(header => {
      worksheet.mergeCells(header.cell);
      const cell = worksheet.getCell(header.cell.split(':')[0]); // Obtener la celda inicial
      cell.value = header.value;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    
    // Obtener el número máximo de precios dinámicos
    const maxCruisePrices = Math.max(...data.cruises.map((cruise: any) => cruise.prices.length));
    
    // Agregar las cabeceras dinámicas ("Price 1", "Price 2", ..., "Notes")
    for (let i = 0; i <= maxCruisePrices; i++) {
      const columnIndex = 6 + i; // Comenzar desde la columna G (índice 7)
      const column = worksheet.getCell(currentRow, columnIndex);
    
      if (i < maxCruisePrices) {
        column.value = `Price ${i + 1}`;
      } else {
        column.value = 'Notes'; // Última columna es para Notes
      }
    
      column.font = { bold: true };
      column.alignment = { horizontal: 'center', vertical: 'middle' };
      column.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }

    currentRow++;

  
    data.cruises.forEach((cruise: any) => {
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`); // Combina columnas para "Cruise"
      worksheet.getCell(`A${currentRow}`).value = cruise.name || '';
    
      worksheet.mergeCells(`C${currentRow}:D${currentRow}`); // Combina columnas para "Operator"
      worksheet.getCell(`C${currentRow}`).value = cruise.operator || '';
    
      worksheet.getCell(`E${currentRow}`).value = cruise.price_conf || ''; // Price Confirmation
    
      // Agregar precios dinámicos
      cruise.prices.forEach((price: any, index: number) => {
        worksheet.getCell(currentRow, 6 + index).value = price;
      });
    
      worksheet.getCell(currentRow, 6 + cruise.prices.length).value = cruise.notes || ''; // Notes
      currentRow++;
    });
    
    worksheet.addRow(['', '', '','Total Cruises', '', ...data.total_prices.total_ext_cruises]);
    currentRow += 3;

    // **7. Totales Generales**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Total Prices';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    const totals = [
      { description: 'Subtotal', values: data.total_prices.subtotal },
      { description: 'Cost Transfers', values: data.total_prices.cost_transfers },
      { description: 'Final Cost', values: data.total_prices.final_cost },
      { description: 'Price per Person', values: data.total_prices.price_pp },
    ];

    totals.forEach((total) => {
      worksheet.addRow(['', '', '','',total.description, ...total.values]);
      currentRow++;
    });

    // **8. Ajuste de columnas**
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    // **9. Descargar Archivo**
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(blob, `${fileName}.xlsx`);
  }
}
