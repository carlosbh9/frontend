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
    const hotelHeaders = ['Day', 'Date', 'City', 'Hotel Name', 'Accommodation Category', 'Price Base'];
    const maxHotelPrices = Math.max(...data.hotels.map((hotel: any) => hotel.prices.length));
    for (let i = 0; i < maxHotelPrices; i++) {
      hotelHeaders.push(`Price ${i + 1}`);
    }
    hotelHeaders.push('Notes');

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
        hotel.accomodatios_category,
        hotel.price_base,
      ];
      row.push(...hotel.prices);
      while (row.length < hotelHeaders.length - 1) {
        row.push('');
      }
      row.push(hotel.notes);
      worksheet.addRow(row);
      currentRow++;
    });

    // Totales de hoteles
    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'TOTAL HOTELS', '','', ...data.total_prices.total_hoteles]);
    worksheet.addRow(['', '', '', 'Total Cost', '','', ...data.total_prices.total_cost]);
    worksheet.addRow(['', '', '', 'External Utility', '','', ...data.total_prices.external_utility]);
    worksheet.addRow(['', '', '', 'Cost External Taxes', '','', ...data.total_prices.cost_external_taxes]);
    worksheet.addRow(['', '', '', 'Total Cost External', '','', ...data.total_prices.total_cost_external]);
    currentRow += 6;

    // **2. Tabla de Servicios**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Flights';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

       // **4. Tabla de Flights**
       worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
       worksheet.getCell(`A${currentRow}`).value = 'Date';
       worksheet.getCell(`A${currentRow}`).font = { bold: true };
       worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
   
       worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
       worksheet.getCell(`C${currentRow}`).value = 'Route';
       worksheet.getCell(`C${currentRow}`).font = { bold: true };
       worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
   
       worksheet.getCell(`F${currentRow}`).value = 'Price Conf.';
       worksheet.getCell(`F${currentRow}`).font = { bold: true };
   
       const maxFlightPrices = Math.max(...data.flights.map((flight: any) => flight.prices.length));
       for (let i = 0; i < maxFlightPrices; i++) {
         worksheet.getCell(currentRow, 7 + i).value = `Price ${i + 1}`;
         worksheet.getCell(currentRow, 7 + i).font = { bold: true };
       }
   
       worksheet.getCell(currentRow, 7 + maxFlightPrices).value = 'Notes';
       worksheet.getCell(currentRow, 7 + maxFlightPrices).font = { bold: true };
   
       currentRow++;
   
       // Filas de flights (si existen)
       data.flights.forEach((flight: any) => {
         worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
         worksheet.getCell(`A${currentRow}`).value = flight.date || '';
   
         worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
         worksheet.getCell(`C${currentRow}`).value = flight.route || '';
   
         const row = [
           flight.date || '',
           '',
           flight.route || '',
           '',
           '',
           flight.price_conf || '',
         ];
         row.push(...flight.prices);
         while (row.length < 7 + maxFlightPrices) {
           row.push('');
         }
         row.push(flight.notes || '');
         worksheet.addRow(row);
         currentRow++;
       });
   
       worksheet.addRow([]);
       worksheet.addRow(['', '', '', 'Total Flights', '', '', ...data.total_prices.total_flights]);
      currentRow += 3;

    // **5. Tabla de Operadores**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Operators';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    // Encabezados
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Country';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = 'Operator Name';
    worksheet.getCell(`C${currentRow}`).font = { bold: true };
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.getCell(`F${currentRow}`).value = 'Price Base';
    worksheet.getCell(`F${currentRow}`).font = { bold: true };

    const maxOperatorPrices = Math.max(...data.operators.map((op: any) => op.prices.length));
    for (let i = 0; i < maxOperatorPrices; i++) {
      worksheet.getCell(currentRow, 7 + i).value = `Price ${i + 1}`;
      worksheet.getCell(currentRow, 7 + i).font = { bold: true };
    }

    worksheet.getCell(currentRow, 7 + maxOperatorPrices).value = 'Notes';
    worksheet.getCell(currentRow, 7 + maxOperatorPrices).font = { bold: true };

    currentRow++;

    // Filas de operadores
    data.operators.forEach((operator: any) => {
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = operator.country || '';

      worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
      worksheet.getCell(`C${currentRow}`).value = operator.name_operator || '';

      const row = [operator.country || '', '', operator.name_operator || '', '', '', operator.price_base || ''];
      row.push(...operator.prices);

      while (row.length < 7 + maxOperatorPrices) {
        row.push('');
      }

      row.push(operator.notes || '');
      worksheet.addRow(row);
      currentRow++;
    });

  
    worksheet.addRow(['', '', '','', 'Total Operators', '', ...data.total_prices.total_ext_operator]);
    currentRow += 3;

      // **6. Tabla de Cruises**
    worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Cruises';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    // Encabezados
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Cruise';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = 'Operator';
    worksheet.getCell(`C${currentRow}`).font = { bold: true };
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.getCell(`F${currentRow}`).value = 'Price Confirmation';
    worksheet.getCell(`F${currentRow}`).font = { bold: true };

    const maxCruisePrices = Math.max(...data.cruises.map((cruise: any) => cruise.prices.length));
    for (let i = 0; i < maxCruisePrices; i++) {
      worksheet.getCell(currentRow, 7 + i).value = `Price ${i + 1}`;
      worksheet.getCell(currentRow, 7 + i).font = { bold: true };
    }

    worksheet.getCell(currentRow, 7 + maxCruisePrices).value = 'Notes';
    worksheet.getCell(currentRow, 7 + maxCruisePrices).font = { bold: true };

    currentRow++;

    // Filas de cruceros
    data.cruises.forEach((cruise: any) => {
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = cruise.name || '';

      worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
      worksheet.getCell(`C${currentRow}`).value = cruise.operator || '';

      const row = [cruise.name || '', '', cruise.operator || '', '', '', cruise.price_conf || ''];
      row.push(...cruise.prices);

      while (row.length < 7 + maxCruisePrices) {
        row.push('');
      }

      row.push(cruise.notes || '');
      worksheet.addRow(row);
      currentRow++;
    });

    
    worksheet.addRow(['', '', '', '','Total Cruises', '', ...data.total_prices.total_ext_cruises]);
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
      worksheet.addRow(['', '', '','','',total.description, ...total.values]);
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
