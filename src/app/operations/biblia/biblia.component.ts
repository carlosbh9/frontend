import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { BookingFilesApi } from '../../features/booking-files/data-access/booking-files.api';
import { BibliaDailyItem } from '../../features/booking-files/data-access/booking-files.types';
import { ServiceOrdersApi } from '../../features/service-orders/data-access/service-orders.api';

@Component({
  selector: 'app-biblia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './biblia.component.html',
  styleUrl: './biblia.component.css'
})
export class BibliaComponent implements OnInit {
  private readonly filesApi = inject(BookingFilesApi);
  private readonly serviceOrdersApi = inject(ServiceOrdersApi);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly dateFilter = signal(this.todayString());
  readonly areaFilter = signal('');
  readonly statusFilter = signal('');
  readonly rows = signal<BibliaDailyItem[]>([]);

  readonly filteredRows = computed(() => this.rows());

  readonly groupedRows = computed(() => {
    const groups = new Map<string, BibliaDailyItem[]>();

    for (const row of this.filteredRows()) {
      const key = row.execution_date || 'NO_DATE';
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
      pending: rows.filter((row) => row.execution_status === 'PENDING').length,
      inProgress: rows.filter((row) => row.execution_status === 'IN_PROGRESS').length,
      done: rows.filter((row) => row.execution_status === 'DONE').length
    };
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await this.filesApi.getBibliaDaily({
        date: this.dateFilter() || this.todayString(),
        area: this.areaFilter(),
        status: this.statusFilter()
      });
      this.rows.set(response.items || []);
    } catch (error: any) {
      this.rows.set([]);
      this.error.set(error?.error?.message || 'Could not load Biblia data');
    } finally {
      this.loading.set(false);
    }
  }

  clearDateFilter(): void {
    this.dateFilter.set('');
    void this.load();
  }

  openBookingFile(row: BibliaDailyItem): void {
    if (!row.file_id) return;
    void this.router.navigate(['/dashboard/quoter-main/booking-files', row.file_id]);
  }

  openContactOrders(row: BibliaDailyItem): void {
    if (!row.contact_id) return;
    void this.router.navigate(['/dashboard/quoter-main/service-orders/contact', row.contact_id]);
  }

  prettify(value: string): string {
    return String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  async updateOrderStatus(row: BibliaDailyItem, nextStatus: string): Promise<void> {
    const orderId = row.service_order_ids?.[0];
    if (!orderId || !nextStatus || nextStatus === row.execution_status) return;

    let reason = '';
    if (nextStatus === 'CANCELLED') {
      reason = window.prompt('Cancellation reason')?.trim() || '';
      if (!reason) {
        toast.error('Cancellation reason is required');
        return;
      }
    }

    try {
      await this.serviceOrdersApi.updateStatus(orderId, nextStatus as any, reason);
      await this.load();
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error?.error?.error || error?.error?.message || 'Could not update order status');
    }
  }

  formatDateLabel(value: string): string {
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
