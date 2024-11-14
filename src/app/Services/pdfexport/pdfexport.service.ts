import { Injectable } from '@angular/core';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Injectable({
  providedIn: 'root'
})
export class PdfexportService {

  constructor() { }


  // Método para exportar el PDF
exportPdf(docDefinition: any): void {
    pdfMake.createPdf(docDefinition).open();
}

generatePdf(data : any) : any {

const tam = data.number_paxs.length;

const tableHeader = [{ text: 'Day' }, { text: 'Date' },{ text: 'City' }, { text: 'Service' }, { text: 'Price Base' }];
for (let i = 0; i < tam; i++) {
    tableHeader.push({ text: `Price ${i + 1}` });
}

const tableHeaderHotels = [
  { text: 'Day' },
  { text: 'Date' },
  { text: 'City' },
  { text: 'Hotel' },
  { text: 'Price Base' },
];

// Crear encabezados dinámicos para los precios según el número de pax
for (let i = 0; i < tam; i++) {
  tableHeaderHotels.push({ text: `Price ${i + 1}` });
}
 // Agregar las columnas de "Accommodations" y "Category" al final
 tableHeaderHotels.push({ text: 'Accommodations and Category' });
// Iniciar el cuerpo de la tabla con el encabezado
const tableBody = [tableHeader]
const tableBodyhotels = [tableHeaderHotels];
// Llenar el cuerpo de la tabla con los datos
data.services.forEach((dayData : any)=> {
    dayData.services.forEach((service: any) => {
        const row = [
            { text: dayData.day.toString(), alignment: 'center' },
            { text: dayData.date, alignment: 'center' },
            { text: service.city,alignment: 'center' },
            { text: service.name_service },
            { text: service.price_base.toString() }
        ];

        // Añadir precios en las columnas correspondientes
        for (let i = 0; i < tam; i++) {
            row.push({ text: service.prices[i] !== undefined ? service.prices[i].toString() : '' });
        }
        console.log('totalrow1',row)
        tableBody.push(row);
    });   
})

//data.hotels.forEach((dayData: any) => {
  data.hotels.forEach((hotel: any) => {
    const row = [
      { text: hotel.day.toString(), alignment: 'center' },
      { text: hotel.date, alignment: 'center' },
      { text: hotel.city },
      { text: hotel.name_hotel },
      { text: hotel.price_base.toString() },
    ];

    // Añadir precios en las columnas correspondientes
    for (let i = 0; i < tam; i++) {
      row.push({ text: hotel.prices[i] !== undefined ? hotel.prices[i].toString() : '' });
    }

    // Añadir "Accommodations" y "Category" al final de la fila
    row.push(hotel.accomodatios_category);

    tableBodyhotels.push(row);
  });
//});

  // Crear la fila de totales
  const totalRow = [
    { text: 'Total Prices', colSpan: 5, alignment: 'center' }, // Total Prices ocupa 4 columnas
    {}, {}, {}, {}, // Deja las primeras 4 celdas vacías para que 'Total Prices' ocupe 4 columnas
    ...data.total_prices.total_services.map((price: any) => {
      return { text: price.toString() }; // Mapea los totales de cada servicio a una celda
    }),
  ];

  const totalRowHotels = [
    { text: 'Total Prices', colSpan: 5, alignment: 'center' }, // Total Prices ocupa las primeras 5 columnas
    {}, {}, {}, {}, // Deja las primeras 5 celdas vacías
    ...data.total_prices.total_services.map((price: any) => {
      return { text: price.toString() };
    }),
    '',  // Espacio vacío para "Accommodations"
  ];

  // Añadir la fila de totales al final de la tabla
  tableBody.push(totalRow);

  // Añadir la fila de totales al final de la tabla
  tableBodyhotels.push(totalRowHotels);

    return {
      content: [
        { text: 'QUOTER', style: 'header' },
        { text: `Guest: ${data.guest}`, style: 'subheader' },
        { text: `Agent: ${data.travel_agent}`, style: 'subheader' },
        { text: `Accommodation: ${data.accomodations}`, style: 'subheader' },
        { text: `Dates: ${data.travelDate.start} to ${data.travelDate.end}`},
        
        // Services Section
        { text: 'Services', style: 'sectionHeader' },
        {
            style: 'tableservice',
            table: {
                widths: [30, 50,30, 200, 30, ...Array(tam).fill(30)], // Ajustar anchos
                body: tableBody
            }
        },
       // Sección de Hoteles
      { text: 'Hotels', style: 'sectionHeader' },
      {
        style: 'tablehotel',
        table: {
          widths: [30, 50, 50, 150, 30, ...Array(tam).fill(30), 100], // Ajuste de anchos, añadiendo espacio para Accommodation y Category
          body: tableBodyhotels,
        },
      },
    ],
    styles: {
        header: { fontSize: 12, bold: true },
        subheader: { fontSize: 12},
        sectionHeader: { fontSize: 12, bold: true},
        tableservice: { bold: false,
          fontSize: 10,
          color: 'black' },
          tablehotel: { bold: false,
            fontSize: 10,
            color: 'black' }
    }
    
    }
  }
}
