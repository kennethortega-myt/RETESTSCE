import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenEstadoActasComponent } from './resumen-estado-actas.component';

describe('ResumenEstadoActasComponent', () => {
  let component: ResumenEstadoActasComponent;
  let fixture: ComponentFixture<ResumenEstadoActasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenEstadoActasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenEstadoActasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
