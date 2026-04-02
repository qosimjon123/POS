export type ScanSource = 'capacitor' | 'web';

export interface UnifiedScanResult {
  value: string;
  displayValue: string;
  format: string;
  source: ScanSource;
}
