import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardHojasAsistenciaComponent } from './dashboard-hojas-asistencia.component';

describe('DashboardHojasAsistenciaComponent', () => {
  let component: DashboardHojasAsistenciaComponent;
  let fixture: ComponentFixture<DashboardHojasAsistenciaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardHojasAsistenciaComponent]
    });
    fixture = TestBed.createComponent(DashboardHojasAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
