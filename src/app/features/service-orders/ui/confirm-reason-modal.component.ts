import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-reason-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
        <div class="absolute inset-0 bg-black/70"></div>
        <div class="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-4">
          <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ description }}</p>

          <textarea
            class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            rows="4"
            [(ngModel)]="reason"
            [placeholder]="placeholder"
          ></textarea>

          @if (error) {
            <p class="mt-2 text-sm text-red-600">{{ error }}</p>
          }

          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              (click)="onClose()"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              (click)="onConfirm()"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmReasonModalComponent {
  @Input() open = false;
  @Input() title = 'Confirm Action';
  @Input() description = 'This action requires a reason.';
  @Input() placeholder = 'Write a reason...';
  @Input() cancelLabel = 'Close';
  @Input() confirmLabel = 'Confirm';
  @Input() error = '';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();

  reason = '';

  onClose(): void {
    this.reason = '';
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit(this.reason.trim());
  }
}
