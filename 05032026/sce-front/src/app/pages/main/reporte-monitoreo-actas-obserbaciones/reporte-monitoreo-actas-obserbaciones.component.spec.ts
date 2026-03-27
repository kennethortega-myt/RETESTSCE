import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteMonitoreoActasObserbacionesComponent } from './reporte-monitoreo-actas-obserbaciones.component';

describe('ReporteMonitoreoActasObserbacionesComponent', () => {
  let component: ReporteMonitoreoActasObserbacionesComponent;
  let fixture: ComponentFixture<ReporteMonitoreoActasObserbacionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteMonitoreoActasObserbacionesComponent]
    });
    fixture = TestBed.createComponent(ReporteMonitoreoActasObserbacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
