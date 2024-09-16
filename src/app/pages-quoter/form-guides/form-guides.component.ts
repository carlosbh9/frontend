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

  selectedService: any = {};
  selectedtype: string = '';
  guides: any[]=[]
  filteredGuides: any[] = []; 
  guide: any = {}
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
  onServiceChange(event: any) {

    const selectedService = this.guides.find(service => service._id === this.selectedService);

      this.guide.name_service=selectedService.name_guide
       this.guide.price_pp=selectedService.price_guide
  
      this.guide.notes=this.notes
      this.guide.date=this.selectedDate()
      this.guide.city=this.selectedCity()
      this.serviceItem.emit(this.guide)
     
    }
}
