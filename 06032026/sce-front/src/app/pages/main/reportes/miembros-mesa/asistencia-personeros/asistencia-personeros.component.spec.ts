import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaPersonerosComponent } from './asistencia-personeros.component';

describe('AsistenciaPersonerosComponent', () => {
  let component: AsistenciaPersonerosComponent;
  let fixture: ComponentFixture<AsistenciaPersonerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaPersonerosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaPersonerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
