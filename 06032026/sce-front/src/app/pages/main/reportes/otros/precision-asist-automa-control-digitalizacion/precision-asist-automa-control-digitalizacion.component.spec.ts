import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecisionAsistAutomaControlDigitalizacionComponent } from './precision-asist-automa-control-digitalizacion.component';

describe('PrecisionAsistAutomaControlDigitalizacionComponent', () => {
  let component: PrecisionAsistAutomaControlDigitalizacionComponent;
  let fixture: ComponentFixture<PrecisionAsistAutomaControlDigitalizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrecisionAsistAutomaControlDigitalizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrecisionAsistAutomaControlDigitalizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
