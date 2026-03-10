import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ServiceOrderAuditLog } from '../data-access/service-orders.types';

@Component({
  selector: 'app-service-order-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-gray-900">Audit Timeline</h3>
      <div class="mt-3 space-y-2">
        @if (!logs?.length) {
          <p class="text-xs text-gray-500">No audit events yet.</p>
        } @else {
          @for (log of logs; track $index) {
            <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p class="text-xs font-semibold text-gray-900">{{ log.action }}</p>
              <p class="text-[11px] text-gray-600">{{ log.at | date:'dd/MM/yyyy HH:mm' }}</p>
              @if (log.message) { <p class="text-xs text-gray-700 mt-1">{{ log.message }}</p> }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ServiceOrderTimelineComponent {
  @Input() logs: ServiceOrderAuditLog[] | null = [];
}
