import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Hostinger API Service
 *
 * Handles communication with Hostinger API for:
 * - Testing connection/authentication
 * - Fetching domains
 * - Fetching subscriptions
 */
@Injectable({
  providedIn: 'root',
})
export class HostingerApiService {
  private readonly http = inject(HttpClient);

  private readonly BASE_URL = environment.api.hostinger.baseUrl;
  private readonly REQUEST_TIMEOUT = environment.api.hostinger.timeout;

  /**
   * Test connection to Hostinger API
   * Makes a simple request to verify token validity
   */
  async testConnection(token: string): Promise<{ success: boolean; error?: string }> {
    if (!token || token.trim() === '') {
      return { success: false, error: 'Token vacío' };
    }

    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      });

      // Test with real Hostinger API endpoints based on official docs
      // https://developers.hostinger.com/
      const endpoints = [
        '/domains/v1/portfolio', // List domains
        '/billing/v1/subscriptions', // List subscriptions
        '/hosting/v1/websites', // List websites
      ];

      for (const endpoint of endpoints) {
        try {

          const response = (await firstValueFrom(
            this.http
              .get<unknown>(`${this.BASE_URL}${endpoint}`, {
                headers,
                observe: 'response',
                withCredentials: false,
              })
              .pipe(timeout(this.REQUEST_TIMEOUT)),
          )) as { status: number; body: unknown };

          if (response.status === 200 || response.status === 201) {
            return { success: true };
          }
        } catch (err) {
          // Continue to next endpoint
          continue;
        }
      }

      return {
        success: false,
        error: 'Ningún endpoint respondió correctamente. Verifica que el token sea válido.',
      };
    } catch (error) {
      // Log detallado para debugging
      console.error('Hostinger API Error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Fetch all domains from Hostinger API
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getDomains(token: string): Promise<any[]> {
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      });

      const response = await firstValueFrom(
        this.http
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .get<any>(`${this.BASE_URL}/domains/v1/portfolio`, { headers })
          .pipe(timeout(this.REQUEST_TIMEOUT)),
      );

      return response.data || response || [];
    } catch (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }
  }

  /**
   * Fetch all subscriptions from Hostinger API
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getSubscriptions(token: string): Promise<any[]> {
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      });

      const response = await firstValueFrom(
        this.http
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .get<any>(`${this.BASE_URL}/billing/v1/subscriptions`, { headers })
          .pipe(timeout(this.REQUEST_TIMEOUT)),
      );

      return response.data || response || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  /**
   * Handle HTTP errors and return user-friendly messages
   */
  private handleError(error: unknown): { success: false; error: string } {
    if (error instanceof HttpErrorResponse) {
      // Status 0 generalmente indica CORS o problemas de red
      if (error.status === 0) {
        console.error('CORS or Network Error Details:', {
          message: error.message,
          error: error.error,
          url: error.url,
          statusText: error.statusText,
        });

        return {
          success: false,
          error:
            'Error de CORS: Hostinger API no permite peticiones desde el navegador. Considera usar un proxy o Cloud Function.',
        };
      }

      switch (error.status) {
        case 401:
          return { success: false, error: 'Token inválido o expirado' };
        case 403:
          return { success: false, error: 'Token sin permisos suficientes' };
        case 429:
          return { success: false, error: 'Demasiadas peticiones. Intenta de nuevo más tarde.' };
        case 500:
        case 502:
        case 503:
        case 530:
          return {
            success: false,
            error: `Error del servidor de Hostinger (${error.status}). El endpoint puede no existir o el token no es válido.`,
          };
        default:
          // Log error details for debugging
          console.error('HTTP Error Details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: error.url,
          });
          return { success: false, error: `Error HTTP ${error.status}: ${error.message}` };
      }
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      return { success: false, error: 'Timeout: La solicitud tardó demasiado' };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Error desconocido' };
  }
}
