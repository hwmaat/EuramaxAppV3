import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPage2PageComponent } from './user-page2-page.component';

describe('UserPage2PageComponent', () => {
  let component: UserPage2PageComponent;
  let fixture: ComponentFixture<UserPage2PageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPage2PageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPage2PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
