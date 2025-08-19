import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BaseGrid } from '@app/common/basegrid';
import { UserDto, UserGroupDto } from '@app/models/auth.models';
import { ApiService } from '@app/services/api.service';
import { DxButtonModule, DxDataGridModule, DxToolbarModule, DxSwitchModule, DxLoadPanelModule, DxPopupModule, DxSelectBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { firstValueFrom } from 'rxjs';
import validationEngine from 'devextreme/ui/validation_engine';
import type TextBox from 'devextreme/ui/text_box';

@Component({
  selector: 'app-user-page2-page',
    imports: [CommonModule, DxButtonModule, DxDataGridModule, DxToolbarModule, DxSwitchModule, 
              DxLoadPanelModule, DxPopupModule, 
              DxSelectBoxModule],
  templateUrl: './user-page2-page.component.html',
  styleUrl: './user-page2-page.component.scss'
})
export class UserPage2PageComponent extends BaseGrid<UserDto> implements OnInit{
  users: UserDto[] = [];
  userGroups: UserGroupDto[] = [];
  caption = 'Users';
  required = [{ type: 'required', message: 'Required' }];

  passwordRequired = false; 
  passwordMasked = true;
  private passwordEditor?: TextBox;
  page = 1;
  pageSize = 25;

  readonly passwordEditorOptions: any = {
    // Use "text" + CSS-like masking to avoid Chrome password heuristics
    mode: 'text',
    showClearButton: true,
    inputAttr: {
      autocomplete: 'off',      // stop Chrome manager
      name: 'pw_field',         // avoid "password"/"new-password"
      autocorrect: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
      'data-lpignore': 'true',
      'data-1p-ignore': 'true',
      'data-bwignore': 'true'
    },
    buttons: [{
      name: 'reveal',
      location: 'after',
      options: {
        icon: 'eyeopen',
        stylingMode: 'text',
        hint: 'Show password',
        onClick: () => this.togglePasswordMask()
      }
    }],
    onInitialized: (e: any) => {
      this.passwordEditor = e.component as TextBox;
      // apply mask after the input exists
      setTimeout(() => this.applyPasswordMask(), 0);
    }
  };

  constructor(){
    super();
    this.entityEndpoint = 'OneDriveFile';
    this.entityName = 'VibQueueFile';
    this.recordIdField = "fileName";

    this.showColumnLinesSwitch=true;
    this.showGridCaption=true;
    this.showAddButton=true;
  } 

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
      notify(this.api.toMessage(e), 'error', 3500);
      this.users = [];
    }
  }

  private async loadUserGroups(): Promise<void> {
    try {
      const groups = await firstValueFrom(this.api.get<UserGroupDto[]>('api/auth/usergroups'));
      this.userGroups = groups ?? [];
    } catch (e: any) {
      notify(this.api.toMessage(e), 'error', 3500);
      this.userGroups = [];
    }
  }
    // ---------- grid events ----------


  onInitNewRow(e: any) {
    this.passwordRequired = true;  // required on create
    this.passwordMasked = true;
    this.loadUserGroups();         // refresh list just-in-time
    e.data = e.data || {};
    e.data.usergroupId = null; // no default selection
  }

  EditRecord(e: any) {
    const rowIndex = e.rowIndex;
    this.passwordMasked = true;
    this.gridx.instance.editRow(rowIndex);
   }
  public override addRecord(e: any): void {
    this.gridx.instance.addRow();
  }
   override refresh(e: any): void {
    this.loadUsers();
    this.loadUserGroups();
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
        const msg = this.api.toMessage(err);
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
        const msg = this.api.toMessage(err);
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
        const msg = this.api.toMessage(err);
        notify(msg, 'error', 3500);
        throw msg;
      });
  }
  onSaving(e: any) {
    const res = validationEngine.validateGroup('userFormGroup');
    if (!res.isValid) {
      e.cancel = true; // keep the popup open
    }
  }
  // ---------- row action buttons ----------
  async onDeactivate(e: any) {
    const row: UserDto = e?.data;
    console.log('user-page2-page.component ==> onDeactivate', e);
    if (!row) return;

    try {
      await firstValueFrom(this.api.post<void>(`api/auth/users/${row.id}/deactivate`, {}));
      this.users = this.users.map(u => u.id === row.id ? { ...u, isActive: false } : u);
      notify(`User '${row.username}' deactivated`, 'success', 2000);
      e.component.refresh();
    } catch (err: any) {
      notify(this.api.toMessage(err), 'error', 3500);
    }
  }

  async onClearLockout(e: any) {
    const row: UserDto = e?.data;
    console.log('user-page2-page.component ==> onClearLockout', e);
    if (!row) return;

    try {
      await firstValueFrom(this.api.post<void>(`api/auth/users/${row.id}/clear-lockout`, {}));
      notify(`Lockout cleared for '${row.username}'`, 'success', 2000);
      e.component.refresh();
    } catch (err: any) {
      notify(this.api.toMessage(err), 'error', 3500);
    }
  }

  async onLogoutAllDevices(e: any) {
    const row: UserDto =e?.data;
    console.log('user-page2-page.component ==> onLogoutAllDevices', e);
    if (!row) return;

    try {
      await firstValueFrom(this.api.post<void>(`api/auth/users/${row.id}/logout-all-devices`, {}));
      notify(`All sessions revoked for '${row.username}'`, 'success', 2000);
    } catch (err: any) {
      notify(this.api.toMessage(err), 'error', 3500);
    }
  }
  // --- internal helpers ---
  private onPasswordEditorInit(e: any) {
    this.passwordEditor = e.component as TextBox;
    this.applyPasswordMask(); // apply initial CSS mask & icon
  }

  private togglePasswordMask() {
    this.passwordMasked = !this.passwordMasked;
    this.applyPasswordMask();
  }

  private applyPasswordMask() {
    if (!this.passwordEditor) return;
    const rootEl = this.passwordEditor.element?.() as HTMLElement | undefined;
    if (!rootEl) return;

    const input = rootEl.querySelector('input.dx-texteditor-input') as HTMLInputElement | null;
    if (input) {
      // Directly set style so it always applies (no ::ng-deep needed)
      (input.style as any).webkitTextSecurity = this.passwordMasked ? 'disc' : 'none';
      (input.style as any).textSecurity = this.passwordMasked ? 'disc' : 'none';
    }

    // Update the eye button icon/hint
    const btn = (this.passwordEditor as any).getButton?.('reveal');
    if (btn) {
      btn.option({
        icon: this.passwordMasked ? 'eyeopen' : 'eyeclose',
        hint: this.passwordMasked ? 'Show password' : 'Hide password'
      });
    }
  }
}


