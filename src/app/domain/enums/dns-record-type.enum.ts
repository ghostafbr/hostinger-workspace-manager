/**
 * DNS Record Type Enum
 *
 * Represents the different types of DNS records
 */
export enum DnsRecordType {
  /** IPv4 Address record */
  A = 'A',

  /** IPv6 Address record */
  AAAA = 'AAAA',

  /** Canonical Name record (alias) */
  CNAME = 'CNAME',

  /** Mail Exchange record */
  MX = 'MX',

  /** Text record */
  TXT = 'TXT',

  /** Name Server record */
  NS = 'NS',

  /** Start of Authority record */
  SOA = 'SOA',

  /** Service record */
  SRV = 'SRV',

  /** Pointer record (reverse DNS) */
  PTR = 'PTR',
}
