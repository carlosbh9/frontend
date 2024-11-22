import { CommonModule } from '@angular/common';
import { Component ,input,OnInit,Input, Output, EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cruceros',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './cruceros.component.html',
  styleUrl: './cruceros.component.css'
})
export class CrucerosComponent {
  paxs = input.required<number[]>();
  @Input() cruises: any[] = [];
 // flights = input<any[]>();
  @Output() cruisesChange = new EventEmitter<any[]>();
  @Output() totalPricesChange = new EventEmitter<number[]>();


  cruisesOptions: string[] = ['AMAZON','OTHER']
  operators: string[] = ['AQUA NERA','ARIA','DELFIN I','DELFIN II & III','RIVER & FOREST']
  originalItem: any = {};
  newCruise: any = {
    name: '',
    operator: '',
    price_conf: 0,
    prices:[],
    notes: '',
    editFlight: false
  }

  emtyCruise(){
    return this.newCruise = {
      name: '',
      operator: '',
      price_conf: 0,
      prices:[],
      notes: '',
      editCruise: false
    }
  }
  onSubmitCruise() {
    this.newCruise.price_conf = this.newCruise.prices[0]
    this.cruises.push(this.newCruise)
    this.emitCruise();
    this.emtyCruise();
  }

  onEdit(item: any, index: number) {
    this.originalItem[index] = { ...item };
    item.editCruise = true;
    console.log('editando item', item, index);
    this.emitCruise(); 
  }

  onClose(item: any, index: number){
  // Revertir el item al estado original
  this.cruises[index] = { ...this.originalItem[index] };
  item.editCruise = false;
  this.emitCruise(); 
}
onSave(item: any){
  item.editCruise= false
  this.originalItem = {};
  this.emitCruise(); 
}
onDelete(index: number){
  this.cruises.splice(index, 1); 
  this.emitCruise();
}

private emitCruise() {
  this.cruisesChange.emit(this.cruises);
  this.totalPricesChange.emit(this.getTotalPrices())
}
getTotalPrices(): number[] {
  const totalPrices: number[] = [];
  // Recorrer cada vuelo (flight) en la tabla
  if(this.cruises!){
  this.cruises.forEach((cruise: { prices: number[] }) => {
    // Recorrer cada precio dentro del array 'prices' del vuelo
    cruise.prices.forEach((price: number, index: number) => {
      // Si ya existe un valor en 'totalPrices' para ese índice, lo suma
      if (totalPrices[index]) {
        totalPrices[index] += price;
      } else {
        // Si no existe valor aún, lo inicializa con el precio actual
        totalPrices[index] = price;
      }
    });
  });
  }
  return totalPrices;
}
}
