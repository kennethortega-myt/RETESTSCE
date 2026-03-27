import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalizacionComponent } from './digitalizacion.component';

describe('DigitalizacionComponent', () => {
  let component: DigitalizacionComponent;
  let fixture: ComponentFixture<DigitalizacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DigitalizacionComponent]
    });
    fixture = TestBed.createComponent(DigitalizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
