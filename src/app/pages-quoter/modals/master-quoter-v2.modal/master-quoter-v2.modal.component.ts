import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { MasterQuoterV2Service } from '../../../Services/master-quoter-v2.service';
import { QuoterV2Service } from '../../../Services/quoter-v2.service';

@Component({
  selector: 'app-master-quoter-v2-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-quoter-v2.modal.component.html',
  styleUrl: './master-quoter-v2.modal.component.css'
})
export class MasterQuoterV2ModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() servicesChange = new EventEmitter<any>();

  numberpaxs = input<number[]>([]);
  childrenAges = input<number[] | undefined>();
  startDateQuoter = input.required<string>();

  mqService = inject(MasterQuoterV2Service);
  quoterV2Service = inject(QuoterV2Service);

  mqQuoters: any[] = [];
  filteredDaysOptions: any[] = [];
  selectedMasterQuoter: any = null;
  filteredOptions: any[] = [];
  searchTerm = '';
  showOptions = false;
  isDropdownOpen = false;
  isDropdownOpenChild = false;
  checkboxes: boolean[][] = [];
  childrenAgesChecks: boolean[] = [];

  selectedServices: any = {
    number_paxs: [] as number[],
    children_ages: [],
    date: '',
    city: '',
    day: 0,
  };

  ngOnInit(): void {
    this.loadmqServices();
    this.checkboxes = this.numberpaxs().map(groupSize => Array(groupSize).fill(true));
    this.childrenAgesChecks = this.childrenAges()?.map(() => true) ?? [];
  }

  async loadmqServices() {
    try {
      const response = await this.mqService.listTemplates({ page: 1, limit: 100, active: true, sortBy: 'name', sortDir: 'asc' });
      this.mqQuoters = response.items || [];
      this.filteredOptions = this.mqQuoters;
    } catch (error) {
      console.error(error);
      toast.error('Error loading Master Quoter V2');
    }
  }

  filterOptions(): void {
    this.filteredOptions = this.searchTerm.trim()
      ? this.mqQuoters.filter(option => option.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      : [];
  }

  async selectOption(option: any): Promise<void> {
    try {
      const resolved = await this.mqService.getResolvedTemplateById(option._id);
      this.selectedMasterQuoter = resolved;
      this.showOptions = false;
      this.searchTerm = resolved.name;
      this.filteredDaysOptions = (resolved.days || []).map((day: any) => ({
        ...day,
        selected: false,
        services: (day.items || []).map((item: any) => ({
          ...item,
          selected: false,
          service_id: item.tariffItemId,
          name_service: item.title || item.tariffItem?.name || item.tariffSnapshot?.name || 'Unnamed item',
          type_service: item.placement,
        }))
      }));

      if (resolved.type === 'TEMPLATE') {
        this.setLastDayServicesSelected();
      }
    } catch (error) {
      console.error(error);
      toast.error('Error loading template detail');
    }
  }

  setLastDayServicesSelected(): void {
    const lastDay = this.filteredDaysOptions.at(-1);
    if (!lastDay) return;
    lastDay.selected = true;
    lastDay.services.forEach((service: any) => {
      if (service.type_service === 'services') {
        service.selected = true;
      }
    });
  }

  toggleAllServices(option: any): void {
    if (option.selected) {
      option.services.forEach((service: any) => {
        if (service.type_service === 'services') service.selected = true;
      });
    } else {
      option.services.forEach((service: any) => {
        if (service.type_service === 'services') service.selected = false;
      });
    }
  }

  isLastElement(index: number): boolean {
    return this.selectedMasterQuoter?.type === 'TEMPLATE' && index === this.filteredDaysOptions.length - 1;
  }

  private getSelectedCountForGroup(groupIndex: number): number {
    return this.checkboxes[groupIndex]?.filter(Boolean).length || 0;
  }

  toggleCheckbox(groupIndex: number, checkboxIndex: number) {
    this.checkboxes[groupIndex][checkboxIndex] = !this.checkboxes[groupIndex][checkboxIndex];
  }

  toggleCheckboxChildrenAges(index: number) {
    this.childrenAgesChecks[index] = !this.childrenAgesChecks[index];
  }

  toggleDropdown() { this.isDropdownOpen = !this.isDropdownOpen; }
  toggleDropdownChild() { this.isDropdownOpenChild = !this.isDropdownOpenChild; }

  async onAddMQuoter() {
    try {
      const selectedItems = this.filteredDaysOptions.flatMap((day: any) =>
        (day.services || [])
          .filter((service: any) => service.selected)
          .map((service: any) => ({
            tariffItemId: service.tariffItemId || service.service_id,
            dayNumber: day.dayNumber,
            placement: service.type_service,
            title: service.name_service,
            notes: service.notes || '',
            city: day.city || service.tariffItem?.city || '',
          }))
      );

      if (!selectedItems.length) {
        toast.warning('Select at least one item');
        return;
      }

      const payload = await this.quoterV2Service.calculatePrices({
        name_quoter: this.selectedMasterQuoter?.name || 'version 1',
        guest: '',
        number_paxs: this.numberpaxs().reduce((sum, _, index) => sum + this.getSelectedCountForGroup(index), 0),
        children_ages: this.childrenAges()?.filter((_, index) => this.childrenAgesChecks[index]) || [],
        travelDateStart: this.selectedMasterQuoter?.type === 'TEMPLATE' ? this.startDateQuoter() : this.selectedServices.date,
        items: selectedItems,
      });

      if (payload.alerts?.length) {
        payload.alerts.forEach((message: string, index: number) => {
          setTimeout(() => toast.info(message, { duration: 8000 }), index * 400);
        });
      }

      this.servicesChange.emit(payload);
      this.closeModal();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.error?.message || 'Error calculating quote items');
    }
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  hideOptions() {
    this.showOptions = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const modalElement = document.getElementById('modalMq');
    const inputElement = document.getElementById('searchInput');
    const dropdownElement = document.getElementById('optionsDropdown');

    if (modalElement && !modalElement.contains(target) && inputElement && !inputElement.contains(target) && dropdownElement && !dropdownElement.contains(target)) {
      this.hideOptions();
    }
  }

  onBlur() {
    setTimeout(() => {
      this.showOptions = false;
    }, 200);
  }
}
