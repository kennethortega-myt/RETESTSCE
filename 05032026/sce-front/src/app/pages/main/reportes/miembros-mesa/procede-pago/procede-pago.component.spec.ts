import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedePagoComponent } from './procede-pago.component';

describe('AvanceComponent', () => {
  let component: ProcedePagoComponent;
  let fixture: ComponentFixture<ProcedePagoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcedePagoComponent]
    });
    fixture = TestBed.createComponent(ProcedePagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
