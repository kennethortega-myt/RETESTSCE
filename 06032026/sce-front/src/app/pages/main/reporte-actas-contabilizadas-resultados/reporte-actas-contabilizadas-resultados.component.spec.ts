import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteActasContabilizadasResultadosComponent } from './reporte-actas-contabilizadas-resultados.component';

describe('ReporteActasContabilizadasResultadosComponent', () => {
  let component: ReporteActasContabilizadasResultadosComponent;
  let fixture: ComponentFixture<ReporteActasContabilizadasResultadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteActasContabilizadasResultadosComponent]
    });
    fixture = TestBed.createComponent(ReporteActasContabilizadasResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
