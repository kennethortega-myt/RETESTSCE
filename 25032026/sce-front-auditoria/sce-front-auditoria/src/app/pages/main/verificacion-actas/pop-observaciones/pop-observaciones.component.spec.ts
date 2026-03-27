import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopObservacionesComponent } from './pop-observaciones.component';

describe('PopObservacionesComponent', () => {
  let component: PopObservacionesComponent;
  let fixture: ComponentFixture<PopObservacionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopObservacionesComponent]
    });
    fixture = TestBed.createComponent(PopObservacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
