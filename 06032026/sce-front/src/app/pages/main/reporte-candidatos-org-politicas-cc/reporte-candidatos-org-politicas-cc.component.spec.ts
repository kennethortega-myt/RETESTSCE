import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteCandidatosOrgPoliticasCcComponent } from './reporte-candidatos-org-politicas-cc.component';

describe('ReporteCandidatosOrgPoliticasCcComponent', () => {
  let component: ReporteCandidatosOrgPoliticasCcComponent;
  let fixture: ComponentFixture<ReporteCandidatosOrgPoliticasCcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteCandidatosOrgPoliticasCcComponent]
    });
    fixture = TestBed.createComponent(ReporteCandidatosOrgPoliticasCcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
