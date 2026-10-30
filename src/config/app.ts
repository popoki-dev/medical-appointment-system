export const APP_CONFIG = {
  name: 'MediBook',
  tagline: 'Hospital appointments, simplified',
  hospitalName: 'MediBook General Hospital',
  supportEmail: 'hello@medibook.example',
  /** Simulated network latency for mock services, in ms. */
  mockLatency: 350,
  /** Prefix for every localStorage key the app owns. */
  storagePrefix: 'medibook:',
  defaultPageSize: 10,
} as const
