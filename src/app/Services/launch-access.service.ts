import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../enviroments/environment';

interface LaunchTokenResponse {
  message: string;
  data: {
    launchToken: string;
    expiresIn: number;
    nonce: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LaunchAccessService {
  private readonly baseUrl = `${environment.apiUrl}/itinerary-launch`;

  constructor(private http: HttpClient) {}

  async openItineraryBuilder(quoterId?: string): Promise<void> {
    const payload = quoterId ? { quoterId } : {};
    const response = await firstValueFrom(
      this.http.post<LaunchTokenResponse>(`${this.baseUrl}/token`, payload)
    );

    const launchToken = response?.data?.launchToken;
    if (!launchToken) {
      throw new Error('Launch token was not generated');
    }

    const targetBase = environment.itineraryBuilderUrl || 'http://localhost:65425/launch';
    const launchUrl = new URL(targetBase);
    const fragmentParams = new URLSearchParams();
    fragmentParams.set('lt', launchToken);
    launchUrl.hash = fragmentParams.toString();

    window.open(launchUrl.toString(), '_blank', 'noopener,noreferrer');
  }
}
