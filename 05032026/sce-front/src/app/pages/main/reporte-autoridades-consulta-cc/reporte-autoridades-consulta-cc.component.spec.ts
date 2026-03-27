import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAutoridadesConsultaCcComponent } from './reporte-autoridades-consulta-cc.component';

describe('ReporteAutoridadesConsultaCcComponent', () => {
  let component: ReporteAutoridadesConsultaCcComponent;
  let fixture: ComponentFixture<ReporteAutoridadesConsultaCcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteAutoridadesConsultaCcComponent]
    });
    fixture = TestBed.createComponent(ReporteAutoridadesConsultaCcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
