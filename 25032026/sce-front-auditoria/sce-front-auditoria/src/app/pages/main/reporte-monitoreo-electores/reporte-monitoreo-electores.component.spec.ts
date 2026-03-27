import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteMonitoreoElectoresComponent } from './reporte-monitoreo-electores.component';

describe('ReporteMonitoreoElectoresComponent', () => {
  let component: ReporteMonitoreoElectoresComponent;
  let fixture: ComponentFixture<ReporteMonitoreoElectoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteMonitoreoElectoresComponent]
    });
    fixture = TestBed.createComponent(ReporteMonitoreoElectoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
