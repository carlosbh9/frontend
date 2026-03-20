import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {
  async downloadQuotationAsExcel(data: any, fileName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Quotation');
    let currentRow = 1;

    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'General Information';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    const generalInfo = [
      ['Guest', data.guest],
      ['File Code', data.FileCode],
      ['Accommodation', data.accomodations],
      ['Total Nights', data.totalNights],
      ['Travel Agent', data.travel_agent],
      ['Start Date', data.travelDate?.start],
      ['End Date', data.travelDate?.end],
      ['Number of Paxs', data.number_paxs],
      ['Children Ages', Array.isArray(data.children_ages) ? data.children_ages.join(', ') : ''],
    ];

    generalInfo.forEach(([field, value]) => {
      worksheet.addRow([field, value]);
      currentRow++;
    });

    currentRow++;
    this.addSectionHeader(worksheet, currentRow, 'Services');
    currentRow++;
    this.addTable(
      worksheet,
      ['Day', 'Date', 'City', 'Service Name', 'Price Base', 'Price', 'Notes'],
      (data.services || []).flatMap((serviceDay: any) =>
        (serviceDay.services || []).map((service: any) => [
          serviceDay.day,
          serviceDay.date,
          service.city,
          service.name_service,
          service.price_base,
          service.price,
          service.notes || '',
        ])
      ),
      [['', '', '', 'TOTAL SERVICES', '', data.total_prices?.total_services || 0, '']],
      currentRow
    );
    currentRow = worksheet.rowCount + 2;

    this.addSectionHeader(worksheet, currentRow, 'Hotels');
    currentRow++;
    this.addTable(
      worksheet,
      ['Day', 'Date', 'City', 'Hotel Name', 'Price Base', 'Price', 'Accommodation Category', 'Notes'],
      (data.hotels || []).map((hotel: any) => [
        hotel.day,
        hotel.date,
        hotel.city,
        hotel.name_hotel,
        hotel.price_base,
        hotel.price,
        hotel.accomodatios_category || '',
        hotel.notes || '',
      ]),
      [
        ['', '', '', 'TOTAL HOTELS', '', data.total_prices?.total_hoteles || 0, '', ''],
        ['', '', '', 'Total Cost', '', data.total_prices?.total_cost || 0, '', ''],
        ['', '', '', 'External Utility', '', data.total_prices?.external_utility || 0, '', ''],
        ['', '', '', 'Cost External Taxes', '', data.total_prices?.cost_external_taxes || 0, '', ''],
        ['', '', '', 'Total Cost External', '', data.total_prices?.total_cost_external || 0, '', ''],
      ],
      currentRow
    );
    currentRow = worksheet.rowCount + 2;

    this.addSectionHeader(worksheet, currentRow, 'Flights');
    currentRow++;
    this.addTable(
      worksheet,
      ['Date', 'Route', 'Price Conf.', 'Price', 'Notes'],
      (data.flights || []).map((flight: any) => [
        flight.date,
        flight.route,
        flight.price_conf,
        flight.price,
        flight.notes || '',
      ]),
      [['', 'Total Flights', '', data.total_prices?.total_flights || 0, '']],
      currentRow
    );
    currentRow = worksheet.rowCount + 2;

    this.addSectionHeader(worksheet, currentRow, 'Operators');
    currentRow++;
    this.addTable(
      worksheet,
      ['Country', 'Operator Name', 'Price', 'Notes'],
      (data.operators || []).map((operator: any) => [
        operator.country,
        operator.name_operator,
        operator.price,
        operator.notes || '',
      ]),
      [['', 'Total Operators', data.total_prices?.total_ext_operator || 0, '']],
      currentRow
    );
    currentRow = worksheet.rowCount + 2;

    this.addSectionHeader(worksheet, currentRow, 'Cruises');
    currentRow++;
    this.addTable(
      worksheet,
      ['Cruise', 'Operator', 'Price Base', 'Price', 'Notes'],
      (data.cruises || []).map((cruise: any) => [
        cruise.name,
        cruise.operator,
        cruise.price_conf,
        cruise.price,
        cruise.notes || '',
      ]),
      [['', 'Total Cruises', '', data.total_prices?.total_ext_cruises || 0, '']],
      currentRow
    );
    currentRow = worksheet.rowCount + 2;

    this.addSectionHeader(worksheet, currentRow, 'Totals');
    currentRow++;
    [
      ['Subtotal', data.total_prices?.subtotal || 0],
      ['Cost Transfers', data.total_prices?.cost_transfers || 0],
      ['Final Cost', data.total_prices?.final_cost || 0],
      ['Price per Person', data.total_prices?.price_pp || 0],
    ].forEach(row => worksheet.addRow(row));

    worksheet.columns.forEach(column => {
      column.width = 20;
      column.numFmt = '$#,##0.00';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(blob, `${fileName}.xlsx`);
  }

  private addSectionHeader(worksheet: ExcelJS.Worksheet, row: number, title: string) {
    worksheet.mergeCells(`A${row}:F${row}`);
    worksheet.getCell(`A${row}`).value = title;
    worksheet.getCell(`A${row}`).font = { bold: true, size: 14 };
  }

  private addTable(
    worksheet: ExcelJS.Worksheet,
    headers: string[],
    rows: any[][],
    totals: any[][],
    startRow: number
  ) {
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    rows.forEach(row => worksheet.addRow(row));
    totals.forEach(row => worksheet.addRow(row));
  }
}
