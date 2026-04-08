import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { ConfirmSalePayload } from '../interfaces/sale-notification.interface';

@Injectable({
  providedIn: 'root'
})
export class QuoterV2Service {
  private readonly baseUrl = `${environment.apiUrl}/quoter-v2`;

  constructor(private http: HttpClient) {}

  async getOptions(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/options`));
  }

  async listQuoters(query: Record<string, any> = {}): Promise<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/quoters`, { params }));
  }

  async getQuoterById(id: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/quoters/${id}`));
  }

  async createQuoter(payload: any): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/quoters`, payload));
  }

  async updateQuoter(id: string, payload: any): Promise<any> {
    return firstValueFrom(this.http.patch<any>(`${this.baseUrl}/quoters/${id}`, payload));
  }

  async deleteQuoter(id: string): Promise<any> {
    return firstValueFrom(this.http.delete<any>(`${this.baseUrl}/quoters/${id}`));
  }

  async confirmSale(id: string, payload: ConfirmSalePayload): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/quoters/${id}/confirm-sale`, payload));
  }

  async calculatePrices(payload: any): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/calculate-prices`, payload));
  }
}
