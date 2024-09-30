import { CommonModule } from '@angular/common';
import { Component , inject, OnInit,input, output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GuidesService } from '../../Services/guides.service';

@Component({
  selector: 'app-form-guides',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-guides.component.html',
  styleUrl: './form-guides.component.css'
})
export class FormGuidesComponent implements OnInit {

  guidesService = inject(GuidesService)
  serviceItem = output<any>()
  selectedCity = input<string>();
  selectedDate = input<string>();
  priceLength = input.required<number>();
  addedPricesCount: number = 0

  selectedService: any = {};
  selectedtype: string = '';
  guides: any[]=[]
  filteredGuides: any[] = []; 
  guide: any = {
    prices:[]
  }
  notes: string = ''

  ngOnInit(): void {
    this.loadGuides();
  }


  async loadGuides (){
    try{
      this.guides = await this.guidesService.getAllGuides();
    }catch{
      console.error('Error fetching expeditions');
    }
  }
  onServices(event:any){
    if (this.selectedtype) {
      this.filteredGuides = this.guides.filter(guide => guide.type_guide === this.selectedtype);
    } else {
      this.filteredGuides = [];
    }

   
  }

  addPrices(){
 
    if (this.addedPricesCount < this.priceLength()) {
     // Agregamos el precio actual al final del arreglo
     this.guide.prices[this.addedPricesCount] = this.guide.price_pp;
     this.addedPricesCount++; // Incrementamos el contador
   } else {
     // Si ya se ha alcanzado el límite de precios, mostramos un mensaje
     console.log("No se pueden agregar más precios, el arreglo está lleno.");
   }
 
   }

  onServiceChange(event: any) {

    const selectedService = this.guides.find(service => service._id === this.selectedService);
    if (selectedService) {
      this.guide.name_service=selectedService.name_guide
      this.guide.price_pp=selectedService.price_guide
    }

      this.guide.notes=this.notes
      this.guide.date=this.selectedDate()
      this.guide.city=this.selectedCity()
      this.serviceItem.emit(this.guide)
     
    }

    Services(event: any){
    //this.guide.prices= new Array(this.priceLength()).fill(0);
    //this.addedPricesCount=0
    this.notes = ''
    }
}
