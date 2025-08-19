import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DxDrawerModule } from 'devextreme-angular';
import { DxTemplateModule } from 'devextreme-angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';


@Component({
  selector: 'app-apppage',
  imports: [CommonModule, RouterOutlet,HeaderComponent, FooterComponent, SideMenuComponent, 
    DxDrawerModule, DxTemplateModule],
  templateUrl: './apppage.component.html',
  styleUrl: './apppage.component.scss'
})
export class ApppageComponent  implements OnInit  {
  themeService = inject(ThemeService);
  router = inject(Router);
  isDrawerOpen = true;
  title = 'EuramaxAppV3';
  text = "sdfsdf sd fsdf sd fsdf";


  ngOnInit(): void {

  }
  onMenuItemClick(e: any) {
  const item = e.itemData;
  if (item.path !== undefined) {
    this.router.navigateByUrl(item.path);
  }
}
  toggleDrawer():void { 
    this.isDrawerOpen = !this.isDrawerOpen;
  }
}
