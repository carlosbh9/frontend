import { CommonModule } from '@angular/common';
import { Component, input, Output, EventEmitter, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { MasterQuoterV2ModalComponent } from '../../../modals/master-quoter-v2.modal/master-quoter-v2.modal.component';
import { EditServiceV2ModalComponent } from '../../../modals/edit-service-v2-modal/edit-service-v2-modal.component';
import { ServiceDay, ServiceItem } from '../../../../interfaces/quoter-models.interface';

type ServiceModalDayData = Omit<ServiceDay, 'number_paxs'> & {
  number_paxs: number[];
  city?: string;
};

type MasterQuoterServicePayload = ServiceDay[] | (ServiceDay & { services: ServiceItem[] });

@Component({
  selector: 'app-services-v2',
  standalone: true,
  imports: [CommonModule, FormsModule, MasterQuoterV2ModalComponent, EditServiceV2ModalComponent],
  templateUrl: './services-v2.component.html',
  styleUrl: './services-v2.component.css'
})
export class ServicesV2Component {
  private editingServiceIndex: number | null = null;

  private toDayNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private sortDaysAscending<T extends { day: unknown }>(services: T[]): T[] {
    return [...services].sort((a, b) => this.toDayNumber(a.day) - this.toDayNumber(b.day));
  }

  @Output() servicesChange = new EventEmitter<ServiceDay[]>();
  @Output() totalPricesChange = new EventEmitter<number>();

  children_ages = input<number[]>();
  startDateQuoter = input.required<string>();
  services = input<ServiceDay[]>([]);
  number_paxs = input.required<number>();

  modalOpen = signal(false);
  modalOpenEditService = signal(false);
  selectserviceEdit: ServiceModalDayData | null = null;
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

  getServicePrice(service: ServiceItem): number {
    return Number(service?.price) || 0;
  }

  getTotalPricesServices(): number {
    return this.getTotalPricesServicesFrom(this.sortedServices());
  }

  getDayTotalPrice(dayService: ServiceDay): number {
    return (dayService.services || []).reduce((sum, service) => sum + this.getServicePrice(service), 0);
  }

  private getMutableServices(): ServiceDay[] {
    return [...this.services()];
  }

  private findServiceIndex(dayService: ServiceDay): number {
    return this.services().findIndex(service => service === dayService || (service.day === dayService.day && service.date === dayService.date));
  }

  private buildModalDayData(dayService?: ServiceDay): ServiceModalDayData {
    return {
      day: dayService?.day || 0,
      date: dayService?.date || this.startDateQuoter() || '',
      number_paxs: [this.toDayNumber(dayService?.number_paxs ?? this.number_paxs())],
      children_ages: [...(dayService?.children_ages || this.children_ages() || [])],
      isFixedLast: dayService?.isFixedLast === true,
      services: [...(dayService?.services || [])],
      city: dayService?.services?.[0]?.city || '',
    };
  }

  private normalizeModalDayData(dayService: ServiceModalDayData): ServiceDay {
    return {
      ...dayService,
      number_paxs: this.toDayNumber(dayService.number_paxs?.[0] ?? this.number_paxs()),
      children_ages: [...(dayService.children_ages || [])],
      services: (dayService.services || []).map((service) => ({
        ...service,
        price_base: Number(service.price_base) || 0,
        price: Number(service.price) || 0,
      })),
    };
  }

  private emitServices(nextServices: ServiceDay[] = this.getMutableServices()) {
    const sortedServices = this.sortDaysAscending(nextServices);
    this.servicesChange.emit(sortedServices);
    this.totalPricesChange.emit(this.getTotalPricesServicesFrom(sortedServices));
  }

  private getTotalPricesServicesFrom(services: ServiceDay[]): number {
    return services.reduce((total, day) => {
      const dayTotal = (day.services || []).reduce((sum, service) => sum + this.getServicePrice(service), 0);
      return total + dayTotal;
    }, 0);
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

  openModalEdit(dayService: ServiceDay) {
    const serviceIndex = this.findServiceIndex(dayService);
    this.editingServiceIndex = serviceIndex;
    this.selectserviceEdit = this.buildModalDayData(serviceIndex >= 0 ? this.services()[serviceIndex] : dayService);
    this.isCreatingDay.set(false);
    this.modalOpenEditService.set(true);
  }

  openAddDayModal() {
    this.editingServiceIndex = null;
    this.selectserviceEdit = this.buildModalDayData();
    this.isCreatingDay.set(true);
    this.modalOpenEditService.set(true);
  }

  closeModalEdit() {
    const nextServices = this.getMutableServices();
    const selectedDay = this.selectserviceEdit;

    if (selectedDay && this.isCreatingDay()) {
      const hasServices = Array.isArray(selectedDay.services) && selectedDay.services.length > 0;
      if (hasServices) {
        nextServices.push(this.normalizeModalDayData(selectedDay));
      }
    } else if (selectedDay && this.editingServiceIndex !== null) {
      nextServices[this.editingServiceIndex] = this.normalizeModalDayData(selectedDay);
    }

    this.modalOpenEditService.set(false);
    this.isCreatingDay.set(false);
    this.editingServiceIndex = null;
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

  getPlacementBadgeClass(service: ServiceItem): string {
    const placement = service?.placement || service?.type_service;
    return placement === 'options'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-indigo-100 text-indigo-700';
  }

  getPlacementLabel(service: ServiceItem): string {
    return service?.placement === 'options' || service?.type_service === 'options' ? 'Option' : 'Service';
  }

  hasTariffReference(service: ServiceItem): boolean {
    return !!String(service?.tariff_item_id || '').trim();
  }

  getTariffSourceLabel(service: ServiceItem): string {
    return this.hasTariffReference(service) ? 'Tariff linked' : 'No tariff ref';
  }

  getServiceRules(): string[] {
    return [
      'Add Day creates an empty day so you can build services manually.',
      'Open Master Quoter imports template items into the current quote.',
      'Check-all inside the edit modal only selects items of type services.',
      'Options remain manual so the user keeps control over optional sales.',
    ];
  }

  getAutoVehicleLabel(service: ServiceItem): string {
    return service?.pricing_meta?.auto_vehicle_type || '';
  }

  hasAutoVehicle(service: ServiceItem): boolean {
    return !!this.getAutoVehicleLabel(service);
  }

  onModalmqQuoterChange(temp: MasterQuoterServicePayload) {
    const nextServices = this.getMutableServices();
    if (Array.isArray(temp)) {
      nextServices.push(...temp);
    } else if ((temp?.day || 0) >= 1 && Array.isArray(temp?.services)) {
      nextServices.push(temp);
    }
    this.emitServices(nextServices);
  }
}
