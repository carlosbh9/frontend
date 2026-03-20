import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { MasterQuoterV2ListResponse, MasterQuoterV2OptionsResponse, MasterQuoterV2Template } from '../interfaces/master-quoter-v2.interface';

@Injectable({ providedIn: 'root' })
export class MasterQuoterV2Service {
  private readonly baseUrl = `${environment.apiUrl}/master-quoter-v2`;

  constructor(private http: HttpClient) {}

  async getOptions() {
    return firstValueFrom(this.http.get<MasterQuoterV2OptionsResponse>(`${this.baseUrl}/options`));
  }

  async listTemplates(query: Record<string, any>) {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return firstValueFrom(this.http.get<MasterQuoterV2ListResponse>(`${this.baseUrl}/templates`, { params }));
  }

  async getTemplateById(id: string) {
    return firstValueFrom(this.http.get<MasterQuoterV2Template>(`${this.baseUrl}/templates/${id}`));
  }

  async getResolvedTemplateById(id: string) {
    return firstValueFrom(this.http.get<MasterQuoterV2Template>(`${this.baseUrl}/templates/${id}/resolved`));
  }

  async createTemplate(payload: Partial<MasterQuoterV2Template>) {
    return firstValueFrom(this.http.post<MasterQuoterV2Template>(`${this.baseUrl}/templates`, payload));
  }

  async updateTemplate(id: string, payload: Partial<MasterQuoterV2Template>) {
    return firstValueFrom(this.http.patch<MasterQuoterV2Template>(`${this.baseUrl}/templates/${id}`, payload));
  }

  async deleteTemplate(id: string) {
    return firstValueFrom(this.http.delete<MasterQuoterV2Template>(`${this.baseUrl}/templates/${id}`));
  }
}
