import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteOrganizacionesPoliticasCcComponent } from './reporte-organizaciones-politicas-cc.component';

describe('ReporteOrganizacionesPoliticasCcComponent', () => {
  let component: ReporteOrganizacionesPoliticasCcComponent;
  let fixture: ComponentFixture<ReporteOrganizacionesPoliticasCcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteOrganizacionesPoliticasCcComponent]
    });
    fixture = TestBed.createComponent(ReporteOrganizacionesPoliticasCcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
