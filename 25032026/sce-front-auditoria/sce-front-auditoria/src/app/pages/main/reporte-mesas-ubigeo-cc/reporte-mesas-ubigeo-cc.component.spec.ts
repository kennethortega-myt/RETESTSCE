import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteMesasUbigeoCcComponent } from './reporte-mesas-ubigeo-cc.component';

describe('ReporteMesasUbigeoCcComponent', () => {
  let component: ReporteMesasUbigeoCcComponent;
  let fixture: ComponentFixture<ReporteMesasUbigeoCcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteMesasUbigeoCcComponent]
    });
    fixture = TestBed.createComponent(ReporteMesasUbigeoCcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
