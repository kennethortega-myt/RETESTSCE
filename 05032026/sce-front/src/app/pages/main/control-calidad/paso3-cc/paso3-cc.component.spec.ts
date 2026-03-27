import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paso3CcComponent } from './paso3-cc.component';

describe('Paso3CcComponent', () => {
  let component: Paso3CcComponent;
  let fixture: ComponentFixture<Paso3CcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paso3CcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paso3CcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
