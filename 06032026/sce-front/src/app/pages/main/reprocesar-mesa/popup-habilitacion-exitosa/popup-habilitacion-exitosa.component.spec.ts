import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupHabilitacionExitosaComponent } from './popup-habilitacion-exitosa.component';

describe('PopupHabilitacionExitosaComponent', () => {
  let component: PopupHabilitacionExitosaComponent;
  let fixture: ComponentFixture<PopupHabilitacionExitosaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupHabilitacionExitosaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupHabilitacionExitosaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
