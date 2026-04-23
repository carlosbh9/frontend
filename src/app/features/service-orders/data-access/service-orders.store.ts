import { Injectable, computed, inject, signal } from '@angular/core';
import { ServiceOrdersApi } from './service-orders.api';
import { ServiceOrder, ServiceOrderFilters } from './service-orders.types';

@Injectable({ providedIn: 'root' })
export class ServiceOrdersStore {
  private readonly api = inject(ServiceOrdersApi);

  readonly orders = signal<ServiceOrder[]>([]);
  readonly loading = signal(false);
  readonly detailLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedOrder = signal<ServiceOrder | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly kpis = signal({ pending: 0, inProgress: 0, overdue: 0, done: 0 });

  readonly filters = signal<Omit<ServiceOrderFilters, 'page' | 'pageSize'>>({
    area: '',
    status: '',
    type: '',
    contactId: ''
  });

  readonly filteredOrders = computed(() => {
    const activeFilters = this.filters();
    return this.orders().filter((order) => {
      const areaOk = !activeFilters.area || order.area === activeFilters.area;
      const statusOk = !activeFilters.status || order.status === activeFilters.status;
      const typeOk = !activeFilters.type || order.type === activeFilters.type;
      return areaOk && statusOk && typeOk;
    });
  });

  readonly overdueOrders = computed(() => {
    const now = Date.now();
    return this.filteredOrders().filter((order) => {
      if (!order.dueDate) return false;
      if (order.status === 'DONE' || order.status === 'CANCELLED') return false;
      return new Date(order.dueDate).getTime() < now;
    });
  });

  readonly statusCount = computed(() => ({
    pending: this.filteredOrders().filter((x) => x.status === 'PENDING').length,
    inProgress: this.filteredOrders().filter((x) => x.status === 'IN_PROGRESS').length,
    waitingInfo: this.filteredOrders().filter((x) => x.status === 'WAITING_INFO').length,
    done: this.filteredOrders().filter((x) => x.status === 'DONE').length,
    cancelled: this.filteredOrders().filter((x) => x.status === 'CANCELLED').length
  }));

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.api.list({
        page: this.page(),
        pageSize: this.pageSize(),
        ...this.filters()
      });
      this.orders.set(response.items || []);
      this.total.set(response.total || 0);
      if (response.kpis) this.kpis.set(response.kpis);
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Could not load service orders');
      this.orders.set([]);
      this.total.set(0);
    } finally {
      this.loading.set(false);
    }
  }

  async selectById(id: string): Promise<void> {
    this.error.set(null);
    const cachedOrder = this.orders().find((order) => order._id === id) || null;
    if (cachedOrder) {
      this.selectedOrder.set(cachedOrder);
    }

    this.detailLoading.set(true);
    try {
      const order = await this.api.getById(id);
      this.selectedOrder.set(order);
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Could not load service order detail');
      if (!cachedOrder) {
        this.selectedOrder.set(null);
      }
    } finally {
      this.detailLoading.set(false);
    }
  }

  clearSelection(): void {
    this.selectedOrder.set(null);
    this.detailLoading.set(false);
  }

  setFilter<K extends keyof ServiceOrderFilters>(key: K, value: ServiceOrderFilters[K]): void {
    this.filters.update((prev) => ({ ...prev, [key]: value || '' }));
    this.page.set(1);
    void this.load();
  }

  setPage(page: number): void {
    if (page < 1 || page === this.page()) return;
    this.page.set(page);
    void this.load();
  }

  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.page.set(1);
    void this.load();
  }

  async updateStatus(orderId: string, status: ServiceOrder['status'], reason = ''): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.api.updateStatus(orderId, status, reason);
      this.patchOrder(updated);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not update status');
    }
  }

  async assign(orderId: string, assigneeId: string | null): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.api.assign(orderId, assigneeId);
      this.patchOrder(updated);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not assign order');
    }
  }

  async toggleChecklist(orderId: string, itemId: string, done: boolean): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.api.updateChecklistItem(orderId, itemId, done);
      this.patchOrder(updated);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not update checklist');
    }
  }

  async updateStage(orderId: string, stageCode: string, comment = ''): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.api.updateStage(orderId, stageCode, comment);
      this.patchOrder(updated);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not update stage');
    }
  }

  async updateFinancials(orderId: string, payload: any): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.api.updateFinancials(orderId, payload);
      this.patchOrder(updated);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not update financials');
    }
  }

  async addAttachment(orderId: string, payload: any): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.api.addAttachment(orderId, payload);
      this.patchOrder(updated);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not add attachment');
    }
  }

  async uploadAttachment(orderId: string, file: File, payload: any): Promise<void> {
    this.error.set(null);
    try {
      const presign = await this.api.presignAttachmentUpload(orderId, {
        fileName: file.name,
        contentType: file.type,
        type: payload.type || 'OTHER'
      });
      await this.api.uploadToS3(presign.uploadUrl, file);
      const updated = await this.api.addAttachment(orderId, {
        ...payload,
        fileName: payload.fileName || file.name,
        contentType: file.type,
        storageKey: presign.key,
        url: presign.fileUrl
      });
      this.patchOrder(updated);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not upload attachment');
    }
  }

  async openAttachment(orderId: string, attachmentId: string): Promise<string | null> {
    this.error.set(null);
    try {
      const response = await this.api.openAttachment(orderId, attachmentId);
      return response.url || null;
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not open attachment');
      return null;
    }
  }

  async removeAttachment(orderId: string, attachmentId: string): Promise<void> {
    this.error.set(null);
    try {
      const updated = await this.api.removeAttachment(orderId, attachmentId);
      this.patchOrder(updated);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not remove attachment');
    }
  }

  async syncByContact(contactId: string): Promise<void> {
    this.error.set(null);
    try {
      await this.api.syncByContact(contactId);
      await this.load();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not sync service orders');
    }
  }

  private patchOrder(updated: ServiceOrder): void {
    if (!updated?._id) return;

    this.orders.update((current) =>
      current.map((order) => order._id === updated._id ? updated : order)
    );

    if (this.selectedOrder()?._id === updated._id) {
      this.selectedOrder.set(updated);
    }
  }
}
