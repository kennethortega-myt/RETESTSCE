import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paso2CcComponent } from './paso2-cc.component';

describe('Paso2CcComponent', () => {
  let component: Paso2CcComponent;
  let fixture: ComponentFixture<Paso2CcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paso2CcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paso2CcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
