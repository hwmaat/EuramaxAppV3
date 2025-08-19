
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
import { globalErrorInterceptor } from '@app/services/global-error.interceptor.ts';
import DataGrid from 'devextreme/ui/data_grid';

config({ licenseKey });

    DataGrid.defaultOptions({
      options: {
        allowColumnReordering: true,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: false,
        showColumnLines: false,
        rowAlternationEnabled: true,
        columnAutoWidth: true,
        hoverStateEnabled:true,
        focusedRowEnabled:true,
        columnHidingEnabled: true,
        selection: { mode: 'single' },
        paging: { enabled: false, pageSize: 15 },
        pager: {
          visible: false, showNavigationButtons: true,
          showPageSizeSelector: true, allowedPageSizes: [5, 10, 15, 20, 25, 100],
          showInfo: true
        },
        editing: { mode: 'cell', allowUpdating: false, allowDeleting: false, allowAdding: false},
        sorting: { mode: 'multiple' },
        grouping: { contextMenuEnabled: true},
        columnChooser: { enabled: false, mode: 'dragAndDrop' },
        columnFixing: { enabled: true },
        searchPanel: { visible: true },
        groupPanel: { visible: true },
        focusedRowIndex: 0,
        
        scrolling: {mode: 'standard'},
        export: {enabled: false, allowExportSelectedData:true}
      }
    } );

export function configurationInitializer(): () => Promise<void> {
  return async () => {
    const globals = inject(Globals);
    // Determine initial environment mode
    const initialMode = environment.production ? 'prod' : 'dev';
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
    provideHttpClient(withInterceptors([authTokenInterceptor,authRefreshInterceptor, globalErrorInterceptor])),
    provideAppInitializer(configurationInitializer())
  ]
})
  .catch((err) => console.error(err));
