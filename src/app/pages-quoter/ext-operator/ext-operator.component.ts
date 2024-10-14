import { CommonModule } from '@angular/common';
import { Component, input,Input,output, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ext-operator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ext-operator.component.html',
  styleUrl: './ext-operator.component.css'
})
export class ExtOperatorComponent {
  datosFlight = output<any[]>();
  priceLength = input.required<number>();
  @Input() operators: any[]=[]
  @Output() operatorsChange = new EventEmitter<any[]>();
  @Output() totalPricesChange = new EventEmitter<number[]>();
  //editFlight: boolean = false;
 // operators: any[] = [];
  countries: string[] = ["ARGENTINA","BOLIVIA","BRAZIL","COLOMBIA","CHILE","ECUADOR"]
  operatorsList: string[]=["Sayhueque","Uncover Colombia","Unic","Southbound","Pure Brazil","Surtrek"]
  originalItem: any = {};
  newExternalOpe: any = {
    country: '',
    name_operator: '',
    prices:[],
    notes: '',
    editOperator: false
  }
  prices: any[]=[]

  porcentajeTD: number = 0

  ngOnInit(): void {

  }
emtyFlight(){
  return this.newExternalOpe = {
    country: '',
    name_operator: '',
    prices:[],
    notes: '',
    editOperator: false
  }
}

onSubmitOperator() {

    this.operators.push(this.newExternalOpe);
    console.log(this.operators);
    this.emtyFlight();
    this.emitOperator(); 
}

onEdit(item: any, index: number) {
  this.originalItem[index] = { ...item };
  item.editOperator = true;
  console.log('editando item', item, index);
  this.emitOperator(); 

}
onClose(item: any, index: number){
    // Revertir el item al estado original
    this.operators[index] = { ...this.originalItem[index] };
    item.editOperator = false;
    this.emitOperator(); 
}
onSave(item: any){
  item.editOperator= false
  this.originalItem = {};
  this.emitOperator(); 
}
onDelete(index: number){
  this.operators.splice(index, 1); 
  this.emitOperator(); 
}

private emitOperator() {
  // this.prices.push(this.externalUtilityPrices())
  // this.prices.push(this.externalTaxesPrices())
  // this.prices.push(this.totalCostExternal())
  this.operatorsChange.emit(this.operators);
  // this.totalPricesChange.emit(this.prices)
  //this.totalCostExternal
}
externalUtilityPrices(): number[] {
  const totalPrices: number[] = [];
  // Recorrer cada vuelo (flight) en la tabla
  this.operators.forEach((flight: { prices: number[] }) => {
    // Recorrer cada precio dentro del array 'prices' del vuelo
    flight.prices.forEach((price: number, index: number) => {
      // Si ya existe un valor en 'totalPrices' para ese índice, lo suma
      if (totalPrices[index]) {
        totalPrices[index] += price ;
      } else {
        // Si no existe valor aún, lo inicializa con el precio actual
        totalPrices[index] = price;
      }
    });
  });

  const totalWithMultiplier = totalPrices.map(price => price * (this.porcentajeTD/100));
  return totalWithMultiplier;
}

externalTaxesPrices(): number[] {
  const totalPrices: number[] = [];
  // Recorrer cada vuelo (flight) en la tabla
  this.operators.forEach((flight: { prices: number[] }) => {
    // Recorrer cada precio dentro del array 'prices' del vuelo
    flight.prices.forEach((price: number, index: number) => {
      // Si ya existe un valor en 'totalPrices' para ese índice, lo suma
      if (totalPrices[index]) {
        totalPrices[index] += price ;
      } else {
        // Si no existe valor aún, lo inicializa con el precio actual
        totalPrices[index] = price;
      }
    });
  });
  const totalWithCondition = totalPrices.map(price => {
    return price < 5000 ? price * 0.05 : price * 0.03;
  });

 
   
  return totalWithCondition
}

totalCostExternal(): number[] {
  const totalCostExternal: number[]=[]
  const utility = this.externalUtilityPrices();
  const taxes = this.externalTaxesPrices();
  const maxLength = taxes.length;
  this.operators.forEach((flight: { prices: number[] }) => {
    // Recorrer cada precio dentro del array 'prices' del vuelo
    flight.prices.forEach((price: number, index: number) => {
      // Si ya existe un valor en 'totalPrices' para ese índice, lo suma
      if (totalCostExternal[index]) {
        totalCostExternal[index] += price ;
      } else {
        // Si no existe valor aún, lo inicializa con el precio actual
        totalCostExternal[index] = price;
      }
    });
  });
  for (let i = 0; i < maxLength; i++) {
    const temp1 = utility[i] || 0;
    const temp2 = taxes[i] || 0;// Si no existe valor, toma 0
    totalCostExternal[i] = temp1 + temp2;
  }

  return totalCostExternal
}
}
