import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoActasOdpeNacionComponent } from './estado-actas-odpe-nacion.component';

describe('EstadoActasOdpeNacionComponent', () => {
  let component: EstadoActasOdpeNacionComponent;
  let fixture: ComponentFixture<EstadoActasOdpeNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EstadoActasOdpeNacionComponent]
    });
    fixture = TestBed.createComponent(EstadoActasOdpeNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
