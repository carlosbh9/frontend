import { Component, OnInit } from '@angular/core';
import { TrainService } from '../../Services/train.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-train-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './train-services.component.html',
  styleUrl: './train-services.component.css'
})
export class TrainServicesComponent implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  trainId: string = '';
  filterText: string = '';
  showAddModal = false;
  showEditModal = false;

  selectedTrain: any = {
    company: '',
    services: [],
    observations: ''
  };

  newService: any = {
    serviceName: '',
    prices: [{
      season: 'Regular',
      adultPrice: 0,
      childPrice: 0,
      guidePrice: 0
    }],
    observations: ''
  };

  selectService: any = {
    serviceName: '',
    prices: [{
      season: 'Regular',
      adultPrice: 0,
      childPrice: 0,
      guidePrice: 0
    }],
    observations: ''
  };

  constructor(private trainService: TrainService, private route: ActivatedRoute) {}

ngOnInit(): void {
  this.route.paramMap.subscribe((params) => {
    const id = params.get('id');
    if (id) {
      this.trainId = id;
      this.fetchTrainServices(id);
      this.getTrainById(id);
    }
  });
}

async fetchTrainServices(id: string) {
  try {
    this.services = await this.trainService.getServicesByTrainId(id);
    this.filteredServices = this.services;
  } catch (error) {
    console.error('Error fetching train services:', error);
  }
}

filterServices() {
      this.filteredServices = this.services.filter((service) => service.serviceName.toLowerCase().includes(this.filterText.toLowerCase()));
}

async onSubmit() {
  try {
    const response = await this.trainService.addServiceToTrain(this.trainId, this.newService);
    console.log('Servicio añadido', response);
    this.fetchTrainServices(this.trainId);  // Actualizar la lista de servicios
    this.emptyService()
    this.showAddModal = false;
    
  } catch (error) {
    console.error('Error al añadir servicio', error);
    
  }
}

async onEditSubmit() {
  try {
    await this.trainService.updateService(this.trainId, this.selectService._id, this.selectService);
    console.log('Servicio actualizado');
    this.fetchTrainServices(this.trainId);
    this.showEditModal = false;
  } catch (error) {
    console.error('Error al actualizar servicio', error);
  }
}

async deleteService(serviceId: string) {
  try {
    await this.trainService.deleteService(this.trainId, serviceId);
    console.log('Servicio eliminado');
    this.fetchTrainServices(this.trainId);
  } catch (error) {
    console.error('Error al eliminar servicio', error);
  }
}

async getTrainById(id: string) {
  try {
    this.selectedTrain = await this.trainService.getTrainById(id);
  } catch (error) {
    console.error('Error al obtener el tren', error);
  }
}

openEditModal(operator: any) {
  this.selectService = { ...operator };
  this.showEditModal = true;

}

closeEditModal() {
  this.showEditModal = false;
  this.fetchTrainServices(this.trainId);
}

openModal() {
  this.showAddModal = true;
}

closeModal() {
  this.showAddModal = false;
  this.emptyService();
}

emptyService(): void {
  this.newService = {
    serviceName: '',
    prices: [{
      season: 'Regular',
      adultPrice: 0,
      childPrice: 0,
      guidePrice: 0
    }],
    observations: ''
  };
}

// addPriceField() {
//   this.newService.prices.push({season:'Regular', adultPrice:0, childPrice:0 , guidePrice: 0});
// }

// addEditPriceField() {
//   this.selectService.prices.push({season:'Regular',adultPrice: 0, childPrice:0, guidePrice: 0});
// }

// removePriceField(index: number) {
//   if (this.newService.prices.length >= 1) {
//     this.newService.prices.splice(index, 1);
//   }else{
//     console.warn('No se puede eliminar el ltimo campo de precio');
//   }
// }

// removeEditPriceField(index: number) {
//   if (this.selectService.prices.length >= 1) {
//     this.selectService.prices.splice(index, 1);
//   }else{
//     console.warn('No se puede eliminar el ltimo campo de precio');
//   }
// }

}
