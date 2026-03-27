import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalfinalizacionComponent } from './modalfinalizacion.component';

describe('ModalfinalizacionComponent', () => {
  let component: ModalfinalizacionComponent;
  let fixture: ComponentFixture<ModalfinalizacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalfinalizacionComponent]
    });
    fixture = TestBed.createComponent(ModalfinalizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
