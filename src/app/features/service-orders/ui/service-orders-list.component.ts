import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceOrder } from '../data-access/service-orders.types';

@Component({
  selector: 'app-service-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- FILTER BAR -->
      <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="grid grid-cols-1 gap-3 xl:grid-cols-4">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Area
            </label>
            <select
              class="block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900
                     ring-1 ring-inset ring-slate-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-600"
              [ngModel]="area"
              (ngModelChange)="areaChange.emit($event)"
            >
              <option value="">All areas</option>
              <option value="RESERVAS">Reservas</option>
              <option value="OPERACIONES">Operaciones</option>
              <option value="CONTABILIDAD">Contabilidad</option>
              <option value="PAGOS">Pagos</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              class="block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900
                     ring-1 ring-inset ring-slate-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-600"
              [ngModel]="status"
              (ngModelChange)="statusChange.emit($event)"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="WAITING_INFO">Waiting info</option>
              <option value="DONE">Done</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Type
            </label>
            <select
              class="block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900
                     ring-1 ring-inset ring-slate-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-600"
              [ngModel]="type"
              (ngModelChange)="typeChange.emit($event)"
            >
              <option value="">All types</option>
              <option value="HOTEL">Hotel</option>
              <option value="TRANSPORT">Transport</option>
              <option value="TOUR">Tour</option>
              <option value="TICKETS">Tickets</option>
              <option value="PREPAYMENT">Prepayment</option>
              <option value="INVOICE">Invoice</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
                     text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-white"
              type="button"
              (click)="reload.emit()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reload
            </button>
          </div>
        </div>
      </div>

      <!-- TABLE CARD -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">Orders List</h3>
            <p class="text-xs text-slate-500">Operational queue by service, status, and due date.</p>
          </div>

          <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {{ orders?.length || 0 }} results
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Service</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Area</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Priority</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Amount</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Due</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              @if (!orders?.length) {
                <tr>
                  <td colspan="8" class="px-4 py-10 text-center">
                    <div class="mx-auto max-w-sm">
                      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 12 3l9 4.5M4.5 9.75V16.5L12 21l7.5-4.5V9.75M12 12l9-4.5M12 12 3 7.5" />
                        </svg>
                      </div>
                      <p class="mt-3 text-sm font-semibold text-slate-900">No orders found</p>
                      <p class="mt-1 text-sm text-slate-500">
                        Try changing filters or reloading the list.
                      </p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (order of orders; track order._id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                        [ngClass]="typeClass(order.type)"
                      >
                        {{ order.type }}
                      </span>
                    </td>

                    <td class="px-4 py-3">
                      <div class="min-w-[200px]">
                        <p class="font-medium text-slate-900">
                          {{ getServiceLabel(order) }}
                        </p>
                        <p class="mt-0.5 text-xs text-slate-500">
                          {{ order._id }}
                        </p>
                      </div>
                    </td>

                    <td class="px-4 py-3">
                      <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {{ order.area }}
                      </span>
                    </td>

                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                        [ngClass]="statusClass(order.status)"
                      >
                        {{ prettify(order.status) }}
                      </span>
                    </td>

                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                        [ngClass]="priorityClass(order.priority)"
                      >
                        {{ prettify(order.priority) }}
                      </span>
                    </td>

                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-900">
                        {{ getAmount(order) | number:'1.2-2' }}
                      </p>
                    </td>

                    <td class="px-4 py-3">
                      <div class="text-sm">
                        <p class="font-medium text-slate-900">
                          {{ order.dueDate ? (order.dueDate | date:'dd/MM/yyyy') : '-' }}
                        </p>
                        @if (isOverdue(order.dueDate, order.status)) {
                          <p class="mt-0.5 text-xs font-medium text-rose-600">Overdue</p>
                        }
                      </div>
                    </td>

                    <td class="px-4 py-3 text-right">
                      <button
                        class="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold
                               text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                        (click)="openDetail.emit(order._id)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                        Detail
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ServiceOrdersListComponent {
  @Input() orders: ServiceOrder[] | null = [];
  @Input() area = '';
  @Input() status = '';
  @Input() type = '';

  @Output() areaChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() typeChange = new EventEmitter<string>();
  @Output() reload = new EventEmitter<void>();
  @Output() openDetail = new EventEmitter<string>();

  getServiceLabel(order: ServiceOrder): string {
    return order?.sourceSnapshot?.name
      || order?.sourceSnapshot?.route
      || order?.sourceSnapshot?.category
      || '-';
  }

  getAmount(order: ServiceOrder): number {
    const amount = Number(order?.sourceSnapshot?.estimatedTotal ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  }

  prettify(value: string | null | undefined): string {
    if (!value) return '-';
    return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
  }

  isOverdue(dueDate?: string | Date | null, status?: string | null): boolean {
    if (!dueDate) return false;
    if (status === 'DONE' || status === 'CANCELLED') return false;
    return new Date(dueDate).getTime() < Date.now();
  }

  statusClass(status: string | null | undefined): string {
    switch (status) {
      case 'PENDING':
        return 'bg-slate-100 text-slate-700 ring-slate-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 ring-blue-200';
      case 'WAITING_INFO':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'DONE':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 ring-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  }

  priorityClass(priority: string | null | undefined): string {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 ring-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  }

  typeClass(type: string | null | undefined): string {
    switch (type) {
      case 'HOTEL':
        return 'bg-violet-50 text-violet-700 ring-violet-200';
      case 'TRANSPORT':
        return 'bg-sky-50 text-sky-700 ring-sky-200';
      case 'TOUR':
        return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
      case 'TICKETS':
        return 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200';
      case 'PREPAYMENT':
        return 'bg-orange-50 text-orange-700 ring-orange-200';
      case 'INVOICE':
        return 'bg-teal-50 text-teal-700 ring-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  }
}
