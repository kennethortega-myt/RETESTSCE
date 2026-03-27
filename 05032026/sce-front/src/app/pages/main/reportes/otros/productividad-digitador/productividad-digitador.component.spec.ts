import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductividadDigitadorComponent } from './productividad-digitador.component';

describe('ProductividadDigitadorComponent', () => {
  let component: ProductividadDigitadorComponent;
  let fixture: ComponentFixture<ProductividadDigitadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductividadDigitadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductividadDigitadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
