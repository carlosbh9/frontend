import { Component, OnInit } from '@angular/core';
import { OperatorsService } from '../../Services/operators.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-operators-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operators-services.component.html',
  styleUrl: './operators-services.component.css'
})
export class OperatorsServicesComponent implements OnInit{
  
  services: any[] = [];
  operatorId: string = '';
  filterText: string = '';

  constructor (private operatorsService: OperatorsService,private route: ActivatedRoute){}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.operatorId = id;
        this.fetchServices(id);
      }
    });
  }

  async fetchServices(id: string) {
    try {
      this.services = await this.operatorsService.getServicesByOperator(id);
    } catch (error) {
      console.error('Error fetching services', error);
    }
  }
  addService() {
    // Implementar lógica para agregar un nuevo servicio
  }

  editService(service: any) {
    // Implementar lógica para editar un servicio existente
  }

  deleteService(serviceId: string) {
    // Implementar lógica para eliminar un servicio existente
  }
}