import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardResolucionesComponent } from './dashboard-resoluciones.component';

describe('DashboardResolucionesComponent', () => {
  let component: DashboardResolucionesComponent;
  let fixture: ComponentFixture<DashboardResolucionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardResolucionesComponent]
    });
    fixture = TestBed.createComponent(DashboardResolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
