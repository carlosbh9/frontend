import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../enviroments/environment';
import { ServiceOrder, ServiceOrderAttachment, ServiceOrderFilters, ServiceOrderFinancials, ServiceOrderListResponse, ServiceOrderTemplate } from './service-orders.types';

@Injectable({ providedIn: 'root' })
export class ServiceOrdersApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/service-orders`;
  private readonly templatesUrl = `${environment.apiUrl}/service-order-templates`;

  async list(filters: ServiceOrderFilters = {}): Promise<ServiceOrderListResponse> {
    let params = new HttpParams()
      .set('page', String(filters.page || 1))
      .set('pageSize', String(filters.pageSize || 20));

    if (filters.area) params = params.set('area', filters.area);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.contactId) params = params.set('contactId', filters.contactId);

    return firstValueFrom(this.http.get<ServiceOrderListResponse>(this.baseUrl, { params }));
  }

  async getById(id: string): Promise<ServiceOrder> {
    return firstValueFrom(this.http.get<ServiceOrder>(`${this.baseUrl}/${id}`));
  }

  async getByContact(contactId: string): Promise<ServiceOrder[]> {
    return firstValueFrom(this.http.get<ServiceOrder[]>(`${this.baseUrl}/by-contact/${contactId}`));
  }

  async updateStatus(id: string, status: ServiceOrder['status'], reason = ''): Promise<ServiceOrder> {
    return firstValueFrom(this.http.patch<ServiceOrder>(`${this.baseUrl}/${id}/status`, { status, reason }));
  }

  async assign(id: string, assigneeId: string | null): Promise<ServiceOrder> {
    return firstValueFrom(this.http.patch<ServiceOrder>(`${this.baseUrl}/${id}/assign`, { assigneeId }));
  }

  async updateChecklistItem(id: string, itemId: string, done: boolean): Promise<ServiceOrder> {
    return firstValueFrom(this.http.patch<ServiceOrder>(`${this.baseUrl}/${id}/checklist/${itemId}`, { done }));
  }

  async updateFinancials(id: string, payload: Partial<ServiceOrderFinancials>): Promise<ServiceOrder> {
    return firstValueFrom(this.http.patch<ServiceOrder>(`${this.baseUrl}/${id}/financials`, payload));
  }

  async addAttachment(id: string, payload: Partial<ServiceOrderAttachment>): Promise<ServiceOrder> {
    return firstValueFrom(this.http.post<ServiceOrder>(`${this.baseUrl}/${id}/attachments`, payload));
  }

  async presignAttachmentUpload(id: string, body: { fileName: string; contentType: string; type: string }): Promise<{ ok: boolean; key: string; fileUrl: string; uploadUrl: string; expiresIn: number; bucket: string }> {
    return firstValueFrom(this.http.post<{ ok: boolean; key: string; fileUrl: string; uploadUrl: string; expiresIn: number; bucket: string }>(`${this.baseUrl}/${id}/attachments/presign`, body));
  }

  async uploadToS3(uploadUrl: string, file: File): Promise<any> {
    return firstValueFrom(this.http.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      responseType: 'text'
    }));
  }

  async openAttachment(id: string, attachmentId: string): Promise<{ ok: boolean; url: string; expiresIn: number }> {
    return firstValueFrom(this.http.get<{ ok: boolean; url: string; expiresIn: number }>(`${this.baseUrl}/${id}/attachments/${attachmentId}/open`));
  }

  async removeAttachment(id: string, attachmentId: string): Promise<ServiceOrder> {
    return firstValueFrom(this.http.delete<ServiceOrder>(`${this.baseUrl}/${id}/attachments/${attachmentId}`));
  }

  async syncByContact(contactId: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/sync-contact/${contactId}`, {}));
  }

  async listTemplates(): Promise<ServiceOrderTemplate[]> {
    return firstValueFrom(this.http.get<ServiceOrderTemplate[]>(this.templatesUrl));
  }

  async upsertTemplate(template: ServiceOrderTemplate): Promise<ServiceOrderTemplate> {
    return firstValueFrom(this.http.put<ServiceOrderTemplate>(this.templatesUrl, template));
  }

  async deleteTemplate(id: string): Promise<{ ok: boolean; deletedId: string }> {
    return firstValueFrom(this.http.delete<{ ok: boolean; deletedId: string }>(`${this.templatesUrl}/${id}`));
  }
}
