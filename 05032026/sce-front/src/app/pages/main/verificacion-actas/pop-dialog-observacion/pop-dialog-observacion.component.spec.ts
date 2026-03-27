import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopDialogObservacionComponent } from './pop-dialog-observacion.component';

describe('PopDialogObservacionComponent', () => {
  let component: PopDialogObservacionComponent;
  let fixture: ComponentFixture<PopDialogObservacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopDialogObservacionComponent]
    });
    fixture = TestBed.createComponent(PopDialogObservacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
