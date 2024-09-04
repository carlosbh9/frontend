import { Component, inject, OnInit,input } from '@angular/core';
import { Entrance } from './entrance.interface';
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
  selectedCity = input<string>();
  selectedDate = input<string>();
 
  selectedService: string = '';
  selectedPrice: Number =0
  entrances: any[]=[];


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
    console.log(this.selectedService)
  }


}
