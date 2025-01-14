import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService } from '../../Services/transport.service';
import { HasRoleDirective } from '../../Services/AuthService/has-role.directive';

@Component({
  selector: 'app-transport',
  standalone: true,
  imports: [CommonModule, FormsModule,HasRoleDirective],
  templateUrl: './transport.component.html',
  styleUrl: './transport.component.css'
})
export class TransportComponent {
  transports: any[] = [];
  filteredTransports: any[] = [];
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;
  filterYear : string = '2025'

  newTransport: any = {
    nombre: '',
    type_service: '',
    type_vehicle: [],
    info: '',
    year:''
  };
  
  selectedTransport: any = {
    nombre: '',
    type_service: '',
    type_vehicle: [],
    info: '',
    year:''
  };

  vehiculos: any [] =[
    {vehiculo: 'CAMIONETA/VW TRANSPORTER /TOYOTA HIACE 01 - 03', range_min:1,range_max :3},
    {vehiculo: 'VW CRAFTER 04 - 07', range_min:4,range_max :7},
    {vehiculo: 'SPRINTER MB 08 - 15/VW CRAFTER DLX 4 PAX', range_min:8,range_max :15},
    {vehiculo: 'MINIBUS 16 - 25', range_min:16,range_max :25},
    {vehiculo: 'AGUA 1 - 2',range_min:1,range_max :2},
    {vehiculo: 'AGUA 3 - 4',range_min:3,range_max :4},
    {vehiculo: 'AGUA 5 - 6',range_min:5,range_max :6},
    {vehiculo: 'AGUA 6 - 10',range_min:6,range_max :10},
  ]

  constructor(private transportService: TransportService) {}

ngOnInit(): void {
  this.fetchTransports();
}

//fetch transports
async fetchTransports() {
  try {
    this.transports = await this.transportService.getalltransport();
    this.filteredTransports = this.transports;
  } catch (error) {
    console.error('Error fetching transports:', error);
  }
}

filterTransports() {
  this.filteredTransports = this.transports.filter(transport => transport.nombre.toLowerCase().includes(this.filterText.toLowerCase())&& (this.filterYear ? transport.year === this.filterYear : true) );
}

onYearChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement; // Casting a HTMLSelectElement
  this.filterYear = String(selectElement.value); // Convertir el valor a número
  this.filterTransports();
}
//delete transport
async deleteTransport(id: string) {
  try {
    await this.transportService.deletetransport(id);
    this.fetchTransports();
  } catch (error) {
    console.error('Error deleting transport:', error);
  }
}

openEditModal(transport: any) {
 this.selectedTransport = {...transport};
 this.showEditModal = true;
}

closeEditModal() {
  this.showEditModal = false;
  this.fetchTransports();
}


openAddModal() {
  this.showAddModal = true;
}

closeModal() {
  this.showAddModal = false;
  this.emptyTransport();
}

emptyTransport(): void {
  this.newTransport = {
    nombre: '',
    type_service: '',
    type_vehicle: [],
    info: '',
    year:''
  };}

onSubmit(){
  this.transportService.addtransport(this.newTransport).then(response => {
    console.log('Transport added successfully:', response);
    this.fetchTransports();
    this.closeModal();
  }).catch(error => {
    console.error('Error adding transport:', error);
  });
}

onEditSubmit(){
  this.transportService.updatetransport(this.selectedTransport._id, this.selectedTransport).then(response => {
    console.log('Transport updated successfully:', response);
    this.fetchTransports();
    this.closeEditModal();
  }).catch(error => {
    console.error('Error updating transport:', error);
  });
}

addPriceField() {
  this.newTransport.type_vehicle.push({name_type_vehicle: '', price:0});
}

addEditPriceField() {
  this.selectedTransport.type_vehicle.push({name_type_vehicle: '', price:0});
}

removeEditPriceField(index: number) {
  if (this.selectedTransport.type_vehicle.length >= 1) { // Prevent removing the only price field
    this.selectedTransport.type_vehicle.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }
}

removePriceField(index: number) {
  if (this.newTransport.type_vehicle.length >= 1) { // Prevent removing the only price field
    this.newTransport.type_vehicle.splice(index, 1);
  } else {
    // Handle the case of removing the only price field (optional: clear values or display a message)
    console.warn('Cannot remove the only price field.');
  }
}

}
