import { Component, inject, OnInit,input, output } from '@angular/core';
import { ExpeditionsService } from '../../Services/expeditions.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-expeditions',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-expeditions.component.html',
  styleUrl: './form-expeditions.component.css'
})
export class FormExpeditionsComponent implements OnInit {

expeditionsService = inject(ExpeditionsService)

serviceItem = output<any>()
selectedCity = input<string>();
selectedDate = input<string>();
 
selectedService: any = {};
expeditions: any[]=[]
expedition: any = {}

notes: string = ''

async loadExpeditions (){
  try{
    this.expeditions = await this.expeditionsService.getAllExpeditions();
  }catch{
    console.error('Error fetching expeditions');
  }
}

ngOnInit(): void {
  this.loadExpeditions();
}

onServiceChange(event: any) {
  const selectedService = this.expeditions.find(service => service._id === this.selectedService);
    this.expedition.name_service=selectedService.name
     this.expedition.price_pp=selectedService.price_pp

    this.expedition.notes=this.notes
    this.expedition.date=this.selectedDate()
    this.expedition.city=this.selectedCity()
    this.serviceItem.emit(this.expedition)
   
  }

}
