import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardActasComponent } from './dashboard-actas.component';

describe('DashboardActasComponent', () => {
  let component: DashboardActasComponent;
  let fixture: ComponentFixture<DashboardActasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardActasComponent]
    });
    fixture = TestBed.createComponent(DashboardActasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
