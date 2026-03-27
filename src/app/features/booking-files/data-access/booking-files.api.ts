import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../enviroments/environment';
import { BibliaDailyItem, BookingFile } from './booking-files.types';

@Injectable({ providedIn: 'root' })
export class BookingFilesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/booking-files`;

  async list(params: { page?: number; pageSize?: number; overall_status?: string; operations_status?: string; reservations_status?: string; payments_status?: string; deliverables_status?: string; risk_level?: string; q?: string } = {}): Promise<{ items: BookingFile[]; total: number; page: number; pageSize: number }> {
    const search = new URLSearchParams();
    search.set('page', String(params.page || 1));
    search.set('pageSize', String(params.pageSize || 20));
    if (params.overall_status) search.set('overall_status', params.overall_status);
    if (params.operations_status) search.set('operations_status', params.operations_status);
    if (params.reservations_status) search.set('reservations_status', params.reservations_status);
    if (params.payments_status) search.set('payments_status', params.payments_status);
    if (params.deliverables_status) search.set('deliverables_status', params.deliverables_status);
    if (params.risk_level) search.set('risk_level', params.risk_level);
    if (params.q) search.set('q', params.q);
    return firstValueFrom(this.http.get<{ items: BookingFile[]; total: number; page: number; pageSize: number }>(`${this.baseUrl}?${search.toString()}`));
  }

  async getById(id: string): Promise<BookingFile> {
    return firstValueFrom(this.http.get<BookingFile>(`${this.baseUrl}/${id}`));
  }

  async getByQuoter(quoterId: string): Promise<BookingFile> {
    return firstValueFrom(this.http.get<BookingFile>(`${this.baseUrl}/by-quoter/${quoterId}`));
  }

  async recalculateSummary(id: string): Promise<BookingFile> {
    return firstValueFrom(this.http.post<BookingFile>(`${this.baseUrl}/${id}/recalculate-summary`, {}));
  }

  async getSummary(id: string): Promise<Partial<BookingFile>> {
    return firstValueFrom(this.http.get<Partial<BookingFile>>(`${this.baseUrl}/${id}/summary`));
  }

  async getBibliaDaily(params: { date: string; area?: string; status?: string }): Promise<{ date: string; items: BibliaDailyItem[]; total: number }> {
    const search = new URLSearchParams();
    search.set('date', params.date);
    if (params.area) search.set('area', params.area);
    if (params.status) search.set('status', params.status);
    return firstValueFrom(this.http.get<{ date: string; items: BibliaDailyItem[]; total: number }>(`${this.baseUrl}/biblia/daily?${search.toString()}`));
  }
}
