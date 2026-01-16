import { TestBed } from '@angular/core/testing';
import { WebhookService } from './webhook.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IWebhookConfig, WebhookPayload } from '@app/domain';

describe('WebhookService', () => {
  let service: WebhookService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WebhookService],
    });
    service = TestBed.inject(WebhookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  describe('sendWebhook', () => {
    const config: IWebhookConfig = {
        url: 'https://test.com/hook',
        platform: 'slack',
        events: ['health.warning'],
        minSeverity: 'warning',
        enabled: true
    };

    const payload: WebhookPayload = {
        event: 'health.warning',
        severity: 'warning',
        title: 'Test',
        message: 'Msg',
        workspace: { id: 'w1', name: 'WS' },
        timestamp: new Date().toISOString()
    };

    it('should send post request for enabled match', async () => {
        const promise = service.sendWebhook(config, payload);
        
        const req = httpMock.expectOne('https://test.com/hook');
        expect(req.request.method).toBe('POST');
        req.flush({});
        
        await promise;
    });

    it('should check severity filter', async () => {
        const configStrict = { ...config, minSeverity: 'critical' as 'critical' };
        // Payload is warning, config is critical only -> should NOT send
        await service.sendWebhook(configStrict, payload);
        
        httpMock.expectNone('https://test.com/hook');
    });

    it('should format payload for slack', async () => {
        const promise = service.sendWebhook(config, payload);
        
        const req = httpMock.expectOne('https://test.com/hook');
        // Slack payload structure check
        expect(req.request.body).toHaveProperty('attachments');
        req.flush({});
        
        await promise;
    });
  });
});
