import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolucionesDevueltasComponent } from './resoluciones-devueltas.component';

describe('ResolucionesDevueltasComponent', () => {
  let component: ResolucionesDevueltasComponent;
  let fixture: ComponentFixture<ResolucionesDevueltasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolucionesDevueltasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolucionesDevueltasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
