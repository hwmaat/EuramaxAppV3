import { Injectable, effect, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, filter } from 'rxjs';
import { Globals } from '@app/services/globals.service';
import { IAppConfig } from '@app/models/app-config.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private globals = inject(Globals);

  private baseUrl$ = new BehaviorSubject<string>('');

  constructor() {
    // Pick up apiBaseUrl from runtime settings (Globals)
    // this.globals.settings$
    //   .pipe(filter((s: IAppConfig | null | undefined) => !!s?.apiBaseUrl))
    //   .subscribe((settings: IAppConfig | null | undefined) => {
    //     const url = (settings?.apiBaseUrl ?? '').replace(/\/+$/, ''); // trim trailing slash
    //     this.baseUrl$.next(url);
    //   });

    // Drive baseUrl$ from the Globals signal
    effect(() => {
      const url = this.globals.apiBaseUrl();
      if (url) {
        this.baseUrl$.next(url);
      }
    }); 
  }

  // ------- helpers -------

  private buildUrl(endpoint: string): string {
    const base = this.baseUrl$.value || '';
    const ep = endpoint.replace(/^\/+/, ''); // trim leading slash
    return `${base}/${ep}`;
  }

  private buildParams(spParams?: Map<string, string>): HttpParams {
    let params = new HttpParams();
    if (spParams) {
      for (const [k, v] of spParams.entries()) {
        params = params.set(k, v);
      }
    }
    return params;
  }

  // ------- verbs -------

  get<T>(endpoint: string, spParams?: Map<string, string>) {
    return this.http.get<T>(this.buildUrl(endpoint), {
      params: this.buildParams(spParams)
    });
  }

  post<T>(endpoint: string, body: any, spParams?: Map<string, string>, options?: { headers?: HttpHeaders }) {
    return this.http.post<T>(this.buildUrl(endpoint), body, {
      params: this.buildParams(spParams),
      headers: options?.headers
    });
  }

  put<T>(endpoint: string, body: any, spParams?: Map<string, string>, options?: { headers?: HttpHeaders }) {
    return this.http.put<T>(this.buildUrl(endpoint), body, {
      params: this.buildParams(spParams),
      headers: options?.headers
    });
  }

  delete<T>(endpoint: string, spParams?: Map<string, string>, options?: { headers?: HttpHeaders }) {
    return this.http.delete<T>(this.buildUrl(endpoint), {
      params: this.buildParams(spParams),
      headers: options?.headers
    });
  }

    // ---------- error formatting ----------
  private getErrorsArray(err: any): string[] {
    const e = err?.error ?? err;
    const errors = e?.errors;
    const list: string[] = [];

    if (errors && typeof errors === 'object') {
      for (const [field, msgs] of Object.entries(errors as Record<string, any>)) {
        const arr = Array.isArray(msgs) ? msgs : [msgs];
        for (const m of arr) {
          const msg = typeof m === 'string' ? m : JSON.stringify(m);
          // Show "Field: message" when field name is meaningful
          list.push(field ? `${field}: ${msg}` : msg);
        }
      }
    }
    return list;
  }

  toMessage(err: any): string {
    const arr = this.getErrorsArray(err);
    if (arr.length) return arr.join('\n');

    const e = err?.error ?? err;
    if (typeof e === 'string') return e;
    if (e?.message) return e.message;
    if (e?.title) return e.title;

    const status = err?.status ? ` (${err.status}${err.statusText ? ' ' + err.statusText : ''})` : '';
    return 'Operation failed' + status + '.';
  }
}
