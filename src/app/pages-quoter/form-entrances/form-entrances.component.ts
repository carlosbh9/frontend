import { Component, inject, OnInit,input, output } from '@angular/core';
import { EntrancesService } from '../../Services/entrances.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-form-entrances',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-entrances.component.html',
  styleUrl: './form-entrances.component.css'
})
export class FormEntrancesComponent implements OnInit {
  entranceService = inject(EntrancesService)
  serviceItem = output<any>()
  selectedCity = input<string>();
  selectedDate = input<string>();
 
  selectedService: any = {};
  selectedAge: Number =0
  notes: string =''
  entrances: any[]=[];
  entrance: any = {}

  async loadEntrances (){
    try{
      this.entrances = await this.entranceService.getAllEntrances();
    }catch{
      console.error('Error fetching entrances');
    }
  }

  ngOnInit(): void {
    this.loadEntrances();
  }

  onServiceChange(event: any): void {

    const selectedService = this.entrances.find(service => service._id === this.selectedService);
    this.entrance.name_service=selectedService.description

    if(this.selectedAge <= selectedService.childRate.upTo){
      this.entrance.price_pp=selectedService.childRate.pp
    }else{
     this.entrance.price_pp=selectedService.price_pp
    }
    this.entrance.notes=this.notes
    this.entrance.date=this.selectedDate()
    this.entrance.city=this.selectedCity()
    this.serviceItem.emit(this.entrance)
    console.log(this.entrance)
  }


}
