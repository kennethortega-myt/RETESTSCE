import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaMiembroMesaComponent } from './asistencia-miembro-mesa.component';

describe('AsistenciaMiembroMesaComponent', () => {
  let component: AsistenciaMiembroMesaComponent;
  let fixture: ComponentFixture<AsistenciaMiembroMesaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaMiembroMesaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaMiembroMesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
