import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceOrdersApi } from '../data-access/service-orders.api';
import { ServiceOrder } from '../data-access/service-orders.types';

@Component({
  selector: 'app-service-orders-by-contact-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 p-4">
      <h1 class="text-lg font-semibold text-gray-900">Post-sales by Contact</h1>
      <p class="text-sm text-gray-500">Contact ID: {{ contactId() || '-' }}</p>

      @if (loading()) {
        <p class="text-sm text-gray-500">Loading...</p>
      } @else if (error()) {
        <p class="text-sm text-red-600">{{ error() }}</p>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left">Type</th>
                <th class="px-3 py-2 text-left">Area</th>
                <th class="px-3 py-2 text-left">Status</th>
                <th class="px-3 py-2 text-left">Due</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (order of orders(); track order._id) {
                <tr>
                  <td class="px-3 py-2">{{ order.type }}</td>
                  <td class="px-3 py-2">{{ order.area }}</td>
                  <td class="px-3 py-2">{{ order.status }}</td>
                  <td class="px-3 py-2">{{ order.dueDate ? (order.dueDate | date:'dd/MM/yyyy') : '-' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
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
