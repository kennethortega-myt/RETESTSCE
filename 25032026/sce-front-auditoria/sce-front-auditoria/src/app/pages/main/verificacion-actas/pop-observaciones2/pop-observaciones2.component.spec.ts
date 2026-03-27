import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopObservaciones2Component } from './pop-observaciones2.component';

describe('PopObservaciones2Component', () => {
  let component: PopObservaciones2Component;
  let fixture: ComponentFixture<PopObservaciones2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopObservaciones2Component]
    });
    fixture = TestBed.createComponent(PopObservaciones2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
