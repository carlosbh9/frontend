import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HasPermissionsDirective } from '../../Services/AuthService/has-permissions.directive';
import { TariffV2Service } from '../../Services/tariff-v2.service';
import { TariffV2ActivityFamilyComponent } from './components/tariff-v2-activity-family.component';
import { TariffV2HotelFamilyComponent } from './components/tariff-v2-hotel-family.component';
import { TariffV2TrainFamilyComponent } from './components/tariff-v2-train-family.component';
import { TariffV2TransportFamilyComponent } from './components/tariff-v2-transport-family.component';
import { TariffV2ValiditySectionComponent } from './components/tariff-v2-validity-section.component';
import {
  ChildPriceType,
  OccupancyType,
  PricingMode,
  ProductCategory,
  SeasonType,
  SpecialDateOperation,
  TariffItemType,
  TariffStatus,
  TariffV2FiltersResponse,
  TariffV2OptionsResponse,
  TariffItemV2,
  TARIFF_V2_TYPE_RULES,
  VehicleType,
} from '../../interfaces/tariff-v2.interface';

@Component({
  selector: 'app-tariff-v2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HasPermissionsDirective,
    TranslateModule,
    TariffV2HotelFamilyComponent,
    TariffV2ActivityFamilyComponent,
    TariffV2TransportFamilyComponent,
    TariffV2TrainFamilyComponent,
    TariffV2ValiditySectionComponent,
  ],
  templateUrl: './tariff-v2.component.html',
  styleUrl: './tariff-v2.component.css',
})
export class TariffV2Component implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tariffV2Service = inject(TariffV2Service);
  private readonly translate = inject(TranslateService);

  readonly items = signal<TariffItemV2[]>([]);
  readonly options = signal<TariffV2OptionsResponse | null>(null);
  readonly filtersMeta = signal<TariffV2FiltersResponse>({ providers: [], cities: [], years: [], tags: [] });
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly showDetailModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly selectedItem = signal<TariffItemV2 | null>(null);
  readonly pagination = signal({ page: 1, limit: 20, total: 0, totalPages: 0 });

  readonly query = signal({
    q: '',
    type: '',
    category: '',
    status: '',
    provider: '',
    city: '',
    year: '',
    active: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  readonly pages = computed(() => {
    const totalPages = this.pagination().totalPages;
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  });
  readonly language = signal<'en' | 'es'>('en');

  form = this.buildForm();

  async ngOnInit() {
    this.initializeLanguage();
    this.syncDynamicValidators();
    await Promise.all([this.loadOptions(), this.loadFilters(), this.loadItems()]);
  }

  initializeLanguage() {
    const saved = (localStorage.getItem('tariff_lang') as 'en' | 'es' | null) || 'en';
    const nextLanguage = saved === 'es' ? 'es' : 'en';
    this.language.set(nextLanguage);
    this.translate.setDefaultLang('en');
    this.translate.use(nextLanguage);
  }

  onLanguageChange(language: string) {
    const nextLanguage = language === 'es' ? 'es' : 'en';
    this.language.set(nextLanguage);
    localStorage.setItem('tariff_lang', nextLanguage);
    this.translate.use(nextLanguage);
  }

  get childPoliciesArray() { return this.form.get('childPolicies') as FormArray; }
  get specialDatesArray() { return this.form.get('validity.specialDates') as FormArray; }
  get closingDatesArray() { return this.form.get('validity.closingDates') as FormArray; }
  get rangesArray() { return this.form.get('pricing.ranges') as FormArray; }
  get roomsArray() { return this.form.get('pricing.rooms') as FormArray; }
  get seasonsArray() { return this.form.get('pricing.seasons') as FormArray; }
  get vehicleRatesArray() { return this.form.get('pricing.vehicleRates') as FormArray; }

  buildForm() {
    return this.fb.group({
      code: [''],
      name: ['', Validators.required],
      provider: [''],
      type: ['', Validators.required],
      category: ['', Validators.required],
      subtype: [''],
      city: [''],
      location: [''],
      active: [true],
      status: ['DRAFT', Validators.required],
      tagsInput: [''],
      content: this.fb.group({
        shortDescription: [''],
        description: [''],
        duration: [''],
        schedules: [''],
        remarks: [''],
        observations: [''],
        cancellationPolicy: [''],
        contactPhone: [''],
        nearbyPlaces: [''],
        generalInfoText: [''],
      }),
      pricing: this.fb.group({
        mode: ['', Validators.required],
        currency: ['USD'],
        pricePerson: [null as boolean | null],
        basePrice: [null as number | null],
        soloTravelerPrice: [null as number | null],
        guidePrice: [null as number | null],
        ranges: this.fb.array([]),
        rooms: this.fb.array([]),
        seasons: this.fb.array([]),
        vehicleRates: this.fb.array([]),
        customText: [''],
      }),
      childPolicies: this.fb.array([]),
      validity: this.fb.group({
        year: [String(new Date().getFullYear()), Validators.required],
        dateFrom: [''],
        dateTo: [''],
        specialDates: this.fb.array([]),
        closingDates: this.fb.array([]),
      }),
      notes: [''],
      metadataText: [''],
    });
  }

  async loadOptions() {
    try {
      this.options.set(await this.tariffV2Service.getOptions());
    } catch (error) {
      console.error(error);
      toast.error('Error loading tariff-v2 options');
    }
  }

  async loadFilters() {
    try {
      this.filtersMeta.set(await this.tariffV2Service.getFilters());
    } catch (error) {
      console.error(error);
      toast.error('Error loading tariff-v2 filters');
    }
  }

  async loadItems(page = this.pagination().page) {
    this.loading.set(true);
    try {
      const response = await this.tariffV2Service.listItems({
        ...this.query(),
        page,
        limit: this.pagination().limit,
      });
      this.items.set(response.items);
      this.pagination.set(response.pagination);
    } catch (error) {
      console.error(error);
      toast.error('Error loading tariff-v2 items');
    } finally {
      this.loading.set(false);
    }
  }

  onFilterChange() {
    this.pagination.update((state) => ({ ...state, page: 1 }));
    this.loadItems(1);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.pagination().totalPages) return;
    this.loadItems(page);
  }

  updateQuery(field: keyof ReturnType<typeof this.query>, value: string) {
    this.query.update((current) => ({ ...current, [field]: value }));
  }

  openCreateModal() {
    this.editingId.set(null);
    this.selectedItem.set(null);
    this.form = this.buildForm();
    this.syncDynamicValidators();
    this.form.markAsPristine();
    this.showModal.set(true);
  }

  closeModal() {
    if (this.form.dirty) {
      const shouldClose = window.confirm('You have unsaved changes. Close anyway?');
      if (!shouldClose) {
        return;
      }
    }
    this.showModal.set(false);
  }

  openDetailModal(item: TariffItemV2) {
    this.selectedItem.set(item);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
  }

  openEditModal(item: TariffItemV2) {
    this.editingId.set(item._id || null);
    this.selectedItem.set(item);
    this.form = this.buildForm();
    this.patchForm(item);
    this.syncDynamicValidators();
    this.form.markAsPristine();
    this.showModal.set(true);
  }

  onTypeSelected() {
    const type = this.form.get('type')?.value as TariffItemType;
    const rule = type ? TARIFF_V2_TYPE_RULES[type] : null;
    if (!rule) return;

    if (rule.categories.length === 1) {
      this.form.get('category')?.setValue(rule.categories[0]);
    }

    if (rule.pricingModes.length === 1) {
      this.form.get('pricing.mode')?.setValue(rule.pricingModes[0]);
    }

    this.resetDynamicSectionsForType(type);
    this.ensureModeDefaults();
    this.syncDynamicValidators();
  }

  onPricingModeChange() {
    this.resetDynamicSectionsForMode(this.selectedPricingMode());
    this.ensureModeDefaults();
    this.syncDynamicValidators();
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.warning('Complete the required fields');
      return;
    }

    this.saving.set(true);
    try {
      const invalidJsonFields = this.getInvalidJsonFields();
      if (invalidJsonFields.length > 0) {
        toast.warning(`Fix invalid JSON in: ${invalidJsonFields.join(', ')}`);
        this.saving.set(false);
        return;
      }

      const payload = this.buildPayload();
      const pricingError = this.validatePayloadBeforeSubmit(payload);
      if (pricingError) {
        toast.warning(pricingError);
        this.saving.set(false);
        return;
      }
      const editingId = this.editingId();

      if (editingId) {
        await this.tariffV2Service.updateItem(editingId, payload);
        toast.success('Tariff item updated');
      } else {
        await this.tariffV2Service.createItem(payload);
        toast.success('Tariff item created');
      }

      this.closeModal();
      await Promise.all([this.loadItems(this.pagination().page), this.loadFilters()]);
    } catch (error: any) {
      console.error(error);
      const backendMessage =
        error?.error?.error ||
        error?.error?.message ||
        error?.error?.details?.field ||
        'Error saving tariff item';
      toast.error(backendMessage);
    } finally {
      this.saving.set(false);
    }
  }

  confirmDelete(item: TariffItemV2) {
    if (!item._id) return;

    toast(`Delete ${item.name}?`, {
      action: {
        label: 'Confirm',
        onClick: async () => {
          try {
            await this.tariffV2Service.deleteItem(item._id!);
            toast.success('Tariff item deleted');
            await Promise.all([this.loadItems(this.pagination().page), this.loadFilters()]);
          } catch (error: any) {
            console.error(error);
            toast.error(error?.error?.message || 'Error deleting tariff item');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => toast.info('Delete cancelled'),
      },
      position: 'top-center',
    });
  }

  addChildPolicy() { this.childPoliciesArray.push(this.createChildPolicyGroup()); }
  removeChildPolicy(index: number) { this.childPoliciesArray.removeAt(index); }
  addSpecialDate() { this.specialDatesArray.push(this.createSpecialDateGroup()); }
  removeSpecialDate(index: number) { this.specialDatesArray.removeAt(index); }
  addClosingDate() { this.closingDatesArray.push(this.createClosingDateGroup()); }
  removeClosingDate(index: number) { this.closingDatesArray.removeAt(index); }
  addRange() { this.rangesArray.push(this.createRangeGroup()); }
  removeRange(index: number) { this.rangesArray.removeAt(index); }
  addRoom() { this.roomsArray.push(this.createRoomGroup()); }
  removeRoom(index: number) { this.roomsArray.removeAt(index); }
  addRoomOccupancy(roomIndex: number) { this.getRoomOccupancyRates(roomIndex).push(this.createOccupancyRateGroup()); }
  removeRoomOccupancy(roomIndex: number, occupancyIndex: number) { this.getRoomOccupancyRates(roomIndex).removeAt(occupancyIndex); }
  addSeason() { this.seasonsArray.push(this.createSeasonGroup()); }
  removeSeason(index: number) { this.seasonsArray.removeAt(index); }
  addVehicleRate() { this.vehicleRatesArray.push(this.createVehicleRateGroup()); }
  removeVehicleRate(index: number) { this.vehicleRatesArray.removeAt(index); }

  getRoomOccupancyRates(index: number) {
    return this.roomsArray.at(index).get('occupancyRates') as FormArray;
  }

  getAvailableCategories() {
    return this.selectedTypeRule()?.categories || this.options()?.categories || [];
  }

  getAvailablePricingModes() {
    return this.selectedTypeRule()?.pricingModes || this.options()?.pricingModes || [];
  }

  selectedTypeRule() {
    const type = this.form.get('type')?.value as TariffItemType | '';
    return type ? TARIFF_V2_TYPE_RULES[type] : null;
  }

  selectedPricingMode() {
    return (this.form.get('pricing.mode')?.value as PricingMode | '') || '';
  }

  selectedFamily() {
    const type = this.form.get('type')?.value as TariffItemType | '';
    if (type === 'HOTEL') return 'hotel';
    if (type === 'TRAIN') return 'train';
    if (type === 'TRANSPORT' || type === 'OPERATOR_SERVICE') return 'transport';
    if (type) return 'activity';
    return null;
  }

  typeSummary() {
    const type = this.form.get('type')?.value as TariffItemType | '';
    const mode = this.selectedPricingMode();

    if (!type) {
      return {
        title: 'Select a type',
        description: 'The form will adapt its sections after you choose the tariff item type.',
      };
    }

    const labels: Record<TariffItemType, { title: string; description: string }> = {
      HOTEL: {
        title: 'Accommodation item',
        description: 'Best for hotel contracts with room-based occupancy rates.',
      },
      ENTRANCE: {
        title: 'Entrance item',
        description: 'Use for entry fees sold per person or per group.',
      },
      EXPEDITION: {
        title: 'Expedition item',
        description: 'Use for expedition products priced per person or per group.',
      },
      EXPERIENCE: {
        title: 'Experience item',
        description: 'Flexible product for activities sold per person, group, or pax range.',
      },
      EXTRA: {
        title: 'Extra item',
        description: 'Use for optional add-ons charged per person or per group.',
      },
      GUIDE: {
        title: 'Guide item',
        description: 'Guide services can be configured per group or per person.',
      },
      RESTAURANT: {
        title: 'Restaurant item',
        description: 'Meals and restaurant products with person/group pricing.',
      },
      TRAIN: {
        title: 'Train item',
        description: 'Train products should be configured with season-based fares.',
      },
      TRANSPORT: {
        title: 'Transport item',
        description: 'Transfers and transport services usually need pax ranges or custom logic.',
      },
      OPERATOR_SERVICE: {
        title: 'Operator service item',
        description: 'Ground operator services can behave like transfer or activity blocks.',
      },
      PROVIDER_ACTIVITY: {
        title: 'Provider activity item',
        description: 'Activity/meal provided by an external provider such as Lima Gourmet.',
      },
    };

    const base = labels[type];
    return {
      title: base.title,
      description: mode ? `${base.description} Current pricing mode: ${mode}.` : base.description,
    };
  }

  requiresProvider() {
    return !!this.selectedTypeRule()?.providerRequired;
  }

  showVehicleRateSection() {
    const type = this.form.get('type')?.value;
    return type === 'TRANSPORT' || type === 'OPERATOR_SERVICE';
  }

  showChildPoliciesSection() {
    const type = this.form.get('type')?.value as TariffItemType | '';
    return ['HOTEL', 'ENTRANCE', 'EXPEDITION', 'EXPERIENCE', 'EXTRA', 'RESTAURANT', 'PROVIDER_ACTIVITY'].includes(type);
  }

  showContentSection() {
    return !!this.form.get('type')?.value;
  }

  showGeneralPricingFields() {
    return ['PER_PERSON', 'PER_GROUP'].includes(this.selectedPricingMode());
  }

  getGeneralFieldHints(): string[] {
    const hints = [
      this.translate.instant('tariff.hint_provider'),
      this.translate.instant('tariff.hint_subtype'),
      this.translate.instant('tariff.hint_location'),
      this.translate.instant('tariff.hint_tags'),
      this.translate.instant('tariff.hint_status_active'),
    ];

    if (this.requiresProvider()) {
      hints.unshift(this.translate.instant('tariff.hint_provider_required'));
    }

    return hints;
  }

  getSoftWarnings(): string[] {
    const warnings: string[] = [];
    const mode = this.selectedPricingMode();
    const family = this.selectedFamily();

    if (!this.form.get('type')?.value) {
      warnings.push(this.translate.instant('tariff.soft_warning_type'));
    }

    if (!mode) {
      warnings.push(this.translate.instant('tariff.soft_warning_mode'));
    }

    if (mode === 'PER_PAX_RANGE' && this.rangesArray.length === 0) {
      warnings.push(this.translate.instant('tariff.soft_warning_ranges'));
    }

    if (mode === 'PER_ROOM' && this.roomsArray.length === 0) {
      warnings.push(this.translate.instant('tariff.soft_warning_rooms'));
    }

    if (mode === 'PER_SEASON' && this.seasonsArray.length === 0) {
      warnings.push(this.translate.instant('tariff.soft_warning_seasons'));
    }

    if (mode === 'CUSTOM' && !String(this.form.get('pricing.customText')?.value || '').trim()) {
      warnings.push(this.translate.instant('tariff.soft_warning_custom'));
    }

    if ((family === 'activity' || family === 'hotel') && this.childPoliciesArray.length === 0) {
      warnings.push(this.translate.instant('tariff.soft_warning_children'));
    }

    if (!String(this.form.get('validity.year')?.value || '').trim()) {
      warnings.push(this.translate.instant('tariff.soft_warning_year'));
    }

    return warnings;
  }

  isFieldInvalid(path: string) {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getFieldError(path: string, label: string) {
    const control = this.form.get(path);
    if (!control || !this.isFieldInvalid(path)) {
      return '';
    }

    if (control.errors?.['required']) {
      return `${label} is required`;
    }

    return `${label} is invalid`;
  }

  hasJsonContent(value: unknown) {
    return !!value && typeof value === 'object' && Object.keys(value as Record<string, unknown>).length > 0;
  }

  objectEntries(value: Record<string, unknown> | undefined | null) {
    return Object.entries(value || {});
  }

  private patchForm(item: TariffItemV2) {
    this.form.patchValue({
      code: item.code || '',
      name: item.name || '',
      provider: item.provider || '',
      type: item.type || '',
      category: item.category || '',
      subtype: item.subtype || '',
      city: item.city || '',
      location: item.location || '',
      active: item.active,
      status: item.status || 'DRAFT',
      tagsInput: (item.tags || []).join(', '),
      content: {
        shortDescription: item.content?.shortDescription || '',
        description: item.content?.description || '',
        duration: item.content?.duration || '',
        schedules: item.content?.schedules || '',
        remarks: item.content?.remarks || '',
        observations: item.content?.observations || '',
        cancellationPolicy: item.content?.cancellationPolicy || '',
        contactPhone: item.content?.contactPhone || '',
        nearbyPlaces: item.content?.nearbyPlaces || '',
        generalInfoText: item.content?.generalInfo ? JSON.stringify(item.content.generalInfo, null, 2) : '',
      },
      pricing: {
        mode: item.pricing?.mode || '',
        currency: item.pricing?.currency || 'USD',
        pricePerson: item.pricing?.pricePerson ?? null,
        basePrice: item.pricing?.basePrice ?? null,
        soloTravelerPrice: item.pricing?.soloTravelerPrice ?? null,
        guidePrice: item.pricing?.guidePrice ?? null,
        customText: item.pricing?.custom ? JSON.stringify(item.pricing.custom, null, 2) : '',
      },
      validity: {
        year: item.validity?.year || String(new Date().getFullYear()),
        dateFrom: item.validity?.dateFrom || '',
        dateTo: item.validity?.dateTo || '',
      },
      notes: item.notes || '',
      metadataText: item.metadata ? JSON.stringify(item.metadata, null, 2) : '',
    });

    (item.childPolicies || []).forEach((policy) => this.childPoliciesArray.push(this.createChildPolicyGroup(policy)));
    (item.validity?.specialDates || []).forEach((rule) => this.specialDatesArray.push(this.createSpecialDateGroup(rule)));
    (item.validity?.closingDates || []).forEach((rule) => this.closingDatesArray.push(this.createClosingDateGroup(rule)));
    (item.pricing?.ranges || []).forEach((range) => this.rangesArray.push(this.createRangeGroup(range)));
    (item.pricing?.rooms || []).forEach((room) => this.roomsArray.push(this.createRoomGroup(room)));
    (item.pricing?.seasons || []).forEach((season) => this.seasonsArray.push(this.createSeasonGroup(season)));
    (item.pricing?.vehicleRates || []).forEach((rate) => this.vehicleRatesArray.push(this.createVehicleRateGroup(rate)));
  }

  private buildPayload() {
    const raw = this.form.getRawValue() as any;

    const payload: Partial<TariffItemV2> = {
      code: raw.code || undefined,
      name: raw.name || '',
      provider: raw.provider || undefined,
      type: raw.type as TariffItemType,
      category: raw.category as ProductCategory,
      subtype: raw.subtype || undefined,
      city: raw.city || undefined,
      location: raw.location || undefined,
      active: raw.active,
      status: raw.status as TariffStatus,
      tags: this.splitCsv(raw.tagsInput),
      content: {
        shortDescription: raw.content.shortDescription || undefined,
        description: raw.content.description || undefined,
        duration: raw.content.duration || undefined,
        schedules: raw.content.schedules || undefined,
        remarks: raw.content.remarks || undefined,
        observations: raw.content.observations || undefined,
        cancellationPolicy: raw.content.cancellationPolicy || undefined,
        contactPhone: raw.content.contactPhone || undefined,
        nearbyPlaces: raw.content.nearbyPlaces || undefined,
        generalInfo: this.parseJsonSafe(raw.content.generalInfoText, 'General info'),
      },
      pricing: {
        mode: raw.pricing.mode as PricingMode,
        currency: raw.pricing.currency || undefined,
        pricePerson: raw.pricing.pricePerson,
        basePrice: this.toNullableNumber(raw.pricing.basePrice),
        soloTravelerPrice: this.toNullableNumber(raw.pricing.soloTravelerPrice),
        guidePrice: this.toNullableNumber(raw.pricing.guidePrice),
        ranges: raw.pricing.ranges,
        rooms: raw.pricing.rooms,
        seasons: raw.pricing.seasons,
        vehicleRates: raw.pricing.vehicleRates,
        custom: this.parseJsonSafe(raw.pricing.customText, 'Custom pricing'),
      },
      childPolicies: raw.childPolicies,
      validity: {
        year: raw.validity.year || '',
        dateFrom: raw.validity.dateFrom || null,
        dateTo: raw.validity.dateTo || null,
        specialDates: raw.validity.specialDates,
        closingDates: raw.validity.closingDates,
      },
      notes: raw.notes || undefined,
      metadata: this.parseJsonSafe(raw.metadataText, 'Metadata'),
    };

    return payload;
  }

  private parseJsonSafe(value?: string | null, fieldLabel = 'JSON field') {
    if (!value?.trim()) return undefined;
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  private getInvalidJsonFields() {
    const raw = this.form.getRawValue() as any;
    const invalidFields: string[] = [];

    if (!this.isValidJsonOrEmpty(raw.content?.generalInfoText)) {
      invalidFields.push('General info');
    }

    if (!this.isValidJsonOrEmpty(raw.pricing?.customText)) {
      invalidFields.push('Custom pricing');
    }

    if (!this.isValidJsonOrEmpty(raw.metadataText)) {
      invalidFields.push('Metadata');
    }

    return invalidFields;
  }

  private isValidJsonOrEmpty(value?: string | null) {
    if (!value?.trim()) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  private splitCsv(value?: string | null) {
    if (!value?.trim()) return [];
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private resetDynamicSectionsForType(type: TariffItemType) {
    if (type !== 'TRANSPORT' && type !== 'OPERATOR_SERVICE') {
      this.clearFormArray(this.vehicleRatesArray);
    }

    if (!['HOTEL', 'ENTRANCE', 'EXPEDITION', 'EXPERIENCE', 'EXTRA', 'RESTAURANT', 'PROVIDER_ACTIVITY'].includes(type)) {
      this.clearFormArray(this.childPoliciesArray);
    }

    if (!this.requiresProvider()) {
      this.form.get('provider')?.setValue('');
    }
  }

  private resetDynamicSectionsForMode(mode: PricingMode | '') {
    if (mode !== 'PER_PAX_RANGE') {
      this.clearFormArray(this.rangesArray);
    }

    if (mode !== 'PER_ROOM') {
      this.clearFormArray(this.roomsArray);
    }

    if (mode !== 'PER_SEASON') {
      this.clearFormArray(this.seasonsArray);
    }

    if (mode !== 'CUSTOM') {
      this.pricingGroup.get('customText')?.setValue('');
    }

    if (!['PER_PERSON', 'PER_GROUP'].includes(mode)) {
      this.pricingGroup.patchValue({
        basePrice: null,
        soloTravelerPrice: null,
        guidePrice: null,
        pricePerson: null,
      }, { emitEvent: false });
    }
  }

  private ensureModeDefaults() {
    const mode = this.selectedPricingMode();

    if (mode === 'PER_PAX_RANGE' && this.rangesArray.length === 0) {
      this.addRange();
    }

    if (mode === 'PER_ROOM' && this.roomsArray.length === 0) {
      this.addRoom();
    }

    if (mode === 'PER_SEASON' && this.seasonsArray.length === 0) {
      this.addSeason();
    }

    if (this.showVehicleRateSection() && this.vehicleRatesArray.length === 0) {
      this.addVehicleRate();
    }
  }

  private syncDynamicValidators() {
    const providerControl = this.form.get('provider');
    const basePriceControl = this.form.get('pricing.basePrice');
    const mode = this.selectedPricingMode();

    if (this.requiresProvider()) {
      providerControl?.setValidators([Validators.required]);
    } else {
      providerControl?.clearValidators();
    }
    providerControl?.updateValueAndValidity({ emitEvent: false });

    if (['PER_PERSON', 'PER_GROUP'].includes(mode)) {
      basePriceControl?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      basePriceControl?.clearValidators();
    }
    basePriceControl?.updateValueAndValidity({ emitEvent: false });
  }

  private clearFormArray(formArray: FormArray) {
    while (formArray.length > 0) {
      formArray.removeAt(0);
    }
  }

  get pricingGroup() {
    return this.form.get('pricing') as FormGroup;
  }

  get contentGroup() {
    return this.form.get('content') as FormGroup;
  }

  get validityGroup() {
    return this.form.get('validity') as FormGroup;
  }

  private validatePayloadBeforeSubmit(payload: Partial<TariffItemV2>) {
    if (!payload.type) {
      return 'Type is required';
    }

    const rule = payload.type ? TARIFF_V2_TYPE_RULES[payload.type] : null;

    if (rule && payload.category && !rule.categories.includes(payload.category)) {
      return `Category ${payload.category} is not valid for type ${payload.type}`;
    }

    if (this.requiresProvider() && !payload.provider) {
      return 'Provider is required for this type';
    }

    if (!payload.pricing?.mode) {
      return 'Pricing mode is required';
    }

    if (rule && !rule.pricingModes.includes(payload.pricing.mode)) {
      return `Pricing mode ${payload.pricing.mode} is not valid for type ${payload.type}`;
    }

    if (['PER_PERSON', 'PER_GROUP'].includes(payload.pricing.mode) && (payload.pricing.basePrice === null || payload.pricing.basePrice === undefined)) {
      return 'Base price is required for per person / per group pricing';
    }

    if (payload.pricing.mode === 'PER_PAX_RANGE' && !payload.pricing.ranges?.length) {
      return 'Add at least one pax range';
    }

    if (payload.pricing.mode === 'PER_ROOM' && !payload.pricing.rooms?.length) {
      return 'Add at least one room rate';
    }

    if (payload.pricing.mode === 'PER_SEASON' && !payload.pricing.seasons?.length) {
      return 'Add at least one season rate';
    }

    if (payload.pricing.mode === 'CUSTOM' && !payload.pricing.custom && !payload.pricing.vehicleRates?.length) {
      return 'Custom pricing requires JSON content or vehicle rates';
    }

    return null;
  }

  private toNullableNumber(value: any) {
    return value === null || value === '' || value === undefined ? null : Number(value);
  }

  private createChildPolicyGroup(policy?: { minAge?: number | null; maxAge?: number | null; priceType?: ChildPriceType; value?: number }) {
    return this.fb.group({
      minAge: [policy?.minAge ?? null],
      maxAge: [policy?.maxAge ?? null],
      priceType: [policy?.priceType || 'FIXED'],
      value: [policy?.value ?? 0],
    });
  }

  private createSpecialDateGroup(rule?: { date?: string; operation?: SpecialDateOperation; value?: number | null; note?: string }) {
    return this.fb.group({
      date: [rule?.date || ''],
      operation: [rule?.operation || 'ADD'],
      value: [rule?.value ?? null],
      note: [rule?.note || ''],
    });
  }

  private createClosingDateGroup(rule?: { date?: string; note?: string }) {
    return this.fb.group({
      date: [rule?.date || ''],
      note: [rule?.note || ''],
    });
  }

  private createRangeGroup(range?: { minPax?: number; maxPax?: number; price?: number; vehicleType?: VehicleType }) {
    return this.fb.group({
      minPax: [range?.minPax ?? 1],
      maxPax: [range?.maxPax ?? 1],
      price: [range?.price ?? 0],
      vehicleType: [range?.vehicleType || ''],
    });
  }

  private createOccupancyRateGroup(rate?: { occupancy?: OccupancyType; confidential?: number; rack?: number }) {
    return this.fb.group({
      occupancy: [rate?.occupancy || 'SWB'],
      confidential: [rate?.confidential ?? 0],
      rack: [rate?.rack ?? 0],
    });
  }

  private createRoomGroup(room?: { roomName?: string; occupancyRates?: Array<{ occupancy?: OccupancyType; confidential?: number; rack?: number }> }) {
    return this.fb.group({
      roomName: [room?.roomName || ''],
      occupancyRates: this.fb.array((room?.occupancyRates || [undefined]).map((rate) => this.createOccupancyRateGroup(rate))),
    });
  }

  private createSeasonGroup(season?: { season?: SeasonType; adultPrice?: number; childPrice?: number | null; guidePrice?: number | null }) {
    return this.fb.group({
      season: [season?.season || 'Regular'],
      adultPrice: [season?.adultPrice ?? 0],
      childPrice: [season?.childPrice ?? null],
      guidePrice: [season?.guidePrice ?? null],
    });
  }

  private createVehicleRateGroup(rate?: { vehicleType?: VehicleType; price?: number }) {
    return this.fb.group({
      vehicleType: [rate?.vehicleType || 'Van'],
      price: [rate?.price ?? 0],
    });
  }
}
