import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceOrdersApi } from '../data-access/service-orders.api';
import { ServiceOrder } from '../data-access/service-orders.types';

@Component({
  selector: 'app-service-orders-by-contact-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full bg-slate-50">
      <div class="mx-auto max-w space-y-6 p-4 sm:p-6">
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0">
              <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                Contact Workflow
              </div>
              <h1 class="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Post-sales by Contact
              </h1>
              <p class="mt-1 max-w-2xl text-sm text-slate-600">
                Review every service order generated for a single sold contact, grouped in one operational queue.
              </p>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Contact ID:
              <span class="font-semibold text-slate-900">{{ contactId() || '-' }}</span>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div class="space-y-6 xl:col-span-4">
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 p-5">
                <h2 class="text-sm font-semibold text-slate-900">Summary</h2>
                <p class="mt-1 text-sm text-slate-600">Quick snapshot of this contact's operational workload.</p>
              </div>
              <div class="grid grid-cols-2 gap-3 p-5">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Total</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">{{ kpis().total }}</p>
                </div>
                <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-amber-700">Pending</p>
                  <p class="mt-2 text-2xl font-semibold text-amber-900">{{ kpis().pending }}</p>
                </div>
                <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-blue-700">In Progress</p>
                  <p class="mt-2 text-2xl font-semibold text-blue-900">{{ kpis().inProgress }}</p>
                </div>
                <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p class="text-xs font-medium uppercase tracking-wide text-emerald-700">Done</p>
                  <p class="mt-2 text-2xl font-semibold text-emerald-900">{{ kpis().done }}</p>
                </div>
              </div>
            </div>

            @if (loading()) {
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <svg class="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4Z"></path>
                  </svg>
                  Loading contact orders...
                </div>
              </div>
            }

            @if (error()) {
              <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                <p class="text-sm font-medium text-rose-700">{{ error() }}</p>
              </div>
            }
          </div>

          <div class="xl:col-span-8">
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 p-5">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 class="text-sm font-semibold text-slate-900">Orders Queue</h2>
                    <p class="mt-1 text-sm text-slate-600">Operational orders linked to this contact's sold quote.</p>
                  </div>
                  <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {{ orders().length }} items
                  </div>
                </div>
              </div>

              <div class="overflow-x-auto p-5">
                <table class="min-w-full divide-y divide-slate-200 text-sm">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Area</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Due</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Snapshot</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 bg-white">
                    @for (order of orders(); track order._id) {
                      <tr class="hover:bg-slate-50/80">
                        <td class="px-4 py-4 font-medium text-slate-900">{{ order.type }}</td>
                        <td class="px-4 py-4 text-slate-600">{{ order.area }}</td>
                        <td class="px-4 py-4">
                          <span
                            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                            [ngClass]="{
                              'bg-amber-50 text-amber-700 ring-amber-200': order.status === 'PENDING',
                              'bg-blue-50 text-blue-700 ring-blue-200': order.status === 'IN_PROGRESS',
                              'bg-emerald-50 text-emerald-700 ring-emerald-200': order.status === 'DONE',
                              'bg-rose-50 text-rose-700 ring-rose-200': order.status === 'CANCELLED',
                              'bg-slate-100 text-slate-700 ring-slate-200': order.status === 'WAITING_INFO'
                            }"
                          >
                            {{ order.status }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-slate-600">{{ order.dueDate ? (order.dueDate | date:'dd/MM/yyyy') : '-' }}</td>
                        <td class="px-4 py-4 text-slate-600">
                          {{ order.sourceSnapshot?.name || order.sourceSnapshot?.route || order.sourceSnapshot?.category || '-' }}
                        </td>
                      </tr>
                    }
                    @if (!loading() && !error() && !orders().length) {
                      <tr>
                        <td colspan="5" class="px-4 py-10 text-center text-sm text-slate-500">
                          No service orders found for this contact.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class ServiceOrdersByContactPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ServiceOrdersApi);

  readonly contactId = signal('');
  readonly orders = signal<ServiceOrder[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly kpis = computed(() => ({
    total: this.orders().length,
    pending: this.orders().filter((order) => order.status === 'PENDING').length,
    inProgress: this.orders().filter((order) => order.status === 'IN_PROGRESS').length,
    done: this.orders().filter((order) => order.status === 'DONE').length
  }));

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('contactId') || '';
    this.contactId.set(id);
    if (!id) return;

    this.loading.set(true);
    this.error.set('');
    try {
      const orders = await this.api.getByContact(id);
      this.orders.set(orders || []);
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Could not load contact orders');
      this.orders.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
