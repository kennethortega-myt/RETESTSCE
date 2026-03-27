import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteMonitoreoActasComponent } from './reporte-monitoreo-actas.component';

describe('ReporteMonitoreoActasComponent', () => {
  let component: ReporteMonitoreoActasComponent;
  let fixture: ComponentFixture<ReporteMonitoreoActasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteMonitoreoActasComponent]
    });
    fixture = TestBed.createComponent(ReporteMonitoreoActasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
