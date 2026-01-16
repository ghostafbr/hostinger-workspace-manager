import { TestBed } from '@angular/core/testing';
import { WompiService } from './wompi.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('WompiService', () => {
  let service: WompiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WompiService],
    });
    service = TestBed.inject(WompiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('generatePaymentLink', () => {
    it('should construct correct URL', async () => {
      const params = {
        publicKey: 'pub_test',
        amount: 10000,
        currency: 'COP',
        reference: 'ref-123',
        description: 'Test Payment',
      };

      const link = await service.generatePaymentLink(params);

      expect(link).toContain('https://checkout.wompi.co/l/');
      expect(link).toContain('public-key=pub_test');
      expect(link).toContain('amount-in-cents=10000');
      expect(link).toContain('reference=ref-123');
    });
  });

  describe('verifyPayment', () => {
    it('should call verify endpoint', async () => {
      const mockResponse = { status: 'APPROVED', data: {} };

      const promise = service.verifyPayment('txn-123', 'pub_test');

      const req = httpMock.expectOne('https://production.wompi.co/v1/transactions/txn-123');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer pub_test');

      req.flush(mockResponse);

      const res = await promise;
      expect(res.status).toBe('APPROVED');
    });
  });
});
