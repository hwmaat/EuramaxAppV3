import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserDto, UserGroupDto } from '@app/models/auth.models';



@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    DxFormModule,
    DxPopupModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxTextBoxModule,
  ],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss'],
})
export class UsersPageComponent implements OnInit {
  private api = inject(ApiService);

  users: UserDto[] = [];
  userGroups: UserGroupDto[] = [];

  required = [{ type: 'required' }];
  passwordRequired = false;

  ngOnInit(): void {
    this.loadUserGroups();
    this.loadUsers();
  }

  // ---------- data loaders ----------
  private async loadUsers(): Promise<void> {
    try {
      const data = await firstValueFrom(this.api.get<UserDto[]>('api/auth/users'));
      this.users = data ?? [];
    } catch (e: any) {
      notify(this.toMessage(e), 'error', 3500);
      this.users = [];
    }
  }

  private async loadUserGroups(): Promise<void> {
    try {
      const groups = await firstValueFrom(this.api.get<UserGroupDto[]>('api/auth/usergroups'));
      this.userGroups = groups ?? [];
    } catch (e: any) {
      notify(this.toMessage(e), 'error', 3500);
      this.userGroups = [];
    }
  }

  // ---------- grid events ----------
  onInitNewRow(e: any) {
    this.passwordRequired = true;  // required on create
    this.loadUserGroups();         // refresh list just-in-time
    e.data = e.data || {};
    e.data.usergroupId = null; // no default selection

  }

  onGroupSelectOpened = (e: any) => {
  // Ensure dropdown lists all items even if input shows 'admin'
  e.component.option('searchValue', '');
};

  onEditingStart(e: any) {
    this.passwordRequired = false; // optional on edit
    this.loadUserGroups();         // refresh list just-in-time
  }

  async onRowInserting(e: any) {
    e.cancel = true;
    const body: any = {
      username: (e.data?.username || '').trim().toLowerCase(),
      firstname: (e.data?.firstname || '').trim(),
      lastname: (e.data?.lastname || '').trim(),
      usergroupId: e.data?.usergroupId,
      password: e.data?.password,
    };

    e.promise = firstValueFrom(this.api.post<UserDto>('api/auth/users', body))
      .then((created) => {
        this.users = [...this.users, created];
        notify(`User '${created.username}' created`, 'success', 2000);
        e.component.cancelEditData(); // close popup
      })
      .catch((err) => {
        const msg = this.toMessage(err);
        notify(msg, 'error', 3500);
        throw msg;
      });
  }

  async onRowUpdating(e: any) {
    e.cancel = true;
    const id: number = typeof e.key === 'object' ? e.key?.id : e.key;
    const v = e.newData ?? {};
    const body: any = {};
    if (v.username     != null) body.username    = (v.username  || '').trim().toLowerCase();
    if (v.firstname    != null) body.firstname   = (v.firstname || '').trim();
    if (v.lastname     != null) body.lastname    = (v.lastname  || '').trim();
    if (v.usergroupId  != null) body.usergroupId = +v.usergroupId;
    if (v.isActive     != null) body.isActive    = !!v.isActive;
    if (v.password)             body.password    = v.password;

    e.promise = firstValueFrom(this.api.put<UserDto>(`api/auth/users/${id}`, body))
      .then((updated) => {
        const idx = this.users.findIndex(u => u.id === id);
        if (idx >= 0) this.users = [...this.users.slice(0, idx), updated, ...this.users.slice(idx + 1)];
        notify(`User '${updated.username}' updated`, 'success', 2000);
        e.component.cancelEditData();
      })
      .catch((err) => {
        const msg = this.toMessage(err);
        notify(msg, 'error', 3500);
        throw msg;
      });
  }

  async onRowRemoving(e: any) {
    e.cancel = true;
    const id: number = typeof e.key === 'object' ? e.key?.id : e.key;

    e.promise = firstValueFrom(this.api.delete<void>(`api/auth/users/${id}`))
      .then(() => {
        this.users = this.users.filter(u => u.id !== id);
        notify('User deleted', 'success', 2000);
      })
      .catch((err) => {
        const msg = this.toMessage(err);
        notify(msg, 'error', 3500);
        throw msg;
      });
  }

  // ---------- row action buttons ----------
  async onDeactivate(e: any) {
    const row: UserDto = e?.row?.data;
    if (!row) return;

    try {
      await firstValueFrom(this.api.post<void>(`api/auth/users/${row.id}/deactivate`, {}));
      this.users = this.users.map(u => u.id === row.id ? { ...u, isActive: false } : u);
      notify(`User '${row.username}' deactivated`, 'success', 2000);
      e.component.refresh();
    } catch (err: any) {
      notify(this.toMessage(err), 'error', 3500);
    }
  }

  async onClearLockout(e: any) {
    const row: UserDto = e?.row?.data;
    if (!row) return;

    try {
      await firstValueFrom(this.api.post<void>(`api/auth/users/${row.id}/clear-lockout`, {}));
      notify(`Lockout cleared for '${row.username}'`, 'success', 2000);
      e.component.refresh();
    } catch (err: any) {
      notify(this.toMessage(err), 'error', 3500);
    }
  }

  async onLogoutAllDevices(e: any) {
    const row: UserDto = e?.row?.data;
    if (!row) return;

    try {
      await firstValueFrom(this.api.post<void>(`api/auth/users/${row.id}/logout-all-devices`, {}));
      notify(`All sessions revoked for '${row.username}'`, 'success', 2000);
    } catch (err: any) {
      notify(this.toMessage(err), 'error', 3500);
    }
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

private toMessage(err: any): string {
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
