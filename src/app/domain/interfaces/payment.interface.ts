import { Timestamp } from 'firebase/firestore';

/**
 * Payment Entity Interface
 *
 * Represents a payment record for domain renewal
 */
export interface Payment {
  /** Unique identifier */
  id: string;

  /** Associated workspace ID */
  workspaceId: string;

  /** Domain ID */
  domainId: string;

  /** Domain name */
  domainName: string;

  /** Transaction ID from payment provider */
  transactionId: string;

  /** Payment reference */
  reference: string;

  /** Payment status */
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';

  /** Amount paid (in COP) */
  amount: number;

  /** Customer email */
  customerEmail: string;

  /** Payment method type */
  paymentMethod: string;

  /** When payment was made */
  paidAt: Timestamp;

  /** When this record was created */
  createdAt: Timestamp;
}
