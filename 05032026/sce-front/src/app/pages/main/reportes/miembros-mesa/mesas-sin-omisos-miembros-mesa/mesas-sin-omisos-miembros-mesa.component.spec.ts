import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesasSinOmisosMiembrosMesaComponent } from './mesas-sin-omisos-miembros-mesa.component';

describe('MesasSinOmisosMiembrosMesaComponent', () => {
  let component: MesasSinOmisosMiembrosMesaComponent;
  let fixture: ComponentFixture<MesasSinOmisosMiembrosMesaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesasSinOmisosMiembrosMesaComponent]
    });
    fixture = TestBed.createComponent(MesasSinOmisosMiembrosMesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
