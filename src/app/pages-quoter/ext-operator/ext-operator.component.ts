import { CommonModule } from '@angular/common';
import { Component, input,Input,output, Output, EventEmitter, signal, computed,effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ext-operator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ext-operator.component.html',
  styleUrl: './ext-operator.component.css'
})
export class ExtOperatorComponent implements OnInit {
 
  priceLength = input.required<number>();
  porcentajeTd =  input.required<number>()
  porcentajeChange = output<number>()
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
    editOperator: false,
  
  }
  prices: any[]=[]
  porcentajeTD = signal<number>(0)  
  prueba: number = 0
  // porcentajeTD = effect(() => {
  //   const currentPorcentaje = this.porcentajeTd();
  //   this.porcentajeChange.emit(currentPorcentaje);
  //   console.log('el valor emitido es:', currentPorcentaje)
  // })

  ngOnInit(): void {
    this.porcentajeTD.set(this.porcentajeTd() || 0);
  }

  constructor(){
   // this.porcentajeTD.set(this.porcentajeTd() || 0);
    effect(() => {
      const total = this.totalCostExternal();
      const porcentaje = this.porcentajeTD();
      this.porcentajeChange.emit(porcentaje); 
      this.totalPricesChange.emit(total); // Emitir al componente padre
      console.log('Precio total emitido:',this.prueba, this.porcentajeTD(), this.porcentajeTd()); // Debug
    });
  
  }
emtyFlight(){
  return this.newExternalOpe = {
    country: '',
    name_operator: '',
    prices:[],
    notes: '',
    editOperator: false,

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
 
}
externalUtilityPrices = computed(() =>  {
  const totalPrices: number[] = [];
  const td = this.porcentajeTd() 
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

  const totalWithMultiplier = totalPrices.map(price => price * (td/100));

  return totalWithMultiplier;
})

externalTaxesPrices = computed(() => {
  const calculatedPrices: number[] = [];
  const externalPrices = this.externalUtilityPrices();
 // const maxLength = this.externalUtilityPrices().length;
 // Iterar sobre cada operador
 this.operators.forEach((flight: { prices: number[] }) => {
  // Recorrer cada precio dentro del array 'prices' del vuelo
  flight.prices.forEach((price: number, index: number) => {
    // Si ya existe un valor en 'totalPrices' para ese índice, lo suma
    if (calculatedPrices[index]) {
      calculatedPrices[index] += price ;
    } else {
      // Si no existe valor aún, lo inicializa con el precio actual
      calculatedPrices[index] = price;
    }
  });
});
const totalPrices = calculatedPrices.map((price, index) => price + externalPrices[index]);

  const totalWithMultiplier = totalPrices.map(price => price < 5000 ? price * 0.05 : price * 0.03);


return totalWithMultiplier;
});

totalCostExternal= computed(() => {
  const totalCostExternal: number[]=[]
  const utility = this.externalUtilityPrices();
  const taxes = this.externalTaxesPrices();
  //const maxLength = this.priceLength();

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

  const hh = totalCostExternal.map((price, index) => price + utility[index] + taxes[index]);
  return hh
})
}
