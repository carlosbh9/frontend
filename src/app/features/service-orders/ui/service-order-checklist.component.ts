import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ServiceOrderChecklistItem } from '../data-access/service-orders.types';

@Component({
  selector: 'app-service-order-checklist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
            Required
          </span>
          <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
            Optional
          </span>
        </div>
        <p class="mt-2 text-xs text-slate-600">
          Required items should be completed before the stage can move forward.
        </p>
      </div>

      <div class="space-y-2">
        @if (!items?.length) {
          <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No checklist items in this stage yet.
          </div>
        } @else {
          @for (item of items; track item.itemId) {
            <label
              class="flex gap-3 rounded-xl border px-4 py-3 transition-colors"
              [ngClass]="{
                'border-emerald-200 bg-emerald-50': item.status === 'DONE',
                'border-rose-200 bg-rose-50/70': item.status !== 'DONE' && item.required,
                'border-slate-200 bg-white': item.status !== 'DONE' && !item.required
              }"
            >
              <input
                class="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                type="checkbox"
                [checked]="item.status === 'DONE'"
                (change)="onToggle(item, $any($event.target).checked)"
              />

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-medium text-slate-900">{{ item.label }}</span>

                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset"
                    [ngClass]="item.required
                      ? 'bg-rose-100 text-rose-700 ring-rose-200'
                      : 'bg-slate-100 text-slate-700 ring-slate-200'"
                  >
                    {{ item.required ? 'Required' : 'Optional' }}
                  </span>

                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset"
                    [ngClass]="item.status === 'DONE'
                      ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                      : 'bg-amber-100 text-amber-700 ring-amber-200'"
                  >
                    {{ item.status === 'DONE' ? 'Completed' : 'Pending' }}
                  </span>
                </div>

                @if (item.helpText) {
                  <p class="mt-1 text-xs text-slate-600">{{ item.helpText }}</p>
                }
              </div>
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
