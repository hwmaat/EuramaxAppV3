import { IAppConfig } from '../models/app-config.model';

export function validateConfig(config: IAppConfig): void {
  const requiredKeys: (keyof IAppConfig)[] = [
    'apiBaseUrl',
    'appBaseUrl',
    'client',
    'title',
    'backgroundImage',
    'logo',
    'theme',
    'vibNetworkLocation',
    'zenyaFolderId',
    'defaultBaanAdministration'
  ];

  const missing = requiredKeys.filter(
    (key) => config[key] === undefined || config[key] === ''
  );

  if (missing.length > 0) {
    console.error('❌ Configuration missing keys:', missing);
    throw new Error(`Configuration invalid. Missing: ${missing.join(', ')}`);
  }
}
