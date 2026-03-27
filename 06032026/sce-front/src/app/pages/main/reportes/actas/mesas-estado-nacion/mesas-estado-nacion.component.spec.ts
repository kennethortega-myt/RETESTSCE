import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesasEstadoNacionComponent } from './mesas-estado-nacion.component';

describe('MesasEstadoNacionComponent', () => {
  let component: MesasEstadoNacionComponent;
  let fixture: ComponentFixture<MesasEstadoNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesasEstadoNacionComponent]
    });
    fixture = TestBed.createComponent(MesasEstadoNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
