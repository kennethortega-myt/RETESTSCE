import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGuardarComponent } from './modal-guardar.component';

describe('ModalGuardarComponent', () => {
  let component: ModalGuardarComponent;
  let fixture: ComponentFixture<ModalGuardarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalGuardarComponent]
    });
    fixture = TestBed.createComponent(ModalGuardarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
