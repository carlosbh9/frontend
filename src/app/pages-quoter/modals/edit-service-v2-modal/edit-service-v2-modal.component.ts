import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, inject, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { MasterQuoterV2Service } from '../../../Services/master-quoter-v2.service';
import { QuoterV2Service } from '../../../Services/quoter-v2.service';
import { TariffV2Service } from '../../../Services/tariff-v2.service';
import { TariffItemV2 } from '../../../interfaces/tariff-v2.interface';

@Component({
  selector: 'app-edit-service-v2-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-service-v2-modal.component.html',
  styleUrl: './edit-service-v2-modal.component.css'
})
export class EditServiceV2ModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() dayData: any;

  number_paxs = input<number[]>();
  children_ages = input<number[]>();

  tariffV2Service = inject(TariffV2Service);
  quoterV2Service = inject(QuoterV2Service);
  masterQuoterV2Service = inject(MasterQuoterV2Service);

  selectedCategory = '';
  selectedYear = '';
  searchTerm = '';
  selectedItemId = '';
  selectedItem: TariffItemV2 | null = null;
  city = '';
  tariffItems: TariffItemV2[] = [];
  filteredTariffItems: TariffItemV2[] = [];
  availableYears: string[] = [];
  availableCategories: string[] = [];
  checkboxes: boolean[][] = [];
  childrenAgesChecks: boolean[] = [];
  isDropdownOpen = false;
  isDropdownOpenChild = false;
  showTariffOptions = false;

  mqSearchTerm = '';
  mqTypeFilter = '';
  mqQuoters: any[] = [];
  filteredMqOptions: any[] = [];
  selectedMqTemplate: any = null;
  filteredMqDaysOptions: any[] = [];
  showMqOptions = false;

  ngOnInit(): void {
    this.dayData.services = Array.isArray(this.dayData?.services) ? this.dayData.services : [];
    this.dayData.children_ages = Array.isArray(this.dayData?.children_ages) ? this.dayData.children_ages : [];
    this.dayData.number_paxs = Array.isArray(this.dayData?.number_paxs) ? this.dayData.number_paxs : [...(this.number_paxs() || [])];

    this.checkboxes = (this.number_paxs() || []).map((groupSize: number, groupIndex: number) => {
      const selectedCount = this.dayData.number_paxs?.[groupIndex] ?? groupSize;
      return Array.from({ length: groupSize }, (_, index) => index < selectedCount);
    });

    this.childrenAgesChecks = this.children_ages()?.map((age: number) => this.dayData.children_ages?.includes(age) || false) || [];
    this.city = this.dayData?.services?.[0]?.city || this.dayData?.city || '';
    this.loadCatalog();
    this.loadMasterTemplates();
  }

  private isServiceLikeItem(item: TariffItemV2 | null | undefined): boolean {
    return !!item && item.type !== 'HOTEL';
  }

  async loadCatalog() {
    try {
      const response = await this.tariffV2Service.listItems({ page: 1, limit: 100, active: true, sortBy: 'name', sortDir: 'asc' });
      this.tariffItems = (response.items || []).filter((item: TariffItemV2) => this.isServiceLikeItem(item));
      this.availableYears = [...new Set(this.tariffItems.map((item: TariffItemV2) => item.validity?.year).filter(Boolean))] as string[];
      this.availableCategories = [...new Set(this.tariffItems.map((item) => item.category).filter(Boolean))];
      this.filteredTariffItems = this.tariffItems;
    } catch (error) {
      console.error(error);
      toast.error('Error loading tariff-v2 items');
    }
  }

  async loadMasterTemplates() {
    try {
      console.log('[EditServiceV2] Loading master-quoter-v2 templates...');
      const query = { page: 1, limit: 100, sortBy: 'name', sortDir: 'asc' };
      console.log('[EditServiceV2] MQ query', query);
      const response = await this.masterQuoterV2Service.listTemplates(query);
      console.log('[EditServiceV2] MQ raw response', response);
      const rawItems = response.items || [];
      console.log('[EditServiceV2] MQ raw items count', rawItems.length);
      this.mqQuoters = rawItems;
      console.log('[EditServiceV2] MQ usable items count', this.mqQuoters.length, this.mqQuoters);
      this.filteredMqOptions = this.mqQuoters.filter((option) => !this.mqTypeFilter || option.type === this.mqTypeFilter);
      console.log('[EditServiceV2] MQ visible options', this.filteredMqOptions);
    } catch (error) {
      console.error('[EditServiceV2] Error loading master-quoter-v2 templates', error);
      toast.error('Error loading master-quoter-v2 templates');
    }
  }

  applyFilters() {
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredTariffItems = this.tariffItems.filter((item) => {
      if (this.selectedCategory && item.category !== this.selectedCategory) return false;
      if (this.selectedYear && item.validity?.year !== this.selectedYear) return false;
      if (!search) return true;
      const haystack = [item.name, item.type, item.category, item.city, item.provider].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }

  onTariffSearchFocus() {
    this.applyFilters();
    this.showTariffOptions = true;
  }

  selectTariffItem(item: TariffItemV2) {
    this.selectedItemId = item._id || '';
    this.selectedItem = item;
    this.searchTerm = item.name;
    this.showTariffOptions = false;
    if (item.city && !this.city) {
      this.city = item.city;
    }
  }

  clearSelectedTariffItem() {
    this.selectedItemId = '';
    this.selectedItem = null;
    this.searchTerm = '';
    this.applyFilters();
  }

  private getSelectedCountForGroup(groupIndex: number): number {
    return this.checkboxes[groupIndex]?.filter(Boolean).length || 0;
  }

  private getSelectedPaxCount(): number {
    return (this.number_paxs() || []).reduce((sum, _, index) => sum + this.getSelectedCountForGroup(index), 0);
  }

  private getSelectedChildrenAges(): number[] {
    return this.children_ages()?.filter((_, index) => this.childrenAgesChecks[index]) || [];
  }

  private syncDaySelections() {
    this.dayData.children_ages = this.getSelectedChildrenAges();
    this.dayData.number_paxs = (this.number_paxs() || []).map((_, index) => this.getSelectedCountForGroup(index));
  }

  private appendCalculatedServices(result: any) {
    const matchingDays = (result?.services || []).filter((day: any) => day.day === this.dayData.day);
    const sourceDays = matchingDays.length ? matchingDays : (result?.services || []);

    sourceDays.forEach((day: any) => {
      (day.services || []).forEach((service: any) => {
        this.dayData.services.push({
          ...service,
          city: service.city || this.city || this.dayData.city || '',
        });
      });
    });
  }

  private showPricingAlerts(result: any) {
    if (!result?.alerts?.length) return;
    result.alerts.forEach((message: string, index: number) => {
      setTimeout(() => toast.info(message, { duration: 7000 }), index * 300);
    });
  }

  async addItem() {
    if (!this.selectedItemId) {
      toast.warning('Select a tariff item');
      return;
    }

    this.syncDaySelections();

    try {
      const result = await this.quoterV2Service.calculatePrices({
        number_paxs: this.getSelectedPaxCount(),
        children_ages: this.getSelectedChildrenAges(),
        items: [{
          tariffItemId: this.selectedItemId,
          dayNumber: this.dayData.day,
          date: this.dayData.date,
          placement: 'services',
          title: this.selectedItem?.name,
          city: this.city || this.selectedItem?.city || '',
        }],
      });

      this.showPricingAlerts(result);
      this.appendCalculatedServices(result);
      this.clearSelectedTariffItem();
      toast.success('Service added');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.error?.message || 'Error adding service');
    }
  }

  filterMqOptions(): void {
    const search = this.mqSearchTerm.toLowerCase().trim();
    this.filteredMqOptions = this.mqQuoters.filter((option) => {
      if (this.mqTypeFilter && option.type !== this.mqTypeFilter) return false;
      if (!search) return true;
      return option.name.toLowerCase().includes(search);
    });
    console.log('[EditServiceV2] MQ search state', {
      mqTypeFilter: this.mqTypeFilter,
      mqSearchTerm: this.mqSearchTerm,
      visibleCount: this.filteredMqOptions.length,
      visibleNames: this.filteredMqOptions.map((item: any) => ({ name: item.name, type: item.type, totalDays: item.totalDays })),
    });
  }

  onMqSearchFocus() {
    this.filterMqOptions();
    this.showMqOptions = true;
  }

  async selectMqTemplate(option: any): Promise<void> {
    try {
      console.log('[EditServiceV2] Selecting MQ template', option);
      const resolved = await this.masterQuoterV2Service.getResolvedTemplateById(option._id);
      console.log('[EditServiceV2] MQ resolved template', resolved);
      this.selectedMqTemplate = resolved;
      this.mqSearchTerm = resolved.name;
      this.showMqOptions = false;
      this.filteredMqDaysOptions = (resolved.days || []).map((day: any) => ({
        ...day,
        selected: false,
        services: (day.items || [])
          .filter((item: any) => this.isServiceLikeItem(item.tariffItem || item.tariffSnapshot))
          .map((item: any) => ({
            ...item,
            selected: false,
            service_id: item.tariffItemId,
            name_service: item.title || item.tariffItem?.name || item.tariffSnapshot?.name || 'Unnamed item',
            type_service: item.placement || 'services',
            template_type: resolved.type,
          })),
      })).filter((day: any) => (day.services || []).length > 0);
    } catch (error) {
      console.error(error);
      toast.error('Error loading master quoter detail');
    }
  }

  toggleAllServices(day: any): void {
    (day.services || []).forEach((service: any) => {
      if (service.type_service === 'services') {
        service.selected = !!day.selected;
      } else if (day.selected) {
        service.selected = false;
      }
    });

    console.log('[EditServiceV2] toggleAllServices', {
      dayNumber: day.dayNumber,
      selected: day.selected,
      serviceSelections: (day.services || []).map((service: any) => ({
        name: service.name_service,
        type_service: service.type_service,
        selected: service.selected,
      })),
    });
  }

  async addItembyMq() {
    const selectedItems = this.filteredMqDaysOptions.flatMap((day: any) => {
      const servicesFromCheckAll = day.selected
        ? (day.services || []).filter((service: any) => service.type_service === 'services')
        : [];
      const manualSelections = (day.services || []).filter((service: any) => service.selected);

      const sourceServices = [...servicesFromCheckAll, ...manualSelections].filter((service: any) => this.isServiceLikeItem(service.tariffItem || service.tariffSnapshot));

      console.log('[EditServiceV2] MQ day selection', {
        dayNumber: day.dayNumber,
        daySelected: day.selected,
        chosenCount: sourceServices.length,
        chosenServices: sourceServices.map((service: any) => ({
          name: service.name_service,
          type_service: service.type_service,
          selected: service.selected,
          service_id: service.service_id,
        })),
      });

      return sourceServices.map((service: any) => ({
        tariffItemId: service.tariffItemId || service.service_id,
        dayNumber: this.dayData.day,
        date: this.dayData.date,
        placement: service.type_service || 'services',
        title: service.name_service,
        notes: service.notes || '',
        city: this.city || day.city || service.tariffItem?.city || '',
      }));
    });

    console.log('[EditServiceV2] MQ selected items for add', {
      count: selectedItems.length,
      selectedItems,
    });

    if (!selectedItems.length) {
      toast.warning('Select at least one item from Master Quoter');
      return;
    }

    this.syncDaySelections();

    try {
      const result = await this.quoterV2Service.calculatePrices({
        number_paxs: this.getSelectedPaxCount(),
        children_ages: this.getSelectedChildrenAges(),
        items: selectedItems,
      });

      console.log('[EditServiceV2] MQ calculate result', result);
      this.showPricingAlerts(result);
      this.appendCalculatedServices(result);
      this.resetMqSelection();
      toast.success('Master Quoter services added');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.error?.message || 'Error adding Master Quoter services');
    }
  }

  getMqSelectedCount(): number {
    return this.filteredMqDaysOptions.reduce((total: number, day: any) => {
      const servicesFromCheckAll = day.selected
        ? (day.services || []).filter((service: any) => service.type_service === 'services').length
        : 0;
      const manualSelections = (day.services || []).filter((service: any) => service.selected).length;
      return total + servicesFromCheckAll + manualSelections;
    }, 0);
  }

  resetMqSelection() {
    this.selectedMqTemplate = null;
    this.filteredMqDaysOptions = [];
    this.mqSearchTerm = '';
    this.showMqOptions = false;
    this.filteredMqOptions = this.mqQuoters.filter((option) => !this.mqTypeFilter || option.type === this.mqTypeFilter);
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

  getSingleItemRules(): string[] {
    return [
      'Single add uses the date, pax selection and children ages from this day.',
      'Only service-like tariff items can be added here. Hotels stay in the Hotels section.',
    ];
  }

  getMasterQuoterRules(): string[] {
    return [
      'Selecting a whole MQ day imports only items marked as services.',
      'Items marked as options are optional and must be selected manually.',
      'If you select multiple MQ days, all chosen services are added as independent lines into this current day.',
    ];
  }

  getAutoVehicleLabel(service: any): string {
    return service?.pricing_meta?.auto_vehicle_type || '';
  }

  hasAutoVehicle(service: any): boolean {
    return !!this.getAutoVehicleLabel(service);
  }

  onDelete(index: number) {
    this.dayData.services.splice(index, 1);
    toast.success('Record deleted');
  }

  toggleCheckbox(groupIndex: number, checkboxIndex: number) {
    this.checkboxes[groupIndex][checkboxIndex] = !this.checkboxes[groupIndex][checkboxIndex];
  }

  toggleCheckboxChild(index: number): void {
    this.childrenAgesChecks[index] = !this.childrenAgesChecks[index];
    this.dayData.children_ages = this.getSelectedChildrenAges();
  }

  toggleDropdown() { this.isDropdownOpen = !this.isDropdownOpen; }
  toggleDropdownChild() { this.isDropdownOpenChild = !this.isDropdownOpenChild; }

  closeModal() {
    this.closeModalEvent.emit();
  }

  hideMqOptions() {
    this.showMqOptions = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const modalElement = document.getElementById('modalMq');
    const mqInputElement = document.getElementById('mqSearchInput');
    const mqDropdownElement = document.getElementById('mqOptionsDropdown');
    const tariffInputElement = document.getElementById('tariffSearchInput');
    const tariffDropdownElement = document.getElementById('tariffOptionsDropdown');

    if (modalElement && !modalElement.contains(target)) {
      this.isDropdownOpen = false;
      this.isDropdownOpenChild = false;
    }

    if (mqInputElement && mqDropdownElement && !mqInputElement.contains(target) && !mqDropdownElement.contains(target)) {
      this.hideMqOptions();
    }

    if (tariffInputElement && tariffDropdownElement && !tariffInputElement.contains(target) && !tariffDropdownElement.contains(target)) {
      this.showTariffOptions = false;
    }
  }

  onMqBlur() {
    setTimeout(() => {
      this.showMqOptions = false;
    }, 200);
  }

  onTariffBlur() {
    setTimeout(() => {
      this.showTariffOptions = false;
    }, 200);
  }
}
