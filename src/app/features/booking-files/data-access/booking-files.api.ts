import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../enviroments/environment';
import { BookingFile } from './booking-files.types';

@Injectable({ providedIn: 'root' })
export class BookingFilesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/booking-files`;

  async list(params: { page?: number; pageSize?: number; operation_status?: string; reservation_status?: string; payment_status?: string; q?: string } = {}): Promise<{ items: BookingFile[]; total: number; page: number; pageSize: number }> {
    const search = new URLSearchParams();
    search.set('page', String(params.page || 1));
    search.set('pageSize', String(params.pageSize || 20));
    if (params.operation_status) search.set('operation_status', params.operation_status);
    if (params.reservation_status) search.set('reservation_status', params.reservation_status);
    if (params.payment_status) search.set('payment_status', params.payment_status);
    if (params.q) search.set('q', params.q);
    return firstValueFrom(this.http.get<{ items: BookingFile[]; total: number; page: number; pageSize: number }>(`${this.baseUrl}?${search.toString()}`));
  }

  async getById(id: string): Promise<BookingFile> {
    return firstValueFrom(this.http.get<BookingFile>(`${this.baseUrl}/${id}`));
  }

  async getByQuoter(quoterId: string): Promise<BookingFile> {
    return firstValueFrom(this.http.get<BookingFile>(`${this.baseUrl}/by-quoter/${quoterId}`));
  }
}
