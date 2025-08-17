import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DxTreeViewModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { menuItems } from '@app/menu-items';

@Component({
  selector: 'side-menu',
  standalone: true,
  imports: [CommonModule, DxTreeViewModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  @Output() menuItemClick = new EventEmitter<any>();
  menuItems = menuItems;

  onMenuItemClick(event: any) {
    this.menuItemClick.emit(event);
  }
}
