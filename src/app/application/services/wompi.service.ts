import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Wompi Payment Service
 *
 * Generates dynamic payment links for domain/subscription renewals
 * Documentation: https://docs.wompi.co/docs/colombia/links-de-pago/
 */
@Injectable({
  providedIn: 'root',
})
export class WompiService {
  private readonly http = inject(HttpClient);
  private readonly WOMPI_API_URL = 'https://production.wompi.co/v1';

  /**
   * Generate a payment link for domain renewal
   */
  async generatePaymentLink(params: {
    publicKey: string;
    amount: number; // In cents (COP)
    currency: string; // 'COP'
    reference: string; // Unique reference (e.g., domainName-timestamp)
    description: string; // Payment description
    redirectUrl?: string; // URL to redirect after payment
    customerEmail?: string; // Customer email for notifications
  }): Promise<string> {
    const { publicKey, amount, currency, reference, description, redirectUrl, customerEmail } =
      params;

    // Wompi uses URL params to generate dynamic links
    const baseUrl = 'https://checkout.wompi.co/l/';
    const queryParams = new URLSearchParams({
      'public-key': publicKey,
      currency,
      'amount-in-cents': amount.toString(),
      reference,
      ...(description && { description }),
      ...(redirectUrl && { 'redirect-url': redirectUrl }),
      ...(customerEmail && { 'customer-email': customerEmail }),
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }

  /**
   * Verify payment status
   */
  async verifyPayment(
    transactionId: string,
    publicKey: string,
  ): Promise<{ status: string; data: unknown }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ status: string; data: unknown }>(
          `${this.WOMPI_API_URL}/transactions/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${publicKey}`,
            },
          },
        ),
      );

      return response;
    } catch (error: unknown) {
      console.error('Error verifying Wompi payment:', error);
      throw error;
    }
  }
}
