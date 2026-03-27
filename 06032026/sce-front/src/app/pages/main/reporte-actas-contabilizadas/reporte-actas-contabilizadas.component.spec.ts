import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteActasContabilizadasComponent } from './reporte-actas-contabilizadas.component';

describe('ReporteActasContabilizadasComponent', () => {
  let component: ReporteActasContabilizadasComponent;
  let fixture: ComponentFixture<ReporteActasContabilizadasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteActasContabilizadasComponent]
    });
    fixture = TestBed.createComponent(ReporteActasContabilizadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
