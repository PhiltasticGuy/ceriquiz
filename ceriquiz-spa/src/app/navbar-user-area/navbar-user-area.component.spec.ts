import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarUserAreaComponent } from './navbar-user-area.component';

describe('NavbarUserAreaComponent', () => {
  let component: NavbarUserAreaComponent;
  let fixture: ComponentFixture<NavbarUserAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavbarUserAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarUserAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
