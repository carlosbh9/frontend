import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).addVirtualFileSystem(pdfFonts);

@Injectable({
  providedIn: 'root'
})
export class PdfexportService {
  convertImageToDataURL(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imagePath;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject('No se pudo obtener el contexto del canvas');
          return;
        }
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      image.onerror = error => {
        console.error('Error al cargar la imagen:', error);
        reject('Error al cargar la imagen');
      };
    });
  }

  exportPdf(docDefinition: any): void {
    pdfMake.createPdf(docDefinition).open();
  }

  generatePdf(data: any, dataURL: string): any {
    return {
      content: [
        {
          columns: [
            { text: 'QUOTE', style: 'title', width: 220 },
            { image: dataURL, width: 150, margin: [150, 0, 0, 30] }
          ]
        },
        this.buildSummary(data),
        { text: '\nServices', style: 'subtitles' },
        this.buildTable(
          ['Day', 'Date', 'City', 'Service', 'Price Base', 'Price', 'Notes'],
          (data.services || []).flatMap((dayData: any) =>
            (dayData.services || []).map((service: any) => [
              dayData.day,
              dayData.date,
              service.city,
              service.name_service,
              this.money(service.price_base),
              this.money(service.price),
              service.notes || '',
            ])
          ),
          ['Total Services', '', '', '', '', this.money(data.total_prices?.total_services || 0), '']
        ),
        { text: '\nHotels', style: 'subtitles' },
        this.buildTable(
          ['Day', 'Date', 'City', 'Hotel', 'Price Base', 'Price', 'Accommodation', 'Notes'],
          (data.hotels || []).map((hotel: any) => [
            hotel.day,
            hotel.date,
            hotel.city,
            hotel.name_hotel,
            this.money(hotel.price_base),
            this.money(hotel.price),
            hotel.accomodatios_category || '',
            hotel.notes || '',
          ]),
          ['Total Hotels', '', '', '', '', this.money(data.total_prices?.total_hoteles || 0), '', '']
        ),
        { text: '\nFlights', style: 'subtitles' },
        this.buildTable(
          ['Date', 'Route', 'Conf. Price', 'Price', 'Notes'],
          (data.flights || []).map((flight: any) => [
            flight.date,
            flight.route,
            this.money(flight.price_conf),
            this.money(flight.price),
            flight.notes || '',
          ]),
          ['Total Flights', '', '', this.money(data.total_prices?.total_flights || 0), '']
        ),
        { text: '\nExternal Operators', style: 'subtitles' },
        this.buildTable(
          ['Country', 'Operator', 'Price', 'Notes'],
          (data.operators || []).map((operator: any) => [
            operator.country,
            operator.name_operator,
            this.money(operator.price),
            operator.notes || '',
          ]),
          ['Total Operators', '', this.money(data.total_prices?.total_ext_operator || 0), '']
        ),
        { text: '\nCruises', style: 'subtitles' },
        this.buildTable(
          ['Cruise', 'Operator', 'Price Base', 'Price', 'Notes'],
          (data.cruises || []).map((cruise: any) => [
            cruise.name,
            cruise.operator,
            this.money(cruise.price_conf),
            this.money(cruise.price),
            cruise.notes || '',
          ]),
          ['Total Cruises', '', '', this.money(data.total_prices?.total_ext_cruises || 0), '']
        ),
        { text: '\nTotals', style: 'subtitles' },
        this.buildTable(
          ['Metric', 'Value'],
          [
            ['Subtotal', this.money(data.total_prices?.subtotal || 0)],
            ['Cost Transfers', this.money(data.total_prices?.cost_transfers || 0)],
            ['Final Cost', this.money(data.total_prices?.final_cost || 0)],
            ['Price per Person', this.money(data.total_prices?.price_pp || 0)],
          ]
        )
      ],
      styles: {
        title: { fontSize: 18, bold: true },
        subtitles: { fontSize: 12, bold: true },
        header: { fontSize: 10, bold: true },
        body: { fontSize: 8, color: 'black' },
      }
    };
  }

  private buildSummary(data: any) {
    return {
      columns: [
        {
          width: '30%',
          text: [
            { text: 'Guest:\n', bold: true },
            { text: 'Travel Designer:\n', bold: true },
            { text: 'Type of Accommodations:\n', bold: true },
            { text: 'Travel Dates:\n', bold: true },
            { text: 'Destinations:\n', bold: true },
            { text: 'Number of Paxs:\n', bold: true },
            { text: 'Children Ages:\n', bold: true },
          ]
        },
        {
          width: '70%',
          text: [
            { text: `${data.guest || 'N/A'}\n` },
            { text: `${data.travel_agent || 'N/A'}\n` },
            { text: `${data.accomodations || 'N/A'}\n` },
            { text: `${data.travelDate?.start || 'N/A'} to ${data.travelDate?.end || 'N/A'}\n` },
            { text: `${Array.isArray(data.destinations) ? data.destinations.join(', ') : 'N/A'}\n` },
            { text: `${data.number_paxs || 0}\n` },
            { text: `${Array.isArray(data.children_ages) && data.children_ages.length ? data.children_ages.join(', ') : 'N/A'}\n` },
          ]
        }
      ]
    };
  }

  private buildTable(headers: string[], rows: any[][], totalRow?: any[]) {
    const body = [headers.map(header => ({ text: header, style: 'header' }))];
    if (rows.length) {
      body.push(...rows);
    } else {
      body.push([{ text: 'No data available', colSpan: headers.length }, ...Array(headers.length - 1).fill('')]);
    }

    if (totalRow) {
      body.push(totalRow);
    }

    return {
      style: 'body',
      table: {
        headerRows: 1,
        widths: Array(headers.length).fill('*'),
        body,
      },
      layout: 'lightHorizontalLines'
    };
  }

  private money(value: unknown): string {
    const numeric = Number(value) || 0;
    return `$${numeric.toFixed(2)}`;
  }
}
