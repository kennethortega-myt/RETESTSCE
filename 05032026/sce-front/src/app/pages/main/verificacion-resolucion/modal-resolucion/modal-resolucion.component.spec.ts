import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalResolucionComponent } from './modal-resolucion.component';

describe('ModalResolucionComponent', () => {
  let component: ModalResolucionComponent;
  let fixture: ComponentFixture<ModalResolucionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalResolucionComponent]
    });
    fixture = TestBed.createComponent(ModalResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
