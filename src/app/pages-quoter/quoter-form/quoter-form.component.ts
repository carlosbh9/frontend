import { CommonModule } from '@angular/common';
import { Component, OnInit,Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuoterService } from '../../Services/quoter.service';
import { FormHotelComponent } from '../form-hotel/form-hotel.component';
import { FormEntrancesComponent } from '../form-entrances/form-entrances.component';
import {FormExpeditionsComponent} from '../form-expeditions/form-expeditions.component'

@Component({
  selector: 'app-quoter-form',
  standalone: true,
  imports: [CommonModule, FormsModule,FormHotelComponent,FormEntrancesComponent,FormExpeditionsComponent],
  templateUrl: './quoter-form.component.html',
  styleUrl: './quoter-form.component.css'
})
export class QuoterFormComponent implements OnInit{
 
  selectedDate: string ='';
  selectedCity: string = '';
  cont = 0 ;
  quoter: any={}
  
  newQuoter: any = {
    guest:'',
    FileCode: '',
    travelDate:{
        start:'',
        end: ''
    },
    acomodations:'',
    totalNights: '',
    number_paxs: 0,
    trvale_agent:'',
    exchange_rate:'',
    services:[],
    hotels:[],
    flights:[]
  };

  selectedQuoter: any = {
    guest:'',
    FileCode: '',
    travelDate:{
        start:'',
        end: ''
    },
    acomodations:'',
    totalNights: '',
    number_paxs: 0,
    trvale_agent:'',
    exchange_rate:'',
    services:[],
    hotels:[],
    flights:[]
  };

  selectedCategory: string = '';
  //hotels: any[] = [];
 

  datosrecibidosHotel: any={};
  datosrecibidosService: any ={}

  constructor(private quoterService: QuoterService) {}
  
  ngOnInit(): void {
    this.fetchHotels(); 
  }

  async fetchHotels() {
    try {
   //   this.quoters = await this.quoterService.getAllQuoter();
      this.quoter= this.newQuoter
    } catch (error) {
      console.error('Error fetching Quoters', error);
    }
  }

  addItemToQuote(datos: any){
  
      this.datosrecibidosHotel ={
        day: this.cont,
        city: datos.city,
        date:datos.date,
        name_hotel: datos.name_hotel,
        type_hotel: datos.price.type,
        price: datos.price.price,
        accomodatios_category: datos.accomodatios_category,
        notes:datos.notes
      };
  }

  addItemService(datos:any){
    this.datosrecibidosService={
      day:this.cont,
      date: datos.date,
      city: datos.city,
      name_service: datos.name_service,
      price_pp:datos.price_pp,
      price:datos.price_pp,
      notes: datos.notes
    }
  }

  
  onSubmit(){
    if(this.datosrecibidosHotel!){
          this.newQuoter.hotels.push(this.datosrecibidosHotel)
    }
    if(this.datosrecibidosService!){
          this.newQuoter.services.push(this.datosrecibidosService)
    }
    this.cont++
  }

  


  onSubmit2(){
    this.quoterService.addItemQuoter(this.newQuoter._id,this.newQuoter.hotels).then(
      response => {
        console.log('Quoter added',response)
        this.fetchHotels();
      },
      error => {
        console.error('Error adding Quoter', error)
      }
    )

  }
}
