import { Component, EventEmitter, OnInit, Input ,inject,input, output} from '@angular/core';
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
  

 
hotelItem = output<any>();

selectedCity = input<string>();
selectedDate =  input<string>();

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
    date:'',
    name_hotel:'',
    accomodatios_category: '',
    price_pp: 0,
    price: {
      type:'',
      price:0
    },
    notes:''
  }; 
  hotelService = inject(HotelService)
 
  
  async loadHotels() {
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
  }

  loadHotels2(): void {
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

  }

  onServiceChange(event: any): void {
  const selectedService = this.hotelServices.find(service => service._id === this.selectedService);

    if (selectedService) {
      this.roomTypes = selectedService.roomPrices;
      
    }
  this.quoterItem.city=this.selectedCity()
  this.quoterItem.date=this.selectedDate()
  this.quoterItem.accomodatios_category= selectedService.name_service
  }

onRoomTypeChange(event: any) {
   this.hotelItem.emit(this.quoterItem);
}
}
