import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toast } from 'ngx-sonner';
import { BookingFilesApi } from '../data-access/booking-files.api';
import { BookingFile, OperationalItinerary, OperationalItineraryItem, OperationalItineraryItemDetail } from '../data-access/booking-files.types';

@Component({
  selector: 'app-booking-file-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-file-page.component.html'
})
export class BookingFilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(BookingFilesApi);

  readonly bookingFile = signal<BookingFile | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly activeTab = signal<'overview' | 'summary' | 'orders' | 'detailed'>('overview');
  readonly savingDetail = signal(false);
  readonly rebuildingItinerary = signal(false);
  readonly editingItemId = signal('');
  readonly editingDayLabel = signal('');
  readonly editingItemTitle = signal('');
  readonly editingItemCity = signal('');
  readonly detailDraft = signal<OperationalItineraryItemDetail>({
    status: 'PENDING',
    start_time: '',
    end_time: '',
    pickup_time: '',
    meeting_point: '',
    responsible_name: '',
    supplier_name: '',
    supplier_contact: '',
    applies_to_mode: 'ALL_PAX',
    applies_to_refs: [],
    notes: ''
  });

  readonly contact = computed(() => this.bookingFile()?.contact_id as any);
  readonly quoter = computed(() => this.bookingFile()?.quoter_id as any);
  readonly orders = computed(() => this.bookingFile()?.service_order_ids || []);
  readonly itinerary = computed(() => this.bookingFile()?.itinerary_snapshot || {});
  readonly operationalItinerary = computed<OperationalItinerary>(() => this.bookingFile()?.operational_itinerary || {
    generated_from_snapshot_at: null,
    updated_at: null,
    updated_by: null,
    completion_percentage: 0,
    days: []
  });
  readonly operationalDays = computed(() => this.operationalItinerary().days || []);
  readonly operationalStats = computed(() => {
    const days = this.operationalDays();
    const items = days.flatMap((day) => day.items || []);
    return {
      completion: this.operationalItinerary().completion_percentage || 0,
      total: items.length,
      ready: items.filter((item) => item.detail?.status === 'READY').length,
      inProgress: items.filter((item) => item.detail?.status === 'IN_PROGRESS').length,
      pending: items.filter((item) => item.detail?.status === 'PENDING').length
    };
  });
  readonly summaryCards = computed(() => {
    const file = this.bookingFile();
    if (!file) return [];
    return [
      { label: 'Overall', value: file.overall_status, tone: 'slate' },
      { label: 'Operations', value: file.operations_status, tone: 'amber' },
      { label: 'Reservations', value: file.reservations_status, tone: 'blue' },
      { label: 'Payments', value: file.payments_status, tone: 'emerald' },
      { label: 'Deliverables', value: file.deliverables_status, tone: 'violet' },
      { label: 'Passenger Info', value: file.passenger_info_status?.status || 'NOT_SENT', tone: 'indigo' }
    ];
  });
  readonly attentionCards = computed(() => {
    const orders = this.orders();
    const now = new Date();
    const overdue = orders.filter((order) => order.status !== 'DONE' && order.status !== 'CANCELLED' && order.dueDate && new Date(order.dueDate) < now);
    const blocked = orders.filter((order) => order.status === 'WAITING_INFO');
    const dueToday = orders.filter((order) => {
      if (!order.dueDate || order.status === 'DONE' || order.status === 'CANCELLED') return false;
      const due = new Date(order.dueDate).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      return due === today;
    });

    return [
      { label: 'Blocked Orders', value: blocked.length, tone: 'rose', helper: blocked.length ? 'These need input before moving forward.' : 'No blocked orders right now.' },
      { label: 'Overdue Orders', value: overdue.length, tone: 'amber', helper: overdue.length ? 'These are past due and should be reviewed first.' : 'No overdue orders.' },
      { label: 'Due Today', value: dueToday.length, tone: 'blue', helper: dueToday.length ? 'These orders need attention today.' : 'Nothing due today.' }
    ];
  });
  readonly ordersByArea = computed(() => {
    const source = this.orders();
    const groups = [
      { key: 'RESERVAS', label: 'Reservations' },
      { key: 'OPERACIONES', label: 'Operations' },
      { key: 'CONTABILIDAD', label: 'Accounting' },
      { key: 'PAGOS', label: 'Payments' }
    ];

    return groups.map((group) => {
      const items = source.filter((order) => order.area === group.key);
      const total = items.length;
      const pending = items.filter((order) => order.status === 'PENDING').length;
      const inProgress = items.filter((order) => order.status === 'IN_PROGRESS').length;
      const blocked = items.filter((order) => order.status === 'WAITING_INFO').length;
      const done = items.filter((order) => order.status === 'DONE').length;
      const safeTotal = total || 1;
      return {
        ...group,
        total,
        pending,
        inProgress,
        blocked,
        done,
        pendingPct: Math.round((pending / safeTotal) * 100),
        inProgressPct: Math.round((inProgress / safeTotal) * 100),
        blockedPct: Math.round((blocked / safeTotal) * 100),
        donePct: Math.round((done / safeTotal) * 100)
      };
    });
  });
  readonly tabItems = computed(() => {
    const orderCount = this.orders().length;
    const operational = this.operationalStats();
    return [
      { id: 'overview' as const, label: 'Overview', meta: this.itineraryLines().length ? `${this.itineraryLines().length} itinerary lines` : 'Trip baseline' },
      { id: 'summary' as const, label: 'Summary', meta: this.summaryCards().length ? `${this.summaryCards().length} summary signals` : 'Master statuses' },
      { id: 'orders' as const, label: 'Orders', meta: `${orderCount} related orders` },
      { id: 'detailed' as const, label: 'Detailed Itinerary', meta: operational.total ? `${operational.ready}/${operational.total} ready` : 'Operational timeline' }
    ];
  });

  readonly kpis = computed(() => {
    const orders = this.orders();
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === 'PENDING').length,
      inProgress: orders.filter((order) => order.status === 'IN_PROGRESS').length,
      done: orders.filter((order) => order.status === 'DONE').length
    };
  });

  readonly itineraryCards = computed(() => {
    const itinerary = this.itinerary();
    return [
      {
        label: 'Services',
        count: Array.isArray(itinerary.services)
          ? itinerary.services.reduce((sum: number, group: any) => sum + (Array.isArray(group?.services) ? group.services.length : 0), 0)
          : 0
      },
      { label: 'Hotels', count: Array.isArray(itinerary.hotels) ? itinerary.hotels.length : 0 },
      { label: 'Flights', count: Array.isArray(itinerary.flights) ? itinerary.flights.length : 0 },
      { label: 'Operators', count: Array.isArray(itinerary.operators) ? itinerary.operators.length : 0 },
      { label: 'Cruises', count: Array.isArray(itinerary.cruises) ? itinerary.cruises.length : 0 }
    ];
  });

  readonly itineraryLines = computed(() => {
    const itinerary = this.itinerary();
    const lines: Array<{ section: string; title: string; subtitle: string }> = [];

    (itinerary.services || []).forEach((group: any) => {
      (group?.services || []).forEach((service: any) => {
        lines.push({
          section: 'Service',
          title: service?.name_service || 'Unnamed service',
          subtitle: [group?.date, service?.city].filter(Boolean).join(' | ')
        });
      });
    });

    (itinerary.hotels || []).forEach((hotel: any) => {
      lines.push({
        section: 'Hotel',
        title: hotel?.name_hotel || 'Unnamed hotel',
        subtitle: [hotel?.date, hotel?.city, hotel?.accomodatios_category].filter(Boolean).join(' | ')
      });
    });

    (itinerary.flights || []).forEach((flight: any) => {
      lines.push({
        section: 'Flight',
        title: flight?.route || 'Unnamed flight',
        subtitle: [flight?.date, flight?.notes].filter(Boolean).join(' | ')
      });
    });

    (itinerary.operators || []).forEach((operator: any) => {
      lines.push({
        section: 'Operator',
        title: operator?.name_operator || 'Unnamed operator',
        subtitle: [operator?.city, operator?.country].filter(Boolean).join(' | ')
      });
    });

    (itinerary.cruises || []).forEach((cruise: any) => {
      lines.push({
        section: 'Cruise',
        title: cruise?.name || 'Unnamed cruise',
        subtitle: [cruise?.operator].filter(Boolean).join(' | ')
      });
    });

    return lines;
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const quoterId = this.route.snapshot.paramMap.get('quoterId') || '';

    if (!id && !quoterId) {
      this.error.set('Booking file identifier is missing');
      this.bookingFile.set(null);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const bookingFile = id
        ? await this.api.getById(id)
        : await this.api.getByQuoter(quoterId);
      this.bookingFile.set(bookingFile);
    } catch (error: any) {
      this.bookingFile.set(null);
      this.error.set(error?.error?.message || 'Could not load booking file');
    } finally {
      this.loading.set(false);
    }
  }

  async recalculateSummary(): Promise<void> {
    const fileId = this.bookingFile()?._id;
    if (!fileId) return;

    try {
      const updated = await this.api.recalculateSummary(fileId);
      this.bookingFile.set(updated);
      toast.success('File summary recalculated');
    } catch (error: any) {
      toast.error(error?.error?.error || error?.error?.message || 'Could not recalculate file summary');
    }
  }

  setTab(tab: 'overview' | 'summary' | 'orders' | 'detailed'): void {
    this.activeTab.set(tab);
  }

  beginEditItem(dayLabel: string, item: OperationalItineraryItem): void {
    this.editingDayLabel.set(dayLabel);
    this.editingItemId.set(item.item_id);
    this.detailDraft.set({
      status: item.detail?.status || 'PENDING',
      start_time: item.detail?.start_time || '',
      end_time: item.detail?.end_time || '',
      pickup_time: item.detail?.pickup_time || '',
      meeting_point: item.detail?.meeting_point || '',
      responsible_name: item.detail?.responsible_name || '',
      supplier_name: item.detail?.supplier_name || '',
      supplier_contact: item.detail?.supplier_contact || '',
      applies_to_mode: item.detail?.applies_to_mode || 'ALL_PAX',
      applies_to_refs: item.detail?.applies_to_refs || [],
      notes: item.detail?.notes || ''
    });
    this.editingItemTitle.set(item.title || '');
    this.editingItemCity.set(item.city || '');
  }

  cancelEditItem(): void {
    this.editingDayLabel.set('');
    this.editingItemId.set('');
    this.editingItemTitle.set('');
    this.editingItemCity.set('');
  }

  async saveDetailItem(): Promise<void> {
    const fileId = this.bookingFile()?._id;
    const itemId = this.editingItemId();
    if (!fileId || !itemId) return;

    this.savingDetail.set(true);
    try {
      const nextItinerary = await this.api.updateOperationalItineraryItem(fileId, itemId, {
        city: this.editingItemCity(),
        detail: this.detailDraft()
      });
      this.bookingFile.update((current) => current ? { ...current, operational_itinerary: nextItinerary } : current);
      this.cancelEditItem();
      toast.success('Detailed itinerary item updated');
    } catch (error: any) {
      toast.error(error?.error?.error || error?.error?.message || 'Could not update itinerary details');
    } finally {
      this.savingDetail.set(false);
    }
  }

  updateDraft<K extends keyof OperationalItineraryItemDetail>(key: K, value: OperationalItineraryItemDetail[K]): void {
    this.detailDraft.update((current) => ({
      ...current,
      [key]: value
    }));
  }

  updateEditingCity(value: string): void {
    this.editingItemCity.set(value);
  }

  async rebuildOperationalItinerary(): Promise<void> {
    const fileId = this.bookingFile()?._id;
    if (!fileId) return;

    this.rebuildingItinerary.set(true);
    try {
      const nextItinerary = await this.api.rebuildOperationalItinerary(fileId);
      this.bookingFile.update((current) => current ? { ...current, operational_itinerary: nextItinerary } : current);
      this.cancelEditItem();
      toast.success('Operational itinerary rebuilt from the sold snapshot');
    } catch (error: any) {
      toast.error(error?.error?.error || error?.error?.message || 'Could not rebuild operational itinerary');
    } finally {
      this.rebuildingItinerary.set(false);
    }
  }

  isEditingItem(itemId: string): boolean {
    return this.editingItemId() === itemId;
  }

  openServiceOrders(): void {
    const contactId = this.contact()?._id;
    if (!contactId) return;
    void this.router.navigate(['/dashboard/quoter-main/service-orders/contact', contactId]);
  }

  openBibliaForTravelDate(): void {
    const targetDate = this.bookingFile()?.travel_date_start;
    if (!targetDate) return;
    void this.router.navigate(['/dashboard/operations/biblia'], { queryParams: { date: targetDate } });
  }

  openQuote(): void {
    const quoterId = this.resolveId(this.quoter());
    if (!quoterId) return;
    void this.router.navigate(['/dashboard/quoter-main/quoter-v2-edit', quoterId]);
  }

  private resolveId(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || '';
  }
}
