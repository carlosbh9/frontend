import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { HasPermissionsDirective } from '../../Services/AuthService/has-permissions.directive';
import { MasterQuoterV2Service } from '../../Services/master-quoter-v2.service';
import { TariffV2Service } from '../../Services/tariff-v2.service';
import { MasterQuoterV2OptionsResponse, MasterQuoterV2Template } from '../../interfaces/master-quoter-v2.interface';
import { TariffItemV2 } from '../../interfaces/tariff-v2.interface';

@Component({
  selector: 'app-master-quoter-v2',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HasPermissionsDirective],
  templateUrl: './master-quoter-v2.component.html',
  styleUrl: './master-quoter-v2.component.css',
})
export class MasterQuoterV2Component implements OnInit {
  private readonly excludedTariffCategories = new Set(['ACCOMMODATION']);

  private readonly fb = inject(FormBuilder);
  private readonly masterQuoterV2Service = inject(MasterQuoterV2Service);
  private readonly tariffV2Service = inject(TariffV2Service);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly templates = signal<MasterQuoterV2Template[]>([]);
  readonly options = signal<MasterQuoterV2OptionsResponse | null>(null);
  readonly tariffCatalog = signal<TariffItemV2[]>([]);
  readonly showModal = signal(false);
  readonly showDetailModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly selectedResolved = signal<MasterQuoterV2Template | null>(null);
  readonly pagination = signal({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly expandedDays = signal<number[]>([0]);
  readonly dayFilters = signal<Record<number, { category: string; year: string; search: string }>>({});
  readonly dayPlacementTarget = signal<Record<number, 'services' | 'options'>>({});
  readonly daySearchOpen = signal<Record<number, boolean>>({});

  readonly query = signal({
    q: '',
    type: '',
    status: '',
    active: '',
    sortBy: 'updatedAt',
    sortDir: 'desc',
  });

  readonly pages = computed(() => Array.from({ length: this.pagination().totalPages }, (_, index) => index + 1));
  readonly tariffCategories = computed(() =>
    [...new Set(this.tariffCatalog()
      .map((item) => item.category)
      .filter((category) => !!category && !this.excludedTariffCategories.has(category)))].sort()
  );
  readonly tariffYears = computed(() =>
    [...new Set(this.tariffCatalog().map((item) => item.validity?.year).filter(Boolean))].sort()
  );
  readonly groupedTariffCatalog = computed(() => {
    const groups = new Map<string, TariffItemV2[]>();

    this.tariffCatalog()
      .filter((item) => !this.isExcludedTariffItem(item))
      .forEach((item) => {
      const key = item.type || 'OTHER';
      const current = groups.get(key) || [];
      current.push(item);
      groups.set(key, current);
    });

    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([type, items]) => ({
        type,
        items: [...items].sort((left, right) => left.name.localeCompare(right.name)),
      }));
  });

  form: FormGroup = this.buildForm();

  private isExcludedTariffItem(item: TariffItemV2 | null | undefined) {
    return !!item && this.excludedTariffCategories.has(item.category);
  }

  async ngOnInit() {
    await Promise.all([this.loadOptions(), this.loadTemplates(), this.loadTariffCatalog()]);
  }

  buildForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      type: ['TEMPLATE', Validators.required],
      destinations: [''],
      totalDays: [1, [Validators.required, Validators.min(1)]],
      status: ['DRAFT', Validators.required],
      active: [true],
      notes: [''],
      metadataText: [''],
      days: this.fb.array([this.createDayGroup(1)]),
    });
  }

  get daysArray(): FormArray {
    return this.form.get('days') as FormArray;
  }

  dayItemsArray(dayIndex: number): FormArray {
    return this.daysArray.at(dayIndex).get('items') as FormArray;
  }

  createDayGroup(dayNumber?: number, day?: any): FormGroup {
    const safeDayNumber = dayNumber ?? (this.daysArray?.length ? this.daysArray.length + 1 : 1);
    return this.fb.group({
      dayNumber: [day?.dayNumber ?? safeDayNumber, [Validators.required, Validators.min(1)]],
      city: [day?.city || ''],
      title: [day?.title || ''],
      notes: [day?.notes || ''],
      items: this.fb.array((day?.items || []).map((item: any) => this.createItemGroup(item))),
    });
  }

  createItemGroup(item?: any): FormGroup {
    return this.fb.group({
      placement: [item?.placement || 'services', Validators.required],
      tariffItemId: [item?.tariffItemId || '', Validators.required],
      tariffSearch: [item?.tariffSnapshot?.name || item?.title || ''],
      itemOrder: [item?.itemOrder ?? 0],
      title: [item?.title || ''],
      notes: [item?.notes || ''],
    });
  }

  async loadOptions() {
    try {
      this.options.set(await this.masterQuoterV2Service.getOptions());
    } catch (error) {
      console.error(error);
      toast.error('Error loading master-quoter-v2 options');
    }
  }

  async loadTemplates(page = this.pagination().page) {
    this.loading.set(true);
    try {
      const response = await this.masterQuoterV2Service.listTemplates({
        ...this.query(),
        page,
        limit: this.pagination().limit,
      });
      this.templates.set(response.items);
      this.pagination.set(response.pagination);
    } catch (error) {
      console.error(error);
      toast.error('Error loading master-quoter-v2 templates');
    } finally {
      this.loading.set(false);
    }
  }

  async loadTariffCatalog() {
    try {
      const response = await this.tariffV2Service.listItems({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortDir: 'asc',
        active: true,
      });
      this.tariffCatalog.set((response.items || []).filter((item: TariffItemV2) => !this.isExcludedTariffItem(item)));
    } catch (error) {
      console.error(error);
      toast.error('Error loading tariff-v2 items');
    }
  }

  updateQuery(field: keyof ReturnType<typeof this.query>, value: string) {
    this.query.update((current) => ({ ...current, [field]: value }));
  }

  onFilterChange() {
    this.pagination.update((state) => ({ ...state, page: 1 }));
    this.loadTemplates(1);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.pagination().totalPages) return;
    this.loadTemplates(page);
  }

  openCreateModal() {
    this.editingId.set(null);
    this.form = this.buildForm();
    this.expandedDays.set([0]);
    this.dayFilters.set({});
    this.dayPlacementTarget.set({ 0: 'services' });
    this.daySearchOpen.set({});
    this.form.markAsPristine();
    this.showModal.set(true);
  }

  async openEditModal(template: MasterQuoterV2Template) {
    if (!template._id) return;
    try {
      const fullTemplate = await this.masterQuoterV2Service.getTemplateById(template._id);
      this.editingId.set(template._id);
      this.form = this.buildForm();
      this.patchForm(fullTemplate);
      this.expandedDays.set((fullTemplate.days || []).map((_, index) => index));
      this.dayFilters.set({});
      this.dayPlacementTarget.set(
        (fullTemplate.days || []).reduce((acc, _, index) => ({ ...acc, [index]: 'services' as const }), {})
      );
      this.daySearchOpen.set({});
      this.form.markAsPristine();
      this.showModal.set(true);
    } catch (error) {
      console.error(error);
      toast.error('Error loading template');
    }
  }

  async openDetailModal(template: MasterQuoterV2Template) {
    if (!template._id) return;
    try {
      this.selectedResolved.set(await this.masterQuoterV2Service.getResolvedTemplateById(template._id));
      this.showDetailModal.set(true);
    } catch (error) {
      console.error(error);
      toast.error('Error loading resolved template');
    }
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
  }

  closeModal() {
    if (this.form.dirty && !window.confirm('You have unsaved changes. Close anyway?')) {
      return;
    }
    this.showModal.set(false);
  }

  addDay() {
    this.daysArray.push(this.createDayGroup(this.daysArray.length + 1));
    this.form.get('totalDays')?.setValue(this.daysArray.length);
    this.dayPlacementTarget.update((targets) => ({
      ...targets,
      [this.daysArray.length - 1]: 'services',
    }));
    this.daySearchOpen.update((state) => ({
      ...state,
      [this.daysArray.length - 1]: false,
    }));
    this.expandDay(this.daysArray.length - 1);
  }

  removeDay(index: number) {
    this.daysArray.removeAt(index);
    this.resequenceDays();
    this.form.get('totalDays')?.setValue(Math.max(this.daysArray.length, 1));
    this.expandedDays.update((days) => days.filter((current) => current !== index).map((current) => current > index ? current - 1 : current));
    this.dayFilters.update((filters) => {
      const next: Record<number, { category: string; year: string; search: string }> = {};
      Object.entries(filters).forEach(([key, value]) => {
        const currentIndex = Number(key);
        if (currentIndex === index) return;
        next[currentIndex > index ? currentIndex - 1 : currentIndex] = value;
      });
      return next;
    });
    this.dayPlacementTarget.update((targets) => {
      const next: Record<number, 'services' | 'options'> = {};
      Object.entries(targets).forEach(([key, value]) => {
        const currentIndex = Number(key);
        if (currentIndex === index) return;
        next[currentIndex > index ? currentIndex - 1 : currentIndex] = value;
      });
      return next;
    });
    this.daySearchOpen.update((state) => {
      const next: Record<number, boolean> = {};
      Object.entries(state).forEach(([key, value]) => {
        const currentIndex = Number(key);
        if (currentIndex === index) return;
        next[currentIndex > index ? currentIndex - 1 : currentIndex] = value;
      });
      return next;
    });
  }

  addItem(dayIndex: number, item?: TariffItemV2, placement?: 'services' | 'options') {
    const targetPlacement = placement || this.getDayPlacementTarget(dayIndex);
    if (item?._id && this.hasItemInPlacement(dayIndex, item._id, targetPlacement)) {
      toast.info(`${item.name} is already added to ${targetPlacement}`);
      return;
    }

    const nextOrder = this.dayItemsArray(dayIndex).length;
    this.dayItemsArray(dayIndex).push(this.createItemGroup({
      placement: targetPlacement,
      tariffItemId: item?._id || '',
      tariffSnapshot: item ? { name: item.name } : undefined,
      title: item?.name || '',
      itemOrder: nextOrder,
    }));
    this.updateDayFilter(dayIndex, 'search', '');
    this.setDaySearchOpen(dayIndex, false);
    this.expandDay(dayIndex);
  }

  removeItem(dayIndex: number, itemIndex: number) {
    this.dayItemsArray(dayIndex).removeAt(itemIndex);
  }

  isDayExpanded(dayIndex: number) {
    return this.expandedDays().includes(dayIndex);
  }

  toggleDay(dayIndex: number) {
    this.expandedDays.update((days) =>
      days.includes(dayIndex) ? days.filter((current) => current !== dayIndex) : [...days, dayIndex]
    );
  }

  expandDay(dayIndex: number) {
    this.expandedDays.update((days) => days.includes(dayIndex) ? days : [...days, dayIndex]);
  }

  setItemPlacement(dayIndex: number, itemIndex: number, placement: 'services' | 'options') {
    this.dayItemsArray(dayIndex).at(itemIndex).get('placement')?.setValue(placement);
  }

  getDayPlacementTarget(dayIndex: number): 'services' | 'options' {
    return this.dayPlacementTarget()[dayIndex] || 'services';
  }

  setDayPlacementTarget(dayIndex: number, placement: 'services' | 'options') {
    this.dayPlacementTarget.update((targets) => ({
      ...targets,
      [dayIndex]: placement,
    }));
  }

  getTariffItemById(tariffItemId: string | null | undefined) {
    if (!tariffItemId) return null;
    return this.tariffCatalog().find((item) => item._id === tariffItemId) || null;
  }

  getSelectedTariffItem(dayIndex: number, itemIndex: number) {
    const tariffItemId = this.dayItemsArray(dayIndex).at(itemIndex).get('tariffItemId')?.value as string | null;
    return this.getTariffItemById(tariffItemId);
  }

  getDayItemsCount(dayIndex: number) {
    return this.dayItemsArray(dayIndex).length;
  }

  getDayPlacementCount(dayIndex: number, placement: 'services' | 'options') {
    return this.dayItemsArray(dayIndex).controls.filter(
      (control) => control.get('placement')?.value === placement
    ).length;
  }

  getDayPlacementItems(dayIndex: number, placement: 'services' | 'options') {
    return this.dayItemsArray(dayIndex).controls
      .map((control, itemIndex) => ({ control, itemIndex }))
      .filter(({ control }) => control.get('placement')?.value === placement)
      .map(({ control, itemIndex }) => {
        const tariffItemId = control.get('tariffItemId')?.value as string | null;
        return {
          itemIndex,
          control,
          tariffItem: this.getTariffItemById(tariffItemId),
        };
      });
  }

  getResolvedPlacementCount(day: any, placement: 'services' | 'options') {
    return (day?.items || []).filter((item: any) => item.placement === placement).length;
  }

  getDayFilter(dayIndex: number) {
    return this.dayFilters()[dayIndex] || { category: '', year: '', search: '' };
  }

  updateDayFilter(dayIndex: number, field: 'category' | 'year' | 'search', value: string) {
    this.dayFilters.update((filters) => ({
      ...filters,
      [dayIndex]: {
        ...this.getDayFilter(dayIndex),
        [field]: value,
      },
    }));

    if (field === 'search') {
      this.setDaySearchOpen(dayIndex, !!value.trim());
    }
  }

  getFilteredTariffItems(dayIndex: number) {
    const filter = this.getDayFilter(dayIndex);
    const search = filter.search.toLowerCase();

    if (!search && !filter.category && !filter.year) {
      return [];
    }

    const filtered = this.tariffCatalog().filter((item) => {
      if (this.isExcludedTariffItem(item)) return false;
      if (filter.category && item.category !== filter.category) return false;
      if (filter.year && item.validity?.year !== filter.year) return false;

      const haystack = [
        item.name,
        item.type,
        item.category,
        item.city,
        item.provider,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return !search || haystack.includes(search);
    });

    return filtered
      .sort((left, right) => left.name.localeCompare(right.name))
      .slice(0, 8);
  }

  hasActiveFilter(dayIndex: number) {
    const filter = this.getDayFilter(dayIndex);
    return !!(filter.search || filter.category || filter.year);
  }

  isDaySearchOpen(dayIndex: number) {
    return !!this.daySearchOpen()[dayIndex];
  }

  setDaySearchOpen(dayIndex: number, open: boolean) {
    this.daySearchOpen.update((state) => ({
      ...state,
      [dayIndex]: open,
    }));
  }

  hasItemInPlacement(dayIndex: number, tariffItemId: string, placement: 'services' | 'options') {
    return this.dayItemsArray(dayIndex).controls.some(
      (control) =>
        control.get('placement')?.value === placement &&
        control.get('tariffItemId')?.value === tariffItemId
    );
  }

  removePlacementItem(dayIndex: number, itemIndex: number) {
    this.removeItem(dayIndex, itemIndex);
  }

  placementBadgeClass(placement: string) {
    return placement === 'options'
      ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : 'bg-indigo-50 text-indigo-700 ring-indigo-200';
  }

  placementButtonClass(active: boolean, placement: string) {
    const base = 'rounded-lg px-3 py-2 text-xs font-semibold ring-1 ring-inset transition-colors';
    if (active) {
      return placement === 'options'
        ? `${base} bg-amber-500 text-white ring-amber-500`
        : `${base} bg-indigo-600 text-white ring-indigo-600`;
    }

    return placement === 'options'
      ? `${base} bg-white text-amber-700 ring-amber-200 hover:bg-amber-50`
      : `${base} bg-white text-indigo-700 ring-indigo-200 hover:bg-indigo-50`;
  }

  statusBadgeClass(status: string) {
    if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (status === 'INACTIVE') return 'bg-slate-100 text-slate-700 ring-slate-200';
    return 'bg-amber-50 text-amber-700 ring-amber-200';
  }

  tariffTypeBadgeClass(type: string | undefined) {
    const palette: Record<string, string> = {
      HOTEL: 'bg-sky-50 text-sky-700 ring-sky-200',
      TRANSPORT: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
      TRAIN: 'bg-violet-50 text-violet-700 ring-violet-200',
      ENTRANCE: 'bg-rose-50 text-rose-700 ring-rose-200',
      EXPERIENCE: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
      EXPEDITION: 'bg-pink-50 text-pink-700 ring-pink-200',
      GUIDE: 'bg-teal-50 text-teal-700 ring-teal-200',
      RESTAURANT: 'bg-orange-50 text-orange-700 ring-orange-200',
      EXTRA: 'bg-lime-50 text-lime-700 ring-lime-200',
      PROVIDER_ACTIVITY: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      OPERATOR_SERVICE: 'bg-blue-50 text-blue-700 ring-blue-200',
    };

    return palette[type || ''] || 'bg-gray-50 text-gray-700 ring-gray-200';
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.warning('Complete the required fields');
      return;
    }

    this.saving.set(true);
    try {
      const payload = this.buildPayload();
      if (this.editingId()) {
        await this.masterQuoterV2Service.updateTemplate(this.editingId()!, payload);
        toast.success('Master Quoter V2 updated');
      } else {
        await this.masterQuoterV2Service.createTemplate(payload);
        toast.success('Master Quoter V2 created');
      }

      this.showModal.set(false);
      await this.loadTemplates(this.pagination().page);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.error?.message || 'Error saving master-quoter-v2');
    } finally {
      this.saving.set(false);
    }
  }

  async confirmDelete(template: MasterQuoterV2Template) {
    if (!template._id) return;
    if (!window.confirm(`Delete ${template.name}?`)) return;

    try {
      await this.masterQuoterV2Service.deleteTemplate(template._id);
      toast.success('Template deleted');
      await this.loadTemplates(this.pagination().page);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.error?.message || 'Error deleting template');
    }
  }

  isFieldInvalid(path: string) {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private resequenceDays() {
    this.daysArray.controls.forEach((control: AbstractControl, index: number) => {
      control.get('dayNumber')?.setValue(index + 1, { emitEvent: false });
    });
  }

  private patchForm(template: MasterQuoterV2Template) {
    this.form.patchValue({
      name: template.name,
      type: template.type,
      destinations: template.destinations || '',
      totalDays: template.totalDays,
      status: template.status,
      active: template.active,
      notes: template.notes || '',
      metadataText: template.metadata ? JSON.stringify(template.metadata, null, 2) : '',
    });

    this.daysArray.clear();
    (template.days || []).forEach((day) => this.daysArray.push(this.createDayGroup(day.dayNumber, day)));
  }

  private buildPayload(): Partial<MasterQuoterV2Template> {
    const raw = this.form.getRawValue() as any;

    return {
      name: raw.name,
      type: raw.type,
      destinations: raw.destinations || undefined,
      totalDays: Number(raw.totalDays),
      status: raw.status,
      active: !!raw.active,
      notes: raw.notes || undefined,
      metadata: this.parseJson(raw.metadataText),
      days: (raw.days || []).map((day: any, index: number) => ({
        dayNumber: Number(day.dayNumber || index + 1),
        city: day.city || undefined,
        title: day.title || undefined,
        notes: day.notes || undefined,
        items: (day.items || []).map((item: any, itemIndex: number) => ({
          placement: item.placement,
          tariffItemId: item.tariffItemId,
          itemOrder: Number(item.itemOrder ?? itemIndex),
          title: item.title || undefined,
          notes: item.notes || undefined,
        })),
      })),
    };
  }

  private parseJson(value?: string | null) {
    if (!value?.trim()) return undefined;
    try {
      return JSON.parse(value);
    } catch {
      toast.warning('Metadata JSON is invalid and was ignored');
      return undefined;
    }
  }
}
