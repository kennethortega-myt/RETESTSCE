import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiembrosMesaActaEscrutinioComponent } from './miembros-mesa-acta-escrutinio.component';

describe('AvanceComponent', () => {
  let component: MiembrosMesaActaEscrutinioComponent;
  let fixture: ComponentFixture<MiembrosMesaActaEscrutinioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MiembrosMesaActaEscrutinioComponent]
    });
    fixture = TestBed.createComponent(MiembrosMesaActaEscrutinioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
