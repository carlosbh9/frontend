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

const tableHeader = [{ text: 'Day' ,style: 'header'}, { text: 'Date' ,style: 'header'},{ text: 'City' ,style: 'header'}, { text: 'Service',style: 'header' }, { text: 'Price Base' ,style: 'header'}];
for (let i = 0; i < tam; i++) {
    tableHeader.push({ text: `Price ${i + 1}`,style: 'header' });
}

const tableHeaderHotels = [
  { text: 'Day' ,style: 'header'},
  { text: 'Date'  ,style: 'header'},
  { text: 'City'  ,style: 'header'},
  { text: 'Hotel'  ,style: 'header'},
  { text: 'Price Base' ,style: 'header' },
];

// Crear encabezados dinámicos para los precios según el número de pax
for (let i = 0; i < tam; i++) {
  tableHeaderHotels.push({ text: `Price ${i + 1}`  ,style: 'header'});
}
 // Agregar las columnas de "Accommodations" y "Category" al final
 tableHeaderHotels.push({ text: 'Accommodations and Category' ,style: 'header' });
// Iniciar el cuerpo de la tabla con el encabezado
const tableBody = [tableHeader]
const tableBodyhotels = [tableHeaderHotels];
// Llenar el cuerpo de la tabla con los datos
data.services.forEach((dayData : any)=> {
    dayData.services.forEach((service: any) => {
        const row = [
           dayData.day.toString(),
            dayData.date,
            service.city,
            service.name_service,
            service.price_base.toString() 
        ];

        // Añadir precios en las columnas correspondientes
        for (let i = 0; i < tam; i++) {
            row.push( service.prices[i] !== undefined ? service.prices[i].toString() : '' );
        }
        console.log('totalrow1',row)
        tableBody.push(row);
    });   
})

//data.hotels.forEach((dayData: any) => {
  data.hotels.forEach((hotel: any) => {
    const row = [
      hotel.day.toString(),
    hotel.date,
     hotel.city  ,
      hotel.name_hotel ,
    hotel.price_base.toString(),
    ];

    // Añadir precios en las columnas correspondientes
    for (let i = 0; i < tam; i++) {
      row.push(hotel.prices[i] !== undefined ? hotel.prices[i].toString() : '' );
    }

    // Añadir "Accommodations" y "Category" al final de la fila
    row.push(hotel.accomodatios_category);

    tableBodyhotels.push(row);
  });
//});

  // Crear la fila de totales
  const totalRow = [
    { text: 'Total Prices', colSpan: 5, alignment: 'center', bold:true }, // Total Prices ocupa 4 columnas
    {}, {}, {}, {}, // Deja las primeras 4 celdas vacías para que 'Total Prices' ocupe 4 columnas
    ...data.total_prices.total_services.map((price: any) => {
      return { text: price.toString(), bold:true }; // Mapea los totales de cada servicio a una celda
    }),
  ];

  const totalRowHotels = [
    { text: 'Total Prices', colSpan: 5, alignment: 'center' , bold:true}, // Total Prices ocupa las primeras 5 columnas
    {}, {}, {}, {}, // Deja las primeras 5 celdas vacías
    ...data.total_prices.total_services.map((price: any) => {
      return { text: price.toString() , bold:true };
    }),
    '',  // Espacio vacío para "Accommodations"
  ];

  // Añadir la fila de totales al final de la tabla
  tableBody.push(totalRow);

  // Añadir la fila de totales al final de la tabla
  tableBodyhotels.push(totalRowHotels);

  const temp1 = 330-(tam*30)
  const temp2 = ((330-(tam*30))/2)-10
  

  console.log('totalPrices:', data.total_prices);
    return {
      content: [
        {
          columns: [
          { text: 'QUOTER', style: 'title' ,width: 220},
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
                body: tableBody
            },
            layout: 'lightHorizontalLines'
        },
       // Sección de Hoteles
      { text: 'Hotels \n', style: 'subtitles' },
      {
        style: 'body',
        table: {
          widths: [20, 60, 50, '*', 30, ...Array(tam).fill(30), '*'], // Ajuste de anchos, añadiendo espacio para Accommodation y Category
          body: tableBodyhotels,
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\n\n' },
      {
        style: 'bodytotals',
        table: {
          widths: ['50%', '50%'], // Ajustar ancho: columna de texto vs precios
          body: [
            [{ text: 'TOTAL COST', bold: true }, { text: `${data.total_prices.total_cost.join(' / ')}` }],
            [{ text: 'EXTERNAL UTILITY', bold: true }, { text: `${data.total_prices.external_utility.join(' / ') || 'N/A'}` }],
            [{ text: 'EXTERNAL TAXES', bold: true }, { text: `${data.total_prices.cost_external_taxes.join(' / ')}` }],
            [{ text: 'TOTAL COST EXTERNAL', bold: true }, { text: `${data.total_prices.total_cost_external.join(' / ')}` }],
          ],
        },
        layout: 'noBorders', // Opcional, si quieres bordes en la tabla
        margin: [200, 0, 0, 0],
      },
      { text: '\n' }, // Espaciado entre tablas
      {
        style: 'bodytotals',
        table: {
          widths: ['50%', '50%'], // Ajustar ancho
          body: [
            [{ text: 'SUBTOTAL', bold: true }, { text: `${data.total_prices.subtotal.join(' / ')}` }],
            [{ text: 'COST OF TRANSFERS', bold: true }, { text: `${data.total_prices.cost_transfers.join(' / ')}` }],
            [{ text: 'FINAL COST', bold: true }, { text: `${data.total_prices.final_cost.join(' / ')}` }],
            [{ text: 'PER PERSON:', bold: true }, { text: `${data.total_prices.price_pp.join(' / ')}` }],
          ],
        },
        layout: 'noBorders',
        margin: [200, 0, 0, 0],
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
}
