import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalobservacionComponent } from './modalobservacion.component';

describe('ModalobservacionComponent', () => {
  let component: ModalobservacionComponent;
  let fixture: ComponentFixture<ModalobservacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalobservacionComponent]
    });
    fixture = TestBed.createComponent(ModalobservacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
