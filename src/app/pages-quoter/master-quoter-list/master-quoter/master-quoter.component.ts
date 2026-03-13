import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntrancesService } from '../../../Services/entrances.service';
import { ExpeditionsService } from '../../../Services/expeditions.service';
import { GuidesService } from '../../../Services/guides.service';
import { RestaurantService } from '../../../Services/restaurant.service';
import { OperatorsService } from '../../../Services/operators.service';
import { MasterQuoterService } from '../../../Services/master-quoter.service';
import { TransportService } from '../../../Services/transport.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainService } from '../../../Services/train.service';
import { ExperiencesService } from '../../../Services/experiences.service';
import { GourmetService } from '../../../Services/limagourmet/gourmet.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { ExtrasService } from '../../../Services/serviceTarifario/extras.service';

type MasterService = {
  type_service: string | null;
  name_service: string | null;
  service_id: string | null;
  service_type: string | null;
  operator_service_id?: string | null;
  train_service_id?: string | null;
};

@Component({
  selector: 'app-master-quoter',
  standalone: true,
  imports: [CommonModule, FormsModule, SweetAlert2Module],
  templateUrl: './master-quoter.component.html',
  styleUrl: './master-quoter.component.css'
})
export class MasterQuoterComponent implements OnInit {
  entranceService = inject(EntrancesService);
  expeditionsService = inject(ExpeditionsService);
  guidesService = inject(GuidesService);
  restaurantService = inject(RestaurantService);
  operatorsService = inject(OperatorsService);
  transportService = inject(TransportService);
  trainService = inject(TrainService);
  activitiesService = inject(ExperiencesService);
  gourmetService = inject(GourmetService);
  extraService = inject(ExtrasService);

  masterQuoterService = inject(MasterQuoterService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  selectedDayIndex: { type: string; dayIndex: number } = { type: 'services', dayIndex: 0 };
  servicesOptions: any[] = [];
  subservicesOptions: any[] = [];
  selectCategoria = '';
  selectedService: any = null;
  selectedSubService: any = null;
  index = 0;
  showUpdate = false;
  idQuoter = '';
  selectedYear = '2025';
  readonly nestedCategories = new Set(['operator', 'train']);

  masterQuoter = {
    name: null as string | null,
    type: 'Templates',
    days: null as number | null,
    destinations: null as string | null,
    day: [{
      city: '',
      name_services: '',
      services: [] as MasterService[]
    }],
  };

  emptyMasterQuoter = {
    name: null as string | null,
    type: 'Templates',
    days: null as number | null,
    destinations: null as string | null,
    day: [{
      city: '',
      name_services: '',
      services: [] as MasterService[]
    }],
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.getQuoterbyId(id);
        this.showUpdate = true;
        this.idQuoter = id;
      }
    });
  }

  async getQuoterbyId(id: string): Promise<void> {
    try {
      this.masterQuoter = await this.masterQuoterService.getMasterQuoterByIdNotReferences(id);
      console.log('quoter cargado', this.masterQuoter);
    } catch (error) {
      console.error('Error get operator by iddd ');
    }
  }

  private getSelectedDay() {
    const dayIndex = this.selectedDayIndex?.dayIndex;
    if (typeof dayIndex !== 'number' || !this.masterQuoter.day[dayIndex]) {
      return null;
    }

    return this.masterQuoter.day[dayIndex];
  }

  private resetSelections() {
    this.selectedService = null;
    this.selectedSubService = null;
    this.subservicesOptions = [];
  }

  private getDisplayName(service: any): string {
    return (
      service.description ||
      service.name ||
      service.name_guide ||
      service.company ||
      service.nombre ||
      service.activitie ||
      service.operador ||
      service.serviceName ||
      service.descripcion ||
      ''
    );
  }

  private addServiceToSelectedDay(service: MasterService) {
    const selectedDay = this.getSelectedDay();
    if (!selectedDay) {
      console.warn('No hay un día seleccionado para agregar servicios');
      return;
    }

    const alreadyExists = selectedDay.services.some(savedService =>
      (service.operator_service_id && savedService.operator_service_id === service.operator_service_id) ||
      (service.train_service_id && savedService.train_service_id === service.train_service_id) ||
      (!service.operator_service_id &&
        !service.train_service_id &&
        savedService.service_id === service.service_id &&
        savedService.type_service === service.type_service &&
        savedService.service_type === service.service_type)
    );

    if (!alreadyExists) {
      selectedDay.services.push({ ...service });
    }
  }

  removeTag(tag: MasterService): void {
    const selectedDay = this.getSelectedDay();
    if (!selectedDay) {
      console.warn('Indice de dia no valido');
      return;
    }

    const index = selectedDay.services.findIndex(service =>
      (tag.operator_service_id && service.operator_service_id === tag.operator_service_id) ||
      (tag.train_service_id && service.train_service_id === tag.train_service_id) ||
      (!tag.operator_service_id && !tag.train_service_id && service.service_id === tag.service_id)
    );

    if (index !== -1) {
      selectedDay.services.splice(index, 1);
    }
  }

  async onCategoriaChange() {
    this.resetSelections();

    switch (this.selectCategoria) {
      case 'entrance':
        this.servicesOptions = (await this.entranceService.getAllEntrances()).filter(item => item.year === this.selectedYear);
        break;
      case 'expeditions':
        this.servicesOptions = (await this.expeditionsService.getAllExpeditions()).filter(item => item.year === this.selectedYear);
        break;
      case 'guides':
        this.servicesOptions = (await this.guidesService.getAllGuides()).filter(item => item.year === this.selectedYear);
        break;
      case 'restaurant':
        this.servicesOptions = (await this.restaurantService.getAllRestaurants()).filter(item => item.year === this.selectedYear);
        break;
      case 'transport':
        this.servicesOptions = (await this.transportService.getalltransport()).filter(item => item.year === this.selectedYear);
        break;
      case 'experience':
        this.servicesOptions = (await this.activitiesService.getAllExperiences()).filter(item => item.year === this.selectedYear);
        break;
      case 'gourmet':
        this.servicesOptions = (await this.gourmetService.getAllLimagourmet()).filter(item => item.year === this.selectedYear);
        break;
      case 'train':
        this.servicesOptions = (await this.trainService.getAllTrains()).filter(item => item.year === this.selectedYear);
        break;
      case 'operator':
        this.servicesOptions = (await this.operatorsService.getAllOperators()).filter(item => item.year === this.selectedYear);
        break;
      case 'extra':
        this.servicesOptions = (await this.extraService.getAllExtras()).filter(item => item.year === this.selectedYear);
        break;
      default:
        this.servicesOptions = [];
    }
  }

  async onServiceChange() {
    if (!this.selectedService?.service_id) {
      return;
    }

    this.selectedService.type_service = this.selectedDayIndex?.type || 'services';

    if (this.selectCategoria === 'operator') {
      this.subservicesOptions = await this.operatorsService.getServicesByOperator(this.selectedService.service_id);
      this.selectedSubService = null;
      return;
    }

    if (this.selectCategoria === 'train') {
      this.subservicesOptions = await this.trainService.getServicesByTrainId(this.selectedService.service_id);
      this.selectedSubService = null;
      return;
    }

    this.addServiceToSelectedDay(this.selectedService);
    this.selectedService = null;
  }

  onSubServiceChange() {
    if (!this.selectedService?.service_id || !this.selectedSubService) {
      return;
    }

    const serviceToSave: MasterService = {
      ...this.selectedSubService,
      type_service: this.selectedDayIndex?.type || 'services',
      service_id: this.selectedService.service_id,
      service_type: this.selectCategoria,
    };

    if (this.nestedCategories.has(this.selectCategoria)) {
      this.addServiceToSelectedDay(serviceToSave);
      this.selectedSubService = null;
    }
  }

  getMainServiceValue(service: any): MasterService {
    return {
      type_service: this.selectedDayIndex?.type || 'services',
      service_id: service._id,
      service_type: this.selectCategoria,
      name_service: this.getDisplayName(service),
    };
  }

  getSubServiceValue(service: any): Partial<MasterService> {
    if (this.selectCategoria === 'operator') {
      return {
        operator_service_id: service._id,
        name_service: service.descripcion,
      };
    }

    if (this.selectCategoria === 'train') {
      return {
        train_service_id: service._id,
        name_service: service.serviceName,
      };
    }

    return {};
  }

  addDays() {
    this.index++;
    this.masterQuoter.day.push({
      city: '',
      name_services: '',
      services: []
    });
  }

  onSubmit() {
    this.masterQuoterService.createMasterQuoter(this.masterQuoter).then(
      response => {
        console.log('Mater Quoter added', response);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Your work has been saved',
          showConfirmButton: false,
          timer: 1500
        });
        this.masterQuoter = structuredClone(this.emptyMasterQuoter);
      },
      error => {
        console.error('Error adding Master Quoter', error);
      }
    );
  }

  onUpdate() {
    this.masterQuoterService.updateMasterQuoter(this.idQuoter, this.masterQuoter).then(
      response => {
        console.log('Quoter update', response);
        this.router.navigate([`/quoter-main/master-quoter-list`], { relativeTo: this.route });
        this.masterQuoter = structuredClone(this.emptyMasterQuoter);
      },
      error => {
        console.error('Error editing Quoter', error);
      }
    );
  }
}
