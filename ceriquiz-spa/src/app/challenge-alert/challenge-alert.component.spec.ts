import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeAlertComponent } from './challenge-alert.component';

describe('ChallengeAlertComponent', () => {
  let component: ChallengeAlertComponent;
  let fixture: ComponentFixture<ChallengeAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChallengeAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
