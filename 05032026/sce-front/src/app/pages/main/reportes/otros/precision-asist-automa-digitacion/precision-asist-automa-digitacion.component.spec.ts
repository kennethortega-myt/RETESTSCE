import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecisionAsistAutomaDigitacionComponent } from './precision-asist-automa-digitacion.component';

describe('PrecisionAsistAutomaDigitacionComponent', () => {
  let component: PrecisionAsistAutomaDigitacionComponent;
  let fixture: ComponentFixture<PrecisionAsistAutomaDigitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrecisionAsistAutomaDigitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrecisionAsistAutomaDigitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
