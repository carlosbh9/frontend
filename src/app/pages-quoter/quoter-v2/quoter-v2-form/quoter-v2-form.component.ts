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
import { CrucerosV2Component } from './cruceros-v2/cruceros-v2.component';
import { ExtOperatorV2Component } from './ext-operator-v2/ext-operator-v2.component';
import { FlightsV2Component } from './flights-v2/flights-v2.component';
import { HotelsV2Component } from './hotels-v2/hotels-v2.component';
import { ServicesV2Component } from './services-v2/services-v2.component';

(pdfMake as any).addVirtualFileSystem(pdfFonts);

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
      this.prueba();
      this.prueba2();
      this.prueba3();
      this.prueba4();
      this.prueba5();
      this.prueba6();
      this.syncDerivedTotals();
    });
  }

  private blurTimeout: any;
  modalOpen = signal(false);
  modalData = signal<any[]>([]);
  filteredOptions: any[] = [];
  showOptions = false;
  showVersion = false;
  showUpdate = false;
  idQuoter = '';

  prueba = signal<number[]>([0]);
  prueba2 = signal<number[]>([0]);
  prueba3 = signal<number[]>([0]);
  prueba4 = signal<number[]>([0]);
  prueba5 = signal<number[]>([0]);
  prueba6 = signal<number[]>([0]);
  numberPaxsVersion = signal(0);

  destinations: string[] = ['PERU', 'BOLIVIA', 'ECUADOR', 'COLOMBIA', 'ARGENTINA', 'CHILE'];
  readonly quoteRules: string[] = [
    'Services can calculate automatically from tariff-v2 and master-quoter-v2.',
    'Hotels are commercial and may use tariff reference or manual negotiated price.',
    'Flights, operators and cruises remain manual blocks controlled by the user.',
    'Saving keeps the same final quoter schema used by the rest of the system.',
  ];

  newQuoter: any = this.createEmptyQuoter();

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

  createEmptyQuoter() {
    return {
      name_quoter: 'version 1',
      guest: '',
      destinations: [],
      children_ages: [0],
      FileCode: '',
      travelDate: { start: '', end: '' },
      accomodations: '',
      totalNights: 0,
      number_paxs: 0,
      travel_agent: '',
      exchange_rate: '',
      services: [],
      hotels: [],
      flights: [],
      operators: [],
      cruises: [],
      total_prices: {
        total_hoteles: [0],
        total_services: [0],
        total_cost: [0],
        external_utility: [0],
        cost_external_taxes: [0],
        total_cost_external: [0],
        total_ext_operator: [0],
        total_ext_cruises: [0],
        total_flights: [0],
        subtotal: [0],
        cost_transfers: [0],
        final_cost: [0],
        price_pp: [0],
        porcentajeTD: 0
      }
    };
  }

  toNumber(value: any): number {
    if (Array.isArray(value)) return Number(value[0]) || 0;
    return Number(value) || 0;
  }

  toSingleArray(value: any): number[] {
    if (Array.isArray(value)) return value.length ? [Number(value[0]) || 0] : [0];
    return [Number(value) || 0];
  }

  getNumberPaxsArray(): number[] {
    return [this.toNumber(this.newQuoter.number_paxs)];
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

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.message || fallback;
  }

  denormalizeQuoterForForm(quoter: any) {
    const totalPrices = quoter?.total_prices || {};
    return {
      ...this.createEmptyQuoter(),
      ...quoter,
      name_version: quoter?.name_quoter || 'version 1',
      number_paxs: this.toNumber(quoter?.number_paxs),
      services: (quoter?.services || []).map((day: any) => ({
        ...day,
        number_paxs: this.toSingleArray(day?.number_paxs ?? quoter?.number_paxs),
        services: (day?.services || []).map((service: any) => ({
          ...service,
          prices: this.toSingleArray(service?.price),
        }))
      })),
      hotels: (quoter?.hotels || []).map((hotel: any) => ({ ...hotel, prices: this.toSingleArray(hotel?.price) })),
      flights: (quoter?.flights || []).map((flight: any) => ({ ...flight, prices: this.toSingleArray(flight?.price) })),
      operators: (quoter?.operators || []).map((operator: any) => ({ ...operator, prices: this.toSingleArray(operator?.price) })),
      cruises: (quoter?.cruises || []).map((cruise: any) => ({ ...cruise, prices: this.toSingleArray(cruise?.price) })),
      total_prices: {
        ...this.createEmptyQuoter().total_prices,
        ...totalPrices,
        total_hoteles: this.toSingleArray(totalPrices.total_hoteles),
        total_services: this.toSingleArray(totalPrices.total_services),
        total_cost: this.toSingleArray(totalPrices.total_cost),
        external_utility: this.toSingleArray(totalPrices.external_utility),
        cost_external_taxes: this.toSingleArray(totalPrices.cost_external_taxes),
        total_cost_external: this.toSingleArray(totalPrices.total_cost_external),
        total_ext_operator: this.toSingleArray(totalPrices.total_ext_operator),
        total_ext_cruises: this.toSingleArray(totalPrices.total_ext_cruises),
        total_flights: this.toSingleArray(totalPrices.total_flights),
        subtotal: this.toSingleArray(totalPrices.subtotal),
        cost_transfers: this.toSingleArray(totalPrices.cost_transfers),
        final_cost: this.toSingleArray(totalPrices.final_cost),
        price_pp: this.toSingleArray(totalPrices.price_pp),
        porcentajeTD: this.toNumber(totalPrices.porcentajeTD),
      }
    };
  }

  normalizeQuoterForPersistence(quoter: any) {
    return {
      ...quoter,
      name_quoter: quoter.name_version || quoter.name_quoter || 'version 1',
      number_paxs: this.toNumber(quoter.number_paxs),
      services: (quoter.services || []).map((day: any) => ({
        ...day,
        number_paxs: this.toNumber(quoter.number_paxs),
        services: (day.services || []).map((service: any) => ({
          ...service,
          price: this.toNumber(service?.prices ?? service?.price),
        }))
      })),
      hotels: (quoter.hotels || []).map((hotel: any) => ({ ...hotel, price: this.toNumber(hotel?.prices ?? hotel?.price) })),
      flights: (quoter.flights || []).map((flight: any) => ({ ...flight, price: this.toNumber(flight?.prices ?? flight?.price) })),
      operators: (quoter.operators || []).map((operator: any) => ({ ...operator, price: this.toNumber(operator?.prices ?? operator?.price) })),
      cruises: (quoter.cruises || []).map((cruise: any) => ({ ...cruise, price: this.toNumber(cruise?.prices ?? cruise?.price) })),
      total_prices: {
        ...quoter.total_prices,
        total_hoteles: this.toNumber(quoter.total_prices.total_hoteles),
        total_services: this.toNumber(quoter.total_prices.total_services),
        total_cost: this.toNumber(quoter.total_prices.total_cost),
        external_utility: this.toNumber(quoter.total_prices.external_utility),
        cost_external_taxes: this.toNumber(quoter.total_prices.cost_external_taxes),
        total_cost_external: this.toNumber(quoter.total_prices.total_cost_external),
        total_ext_operator: this.toNumber(quoter.total_prices.total_ext_operator),
        total_ext_cruises: this.toNumber(quoter.total_prices.total_ext_cruises),
        total_flights: this.toNumber(quoter.total_prices.total_flights),
        subtotal: this.toNumber(quoter.total_prices.subtotal),
        cost_transfers: this.toNumber(quoter.total_prices.cost_transfers),
        final_cost: this.toNumber(quoter.total_prices.final_cost),
        price_pp: this.toNumber(quoter.total_prices.price_pp),
        porcentajeTD: this.toNumber(quoter.total_prices.porcentajeTD),
      }
    };
  }

  async loadContacts() {
    try {
      const result = await this.contactService.getAllContacts();
      this.filteredOptions = result.contacts;
    } catch (error) {
      console.log('Error loading contacts', error);
    }
  }

  async filterOptions() {
    const result = await this.contactService.getAllContacts(this.newQuoter.guest);
    this.filteredOptions = result.contacts;
  }

  selectOption(option: any): void {
    this.newQuoter.guest = option.name;
    this.newQuoter.contact_id = option._id;
    this.showOptions = false;
  }

  async getQuoterbyId(id: string): Promise<void> {
    try {
      const quoter = await this.quoterService.getQuoterById(id);
      this.newQuoter = this.denormalizeQuoterForForm(quoter);
      toast.success('Quoter V2 loaded successfully');
      this.prueba.set(this.newQuoter.total_prices.total_hoteles);
      this.prueba2.set(this.newQuoter.total_prices.total_services);
      this.prueba3.set(this.newQuoter.total_prices.total_ext_operator);
      this.prueba4.set(this.newQuoter.total_prices.total_flights);
      this.prueba5.set(this.newQuoter.total_prices.total_ext_cruises);
      this.prueba6.set(this.newQuoter.total_prices.external_utility);
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

  onInputChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const updatedValues = [...this.prueba6()];
    updatedValues[index] = parseFloat(input.value);
    this.prueba6.set(updatedValues);
  }

  onNumberPaxsChange() {
    this.newQuoter.number_paxs = this.toNumber(this.newQuoter.number_paxs);
    this.numberPaxsVersion.update(value => value + 1);
  }

  onCruiseUpdate(cruises: any[]) { this.newQuoter.cruises = cruises; }
  onFlightsUpdate(flights: any[]) { this.newQuoter.flights = flights; }
  onServicesUpdate(services: any[]) { this.newQuoter.services = services; }
  onOperatorsUpdate(operators: any[]) { this.newQuoter.operators = operators; }
  onHotelsUpdate(hotels: any[]) { this.newQuoter.hotels = hotels; }
  onPorcentajeTDUpdate(porcentaje: number) { this.newQuoter.total_prices.porcentajeTD = porcentaje; }
  onPorcentajeTD(porcentaje: number) { this.newQuoter.total_prices.porcentajeTD = porcentaje; }
  onTotalPricesCruiseChange(prices: number[]) { this.prueba5.set(prices); this.newQuoter.total_prices.total_ext_cruises = prices; }
  onTotalPricesServicesChange(prices: number[]) { this.prueba2.set(prices); this.newQuoter.total_prices.total_services = prices; }
  onTotalPricesHotelsChange(prices: number[]) { this.prueba.set(prices); this.newQuoter.total_prices.total_hoteles = prices; }
  onTotalPricesOperatorsChange(prices: any[]) { this.prueba3.set(prices); this.newQuoter.total_prices.total_ext_operator = prices; }
  onTotalPricesFligtsChange(prices: number[]) { this.prueba4.set(prices); this.newQuoter.total_prices.total_flights = prices; }

  private sumPricesByIndex(...priceGroups: number[][]): number[] {
    const totals: number[] = [];
    const maxLength = 1;
    for (let i = 0; i < maxLength; i++) {
      totals[i] = priceGroups.reduce((sum, prices) => sum + (prices[i] || 0), 0);
    }
    return totals;
  }

  private mapPricesByIndex(source: number[], mapper: (value: number, index: number) => number): number[] {
    const totals: number[] = [];
    const maxLength = 1;
    for (let i = 0; i < maxLength; i++) totals[i] = mapper(source[i] || 0, i);
    return totals;
  }

  private buildDerivedTotals() {
    const total_cost = this.sumPricesByIndex(this.prueba(), this.prueba2());
    const external_utility = [...this.prueba6()];
    const cost_external_taxes = this.mapPricesByIndex(total_cost, (value, index) => {
      const utility = external_utility[index] || 0;
      return (value + utility) * 0.15;
    });
    const total_cost_external = this.sumPricesByIndex(total_cost, cost_external_taxes, external_utility);
    const subtotal = this.sumPricesByIndex(total_cost_external, this.prueba3(), this.prueba4(), this.prueba5());
    const cost_transfers = this.mapPricesByIndex(subtotal, value => value * 0.04);
    const final_cost = this.sumPricesByIndex(subtotal, cost_transfers);
    const price_pp = this.mapPricesByIndex(final_cost, value => {
      const paxCount = this.toNumber(this.newQuoter.number_paxs);
      return paxCount > 0 ? value / paxCount : 0;
    });

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
      const payload = this.normalizeQuoterForPersistence(this.newQuoter);
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

  openModal() { this.modalOpen.set(true); this.modalData.set(this.getNumberPaxsArray()); }
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
