import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReporteComponent } from './modal-reporte.component';

describe('ModalReporteComponent', () => {
  let component: ModalReporteComponent;
  let fixture: ComponentFixture<ModalReporteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalReporteComponent]
    });
    fixture = TestBed.createComponent(ModalReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
