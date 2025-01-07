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
    const serviceHeaders = ['Day', 'Date', 'City', 'Service Name', 'Price Base', 'Prices', 'Notes'];
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
        worksheet.addRow([
          serviceDay.day,
          serviceDay.date,
          service.city,
          service.name_service,
          service.price_base,
          service.prices.join(', '),
          service.notes,
        ]);
        currentRow++;
      });
    });

    // Totales de servicios
    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'TOTAL SERVICES', '', data.total_prices.total_services.join(', ')]);
    currentRow += 2;

    // **3. Tabla de Hoteles**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Hotels';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    // Encabezados de la tabla
    const hotelHeaders = ['Day', 'Date', 'City', 'Hotel Name', 'Accommodation Category', 'Price Base', 'Prices', 'Notes'];
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
      worksheet.addRow([
        hotel.day,
        hotel.date,
        hotel.city,
        hotel.name_hotel,
        hotel.accomodatios_category,
        hotel.price_base,
        hotel.prices.join(', '),
        hotel.notes,
      ]);
      currentRow++;
    });

    // Totales de hoteles
    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'TOTAL HOTELS', '', data.total_prices.total_hoteles.join(', ')]);
    currentRow += 2;

    // **4. Tabla de Flights**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Flights';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    const flightHeaders = ['Date', 'Route', 'Price Conf.', 'Prices', 'Notes'];
    flightHeaders.forEach((header, index) => {
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

    // Filas de flights (si existen)
    data.flights.forEach((flight: any) => {
      worksheet.addRow([
        flight.date || '',
        flight.route || '',
        flight.price_conf || '',
        flight.prices || '',
        flight.notes || '',
      ]);
      currentRow++;
    });

    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'Total Flights', '', data.total_prices.total_flights.join(', ')]);
    currentRow += 2;

    // **5. Tabla de Operadores**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Operators';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    const operatorHeaders = ['Country', 'Operator Name', 'Prices', 'Notes'];
    operatorHeaders.forEach((header, index) => {
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

    data.operators.forEach((operator: any) => {
      worksheet.addRow([
        operator.country || '',
        operator.name_operator || '',
        operator.prices.join(', ') || '',
        operator.notes || '',
      ]);
      currentRow++;
    });

    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'Total Operators', '', data.total_prices.total_ext_operator.join(', ')]);
    currentRow += 2;

    // **6. Tabla de Cruises**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Cruises';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    const cruiseHeaders = ['Cruise Name', 'Operator', 'Price Confirmation', 'Prices', 'Notes'];
    cruiseHeaders.forEach((header, index) => {
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

    data.cruises.forEach((cruise: any) => {
      worksheet.addRow([
        cruise.name || '',
        cruise.operator || '',
        cruise.price_conf || '',
        cruise.prices.join(', ') || '',
        cruise.notes || '',
      ]);
      currentRow++;
    });

    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'Total Cruises', '', data.total_prices.total_ext_cruises.join(', ')]);
    currentRow += 2;


    // **7. Totales Generales**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Total Prices';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    const totals = [
      { description: 'Total Cost', values: data.total_prices.total_cost },
      { description: 'External Utility', values: data.total_prices.external_utility },
      { description: 'Cost External Taxes', values: data.total_prices.cost_external_taxes },
      { description: 'Total Cost External', values: data.total_prices.total_cost_external },
      { description: 'Subtotal', values: data.total_prices.subtotal },
      { description: 'Cost Transfers', values: data.total_prices.cost_transfers },
      { description: 'Final Cost', values: data.total_prices.final_cost },
      { description: 'Price per Person', values: data.total_prices.price_pp },
    ];

    totals.forEach((total) => {
      worksheet.addRow([total.description, ...total.values]);
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
