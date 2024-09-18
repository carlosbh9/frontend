import { Component ,inject,input,OnInit,output} from '@angular/core';
import { OperatorsService } from '../../Services/operators.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-operators',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './form-operators.component.html',
  styleUrl: './form-operators.component.css'
})
export class FormOperatorsComponent implements OnInit{
  operatorsService = inject(OperatorsService)
  serviceItem = output<any>()
  selectedCity = input<string>();
  selectedDate = input<string>();

  selectedOperator: string = '';
  selectedService: string = '';
  selectedPrice: number = 0;

  operators: any[]=[];
  operatorsServices: any[] =[]
  prices: any[]=[]
  notes : string =''
  operator : any={}
;
  async loadEntrances (){
    try{
      this.operators = await this.operatorsService.getAllOperators();
    }catch{
      console.error('Error fetching entrances');
    }
  }

  ngOnInit(): void {
    this.loadEntrances();
  }
  onOperatorsChange(event: any): void{
    const selectedOperator = this.operators.find(operator => operator._id === this.selectedOperator)
    if(selectedOperator){
      this.operatorsServices= selectedOperator.servicios
    }
  }
  onServiceChange(event: any){
    const selectedService = this.operatorsServices.find(service => service._id === this.selectedService)
    if(selectedService){
      this.prices= selectedService.prices
     
    }

    this.operator.name_service=selectedService.descripcion
    
    this.operator.date=this.selectedDate()
    this.operator.city=this.selectedCity()
    
  }

  onPricesChange(event: any){
    this.selectedPrice = Number(event)
    this.operator.price_pp=this.selectedPrice
    this.operator.notes=this.notes
    this.serviceItem.emit(this.operator)
    console.log('es el operador?',this.operator)
  }
}
