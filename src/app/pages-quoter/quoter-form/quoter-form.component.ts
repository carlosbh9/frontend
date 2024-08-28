import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuoterService } from '../../Services/quoter.service';
import { FormHotelComponent } from '../form-hotel/form-hotel.component';

@Component({
  selector: 'app-quoter-form',
  standalone: true,
  imports: [CommonModule, FormsModule,FormHotelComponent],
  templateUrl: './quoter-form.component.html',
  styleUrl: './quoter-form.component.css'
})
export class QuoterFormComponent implements OnInit{
  currentHotelIndex: number | null = null; 
  itemsNull: boolean =  false
  quoters: any[]=[];
  quoter: any={}
  filteredQuoters: any[] = [];
  filterText: string = '';
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
 

  datosrecibidos: any={};

  constructor(private quoterService: QuoterService) {}
  
  ngOnInit(): void {
    this.fetchOperators(); 
  }

  async fetchOperators() {
    try {
   //   this.quoters = await this.quoterService.getAllQuoter();
      this.quoter= this.newQuoter
      this.filteredQuoters = this.quoters;
    } catch (error) {
      console.error('Error fetching Quoters', error);
    }
  }
  itemsNull2(){

    const selectedHotel: any = null
    const selectedService : any = null
    const selectedRoomType : any =null
  }
  addItemToQuote(datos: any){

      this.datosrecibidos ={
 
        city: datos.city,
        name_hotel: datos.name_hotel,
        type_hotel: datos.price.type,
        price: datos.price.price,
        accomodatios_category: datos.accomodatios_category,
        notes:datos.notes
      };

    //  this.currentHotelIndex = this.newQuoter.hotels.length - 1;
    

  }
  onSubmit(){
    this.newQuoter.hotels.push(this.datosrecibidos)
    console.log('nuevo',this.newQuoter.hotels)
    console.log('nuevo',this.newQuoter)
    this.itemsNull = !this.itemsNull;
  
  }

  resetCurrentHotel(): void {
    // Método para resetear el índice del hotel en edición
    this.currentHotelIndex = null;
    console.log('hoteles agregados',this.newQuoter)
  }
    
  


  onSubmit2(){
    this.quoterService.addItemQuoter(this.newQuoter._id,this.newQuoter.hotels).then(
      response => {
        console.log('Quoter added',response)
        this.fetchOperators();
      },
      error => {
        console.error('Error adding Quoter', error)
      }
    )
 
     console.log('new quoter: ',this.newQuoter.hotels)
     console.log('ID: ',this.newQuoter)
  }
}
