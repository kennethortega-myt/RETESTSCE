import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupObservacionesComponent } from './popup-observaciones.component';

describe('PopupObservacionesComponent', () => {
  let component: PopupObservacionesComponent;
  let fixture: ComponentFixture<PopupObservacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupObservacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupObservacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
