import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { BookingFilesApi } from '../../features/booking-files/data-access/booking-files.api';
import { BibliaDailyItem } from '../../features/booking-files/data-access/booking-files.types';
import { ServiceOrdersApi } from '../../features/service-orders/data-access/service-orders.api';

type WeekDayItem = {
  iso: string;
  dayName: string;
  dayNumber: string;
  monthLabel: string;
  isToday: boolean;
  isSelected: boolean;
};

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

  readonly weekDays = computed<WeekDayItem[]>(() => {
    const selected = this.parseDate(this.dateFilter() || this.todayString());
    return Array.from({ length: 7 }).map((_, index) => {
      const date = this.addDays(selected, index - 3);
      const iso = this.toIsoDate(date);
      return {
        iso,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.toLocaleDateString('en-US', { day: '2-digit' }),
        monthLabel: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: iso === this.todayString(),
        isSelected: iso === (this.dateFilter() || this.todayString())
      };
    });
  });

  readonly rowsByFile = computed(() => {
    const groups = new Map<string, BibliaDailyItem[]>();
    for (const row of this.rows()) {
      const key = row.file_id || 'NO_FILE';
      const current = groups.get(key) || [];
      current.push(row);
      groups.set(key, current);
    }

    return Array.from(groups.entries())
      .map(([key, items]) => {
        const ordered = [...items].sort((left, right) =>
          this.compareTime(left.time, right.time)
          || (left.day || 0) - (right.day || 0)
          || String(left.title || '').localeCompare(String(right.title || ''))
        );
        const file = ordered[0];
        return {
          key,
          fileCode: file?.fileCode || '',
          guest: file?.guest || '',
          overall_status: file?.overall_status || 'PENDING',
          risk_level: file?.risk_level || 'LOW',
          next_action: file?.next_action || '',
          file_id: file?.file_id || '',
          contact_id: file?.contact_id || '',
          items: ordered
        };
      })
      .sort((left, right) => {
        const leftTime = left.items[0]?.time || '';
        const rightTime = right.items[0]?.time || '';
        return this.compareTime(leftTime, rightTime)
          || String(left.fileCode || '').localeCompare(String(right.fileCode || ''));
      });
  });

  readonly scheduleRows = computed(() => {
    return [...this.rows()].sort((left, right) =>
      this.compareTime(left.time, right.time)
      || String(left.fileCode || '').localeCompare(String(right.fileCode || ''))
      || String(left.title || '').localeCompare(String(right.title || ''))
    );
  });

  readonly kpis = computed(() => {
    const rows = this.rows();
    const uniqueFiles = new Set(rows.map((row) => row.file_id).filter(Boolean));
    return {
      totalItems: rows.length,
      totalFiles: uniqueFiles.size,
      withTime: rows.filter((row) => !!row.time).length,
      ready: rows.filter((row) => row.detail_status === 'READY').length,
      pendingTime: rows.filter((row) => !row.time).length
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

  async selectDay(iso: string): Promise<void> {
    this.dateFilter.set(iso);
    await this.load();
  }

  async moveSelectedDay(offset: number): Promise<void> {
    const next = this.toIsoDate(this.addDays(this.parseDate(this.dateFilter() || this.todayString()), offset));
    await this.selectDay(next);
  }

  async jumpToToday(): Promise<void> {
    await this.selectDay(this.todayString());
  }

  openBookingFile(row: BibliaDailyItem | { file_id: string }): void {
    if (!row.file_id) return;
    void this.router.navigate(['/dashboard/quoter-main/booking-files', row.file_id], {
      queryParams: { tab: 'detailed' }
    });
  }

  openContactOrders(row: BibliaDailyItem | { contact_id?: string }): void {
    if (!row.contact_id) return;
    void this.router.navigate(['/dashboard/quoter-main/service-orders/contact', row.contact_id]);
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

  formatTimeRange(row: BibliaDailyItem): string {
    if (row.time && row.end_time) {
      return `${row.time} - ${row.end_time}`;
    }
    if (row.time) {
      return row.time;
    }
    return 'Pending';
  }

  fileTone(value: string): string {
    const palette = ['slate', 'blue', 'emerald', 'amber', 'rose', 'violet', 'cyan', 'orange'];
    const input = String(value || '');
    let hash = 0;
    for (let index = 0; index < input.length; index += 1) {
      hash = ((hash << 5) - hash) + input.charCodeAt(index);
      hash |= 0;
    }
    return palette[Math.abs(hash) % palette.length];
  }

  private compareTime(a = '', b = ''): number {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return String(a).localeCompare(String(b));
  }

  private parseDate(value: string): Date {
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date(`${this.todayString()}T00:00:00`) : parsed;
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private todayString(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
