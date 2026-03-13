import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ServiceOrdersApi } from '../../features/service-orders/data-access/service-orders.api';
import { ServiceOrder } from '../../features/service-orders/data-access/service-orders.types';

type AssignmentRow = {
  order: ServiceOrder;
  executionDate: string;
  executionLabel: string;
  serviceName: string;
  guest: string;
  city: string;
  assignmentHint: string;
  notes: string;
};

@Component({
  selector: 'app-guide-transport-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guide-transport-assignment.component.html'

})
export class GuideTransportAssignmentComponent implements OnInit {
  private readonly api = inject(ServiceOrdersApi);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly dateFilter = signal(this.todayString());
  readonly statusFilter = signal('');
  readonly typeFilter = signal('');
  readonly orders = signal<ServiceOrder[]>([]);

  readonly rows = computed(() =>
    this.orders()
      .filter((order) => order.area === 'OPERACIONES')
      .map((order) => this.toRow(order))
  );

  readonly filteredRows = computed(() => {
    const date = this.dateFilter();
    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.rows().filter((row) => {
      const matchesDate = !date || row.executionDate === date;
      const matchesStatus = !status || row.order.status === status;
      const matchesType = !type || row.order.type === type;
      return matchesDate && matchesStatus && matchesType;
    });
  });

  readonly groupedRows = computed(() => {
    const groups = new Map<string, AssignmentRow[]>();

    for (const row of this.filteredRows()) {
      const key = row.executionDate || 'NO_DATE';
      const bucket = groups.get(key) || [];
      bucket.push(row);
      groups.set(key, bucket);
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
      waiting: rows.filter((row) => row.order.status === 'WAITING_INFO').length
    };
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await this.api.list({ page: 1, pageSize: 500, area: 'OPERACIONES' });
      this.orders.set(response.items || []);
    } catch (error: any) {
      this.orders.set([]);
      this.error.set(error?.error?.message || 'Could not load assignment queue');
    } finally {
      this.loading.set(false);
    }
  }

  clearFilters(): void {
    this.dateFilter.set('');
    this.statusFilter.set('');
    this.typeFilter.set('');
  }

  openBookingFile(row: AssignmentRow): void {
    if (!row.order.soldQuoterId) return;
    void this.router.navigate(['/dashboard/quoter-main/booking-files/by-quoter', row.order.soldQuoterId]);
  }

  openContactOrders(row: AssignmentRow): void {
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
      toast.success('Assignment status updated');
    } catch (error: any) {
      toast.error(error?.error?.error || error?.error?.message || 'Could not update assignment status');
    }
  }

  private toRow(order: ServiceOrder): AssignmentRow {
    const snapshot = order.sourceSnapshot || {};
    const executionDate = this.normalizeDate(
      snapshot.date
      || snapshot.travelDate?.start
      || order.dueDate
      || ''
    );

    return {
      order,
      executionDate,
      executionLabel: executionDate ? this.formatDateLabel(executionDate) : '-',
      serviceName: snapshot.name || snapshot.route || `${order.type} service`,
      guest: snapshot.guest || '-',
      city: snapshot.city || snapshot.country || '-',
      assignmentHint: this.getAssignmentHint(order, snapshot),
      notes: snapshot.notes || ''
    };
  }

  private getAssignmentHint(order: ServiceOrder, snapshot: any): string {
    if (order.type === 'TRANSPORT') {
      return snapshot.route || 'Assign vehicle and driver';
    }
    if (order.type === 'TOUR') {
      return snapshot.category === 'operator' ? 'Coordinate operator dispatch' : 'Assign guide / operation lead';
    }
    if (order.type === 'TICKETS') {
      return 'Coordinate ticket execution';
    }
    return 'Assign operational owner';
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
