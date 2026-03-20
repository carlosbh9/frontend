import { CommonModule } from '@angular/common';
import { Component, input, Output, EventEmitter, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { MasterQuoterV2ModalComponent } from '../../../modals/master-quoter-v2.modal/master-quoter-v2.modal.component';
import { EditServiceV2ModalComponent } from '../../../modals/edit-service-v2-modal/edit-service-v2-modal.component';

@Component({
  selector: 'app-services-v2',
  standalone: true,
  imports: [CommonModule, FormsModule, MasterQuoterV2ModalComponent, EditServiceV2ModalComponent],
  templateUrl: './services-v2.component.html',
  styleUrl: './services-v2.component.css'
})
export class ServicesV2Component {
  private toDayNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private sortDaysAscending<T extends { day: any }>(services: T[]): T[] {
    return [...services].sort((a, b) => this.toDayNumber(a.day) - this.toDayNumber(b.day));
  }

  @Output() servicesChange = new EventEmitter<any>();
  @Output() totalPricesChange = new EventEmitter<number[]>();

  children_ages = input<number[]>();
  startDateQuoter = input.required<string>();
  services = input<any[]>([]);
  number_paxs = input.required<number[]>();

  modalOpen = signal(false);
  modalOpenEditService = signal(false);
  selectserviceEdit: any = {};
  isCreatingDay = signal(false);

  sortedServices = computed(() => {
    const servicesCopy = [...this.services()];
    if (!servicesCopy.length) return [];
    const lastElement = servicesCopy.find(service => service.isFixedLast);
    const filteredServices = lastElement ? servicesCopy.filter(service => !service.isFixedLast) : servicesCopy;
    const sortedBase = this.sortDaysAscending(filteredServices);
    if (lastElement) {
      if (sortedBase.length > 0) {
        const maxDay = this.toDayNumber(sortedBase[sortedBase.length - 1].day);
        return [...sortedBase, { ...lastElement, day: maxDay + 1 }];
      }
      return [lastElement];
    }
    return sortedBase;
  });

  getServicePrices(service: any): number[] {
    if (Array.isArray(service?.prices)) return service.prices.map((price: any) => Number(price) || 0);
    if (service?.price !== undefined && service?.price !== null) return [Number(service.price) || 0];
    return [];
  }

  getTotalPricesServices(): number[] {
    const totalPrices: number[] = [];
    this.sortedServices().forEach((day: { services: any[] }) => {
      day.services.forEach((service: any) => {
        this.getServicePrices(service).forEach((price: number, index: number) => {
          totalPrices[index] = (totalPrices[index] || 0) + price;
        });
      });
    });
    return totalPrices;
  }

  private getMutableServices(): any[] {
    return [...this.services()];
  }

  private findServiceIndex(dayService: any): number {
    return this.services().findIndex(service => service === dayService || (service.day === dayService.day && service.date === dayService.date));
  }

  private emitServices(nextServices: any[] = this.getMutableServices()) {
    const sortedServices = this.sortDaysAscending(nextServices);
    this.servicesChange.emit(sortedServices);
    this.totalPricesChange.emit(this.getTotalPricesServicesFrom(sortedServices));
  }

  private getTotalPricesServicesFrom(services: any[]): number[] {
    const totalPrices: number[] = [];
    services.forEach((day: { services: any[] }) => {
      day.services.forEach((service: any) => {
        this.getServicePrices(service).forEach((price: number, index: number) => {
          totalPrices[index] = (totalPrices[index] || 0) + price;
        });
      });
    });
    return totalPrices;
  }

  openModal() {
    if (!this.startDateQuoter()) {
      toast.warning('Travel dates are required');
      return;
    }
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  openModalEdit(dayService: any) {
    const serviceIndex = this.findServiceIndex(dayService);
    this.selectserviceEdit = serviceIndex >= 0 ? this.services()[serviceIndex] : dayService;
    this.isCreatingDay.set(false);
    this.modalOpenEditService.set(true);
  }

  openAddDayModal() {
    this.selectserviceEdit = {
      day: 0,
      date: this.startDateQuoter() || '',
      number_paxs: [...this.number_paxs()],
      children_ages: [...(this.children_ages() || [])],
      isFixedLast: false,
      services: [],
      city: '',
    };
    this.isCreatingDay.set(true);
    this.modalOpenEditService.set(true);
  }

  closeModalEdit() {
    const nextServices = this.getMutableServices();

    if (this.isCreatingDay()) {
      const hasServices = Array.isArray(this.selectserviceEdit?.services) && this.selectserviceEdit.services.length > 0;
      if (hasServices) {
        nextServices.push({ ...this.selectserviceEdit, services: [...this.selectserviceEdit.services] });
      }
    }

    this.modalOpenEditService.set(false);
    this.isCreatingDay.set(false);
    this.emitServices(nextServices);
  }

  deleteService(index: number) {
    const nextServices = this.getMutableServices();
    nextServices.splice(index, 1);
    this.emitServices(nextServices);
  }

  isLastElement(index: number): boolean {
    return index === this.sortedServices().length - 1;
  }

  getPlacementBadgeClass(service: any): string {
    const placement = service?.placement || service?.type_service;
    return placement === 'options'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-indigo-100 text-indigo-700';
  }

  getPlacementLabel(service: any): string {
    return service?.placement === 'options' || service?.type_service === 'options' ? 'Option' : 'Service';
  }

  getServiceRules(): string[] {
    return [
      'Add Day creates an empty day so you can build services manually.',
      'Open Master Quoter imports template items into the current quote.',
      'Check-all inside the edit modal only selects items of type services.',
      'Options remain manual so the user keeps control over optional sales.',
    ];
  }

  getAutoVehicleLabel(service: any): string {
    return service?.pricing_meta?.auto_vehicle_type || '';
  }

  hasAutoVehicle(service: any): boolean {
    return !!this.getAutoVehicleLabel(service);
  }

  onModalmqQuoterChange(temp: any) {
    const nextServices = this.getMutableServices();
    if (Array.isArray(temp?.services) && temp.services.length && Array.isArray(temp.services[0]?.services)) {
      nextServices.push(...temp.services);
    } else if (temp?.day >= 1 && Array.isArray(temp?.services)) {
      nextServices.push(temp);
    }
    this.emitServices(nextServices);
  }
}
