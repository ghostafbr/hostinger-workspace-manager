import { Injectable } from '@angular/core';

/**
 * Export Service
 *
 * Provides functionality to export data to various formats (CSV, JSON, etc.)
 */
@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /**
   * Export data to CSV
   *
   * @param data - Array of objects to export
   * @param filename - Name of the file to download
   * @param columns - Optional column configuration (label and key mapping)
   */
  exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    columns?: { label: string; key: keyof T }[],
  ): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // If no columns specified, use all keys from first object
    const headers = columns
      ? columns.map((col) => col.label)
      : Object.keys(data[0] as Record<string, unknown>);

    const keys = columns ? columns.map((col) => col.key) : Object.keys(data[0]);

    // Build CSV content
    const csvContent = [
      // Header row
      headers.join(','),
      // Data rows
      ...data.map((row) =>
        keys
          .map((key) => {
            const value = row[key as keyof T];
            return this.escapeCSVValue(value);
          })
          .join(','),
      ),
    ].join('\n');

    // Create blob and download
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Export data to JSON
   *
   * @param data - Data to export
   * @param filename - Name of the file to download
   */
  exportToJSON<T>(data: T, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  /**
   * Escape CSV value (handle commas, quotes, newlines)
   */
  private escapeCSVValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    let stringValue: string;

    // Handle Date objects
    if (value instanceof Date) {
      stringValue = value.toISOString();
    } else if (typeof value === 'object') {
      // Convert objects/arrays to JSON string
      stringValue = JSON.stringify(value);
    } else {
      stringValue = String(value);
    }

    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Download file to user's computer
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
