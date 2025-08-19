import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';

export interface UserGroupDto {
  id: number;
  groupName: string;
}

@Component({
  selector: 'app-usergroups-page',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxFormModule, DxPopupModule, DxTextBoxModule],
  templateUrl: './usergroups-page.component.html',
  styleUrls: ['./usergroups-page.component.scss'],
})
export class UserGroupsPageComponent implements OnInit {
  private api = inject(ApiService);

  groups: UserGroupDto[] = [];
  required = [{ type: 'required' }];

  ngOnInit(): void {
    this.loadGroups();
  }

  // ---------- data loader ----------
  private async loadGroups(): Promise<void> {
    try {
      const data = await firstValueFrom(this.api.get<UserGroupDto[]>('api/auth/usergroups'));
      this.groups = data ?? [];
    } catch (e: any) {
      notify(this.toMessage(e), 'error', 3500);
      this.groups = [];
    }
  }

  // ---------- grid events ----------
  onRowInserting(e: any) {
    e.cancel = true;
    const body = { groupName: (e.data?.groupName || '').trim() };

    e.promise = firstValueFrom(this.api.post<UserGroupDto>('api/auth/usergroups', body))
      .then((created) => {
        this.groups = [...this.groups, created];
        notify(`Group '${created.groupName}' created`, 'success', 2000);
        e.component.cancelEditData();
      })
      .catch((err) => {
        const msg = this.toMessage(err);
        notify(msg, 'error', 3500);
        throw msg;
      });
  }

  onRowUpdating(e: any) {
    e.cancel = true;
    const id: number = typeof e.key === 'object' ? e.key?.id : e.key;
    const v = e.newData ?? {};
    const body: any = {};
    if (v.groupName != null) body.groupName = (v.groupName || '').trim();

    e.promise = firstValueFrom(this.api.put<UserGroupDto>(`api/auth/usergroups/${id}`, body))
      .then((updated) => {
        const idx = this.groups.findIndex(g => g.id === id);
        if (idx >= 0) this.groups = [...this.groups.slice(0, idx), updated, ...this.groups.slice(idx + 1)];
        notify(`Group '${updated.groupName}' updated`, 'success', 2000);
        e.component.cancelEditData();
      })
      .catch((err) => {
        const msg = this.toMessage(err);
        notify(msg, 'error', 3500);
        throw msg;
      });
  }

  onRowRemoving(e: any) {
    e.cancel = true;
    const id: number = typeof e.key === 'object' ? e.key?.id : e.key;

    e.promise = firstValueFrom(this.api.delete<void>(`api/auth/usergroups/${id}`))
      .then(() => {
        this.groups = this.groups.filter(g => g.id !== id);
        notify('Group deleted', 'success', 2000);
      })
      .catch((err) => {
        const msg = this.toMessage(err);
        notify(msg, 'error', 3500); // 409 when group is in use
        throw msg;
      });
  }

  // ---------- error formatting ----------
  private toMessage(err: any): string {
    if (!err) return 'Operation failed.';
    if (typeof err === 'string') return err;
    const e = err.error ?? err;
    if (typeof e === 'string') return e;
    if (e?.message) return e.message;
    if (e?.title) return e.title;
    if (e?.errors) {
      try {
        const parts = Object.values(e.errors as Record<string, string[]>)
          .flat()
          .filter(Boolean);
        if (parts.length) return parts.join(' ');
      } catch {}
    }
    const status = err.status ? ` (${err.status}${err.statusText ? ' ' + err.statusText : ''})` : '';
    return 'Operation failed' + status + '.';
  }
}
