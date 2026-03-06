import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroments/environment';

type PresignResp = { ok: boolean; key: string; uploadUrl: string; expiresIn: number };

export interface CreatePublicLinkResponse {
  token: string;
  expiresAt: string;
  clientId: string;
  publicUrl?: string;
}

export interface ValidatePublicLinkResponse {
  valid: boolean;
  clientId: string;
  expiresAt: string;
}

export interface PublicBookingLinkItem {
  token: string;
  clientId?: string;
  expiresAt?: string;
  createdAt?: string;
  status?: string;
  submitted?: boolean;
  submittedAt?: string;
  publicUrl?: string;
}

export interface publicbookinglinksummaryitem {
  token: string;
  clientId?: string;
  expiresAt?: string;
  createdAt?: string;
  status?: string;
  submitted?: boolean;
  submittedAt?: string;
  publicUrl?: string;
}

export interface PaginatedPublicBookingLinksResponse {
  items: publicbookinglinksummaryitem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicBookingLinkDetailItem extends publicbookinglinksummaryitem {
  ok?: boolean;
  submission?: any | null;
}

export interface UpdatePublicBookingLinkPayload {
  clientId?: string;
  status?: 'active' | 'used' | 'revoked' | 'expired';
  expiresAt?: string;
  submission?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BookingPublicService {
  private baseUrl = `${environment.apiUrl}/public-booking-links`;

  constructor(private http: HttpClient) {}

  async createPublicLink(clientId: string, expiresInHours = 72): Promise<CreatePublicLinkResponse> {
    return firstValueFrom(
      this.http.post<CreatePublicLinkResponse>(this.baseUrl, {
        clientId,
        expiresInHours
      })
    );
  }

  async validatePublicLink(token: string): Promise<ValidatePublicLinkResponse> {
    return firstValueFrom(this.http.get<ValidatePublicLinkResponse>(`${this.baseUrl}/${token}`));
  }

  async getPublicLinks(): Promise<publicbookinglinksummaryitem[]> {
    return firstValueFrom(
      this.http.get<publicbookinglinksummaryitem[]>(`${this.baseUrl}?includeSubmission=0`)
    );
  }

  async getPublicLinksPaginated(
    page: number,
    pageSize: number,
    clientId: string = '',
    token: string = ''
  ): Promise<PaginatedPublicBookingLinksResponse> {
    let params = new HttpParams()
      .set('includeSubmission', '0')
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    if (clientId.trim()) {
      params = params.set('clientId', clientId.trim());
    }
    if (token.trim()) {
      params = params.set('token', token.trim());
    }

    const response = await firstValueFrom(
      this.http.get<any>(this.baseUrl, { params })
    );

    // Backward compatibility: if backend still returns an array, paginate in memory.
    if (Array.isArray(response)) {
      const allItems = response as publicbookinglinksummaryitem[];
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return {
        items: allItems.slice(start, end),
        total: allItems.length,
        page,
        pageSize
      };
    }

    const items: publicbookinglinksummaryitem[] =
      response?.items ||
      response?.links ||
      response?.contacts ||
      [];

    const total = Number(
      response?.total ??
      response?.totalLinks ??
      response?.totalContacts ??
      items.length
    );

    return {
      items,
      total: Number.isFinite(total) ? total : items.length,
      page: Number(response?.page ?? page),
      pageSize: Number(response?.pageSize ?? pageSize)
    };
  }

  async getPublicLinkDetail(token: string): Promise<PublicBookingLinkDetailItem> {
    return firstValueFrom(
      this.http.get<PublicBookingLinkDetailItem>(`${this.baseUrl}/${token}/detail`)
    );
  }

  async updatePublicLink(token: string, payload: UpdatePublicBookingLinkPayload): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}/${token}`, payload));
  }

  async deletePublicLink(token: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.baseUrl}/${token}`));
  }

  presignPassport(token: string, body: { guestIndex: number; fileName: string; contentType: string }) {
    return this.http.post<PresignResp>(`${this.baseUrl}/${token}/presign-passport`, body);
  }

  uploadToS3(uploadUrl: string, file: File) {
    const headers = new HttpHeaders({ 'Content-Type': file.type });
    return this.http.put(uploadUrl, file, { headers, responseType: 'text' });
  }

  submitPublicForm(token: string, payload: any) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${token}/submit`, payload));
  }
}
