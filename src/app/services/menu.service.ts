// app/layout/menu.service.ts  (new file; adjust path to your structure)
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '@app/services/auth.service';
import { MenuItem, menuItems } from '@app/menu-items'; // adjust import if needed

@Injectable({ providedIn: 'root' })
export class MenuService {
  private auth = inject(AuthService);

  // Recompute whenever user’s groups change
  filteredMenuItems$ = this.auth.currentUserGroups$.pipe(
    map(() => this.filterMenuItems(menuItems))
  );

  private filterMenuItems(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => this.hasAccess(item))
      .map(item => ({
        ...item,
        items: item.items ? this.filterMenuItems(item.items) : undefined
      }))
      .filter(item => !item.items || item.items.length > 0); // remove empty parents
  }

  private hasAccess(item: MenuItem): boolean {
    // If no access is defined, allow
    if (!item.access || item.access.length === 0) {
      return true;
    }
    return this.auth.hasAccess(item.access);
  }
}
