import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ServiceOrderChecklistItem } from '../data-access/service-orders.types';

@Component({
  selector: 'app-service-order-checklist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-gray-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-gray-900">Checklist</h3>
      <div class="mt-3 space-y-2">
        @if (!items?.length) {
          <p class="text-xs text-gray-500">No checklist items.</p>
        } @else {
          @for (item of items; track item.itemId) {
            <label class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <input
                type="checkbox"
                [checked]="item.status === 'DONE'"
                (change)="onToggle(item, $any($event.target).checked)"
              />
              <span class="text-gray-800">{{ item.label }}</span>
            </label>
          }
        }
      </div>
    </div>
  `
})
export class ServiceOrderChecklistComponent {
  @Input() items: ServiceOrderChecklistItem[] | null = [];
  @Output() toggle = new EventEmitter<{ itemId: string; done: boolean }>();

  onToggle(item: ServiceOrderChecklistItem, done: boolean): void {
    this.toggle.emit({ itemId: item.itemId, done });
  }
}
