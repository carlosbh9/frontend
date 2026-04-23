import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceOrdersStore } from '../data-access/service-orders.store';
import { ConfirmReasonModalComponent } from '../ui/confirm-reason-modal.component';
import { ServiceOrderDetailComponent } from '../ui/service-order-detail.component';
import { ServiceOrdersListComponent } from '../ui/service-orders-list.component';

@Component({
  selector: 'app-service-orders-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ServiceOrdersListComponent, ServiceOrderDetailComponent, ConfirmReasonModalComponent],
  template: `


  <div class="min-h-full bg-slate-50">
    <div class="mx-auto max-w space-y-4 p-1 sm:p-2">
      <!-- HEADER -->
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
              Operations Dashboard
            </div>

            <h1 class="mt-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              Service Orders
            </h1>

            <p class="mt-1 max-w-2xl text-xs text-slate-600 sm:text-sm">
              Monitor operational workload, review order progress, and keep reservations,
              accounting, and execution teams aligned.
            </p>
          </div>

          <!-- Quick actions -->
          <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
              Selected order:
              <span class="font-semibold text-slate-700">
                {{ selectedId() || 'None' }}
              </span>
            </div>

            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              (click)="reload()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </section>

      <!-- SUMMARY -->
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="text-sm font-semibold text-slate-900">Order Summary</h2>
              <p class="mt-1 text-xs text-slate-600 sm:text-sm">
                Quick snapshot of operational workload and follow-up needs across all service orders.
              </p>
            </div>

            <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {{ store.total() }} total orders
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 p-4 lg:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Pending</p>
            <p class="mt-1 text-xl font-semibold text-slate-900">{{ store.kpis().pending }}</p>
            <p class="mt-0.5 text-[11px] text-slate-500">Awaiting action</p>
          </div>

          <div class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
            <p class="text-xs font-medium uppercase tracking-wide text-blue-700">In Progress</p>
            <p class="mt-1 text-xl font-semibold text-blue-900">{{ store.kpis().inProgress }}</p>
            <p class="mt-0.5 text-[11px] text-blue-700/80">Currently being worked on</p>
          </div>

          <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <p class="text-xs font-medium uppercase tracking-wide text-emerald-700">Done</p>
            <p class="mt-1 text-xl font-semibold text-emerald-900">{{ store.kpis().done }}</p>
            <p class="mt-0.5 text-[11px] text-emerald-700/80">Completed orders</p>
          </div>

          <div class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
            <p class="text-xs font-medium uppercase tracking-wide text-rose-700">Overdue</p>
            <p class="mt-1 text-xl font-semibold text-rose-900">{{ store.kpis().overdue }}</p>
            <p class="mt-0.5 text-[11px] text-rose-700/80">Needs immediate attention</p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-sm font-semibold text-slate-900">Operations Workspace</h2>
              <p class="mt-1 text-sm text-slate-600">
                Review the queue and work on one selected order without leaving the page.
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Selected order:
                <span class="font-semibold text-slate-700">{{ selectedId() || 'None' }}</span>
              </div>

              <div class="flex gap-2">
                <input
                  class="block min-w-[180px] rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  [(ngModel)]="syncContactId"
                  placeholder="Paste contact ID"
                />
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                  (click)="syncContactOrders()"
                >
                  Sync sold contact
                </button>
              </div>
            </div>
          </div>

          @if (store.loading()) {
            <div class="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <svg class="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4Z"></path>
              </svg>
              Loading service orders...
            </div>
          }

          @if (store.error()) {
            <div class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {{ store.error() }}
            </div>
          }
        </div>

        <div class="grid gap-4 p-4 xl:grid-cols-12">
          <div class="xl:col-span-7 2xl:col-span-8">
            <div class="rounded-xl border border-slate-200 bg-white">
              <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Orders Queue</h3>
                  <p class="mt-0.5 text-xs text-slate-600">Select one order to review and update it inline.</p>
                </div>

                <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {{ store.total() }} total
                </div>
              </div>

              <div class="p-3">
                <app-service-orders-list
                  [orders]="store.orders()"
                  [area]="store.filters().area || ''"
                  [status]="store.filters().status || ''"
                  [type]="store.filters().type || ''"
                  [page]="store.page()"
                  [pageSize]="store.pageSize()"
                  [total]="store.total()"
                  (areaChange)="store.setFilter('area', $event)"
                  (statusChange)="store.setFilter('status', $event)"
                  (typeChange)="store.setFilter('type', $event)"
                  (pageChange)="store.setPage($event)"
                  (pageSizeChange)="store.setPageSize($event)"
                  (reload)="reload()"
                  (openDetail)="openDetail($event)"
                />
              </div>
            </div>
          </div>

          <div class="xl:col-span-5 2xl:col-span-4">
            <div class="rounded-xl border border-slate-200 bg-white xl:sticky xl:top-3">
              <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Selected Order</h3>
                  <p class="mt-0.5 text-xs text-slate-600">Compact detail panel with tabs for workflow, financials, and files.</p>
                </div>

                @if (selectedId()) {
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                    (click)="clearSelection()"
                  >
                    Clear
                  </button>
                }
              </div>

              <div class="max-h-[calc(100vh-11rem)] overflow-y-auto p-3">
                @if (store.detailLoading() && !store.selectedOrder()) {
                  <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600">
                      <svg class="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4Z"></path>
                      </svg>
                      Loading service order detail...
                    </div>
                  </div>
                }

                <app-service-order-detail
                  [order]="store.selectedOrder()"
                  (close)="clearSelection()"
                  (statusChange)="changeStatus($event)"
                  (stageChange)="changeStage($event)"
                  (assigneeChange)="changeAssignee($event)"
                  (checklistToggle)="toggleChecklist($event.itemId, $event.done)"
                  (financialsSave)="saveFinancials($event)"
                  (attachmentAdd)="addAttachment($event)"
                  (attachmentUpload)="uploadAttachment($event)"
                  (attachmentOpen)="openAttachment($event)"
                  (attachmentRemove)="removeAttachment($event)"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <app-confirm-reason-modal
      [open]="isCancelModalOpen()"
      title="Cancel Order"
      description="A reason is required to cancel this order."
      placeholder="Write cancellation reason..."
      confirmLabel="Confirm cancel"
      [error]="cancelError()"
      (close)="closeCancelModal()"
      (confirm)="confirmCancel($event)"
    />
  </div>

  `
})
export class ServiceOrdersPageComponent implements OnInit {
  readonly store = inject(ServiceOrdersStore);
  readonly selectedId = computed(() => this.store.selectedOrder()?._id || '');
  readonly isCancelModalOpen = signal(false);
  readonly cancelError = signal('');
  syncContactId = '';

  async ngOnInit(): Promise<void> {
    await this.store.load();
  }

  reload(): void {
    void this.store.load();
  }

  openDetail(orderId: string): void {
    void this.store.selectById(orderId);
  }

  clearSelection(): void {
    this.store.clearSelection();
  }

  changeStatus(status: any): void {
    const orderId = this.selectedId();
    if (!orderId) return;
    if (status === 'CANCELLED') {
      this.cancelError.set('');
      this.isCancelModalOpen.set(true);
      return;
    }
    void this.store.updateStatus(orderId, status, '');
  }

  closeCancelModal(): void {
    this.isCancelModalOpen.set(false);
    this.cancelError.set('');
  }

  confirmCancel(reason: string): void {
    const orderId = this.selectedId();
    if (!orderId) return;
    if (!reason) {
      this.cancelError.set('Cancellation reason is required');
      return;
    }
    this.closeCancelModal();
    void this.store.updateStatus(orderId, 'CANCELLED', reason);
  }

  syncContactOrders(): void {
    const contactId = this.syncContactId.trim();
    if (!contactId) return;
    void this.store.syncByContact(contactId);
  }

  changeAssignee(assigneeId: string | null): void {
    const orderId = this.selectedId();
    if (!orderId) return;
    void this.store.assign(orderId, assigneeId);
  }

  changeStage(event: { stageCode: string; comment: string }): void {
    const orderId = this.selectedId();
    if (!orderId || !event?.stageCode) return;
    void this.store.updateStage(orderId, event.stageCode, event.comment || '');
  }

  toggleChecklist(itemId: string, done: boolean): void {
    const orderId = this.selectedId();
    if (!orderId) return;
    void this.store.toggleChecklist(orderId, itemId, done);
  }

  saveFinancials(payload: any): void {
    const orderId = this.selectedId();
    if (!orderId) return;
    void this.store.updateFinancials(orderId, payload);
  }

  addAttachment(payload: any): void {
    const orderId = this.selectedId();
    if (!orderId) return;
    void this.store.addAttachment(orderId, payload);
  }

  uploadAttachment(payload: { file: File; attachment: any }): void {
    const orderId = this.selectedId();
    if (!orderId) return;
    void this.store.uploadAttachment(orderId, payload.file, payload.attachment);
  }

  removeAttachment(attachmentId: string): void {
    const orderId = this.selectedId();
    if (!orderId) return;
    void this.store.removeAttachment(orderId, attachmentId);
  }

  async openAttachment(attachmentId: string): Promise<void> {
    const orderId = this.selectedId();
    if (!orderId) return;
    const url = await this.store.openAttachment(orderId, attachmentId);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
