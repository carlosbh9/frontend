import { Component, EventEmitter, Output ,input, output} from '@angular/core';
import { HotelService } from '../../Services/hotel.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-hotel.component.html',
  styleUrl: './form-hotel.component.css'
})
export class FormHotelComponent {
  
//@Output() addItem = new EventEmitter<any>();
 
hotelItem = output<any>();

selectedHotel: string = '';
  selectedService: string = '';
  selectedRoomType: string = '';
  hotels: any[] = [];
  hotelServices: any[] = [];
  roomTypes: any[] = [];
  
  selectedItem: any[]=[]
  selectedRoomTypePrices: any[]=[];
  selectedPrices: any[] = [];
  
  constructor(private hotelService: HotelService) {}
  
  async loadHotels2() {
    try {
      this.hotels = await this.hotelService.getAllHotels();
     // this.hotels = data;
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  }
  


  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.hotelService.getAllHotels().then((data: any[]) => {
      this.hotels = data;
    });
  }

  onHotelChange(event: any): void {
 
    //const selectedHotel = this.hotels.find(hotel => hotel._id === this.selectedHotel);

      // Cambiar la llamada para esperar el resultado de la promesa
      this.hotelService.getServicesByHotelId(this.selectedHotel).then((services: any[]) => {
        this.hotelServices = services;
      });
    console.log('es el id?: ',this.selectedHotel)

    //if (selectedHotel) {
      //this.hotelServices = selectedHotel.services;
   // }
  }
  onServiceChange(event: any): void {
  const selectedService = this.hotelServices.find(service => service._id === this.selectedService);

    if (selectedService) {
      this.roomTypes = selectedService.roomPrices;
    }
   
  }
 async onRoomTypeChange(event: any) {
  
this.selectedItem.push(this.selectedHotel,this.selectedService,this.selectedRoomType)
  this.selectedItem[event] = event.target.value;
   this.hotelItem.emit(this.selectedItem);
}
//enviarAlPadre(){
  //this.hotelItem.emit(this.selectedPrices);
//}

//<button (click)="enviarAlPadre()">Enviar Datos al Padre</button>

}
