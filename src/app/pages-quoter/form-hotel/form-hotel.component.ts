import { Component, EventEmitter, OnInit, Output ,input, output} from '@angular/core';
import { HotelService } from '../../Services/hotel.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { NonNullAssert } from '@angular/compiler';

@Component({
  selector: 'app-form-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-hotel.component.html',
  styleUrl: './form-hotel.component.css'
})
export class FormHotelComponent implements OnInit {
  
//@Output() addItem = new EventEmitter<any>();
 
hotelItem = output<any>();
itemsNull = input<boolean>(false)
  selectedHotel: string = '';
  selectedService: string = '';
  selectedRoomType: string = '';
  hotels: any[] = [];
  hotelServices: any[] = [];
  roomTypes: any[] = [];
  
  selectedItem: any[]=[]
  selectedRoomTypePrices: any[]=[];
  selectedPrices: any[] = [];

  quoterItem: any = {
    city:'',
    name_hotel:'',
    accomodatios_category: '',
    price_pp: 0,
    price: {
      type:'',
      price:0
    },
    notes:''
  }; 
  
  constructor(private hotelService: HotelService) {}
  
  async loadHotels2() {
    try {
      this.hotels = await this.hotelService.getAllHotels();
     // this.hotels = data;
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  }
  
  //itemsNull(){

 // }

  ngOnInit(): void {
    this.loadHotels();
    if(this.itemsNull!){ // Cambiar la comparación para verificar el valor 
      this.selectedHotel== null
      this.selectedService == null
      this.selectedRoomType==null
      
      // ... lógica adicional si es necesario
    }
    console.log('bbbbb',this.itemsNull)
  }

  loadHotels(): void {
    this.hotelService.getAllHotels().then((data: any[]) => {
      this.hotels = data;
    });
  }

  onHotelChange(event: any): void {
      const selectedHotel = this.hotels.find(hotel => hotel._id === this.selectedHotel)
      // Cambiar la llamada para esperar el resultado de la promesa
      if(selectedHotel){
        this.hotelServices= selectedHotel.services
      }
      this.quoterItem.name_hotel= selectedHotel.name
      this.quoterItem.city=selectedHotel.location
    //  this.hotelService.getServicesByHotelId(this.selectedHotel).then((services: any[]) => {
    //    this.hotelServices = services;
    //  });
    console.log('ttt',this.itemsNull)
    
  }

  onServiceChange(event: any): void {
  const selectedService = this.hotelServices.find(service => service._id === this.selectedService);

    if (selectedService) {
      this.roomTypes = selectedService.roomPrices;
      
    }
  this.quoterItem.accomodatios_category= selectedService.name_service
  }

onRoomTypeChange(event: any) {
   this.hotelItem.emit(this.quoterItem);
}
//enviarAlPadre(){
  //this.hotelItem.emit(this.selectedPrices);
//}

//<button (click)="enviarAlPadre()">Enviar Datos al Padre</button>

}
