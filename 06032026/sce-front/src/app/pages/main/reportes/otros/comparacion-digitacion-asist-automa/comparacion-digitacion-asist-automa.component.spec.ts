import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparacionDigitacionAsistAutomaComponent } from './comparacion-digitacion-asist-automa.component';

describe('ComparacionDigitacionAsistAutomaComponent', () => {
  let component: ComparacionDigitacionAsistAutomaComponent;
  let fixture: ComponentFixture<ComparacionDigitacionAsistAutomaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparacionDigitacionAsistAutomaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparacionDigitacionAsistAutomaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
