/**
 * Payment Options Interface
 *
 * Defines payment methods available for domain/subscription renewals
 */
export interface PaymentOptions {
  /** Wompi public key for payment integration */
  wompiPublicKey?: string;

  /** Wompi private key (stored encrypted) */
  wompiPrivateKey?: string;

  /** Wompi integrity key for signature generation (REQUIRED for payment links) */
  wompiIntegrityKey?: string;

  /** Bancolombia account information */
  bancolombia?: {
    accountType: 'ahorros' | 'corriente';
    accountNumber: string;
    ownerName: string;
    ownerDocument: string;
  };

  /** Nequi account information */
  nequi?: {
    phoneNumber: string;
    ownerName: string;
  };
}
