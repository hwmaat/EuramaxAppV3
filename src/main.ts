
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { licenseKey } from './devextreme-license25.1';
import config from 'devextreme/core/config';
import { inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { Globals } from '@app/services/globals.service';
import { environment } from '@environment/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authTokenInterceptor } from '@app/interceptors/auth-token.interceptor';
import { authRefreshInterceptor } from '@app/interceptors/auth-refresh.interceptor';

config({ licenseKey });

export function configurationInitializer(): () => Promise<void> {
  return async () => {
    const globals = inject(Globals);
    
    // Determine initial environment mode
    const initialMode = environment.production ? 'prod' : 'test'; // or 'dev'
    
    console.log('main ==> configurationInitializer initial environmentMode:', initialMode);
    
    try {
      // Use the service method to load initial configuration
      await globals.setEnvironmentMode(initialMode);
      
      console.log('main ==> configurationInitializer: initialization complete');
      
    } catch (error) {
      console.error('main ==> configurationInitializer: initialization failed', error);
      // App initialization will fail, which is probably what we want
    }
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    //provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authTokenInterceptor,authRefreshInterceptor])),
    provideAppInitializer(configurationInitializer())
  ]
})
  .catch((err) => console.error(err));
