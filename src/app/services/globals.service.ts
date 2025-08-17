import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { validateConfig } from '../common/config-validator';
import { environment } from '@environment/environment.prod';
import { IAppConfig } from '@app/models/app-config.model';

@Injectable({ providedIn: 'root' })
export class Globals {

  private environmentModeSubject = new BehaviorSubject<string>('');
  environmentMode$ = this.environmentModeSubject.asObservable();
  
  async setEnvironmentMode(mode: string): Promise<void> {
    try {
      const env = mode === 'prod' ? 'prod' : 'dev';
      
      console.log('Globals ==> setEnvironmentMode changing to:', mode);
      
      const configPath = `/assets/config.${env}.json`;
      const configResponse = await fetch(configPath);
      if (!configResponse.ok) {
        throw new Error(`Failed to load ${configPath}`);
      }
      const config = await configResponse.json();
  

      // Update the settings and environment mode
      this.setSettings(config);
      this.environmentModeSubject.next(mode);
      
    } catch (error) {
      console.error('Error setting environment mode:', error);
      this.setError(`Failed to load configuration for ${mode} environment: ${(error as Error).message}`);
      throw error; // Re-throw so caller can handle it
    }
  }

  private settingsBehaviourSubject = new BehaviorSubject<IAppConfig>({
    apiBaseUrl: '',
    appBaseUrl: '',
    client: '',
    backgroundImage: '',
    logo: '',
    theme: '',
    title: '',
    vibNetworkLocation: '',
    zenyaFolderId: '',
    defaultBaanAdministration:'',
    vibNetworkLocation_test: '',
    zenyaFolderId_test:''
  }); 

  settings$ = this.settingsBehaviourSubject.asObservable();

  public  setSettings(config: IAppConfig): void {
    this.settingsBehaviourSubject.next(config);
  }

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  public setError(message: string) {
    console.error('[Globals] Error:', message);
    this.errorSubject.next(message);
  }

  private readonly USER_KEY = 'current_user';
  private readonly TOKEN_KEY = 'auth_token';

  setAuthData(user: any, token: string): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getAuthData(): { user: any, token: string } | null {
    const user = sessionStorage.getItem(this.USER_KEY);
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    
    if (user && token) {
      return { user: JSON.parse(user), token };
    }
    return null;
  }

  clearAuthData(): void {
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(this.TOKEN_KEY);
  }

}
