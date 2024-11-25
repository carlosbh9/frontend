import { Injectable } from '@angular/core';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Injectable({
  providedIn: 'root'
})
export class PdfexportService {

  constructor() { }

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

      image.onerror = (error) => reject(error);
    });
  }
  // Método para exportar el PDF
exportPdf(docDefinition: any): void {
    pdfMake.createPdf(docDefinition).open();
}

generatePdf(data : any,dataURL: string) : any {

const tam = data.number_paxs.length;
const tableBodyServices = this.createServicesTableContent(data, tam);
const tableBodyHotels = this.createHotelsTableContent(data, tam);
const tableBodyFlights = this.createFlightsTableContent(data, tam);
    // Generar contenido de la tabla llamando a un solo método
const tableBodyOpertators = this.createOperatorsTableContent(data, tam);


    return {
      content: [
        {
          columns: [
          { text: 'QUOTE', style: 'title' ,width: 220},
          {
            image: dataURL,
            width: 150,
			      margin: [150,0,0,50]
          },
          ] 
        },
        {
          columns: [
            {
              width: '30%', // Ajusta el ancho de la columna izquierda
              text: [
                { text: 'Guest: \n', bold: true },
                { text: 'Travel Designer: \n', bold: true },
                { text: 'Type of Accommodations: \n', bold: true },
                { text: 'Travel Dates: \n', bold: true },
              ],
            },
            {
              width: '70%', // Ajusta el ancho de la columna derecha
              text: [
                { text: `${data.guest} \n` },
                { text: `${data.travel_agent} \n` },
                { text: `${data.accomodations} \n` },
                { text: `${data.travelDate.start} to ${data.travelDate.end} \n` },
              ],
            },
          ]
        },
        { text: '\n\n' },
        
        // Services Section
        { text: 'Services \n', style: 'subtitles' },
        {
            style: 'body',
            table: {
                widths: [20, 60,30, '*', 30, ...Array(tam).fill(30)], // Ajustar anchos
                body: tableBodyServices
            },
            layout: 'lightHorizontalLines'
        },
       // Sección de Hoteles
      { text: 'Hotels \n', style: 'subtitles' },
      {
        style: 'body',
        table: {
          widths: [20, 60, 50, '*', 30, ...Array(tam).fill(30), '*'], // Ajuste de anchos, añadiendo espacio para Accommodation y Category
          body: tableBodyHotels,
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\n\n' },
      { text: 'Flights \n', style: 'subtitles' },
      {
        style: 'body',
        table: {
          widths: [60, 60, 50, ...Array(tam).fill(30), '*'], // Ajuste de anchos, añadiendo espacio para Accommodation y Category
          body: tableBodyFlights,
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\n\n' },
      { text: 'External Operators \n', style: 'subtitles' },
      {
        style: 'body',
        table: {
          widths: [70, 70, ...Array(tam).fill(50), '*'], // Ajustar anchos de las columnas
          body: tableBodyOpertators,
        },
        layout: 'lightHorizontalLines',
      },

    ],
    styles: {
        title: {fontSize: 18,
          bold: true,
          alignment: 'top',
         
        },
        img: { 
          alignment: 'right',
          margin: [0, 50, 0, 0]},
        subtitles: {fontSize: 12, bold: true},
        header: { fontSize: 10, bold: true },
        body: {fontSize:8,color: 'black'},
        bodytotals: {fontSize:8,color: 'black'},
        formStyle: {fontSize: 10, bold: false}
       
       
    },
   
    
    }
  }
 // Método para generar contenido de la tabla de servicios
 private createServicesTableContent(data: any, tam: number): any[] {
  const tableHeader = [
    { text: 'Day', style: 'header' },
    { text: 'Date', style: 'header' },
    { text: 'City', style: 'header' },
    { text: 'Service', style: 'header' },
    { text: 'Price Base', style: 'header' },
  ];

  // Crear encabezados dinámicos para los precios
  for (let i = 0; i < tam; i++) {
    tableHeader.push({ text: `Price ${i + 1}`, style: 'header' });
  }

  const tableBody: any[] = [tableHeader];

  // Llenar el cuerpo de la tabla con datos de servicios
  data.services.forEach((dayData: any) => {
    dayData.services.forEach((service: any) => {
      const row = [
        dayData.day.toString(),
        dayData.date,
        service.city,
        service.name_service,
        service.price_base.toString(),
      ];

      // Añadir precios dinámicos
      for (let i = 0; i < tam; i++) {
        row.push(service.prices[i] !== undefined ? service.prices[i].toString() : '');
      }

      tableBody.push(row);
    });
  });

  // Crear fila de totales
  const totalRow = [
    { text: 'Total Prices', colSpan: 5, alignment: 'center', bold: true },
    {}, {}, {}, {}, // Celdas vacías para las columnas colapsadas
    ...data.total_prices.total_services.map((price: any) => {
      return { text: price.toString(), bold: true };
    }),
  ];

  tableBody.push(totalRow);
  return tableBody;
}
 // Método para generar contenido de la tabla de hoteles
 private createHotelsTableContent(data: any, tam: number): any[] {
  const tableHeaderHotels = [
    { text: 'Day', style: 'header' },
    { text: 'Date', style: 'header' },
    { text: 'City', style: 'header' },
    { text: 'Hotel', style: 'header' },
    { text: 'Price Base', style: 'header' },
  ];

  // Crear encabezados dinámicos para los precios
  for (let i = 0; i < tam; i++) {
    tableHeaderHotels.push({ text: `Price ${i + 1}`, style: 'header' });
  }

  // Agregar columna de "Accommodations" y "Category"
  tableHeaderHotels.push({ text: 'Accommodations and Category', style: 'header' });

  const tableBodyHotels: any[] = [tableHeaderHotels];

  // Llenar el cuerpo de la tabla con datos de hoteles
  data.hotels.forEach((hotel: any) => {
    const row = [
      hotel.day.toString(),
      hotel.date,
      hotel.city,
      hotel.name_hotel,
      hotel.price_base.toString(),
    ];

    // Añadir precios dinámicos
    for (let i = 0; i < tam; i++) {
      row.push(hotel.prices[i] !== undefined ? hotel.prices[i].toString() : '');
    }

    // Añadir "Accommodations" y "Category"
    row.push(hotel.accomodatios_category);

    tableBodyHotels.push(row);
  });

  // Crear fila de totales
  const totalRowHotels = [
    { text: 'Total Prices', colSpan: 5, alignment: 'center', bold: true },
    {}, {}, {}, {}, // Celdas vacías para las columnas colapsadas
    ...data.total_prices.total_hoteles.map((price: any) => {
      return { text: price.toString(), bold: true };
    }),
    '', // Espacio vacío para "Accommodations"
  ];

  tableBodyHotels.push(totalRowHotels);
  return tableBodyHotels;
}

  private createFlightsTableContent(data: any, tam: number): any[] {
    // Crear encabezados
    const tableHeader = [
      { text: 'Date', style: 'header' },
      { text: 'Route', style: 'header' },
      { text: 'Conf. Price', style: 'header' },
    ];

    // Agregar cabeceras dinámicas para precios
    for (let i = 0; i < tam; i++) {
      tableHeader.push({ text: `Price ${i + 1}`, style: 'header' });
    }

    // Agregar columna de notas
    tableHeader.push({ text: 'Notes', style: 'header' });

    // Crear cuerpo de la tabla
    const tableBody: any[] = [tableHeader];
    data.flights.forEach((flight: any) => {
      const row = [
        flight.date,
        flight.route,
        flight.price_conf.toString(),
      ];

      // Agregar precios dinámicos
      for (let i = 0; i < tam; i++) {
        row.push(flight.prices[i] !== undefined ? flight.prices[i].toString() : '');
      }

      // Agregar notas
      row.push(flight.notes);

      tableBody.push(row);
    });

    // Crear fila de totales
    const totalRow = [
      { text: 'Total Prices', colSpan: 3, alignment: 'center', bold: true },
      {}, {}, // Celdas vacías para las columnas colapsadas
      ...data.total_prices.total_flights.map((price: any) => {
        return { text: price.toString(), bold: true };
      }),
      '', // Espacio vacío para "Notes"
    ];

    // Agregar la fila de totales al final del cuerpo
    tableBody.push(totalRow);

    return tableBody;
  }
  private createOperatorsTableContent(data: any, tam: number): any[] {
    // Crear encabezados
    const tableHeader = [
      { text: 'Country', style: 'header' },
      { text: 'Operator', style: 'header' },
    ];

    // Agregar cabeceras dinámicas para precios
    for (let i = 0; i < tam; i++) {
      tableHeader.push({ text: `Price ${i + 1}`, style: 'header' });
    }

    // Agregar columna de notas
    tableHeader.push({ text: 'Notes', style: 'header' });

    // Crear cuerpo de la tabla
    const tableBody: any[] = [tableHeader];
    data.operators.forEach((operator: any) => {
      const row = [
        operator.country,
        operator.name_operator,
      ];

      // Agregar precios dinámicos
      for (let i = 0; i < tam; i++) {
        row.push(operator.prices[i] !== undefined ? operator.prices[i].toString() : '');
      }

      // Agregar notas
      row.push(operator.notes);

      tableBody.push(row);
    });

    // Crear fila de totales
    const totalRow = [
      { text: 'Total Prices', colSpan: 2, alignment: 'center', bold: true },
      {}, // Celdas vacías para las columnas colapsadas
      ...data.total_prices.total_ext_operator.map((price: any) => {
        return { text: price.toString(), bold: true };
      }),
      '', // Espacio vacío para "Notes"
    ];

    // Agregar la fila de totales al final del cuerpo
    tableBody.push(totalRow);

    return tableBody;
  }
}