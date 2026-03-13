import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ServiceOrdersApi } from '../../features/service-orders/data-access/service-orders.api';
import { ServiceOrder } from '../../features/service-orders/data-access/service-orders.types';

type BibliaRow = {
  order: ServiceOrder;
  executionDate: string;
  executionLabel: string;
  title: string;
  detail: string;
  guest: string;
  city: string;
};

@Component({
  selector: 'app-biblia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './biblia.component.html',
  styleUrl: './biblia.component.css'
})
export class BibliaComponent implements OnInit {
  private readonly api = inject(ServiceOrdersApi);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly dateFilter = signal(this.todayString());
  readonly areaFilter = signal('');
  readonly statusFilter = signal('');
  readonly orders = signal<ServiceOrder[]>([]);

  readonly rows = computed(() => this.orders().map((order) => this.toBibliaRow(order)));

  readonly filteredRows = computed(() => {
    const date = this.dateFilter();
    const area = this.areaFilter();
    const status = this.statusFilter();

    return this.rows().filter((row) => {
      const matchesDate = !date || row.executionDate === date;
      const matchesArea = !area || row.order.area === area;
      const matchesStatus = !status || row.order.status === status;
      return matchesDate && matchesArea && matchesStatus;
    });
  });

  readonly groupedRows = computed(() => {
    const groups = new Map<string, BibliaRow[]>();

    for (const row of this.filteredRows()) {
      const key = row.executionDate || 'NO_DATE';
      const current = groups.get(key) || [];
      current.push(row);
      groups.set(key, current);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => {
        if (a === 'NO_DATE') return 1;
        if (b === 'NO_DATE') return -1;
        return a.localeCompare(b);
      })
      .map(([key, rows]) => ({
        key,
        label: key === 'NO_DATE' ? 'Without execution date' : this.formatDateLabel(key),
        rows
      }));
  });

  readonly kpis = computed(() => {
    const rows = this.filteredRows();
    return {
      total: rows.length,
      pending: rows.filter((row) => row.order.status === 'PENDING').length,
      inProgress: rows.filter((row) => row.order.status === 'IN_PROGRESS').length,
      done: rows.filter((row) => row.order.status === 'DONE').length
    };
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await this.api.list({ page: 1, pageSize: 500 });
      this.orders.set(response.items || []);
    } catch (error: any) {
      this.orders.set([]);
      this.error.set(error?.error?.message || 'Could not load Biblia data');
    } finally {
      this.loading.set(false);
    }
  }

  clearDateFilter(): void {
    this.dateFilter.set('');
  }

  openBookingFile(row: BibliaRow): void {
    if (!row.order.soldQuoterId) return;
    void this.router.navigate(['/dashboard/quoter-main/booking-files/by-quoter', row.order.soldQuoterId]);
  }

  openContactOrders(row: BibliaRow): void {
    if (!row.order.contactId) return;
    void this.router.navigate(['/dashboard/quoter-main/service-orders/contact', row.order.contactId]);
  }

  getPaymentStatus(order: ServiceOrder): string {
    return order.financials?.paymentStatus || 'NOT_REQUIRED';
  }

  getAttachmentCount(order: ServiceOrder): number {
    return order.attachments?.length || 0;
  }

  hasAttachmentType(order: ServiceOrder, type: string): boolean {
    return !!order.attachments?.some((attachment) => attachment.type === type);
  }

  prettify(value: string): string {
    return String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  async updateOrderStatus(order: ServiceOrder, nextStatus: ServiceOrder['status']): Promise<void> {
    if (!nextStatus || nextStatus === order.status) return;

    let reason = '';
    if (nextStatus === 'CANCELLED') {
      reason = window.prompt('Cancellation reason')?.trim() || '';
      if (!reason) {
        toast.error('Cancellation reason is required');
        return;
      }
    }

    try {
      const updated = await this.api.updateStatus(order._id, nextStatus, reason);
      this.orders.set(this.orders().map((item) => item._id === updated._id ? updated : item));
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error?.error?.error || error?.error?.message || 'Could not update order status');
    }
  }

  private toBibliaRow(order: ServiceOrder): BibliaRow {
    const snapshot = order.sourceSnapshot || {};
    const executionDate = this.normalizeDate(
      snapshot.date
      || snapshot.travelDate?.start
      || order.dueDate
      || ''
    );

    const title = snapshot.name || snapshot.route || `${order.type} service`;
    const detail = [
      snapshot.category,
      snapshot.notes,
      snapshot.operator
    ].filter(Boolean).join(' | ');

    return {
      order,
      executionDate,
      executionLabel: executionDate ? this.formatDateLabel(executionDate) : 'Without execution date',
      title,
      detail,
      guest: snapshot.guest || '-',
      city: snapshot.city || snapshot.country || '-'
    };
  }

  private normalizeDate(value: string): string {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  }

  private formatDateLabel(value: string): string {
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private todayString(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
