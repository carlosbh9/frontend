import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BookingFilesApi } from '../data-access/booking-files.api';
import { BookingFile } from '../data-access/booking-files.types';

@Component({
  selector: 'app-booking-files-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-full bg-slate-50">
      <div class="mx-auto max-w space-y-6 p-4 sm:p-6">
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0">
              <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                Files Overview
              </div>
              <h1 class="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Booking Files
              </h1>
              <p class="mt-1 max-w-2xl text-sm text-slate-600">
                Review all confirmed travel files, their operational state, and access each file detail quickly.
              </p>
            </div>

            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              (click)="load()"
            >
              Refresh
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 p-5">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 class="text-sm font-semibold text-slate-900">Files List</h2>
                <p class="mt-1 text-sm text-slate-600">Track booking files by operational, reservation, and payment status.</p>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <input
                  class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  [ngModel]="query()"
                  (ngModelChange)="query.set($event)"
                  (keyup.enter)="resetAndLoad()"
                  placeholder="Search file code or ID"
                />
                <select class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600" [ngModel]="operationStatus()" (ngModelChange)="operationStatus.set($event); resetAndLoad()">
                  <option value="">All operations</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <select class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600" [ngModel]="reservationStatus()" (ngModelChange)="reservationStatus.set($event); resetAndLoad()">
                  <option value="">All reservations</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <select class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600" [ngModel]="paymentStatus()" (ngModelChange)="paymentStatus.set($event); resetAndLoad()">
                  <option value="">All payments</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="NOT_REQUIRED">Not required</option>
                </select>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                  (click)="resetAndLoad()"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto p-5">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Guest</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Contact</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Travel</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Operation</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Reservations</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Payments</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                @for (file of files(); track file._id) {
                  <tr class="hover:bg-slate-50/80">
                    <td class="px-4 py-4">
                      <div class="font-medium text-slate-900">{{ file.fileCode || '-' }}</div>
                      <div class="text-xs text-slate-500">{{ file.guest || resolveName(file.quoter_id) || '-' }}</div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="font-medium text-slate-900">{{ resolveName(file.contact_id) || '-' }}</div>
                      <div class="text-xs text-slate-500">{{ file._id }}</div>
                    </td>
                    <td class="px-4 py-4 text-slate-600">{{ file.travel_date_start || '-' }} {{ file.travel_date_end ? 'to ' + file.travel_date_end : '' }}</td>
                    <td class="px-4 py-4"><span class="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">{{ file.operation_status }}</span></td>
                    <td class="px-4 py-4"><span class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">{{ file.reservation_status }}</span></td>
                    <td class="px-4 py-4"><span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">{{ file.payment_status }}</span></td>
                    <td class="px-4 py-4">
                      <button class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50" (click)="openFile(file._id)">
                        Open File
                      </button>
                    </td>
                  </tr>
                }
                @if (!loading() && !error() && !files().length) {
                  <tr>
                    <td colspan="7" class="px-4 py-10 text-center text-sm text-slate-500">No booking files found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-xs text-slate-500">
              Showing {{ pageStart() }} to {{ pageEnd() }} of {{ total() }} files
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" [disabled]="page() <= 1" (click)="changePage(page() - 1)">Prev</button>
              <div class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">Page {{ page() }} / {{ totalPages() }}</div>
              <button type="button" class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" [disabled]="page() >= totalPages()" (click)="changePage(page() + 1)">Next</button>
            </div>
          </div>

          @if (loading()) {
            <div class="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">Loading booking files...</div>
          }
          @if (error()) {
            <div class="border-t border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{{ error() }}</div>
          }
        </section>
      </div>
    </div>
  `
})
export class BookingFilesListPageComponent implements OnInit {
  private readonly api = inject(BookingFilesApi);
  private readonly router = inject(Router);

  readonly files = signal<BookingFile[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly total = signal(0);
  readonly operationStatus = signal('');
  readonly reservationStatus = signal('');
  readonly paymentStatus = signal('');
  readonly query = signal('');

  readonly totalPages = signal(1);
  readonly pageStart = signal(0);
  readonly pageEnd = signal(0);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await this.api.list({
        page: this.page(),
        pageSize: this.pageSize(),
        q: this.query().trim(),
        operation_status: this.operationStatus(),
        reservation_status: this.reservationStatus(),
        payment_status: this.paymentStatus()
      });
      this.files.set(response.items || []);
      this.total.set(response.total || 0);
      this.totalPages.set(Math.max(1, Math.ceil((response.total || 0) / this.pageSize())));
      this.pageStart.set(response.total ? (this.page() - 1) * this.pageSize() + 1 : 0);
      this.pageEnd.set(Math.min(this.page() * this.pageSize(), response.total || 0));
    } catch (error: any) {
      this.files.set([]);
      this.total.set(0);
      this.totalPages.set(1);
      this.pageStart.set(0);
      this.pageEnd.set(0);
      this.error.set(error?.error?.message || 'Could not load booking files');
    } finally {
      this.loading.set(false);
    }
  }

  resetAndLoad(): void {
    this.page.set(1);
    void this.load();
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) return;
    this.page.set(nextPage);
    void this.load();
  }

  openFile(id: string): void {
    void this.router.navigate(['/dashboard/quoter-main/booking-files', id]);
  }

  resolveName(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.name || value.guest || '';
  }
}
