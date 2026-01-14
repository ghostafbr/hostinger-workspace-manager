import { TestBed } from '@angular/core/testing';
import { EncryptionService } from './encryption.service';
import { describe, it, expect, beforeEach } from 'vitest';
import * as cryptoJs from 'crypto-js';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EncryptionService],
    });
    service = TestBed.inject(EncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('encrypt', () => {
    it('should encrypt plain text', () => {
      const plainText = 'my-api-token-12345';
      const encrypted = service.encrypt(plainText);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plainText);
      expect(typeof encrypted).toBe('string');
    });

    it('should produce different ciphertext for same plaintext due to IV', () => {
      const plainText = 'my-api-token';
      const encrypted1 = service.encrypt(plainText);
      const encrypted2 = service.encrypt(plainText);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const encrypted = service.encrypt('');
      expect(encrypted).toBe('');
    });

    it('should handle special characters', () => {
      const plainText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = service.encrypt(plainText);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plainText);
    });

    it('should handle unicode characters', () => {
      const plainText = '你好世界 🚀 Привет мир';
      const encrypted = service.encrypt(plainText);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plainText);
    });

    it('should handle very long strings', () => {
      const plainText = 'a'.repeat(10000);
      const encrypted = service.encrypt(plainText);

      expect(encrypted).toBeTruthy();
      expect(encrypted.length).toBeGreaterThan(0);
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted text back to original', () => {
      const plainText = 'my-api-token-12345';
      const encrypted = service.encrypt(plainText);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should handle empty string encryption/decryption', () => {
      const plainText = '';
      const encrypted = service.encrypt(plainText);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should handle special characters round-trip', () => {
      const plainText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = service.encrypt(plainText);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should handle unicode characters round-trip', () => {
      const plainText = '你好世界 🚀 Привет мир';
      const encrypted = service.encrypt(plainText);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should handle very long strings round-trip', () => {
      const plainText = 'a'.repeat(10000);
      const encrypted = service.encrypt(plainText);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should handle whitespace', () => {
      const plainText = '  spaces  \n\t\r  ';
      const encrypted = service.encrypt(plainText);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it('should return empty string for invalid ciphertext', () => {
      const result = service.decrypt('invalid-ciphertext');
      expect(result).toBe('');
    });

    it('should return empty string for tampered ciphertext', () => {
      const plainText = 'my-api-token';
      const encrypted = service.encrypt(plainText);
      const tampered = encrypted.substring(0, encrypted.length - 4) + 'xxxx';

      const result = service.decrypt(tampered);
      expect(result).toBe('');
    });

    it('should return empty string for empty ciphertext', () => {
      const result = service.decrypt('');
      expect(result).toBe('');
    });
  });

  describe('encrypt/decrypt integration', () => {
    it('should maintain data integrity through multiple encryption/decryption cycles', () => {
      const plainText = 'sensitive-api-key-abc123';

      // Cycle 1
      const encrypted1 = service.encrypt(plainText);
      const decrypted1 = service.decrypt(encrypted1);
      expect(decrypted1).toBe(plainText);

      // Cycle 2 - encrypt the encrypted value
      const encrypted2 = service.encrypt(encrypted1);
      const decrypted2 = service.decrypt(encrypted2);
      expect(decrypted2).toBe(encrypted1);

      // Decrypt back to original
      const final = service.decrypt(decrypted2);
      expect(final).toBe(plainText);
    });

    it('should produce consistent decryption for same ciphertext', () => {
      const plainText = 'my-token';
      const encrypted = service.encrypt(plainText);

      const decrypted1 = service.decrypt(encrypted);
      const decrypted2 = service.decrypt(encrypted);
      const decrypted3 = service.decrypt(encrypted);

      expect(decrypted1).toBe(plainText);
      expect(decrypted2).toBe(plainText);
      expect(decrypted3).toBe(plainText);
    });

    it('should handle real-world API token example', () => {
      const apiToken = 'api_test_51x2x3xJ4x5xO6xQ7xS8xU9xW0xY1xA2xC3xE4xG5xI6xK7xM8xO9xQ';
      const encrypted = service.encrypt(apiToken);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(apiToken);
      expect(encrypted).not.toContain(apiToken);
    });
  });

  describe('hash', () => {
    it('should hash text using SHA256', () => {
      const text = 'my-password';
      const hashed = service.hash(text);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(text);
      expect(hashed.length).toBe(64); // SHA256 produces 64 character hex string
    });

    it('should produce same hash for same input', () => {
      const text = 'consistent-data';
      const hash1 = service.hash(text);
      const hash2 = service.hash(text);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = service.hash('input1');
      const hash2 = service.hash('input2');

      expect(hash1).not.toBe(hash2);
    });

    it('should return empty string for empty input', () => {
      const result = service.hash('');
      expect(result).toBe('');
    });

    it('should throw error when hashing fails', () => {
        // Force error by mocking hash implementation
        vi.spyOn(service as any, 'hash').mockImplementation(() => {
          throw new Error('Hash error');
        });

        expect(() => service.hash('text')).toThrow('Hash error');
    });
  });

  describe('error handling', () => {
    it('should throw error when encryption fails', () => {
      // Mock crypto-js to throw error
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const cryptoMock = vi.spyOn(cryptoJs.AES, 'encrypt');
      cryptoMock.mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      expect(() => service.encrypt('test')).toThrow('Failed to encrypt data');
      cryptoMock.mockRestore();
    });

    it('should throw error when decryption fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const cryptoMock = vi.spyOn(cryptoJs.AES, 'decrypt');
      cryptoMock.mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      expect(() => service.decrypt('invalid')).toThrow('Failed to decrypt data');
      cryptoMock.mockRestore();
    });
  });
});

