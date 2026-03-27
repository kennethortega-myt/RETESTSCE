import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoActasOdpeComponent } from './estado-actas-odpe.component';

describe('EstadoActasOdpeComponent', () => {
  let component: EstadoActasOdpeComponent;
  let fixture: ComponentFixture<EstadoActasOdpeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EstadoActasOdpeComponent]
    });
    fixture = TestBed.createComponent(EstadoActasOdpeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
