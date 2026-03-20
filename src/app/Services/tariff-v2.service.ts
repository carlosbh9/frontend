import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { TariffItemV2, TariffV2FiltersResponse, TariffV2ListResponse, TariffV2OptionsResponse } from '../interfaces/tariff-v2.interface';

@Injectable({ providedIn: 'root' })
export class TariffV2Service {
  private readonly baseUrl = `${environment.apiUrl}/tariff-v2`;

  constructor(private http: HttpClient) {}

  async getOptions() {
    return firstValueFrom(this.http.get<TariffV2OptionsResponse>(`${this.baseUrl}/options`));
  }

  async getFilters() {
    return firstValueFrom(this.http.get<TariffV2FiltersResponse>(`${this.baseUrl}/filters`));
  }

  async listItems(query: Record<string, any>) {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return firstValueFrom(this.http.get<TariffV2ListResponse>(`${this.baseUrl}/items`, { params }));
  }

  async getItemById(id: string) {
    return firstValueFrom(this.http.get<TariffItemV2>(`${this.baseUrl}/items/${id}`));
  }

  async createItem(payload: Partial<TariffItemV2>) {
    return firstValueFrom(this.http.post<TariffItemV2>(`${this.baseUrl}/items`, payload));
  }

  async updateItem(id: string, payload: Partial<TariffItemV2>) {
    return firstValueFrom(this.http.patch<TariffItemV2>(`${this.baseUrl}/items/${id}`, payload));
  }

  async deleteItem(id: string) {
    return firstValueFrom(this.http.delete<TariffItemV2>(`${this.baseUrl}/items/${id}`));
  }
}
