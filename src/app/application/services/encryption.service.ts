import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '@app/../environments/environment';

/**
 * Encryption Service
 *
 * Handles encryption and decryption of sensitive data using AES
 */
@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  // En producción, esta clave debe venir de environment variables seguras
  // Por ahora usamos una clave de ejemplo
  private readonly encryptionKey = environment.encryptionKey || 'hostinger-workspace-manager-secret-key-2026';

  /**
   * Encrypt text using AES
   */
  encrypt(text: string): string {
    if (!text) return '';
    
    try {
      const encrypted = CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Error encrypting text:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt text using AES
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Error decrypting text:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash text using SHA256 (one-way, for validation)
   */
  hash(text: string): string {
    if (!text) return '';
    
    try {
      return CryptoJS.SHA256(text).toString();
    } catch (error) {
      console.error('Error hashing text:', error);
      throw new Error('Failed to hash data');
    }
  }
}
