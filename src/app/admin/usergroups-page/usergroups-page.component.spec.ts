import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsergroupsPageComponent } from './usergroups-page.component';

describe('UsergroupsPageComponent', () => {
  let component: UsergroupsPageComponent;
  let fixture: ComponentFixture<UsergroupsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsergroupsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsergroupsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
