import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceOrder } from '../data-access/service-orders.types';
import { ServiceOrderChecklistComponent } from './service-order-checklist.component';
import { ServiceOrderTimelineComponent } from './service-order-timeline.component';

@Component({
  selector: 'app-service-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ServiceOrderChecklistComponent, ServiceOrderTimelineComponent],
  template: `
    @if (!order) {
      <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-inset ring-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
        </div>
        <p class="mt-4 text-sm font-semibold text-slate-900">No order selected</p>
        <p class="mt-1 text-sm text-slate-500">
          Choose a service order from the list to review details, checklist, and activity.
        </p>
      </div>
    } @else {
      <div class="space-y-5">
        <!-- HEADER CARD -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 p-5">
            <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                    [ngClass]="typeClass(order.type)"
                  >
                    {{ order.type }}
                  </span>

                  <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {{ order.area }}
                  </span>

                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                    [ngClass]="priorityClass(order.priority)"
                  >
                    {{ prettify(order.priority) }}
                  </span>
                </div>

                <h2 class="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                  {{ getServiceLabel(order) }}
                </h2>

                <p class="mt-1 text-xs text-slate-500">
                  Order ID:
                  <span class="font-mono text-slate-700">{{ order._id }}</span>
                </p>
              </div>

              <!-- Controls -->
              <div class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[340px]">
                <div>
                  <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </label>
                  <select
                    class="block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900
                           ring-1 ring-inset ring-slate-300
                           focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    [ngModel]="order.status"
                    (ngModelChange)="statusChange.emit($event)"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="WAITING_INFO">Waiting info</option>
                    <option value="DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assignee ID
                  </label>
                  <input
                    class="block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900
                           ring-1 ring-inset ring-slate-300 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    [ngModel]="order.assigneeId || ''"
                    (ngModelChange)="assigneeChange.emit($event || null)"
                    placeholder="Assign owner"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Summary strip -->
          <div class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
              <span
                class="mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                [ngClass]="statusClass(order.status)"
              >
                {{ prettify(order.status) }}
              </span>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Priority</p>
              <span
                class="mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                [ngClass]="priorityClass(order.priority)"
              >
                {{ prettify(order.priority) }}
              </span>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Due Date</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ order.dueDate ? (order.dueDate | date:'dd/MM/yyyy') : '-' }}
              </p>
              @if (isOverdue(order.dueDate, order.status)) {
                <p class="mt-1 text-xs font-medium text-rose-600">Overdue</p>
              }
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Assignee</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ order.assigneeId || 'Unassigned' }}
              </p>
            </div>
          </div>
        </div>

        <!-- SNAPSHOT -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 p-5">
            <h3 class="text-sm font-semibold text-slate-900">Sold Service Snapshot</h3>
            <p class="mt-1 text-sm text-slate-600">
              Reference information captured from the sold service.
            </p>
          </div>

          <div class="p-5">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Category</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.category || '-' }}</p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Service</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">{{ getServiceLabel(order) }}</p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">City</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.city || '-' }}</p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Guest</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.guest || '-' }}</p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Date</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.date || '-' }}</p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Day</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.day ?? '-' }}</p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Base Price</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ getNumber(order.sourceSnapshot?.priceBase) | number:'1.2-2' }}
                </p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Estimated Total</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ getNumber(order.sourceSnapshot?.estimatedTotal) | number:'1.2-2' }}
                </p>
              </div>
            </div>

            @if (order.sourceSnapshot?.prices?.length) {
              <div class="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Prices breakdown</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  @for (price of order.sourceSnapshot.prices; track $index) {
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {{ getNumber(price) | number:'1.2-2' }}
                    </span>
                  }
                </div>
              </div>
            }

            @if (order.sourceSnapshot?.notes) {
              <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                <p class="mt-2 text-sm text-slate-700">{{ order.sourceSnapshot.notes }}</p>
              </div>
            }
          </div>
        </div>

        <!-- FINANCIALS + ATTACHMENTS -->
        <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 p-5">
              <h3 class="text-sm font-semibold text-slate-900">Financial Control</h3>
              <p class="mt-1 text-sm text-slate-600">
                Track supplier, invoice, expected cost, and payment progress for this order.
              </p>
            </div>
            <div class="space-y-4 p-5">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.supplierName" placeholder="Supplier name" />
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.supplierReference" placeholder="Supplier reference" />
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.invoiceNumber" placeholder="Invoice number" />
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.currency" placeholder="Currency" />
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="number" [(ngModel)]="financialsForm.expectedCost" placeholder="Expected cost" />
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="number" [(ngModel)]="financialsForm.paidAmount" placeholder="Paid amount" />
                <select class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.paymentStatus">
                  <option value="NOT_REQUIRED">Not required</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
                <select class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.paymentMethod">
                  <option value="OTHER">Other</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="CHECK">Check</option>
                </select>
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="date" [(ngModel)]="financialsForm.paymentDueDate" />
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="date" [(ngModel)]="financialsForm.paymentDate" />
                <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2" type="date" [(ngModel)]="financialsForm.invoiceDate" />
              </div>

              <div class="flex justify-end">
                <button class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700" type="button" (click)="financialsSave.emit(financialsForm)">
                  Save Financials
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 p-5">
              <h3 class="text-sm font-semibold text-slate-900">Attachments</h3>
              <p class="mt-1 text-sm text-slate-600">
                Register vouchers, invoices, payment proofs, and reservation confirmations.
              </p>
            </div>
            <div class="space-y-4 p-5">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <select class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="attachmentForm.type">
                    <option value="VOUCHER">Voucher</option>
                    <option value="INVOICE">Invoice</option>
                    <option value="PAYMENT_PROOF">Payment proof</option>
                  <option value="RESERVATION_CONFIRMATION">Reservation confirmation</option>
                  <option value="TICKET">Ticket</option>
                  <option value="PASSPORT_COPY">Passport copy</option>
                  <option value="OTHER">Other</option>
                  </select>
                  <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="attachmentForm.fileName" placeholder="File name" />
                  <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" (change)="onAttachmentFileSelected($event)" />
                  <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2" [(ngModel)]="attachmentForm.url" placeholder="File URL" />
                  <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2" [(ngModel)]="attachmentForm.notes" placeholder="Notes" />
                </div>

                <div class="flex justify-end">
                  <button class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50" type="button" (click)="addAttachment()">
                    {{ selectedAttachmentFile ? 'Upload Attachment' : 'Add Attachment' }}
                  </button>
                </div>

              <div class="space-y-2">
                @for (attachment of order.attachments || []; track attachment.attachmentId) {
                  <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                          {{ prettify(attachment.type) }}
                        </span>
                        <span class="text-sm font-semibold text-slate-900">{{ attachment.fileName }}</span>
                      </div>
                      <p class="mt-1 text-xs text-slate-500">{{ attachment.notes || attachment.url || '-' }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50" type="button" (click)="attachmentOpen.emit(attachment.attachmentId)">
                        Open
                      </button>
                      <button class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50" type="button" (click)="attachmentRemove.emit(attachment.attachmentId)">
                        Remove
                      </button>
                    </div>
                  </div>
                }
                @if (!(order.attachments?.length)) {
                  <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    No attachments registered yet.
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- CHECKLIST + TIMELINE -->
        <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 p-5">
              <h3 class="text-sm font-semibold text-slate-900">Checklist</h3>
              <p class="mt-1 text-sm text-slate-600">
                Track the operational tasks required to complete this order.
              </p>
            </div>
            <div class="p-5">
              <app-service-order-checklist
                [items]="order.checklist"
                (toggle)="checklistToggle.emit($event)"
              />
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 p-5">
              <h3 class="text-sm font-semibold text-slate-900">Timeline</h3>
              <p class="mt-1 text-sm text-slate-600">
                Audit log of status updates and operational changes.
              </p>
            </div>
            <div class="p-5">
              <app-service-order-timeline [logs]="order.auditLogs" />
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ServiceOrderDetailComponent {
  @Input() order: ServiceOrder | null = null;
  @Output() statusChange = new EventEmitter<ServiceOrder['status']>();
  @Output() assigneeChange = new EventEmitter<string | null>();
  @Output() checklistToggle = new EventEmitter<{ itemId: string; done: boolean }>();
  @Output() financialsSave = new EventEmitter<any>();
  @Output() attachmentAdd = new EventEmitter<any>();
  @Output() attachmentUpload = new EventEmitter<{ file: File; attachment: any }>();
  @Output() attachmentOpen = new EventEmitter<string>();
  @Output() attachmentRemove = new EventEmitter<string>();

  financialsForm: any = {};
  attachmentForm: any = {
    type: 'VOUCHER',
    fileName: '',
    url: '',
    notes: ''
  };
  selectedAttachmentFile: File | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']?.currentValue) {
      const order = changes['order'].currentValue as ServiceOrder;
      this.financialsForm = {
        supplierName: order.financials?.supplierName || '',
        supplierReference: order.financials?.supplierReference || '',
        currency: order.financials?.currency || 'USD',
        expectedCost: order.financials?.expectedCost ?? 0,
        paidAmount: order.financials?.paidAmount ?? 0,
        paymentStatus: order.financials?.paymentStatus || 'NOT_REQUIRED',
        paymentMethod: order.financials?.paymentMethod || 'OTHER',
        paymentDueDate: this.toDateInput(order.financials?.paymentDueDate),
        paymentDate: this.toDateInput(order.financials?.paymentDate),
        invoiceNumber: order.financials?.invoiceNumber || '',
        invoiceDate: this.toDateInput(order.financials?.invoiceDate)
      };
      this.attachmentForm = {
        type: 'VOUCHER',
        fileName: '',
        url: '',
        notes: ''
      };
      this.selectedAttachmentFile = null;
    }
  }

  addAttachment(): void {
    const cleanedPayload = {
      ...this.attachmentForm,
      fileName: this.attachmentForm.fileName?.trim(),
      url: (this.attachmentForm.url || '').trim(),
      notes: (this.attachmentForm.notes || '').trim()
    };

    if (this.selectedAttachmentFile) {
      this.attachmentUpload.emit({
        file: this.selectedAttachmentFile,
        attachment: {
          ...cleanedPayload,
          fileName: cleanedPayload.fileName || this.selectedAttachmentFile.name
        }
      });
      this.resetAttachmentForm();
      return;
    }

    if (!cleanedPayload.fileName) return;
    this.attachmentAdd.emit({
      ...cleanedPayload
    });
    this.resetAttachmentForm();
  }

  onAttachmentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] || null;
    this.selectedAttachmentFile = file;
    if (file && !this.attachmentForm.fileName?.trim()) {
      this.attachmentForm.fileName = file.name;
    }
  }

  private resetAttachmentForm(): void {
    this.attachmentForm = {
      type: 'VOUCHER',
      fileName: '',
      url: '',
      notes: ''
    };
    this.selectedAttachmentFile = null;
  }

  getNumber(value: any): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  getServiceLabel(order: ServiceOrder): string {
    return order?.sourceSnapshot?.name
      || order?.sourceSnapshot?.route
      || order?.sourceSnapshot?.category
      || '-';
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

  private toDateInput(value?: string | Date | null): string {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  }
}
