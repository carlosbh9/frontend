import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, HostListener, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { ContactService } from '../../../Services/contact/contact.service';
import { ExportExcelService } from '../../../Services/exportExcel/export-excel.service';
import { PdfexportService } from '../../../Services/pdfexport/pdfexport.service';
import { QuoterV2Service } from '../../../Services/quoter-v2.service';
import {
  CruiseItem,
  FlightItem,
  HotelItem,
  OperatorItem,
  Quoter,
  ServiceDay,
  ServiceItem,
  TotalPrices,
} from '../../../interfaces/quoter-models.interface';
import { CrucerosV2Component } from './cruceros-v2/cruceros-v2.component';
import { ExtOperatorV2Component } from './ext-operator-v2/ext-operator-v2.component';
import { FlightsV2Component } from './flights-v2/flights-v2.component';
import { HotelsV2Component } from './hotels-v2/hotels-v2.component';
import { ServicesV2Component } from './services-v2/services-v2.component';

(pdfMake as any).addVirtualFileSystem(pdfFonts);

type ContactOption = {
  _id: string;
  name: string;
};

type QuoterFormState = Quoter & {
  services: ServiceDay[];
  hotels: HotelItem[];
  flights: FlightItem[];
  operators: OperatorItem[];
  cruises: CruiseItem[];
  total_prices: TotalPrices;
};

@Component({
  selector: 'app-quoter-v2-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FlightsV2Component,
    ExtOperatorV2Component,
    ServicesV2Component,
    HotelsV2Component,
    CrucerosV2Component,
  ],
  templateUrl: './quoter-v2-form.component.html',
  styleUrl: './quoter-v2-form.component.css'
})
export class QuoterV2FormComponent implements OnInit {
  quoterService = inject(QuoterV2Service);
  contactService = inject(ContactService);
  route = inject(ActivatedRoute);
  pdfExportService = inject(PdfexportService);
  excelService = inject(ExportExcelService);

  constructor() {
    effect(() => {
      this.numberPaxsVersion();
      this.hotelsTotal();
      this.servicesTotal();
      this.operatorsTotal();
      this.flightsTotal();
      this.cruisesTotal();
      this.externalUtility();
      this.syncDerivedTotals();
    });
  }

  private blurTimeout?: ReturnType<typeof setTimeout>;
  modalOpen = signal(false);
  filteredOptions: ContactOption[] = [];
  showOptions = false;
  showVersion = false;
  showUpdate = false;
  idQuoter = '';

  hotelsTotal = signal(0);
  servicesTotal = signal(0);
  operatorsTotal = signal(0);
  flightsTotal = signal(0);
  cruisesTotal = signal(0);
  externalUtility = signal(0);
  numberPaxsVersion = signal(0);

  destinations: string[] = ['PERU', 'BOLIVIA', 'ECUADOR', 'COLOMBIA', 'ARGENTINA', 'CHILE'];
  readonly quoteRules: string[] = [
    'Services can calculate automatically from tariff-v2 and master-quoter-v2.',
    'Hotels are commercial and may use tariff reference or manual negotiated price.',
    'Flights, operators and cruises remain manual blocks controlled by the user.',
    'Saving keeps the same final quoter schema used by the rest of the system.',
  ];

  newQuoter: QuoterFormState = this.createEmptyQuoter();

  ngOnInit(): void {
    this.loadContacts();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      this.getQuoterbyId(id);
      this.showUpdate = true;
      this.idQuoter = id;
    });
  }

  createEmptyQuoter(): QuoterFormState {
    return {
      name_quoter: 'version 1',
      guest: '',
      destinations: [],
      children_ages: null,
      FileCode: '',
      travelDate: { start: '', end: '' },
      accomodations: '',
      totalNights: '',
      number_paxs: 0,
      travel_agent: '',
      exchange_rate: '',
      services: [],
      hotels: [],
      flights: [],
      operators: [],
      cruises: [],
      total_prices: {
        total_hoteles: 0,
        total_services: 0,
        total_cost: 0,
        external_utility: 0,
        cost_external_taxes: 0,
        total_cost_external: 0,
        total_ext_operator: 0,
        total_ext_cruises: 0,
        total_flights: 0,
        subtotal: 0,
        cost_transfers: 0,
        final_cost: 0,
        price_pp: 0,
        porcentajeTD: 0
      }
    };
  }

  toNumber(value: unknown): number {
    if (Array.isArray(value)) return Number(value[0]) || 0;
    return Number(value) || 0;
  }

  private normalizeServiceItem(service: Partial<ServiceItem> & { prices?: unknown; price?: unknown }): ServiceItem {
    return {
      city: service.city || '',
      name_service: service.name_service || '',
      type: service.type || '',
      price_base: this.toNumber(service.price_base),
      price: this.toNumber(service.price ?? service.prices),
      notes: service.notes || '',
      tariff_item_id: service.tariff_item_id,
      placement: service.placement,
      pricing_meta: service.pricing_meta,
      day: service.day,
      service_id: service.service_id,
      service_type: service.service_type,
      type_service: service.type_service,
      operator_service_id: service.operator_service_id,
      train_service_id: service.train_service_id,
      editService: service.editService,
      selected: service.selected,
    };
  }

  private normalizeHotelItem(hotel: Partial<HotelItem> & { prices?: unknown; price?: unknown }): HotelItem {
    return {
      day: this.toNumber(hotel.day),
      date: hotel.date || '',
      city: hotel.city || '',
      name_hotel: hotel.name_hotel || '',
      price_base: this.toNumber(hotel.price_base),
      price: this.toNumber(hotel.price ?? hotel.prices),
      accomodatios_category: hotel.accomodatios_category || '',
      notes: hotel.notes || '',
      tariff_item_id: hotel.tariff_item_id,
      placement: hotel.placement,
      room_name: hotel.room_name,
      occupancy: hotel.occupancy,
      room_rate_type: hotel.room_rate_type,
      price_source: hotel.price_source,
    };
  }

  private normalizeFlightItem(flight: Partial<FlightItem> & { prices?: unknown; price_conf?: unknown; price?: unknown }): FlightItem {
    return {
      date: flight.date || '',
      route: flight.route || '',
      price_base: this.toNumber(flight.price_base ?? flight.price_conf),
      price: this.toNumber(flight.price ?? flight.prices),
      notes: flight.notes || '',
      editFlight: flight.editFlight,
    };
  }

  private normalizeOperatorItem(operator: Partial<OperatorItem> & { prices?: unknown; price?: unknown }): OperatorItem {
    return {
      country: operator.country || '',
      name_operator: operator.name_operator || '',
      price: this.toNumber(operator.price ?? operator.prices),
      notes: operator.notes || '',
      editOperator: operator.editOperator,
    };
  }

  private normalizeCruiseItem(cruise: Partial<CruiseItem> & { prices?: unknown; price_conf?: unknown; price?: unknown }): CruiseItem {
    return {
      name: cruise.name || '',
      operator: cruise.operator || '',
      price_base: this.toNumber(cruise.price_base ?? cruise.price_conf),
      price: this.toNumber(cruise.price ?? cruise.prices),
      notes: cruise.notes || '',
      editCruise: cruise.editCruise,
    };
  }

  getQuoteValidationIssues(): string[] {
    const issues: string[] = [];
    if (!String(this.newQuoter.guest || '').trim()) issues.push('Guest is required.');
    if (!this.newQuoter.travelDate?.start) issues.push('Travel start date is required.');
    if (!(this.toNumber(this.newQuoter.number_paxs) > 0)) issues.push('Number of pax must be greater than 0.');
    if (!Array.isArray(this.newQuoter.destinations) || this.newQuoter.destinations.length === 0) {
      issues.push('Select at least one destination.');
    }
    return issues;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const candidate = error as { error?: { error?: string; message?: string }; message?: string } | undefined;
    if (!candidate) return fallback;
    return candidate.error?.error || candidate.error?.message || candidate.message || fallback;
  }

  private buildNormalizedTotalPrices(totalPrices: Partial<TotalPrices> = {}): TotalPrices {
    return {
      ...this.createEmptyQuoter().total_prices,
      ...totalPrices,
      total_hoteles: this.toNumber(totalPrices.total_hoteles),
      total_services: this.toNumber(totalPrices.total_services),
      total_cost: this.toNumber(totalPrices.total_cost),
      external_utility: this.toNumber(totalPrices.external_utility),
      cost_external_taxes: this.toNumber(totalPrices.cost_external_taxes),
      total_cost_external: this.toNumber(totalPrices.total_cost_external),
      total_ext_operator: this.toNumber(totalPrices.total_ext_operator),
      total_ext_cruises: this.toNumber(totalPrices.total_ext_cruises),
      total_flights: this.toNumber(totalPrices.total_flights),
      subtotal: this.toNumber(totalPrices.subtotal),
      cost_transfers: this.toNumber(totalPrices.cost_transfers),
      final_cost: this.toNumber(totalPrices.final_cost),
      price_pp: this.toNumber(totalPrices.price_pp),
      porcentajeTD: this.toNumber(totalPrices.porcentajeTD),
    };
  }

  denormalizeQuoterForForm(quoter: Partial<QuoterFormState> & { name_version?: string }): QuoterFormState {
    const totalPrices = quoter?.total_prices || {};
    return {
      ...this.createEmptyQuoter(),
      ...quoter,
      name_quoter: quoter?.name_quoter || quoter?.name_version || 'version 1',
      totalNights: String(quoter?.totalNights ?? ''),
      children_ages: Array.isArray(quoter?.children_ages) && quoter.children_ages.length ? quoter.children_ages : null,
      number_paxs: this.toNumber(quoter?.number_paxs),
      services: (quoter?.services || []).map((day) => ({
        ...day,
        day: this.toNumber(day?.day),
        number_paxs: this.toNumber(day?.number_paxs ?? quoter?.number_paxs),
        children_ages: Array.isArray(day?.children_ages) ? day.children_ages : [],
        services: (day?.services || []).map((service) => this.normalizeServiceItem(service)),
      })),
      hotels: (quoter?.hotels || []).map((hotel) => this.normalizeHotelItem(hotel)),
      flights: (quoter?.flights || []).map((flight) => this.normalizeFlightItem(flight)),
      operators: (quoter?.operators || []).map((operator) => this.normalizeOperatorItem(operator)),
      cruises: (quoter?.cruises || []).map((cruise) => this.normalizeCruiseItem(cruise)),
      total_prices: this.buildNormalizedTotalPrices(totalPrices),
    };
  }

  normalizeQuoterForPersistence(quoter: QuoterFormState): QuoterFormState {
    const { name_version, ...rest } = quoter;

    return {
      ...rest,
      name_quoter: quoter.name_quoter || quoter.name_version || 'version 1',
      totalNights: String(quoter?.totalNights ?? '').trim(),
      children_ages: Array.isArray(quoter.children_ages) && quoter.children_ages.length ? [...quoter.children_ages] : null,
      number_paxs: this.toNumber(quoter.number_paxs),
      services: (quoter.services || []).map((day) => ({
        ...day,
        day: this.toNumber(day.day),
        number_paxs: this.toNumber(quoter.number_paxs),
        services: (day.services || []).map((service) => this.normalizeServiceItem(service)),
      })),
      hotels: (quoter.hotels || []).map((hotel) => this.normalizeHotelItem(hotel)),
      flights: (quoter.flights || []).map((flight) => this.normalizeFlightItem(flight)),
      operators: (quoter.operators || []).map((operator) => this.normalizeOperatorItem(operator)),
      cruises: (quoter.cruises || []).map((cruise) => this.normalizeCruiseItem(cruise)),
      total_prices: this.buildNormalizedTotalPrices(quoter.total_prices),
    };
  }

  private buildCreatePayload(quoter: QuoterFormState) {
    const normalized = this.normalizeQuoterForPersistence(quoter);
    const {
      _id,
      id,
      createdAt,
      updatedAt,
      soldAt,
      soldBy,
      booking_file_id,
      status,
      ...rest
    } = normalized;

    return {
      ...rest,
      status: 'DRAFT',
      booking_file_id: null,
      soldAt: null,
      soldBy: null,
    };
  }

  async loadContacts() {
    try {
      const result = await this.contactService.getAllContacts();
      this.filteredOptions = result.contacts as ContactOption[];
    } catch (error) {
      console.log('Error loading contacts', error);
    }
  }

  async filterOptions() {
    const result = await this.contactService.getAllContacts(this.newQuoter.guest);
    this.filteredOptions = result.contacts as ContactOption[];
  }

  selectOption(option: ContactOption): void {
    this.newQuoter.guest = option.name;
    this.newQuoter.contact_id = option._id;
    this.showOptions = false;
  }

  async getQuoterbyId(id: string): Promise<void> {
    try {
      const quoter = await this.quoterService.getQuoterById(id);
      this.newQuoter = this.denormalizeQuoterForForm(quoter);
      toast.success('Quoter V2 loaded successfully');
      this.hotelsTotal.set(this.newQuoter.total_prices.total_hoteles);
      this.servicesTotal.set(this.newQuoter.total_prices.total_services);
      this.operatorsTotal.set(this.newQuoter.total_prices.total_ext_operator);
      this.flightsTotal.set(this.newQuoter.total_prices.total_flights);
      this.cruisesTotal.set(this.newQuoter.total_prices.total_ext_cruises);
      this.externalUtility.set(this.newQuoter.total_prices.external_utility);
      this.numberPaxsVersion.update(value => value + 1);
    } catch (error) {
      console.error(error);
      toast.error('Error loading Quoter V2');
    }
  }

  addChildrenAges() {
    if (!this.newQuoter.children_ages) this.newQuoter.children_ages = [];
    this.newQuoter.children_ages.push(0);
  }

  removeChildrenAges(indexToRemove: number): void {
    if (Array.isArray(this.newQuoter.children_ages) && indexToRemove >= 0 && indexToRemove < this.newQuoter.children_ages.length) {
      this.newQuoter.children_ages.splice(indexToRemove, 1);
      if (this.newQuoter.children_ages.length === 0) this.newQuoter.children_ages = null;
    }
  }

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
    if (!Array.isArray(this.newQuoter.destinations)) this.newQuoter.destinations = [];
    if (checkbox.checked) {
      this.newQuoter.destinations.push(value);
    } else {
      const index = this.newQuoter.destinations.indexOf(value);
      if (index > -1) this.newQuoter.destinations.splice(index, 1);
    }
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.externalUtility.set(this.toNumber(input.value));
  }

  onNumberPaxsChange() {
    this.newQuoter.number_paxs = this.toNumber(this.newQuoter.number_paxs);
    this.numberPaxsVersion.update(value => value + 1);
  }

  onCruiseUpdate(cruises: CruiseItem[]) { this.newQuoter.cruises = cruises; }
  onFlightsUpdate(flights: FlightItem[]) { this.newQuoter.flights = flights; }
  onServicesUpdate(services: ServiceDay[]) { this.newQuoter.services = services; }
  onOperatorsUpdate(operators: OperatorItem[]) { this.newQuoter.operators = operators; }
  onHotelsUpdate(hotels: HotelItem[]) { this.newQuoter.hotels = hotels; }
  onPorcentajeTDUpdate(porcentaje: number) { this.newQuoter.total_prices.porcentajeTD = porcentaje; }
  onPorcentajeTD(porcentaje: number) { this.newQuoter.total_prices.porcentajeTD = porcentaje; }
  onTotalPricesCruiseChange(price: number) { this.cruisesTotal.set(price); this.newQuoter.total_prices.total_ext_cruises = price; }
  onTotalPricesServicesChange(price: number) { this.servicesTotal.set(price); this.newQuoter.total_prices.total_services = price; }
  onTotalPricesHotelsChange(price: number) { this.hotelsTotal.set(price); this.newQuoter.total_prices.total_hoteles = price; }
  onTotalPricesOperatorsChange(price: number) { this.operatorsTotal.set(price); this.newQuoter.total_prices.total_ext_operator = price; }
  onTotalPricesFligtsChange(price: number) { this.flightsTotal.set(price); this.newQuoter.total_prices.total_flights = price; }

  private buildDerivedTotals(): Pick<TotalPrices, 'total_cost' | 'external_utility' | 'cost_external_taxes' | 'total_cost_external' | 'subtotal' | 'cost_transfers' | 'final_cost' | 'price_pp'> {
    const total_cost = this.hotelsTotal() + this.servicesTotal();
    const external_utility = this.externalUtility();
    const cost_external_taxes = (total_cost + external_utility) * 0.15;
    const total_cost_external = total_cost + cost_external_taxes + external_utility;
    const subtotal = total_cost_external + this.operatorsTotal() + this.flightsTotal() + this.cruisesTotal();
    const cost_transfers = subtotal * 0.04;
    const final_cost = subtotal + cost_transfers;
    const paxCount = this.toNumber(this.newQuoter.number_paxs);
    const price_pp = paxCount > 0 ? final_cost / paxCount : 0;

    return { total_cost, external_utility, cost_external_taxes, total_cost_external, subtotal, cost_transfers, final_cost, price_pp };
  }

  private syncDerivedTotals() {
    const derivedTotals = this.buildDerivedTotals();
    this.newQuoter.total_prices.total_cost = derivedTotals.total_cost;
    this.newQuoter.total_prices.external_utility = derivedTotals.external_utility;
    this.newQuoter.total_prices.cost_external_taxes = derivedTotals.cost_external_taxes;
    this.newQuoter.total_prices.total_cost_external = derivedTotals.total_cost_external;
    this.newQuoter.total_prices.subtotal = derivedTotals.subtotal;
    this.newQuoter.total_prices.cost_transfers = derivedTotals.cost_transfers;
    this.newQuoter.total_prices.final_cost = derivedTotals.final_cost;
    this.newQuoter.total_prices.price_pp = derivedTotals.price_pp;
  }

  async onSubmit() {
    this.syncDerivedTotals();
    const issues = this.getQuoteValidationIssues();
    if (issues.length) {
      toast.warning(issues[0]);
      return;
    }
    try {
      const payload = this.buildCreatePayload(this.newQuoter);
      await this.quoterService.createQuoter(payload);
      toast.success('Quoter V2 added');
      this.closeModalVersion();
    } catch (error) {
      console.error(error);
      toast.error(this.getErrorMessage(error, 'Error creating Quoter V2'));
    }
  }

  async onUpdate() {
    this.syncDerivedTotals();
    const issues = this.getQuoteValidationIssues();
    if (issues.length) {
      toast.warning(issues[0]);
      return;
    }
    try {
      const payload = this.normalizeQuoterForPersistence(this.newQuoter);
      await this.quoterService.updateQuoter(this.idQuoter, payload);
      toast.success('Quoter V2 updated');
    } catch (error) {
      console.error(error);
      toast.error(this.getErrorMessage(error, 'Error editing Quoter V2'));
    }
  }

  getTotalCosts = computed(() => { this.numberPaxsVersion(); return this.buildDerivedTotals().total_cost; });
  getExternalTaxes = computed(() => { this.numberPaxsVersion(); return this.buildDerivedTotals().cost_external_taxes; });
  getTotalCostExternal = computed(() => { this.numberPaxsVersion(); return this.buildDerivedTotals().total_cost_external; });
  subTotal = computed(() => { this.numberPaxsVersion(); return this.buildDerivedTotals().subtotal; });
  costOfTransfers = computed(() => { this.numberPaxsVersion(); return this.buildDerivedTotals().cost_transfers; });
  final_cost = computed(() => { this.numberPaxsVersion(); return this.buildDerivedTotals().final_cost; });
  price_per_person = computed(() => { this.numberPaxsVersion(); return this.buildDerivedTotals().price_pp; });

  openModal() { this.modalOpen.set(true); }
  closeModal() { this.modalOpen.set(false); }
  openModalVersion() { this.showVersion = true; }
  closeModalVersion() { this.showVersion = false; }

  async generatePDF() {
    try {
      const dataURL = await this.pdfExportService.convertImageToDataURL('/images/image.png');
      const payload = this.normalizeQuoterForPersistence(this.newQuoter);
      const docDefinition = this.pdfExportService.generatePdf(payload, dataURL);
      this.pdfExportService.exportPdf(docDefinition);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Error exporting PDF');
    }
  }

  generateExcel() {
    try {
      const payload = this.normalizeQuoterForPersistence(this.newQuoter);
      this.excelService.downloadQuotationAsExcel(payload, `${this.newQuoter.guest}`);
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('A problem occurred while exporting Excel');
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const inputElement = document.getElementById('searchInput');
    const dropdownElement = document.getElementById('optionsDropdown');

    if (inputElement && !inputElement.contains(target) && dropdownElement && !dropdownElement.contains(target)) {
      this.showOptions = false;
    }
  }

  onInputFocus(): void {
    clearTimeout(this.blurTimeout);
    if (this.filteredOptions.length) this.showOptions = true;
  }

  onInputBlur(): void {
    this.blurTimeout = setTimeout(() => {
      this.showOptions = false;
    }, 200);
  }
}
