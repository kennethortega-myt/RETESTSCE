import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalActaComponent } from './modal-acta.component';

describe('ModalActaComponent', () => {
  let component: ModalActaComponent;
  let fixture: ComponentFixture<ModalActaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalActaComponent]
    });
    fixture = TestBed.createComponent(ModalActaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
