import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionDatosActaComponent } from './seccion-datos-acta.component';

describe('SeccionDatosActaComponent', () => {
  let component: SeccionDatosActaComponent;
  let fixture: ComponentFixture<SeccionDatosActaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionDatosActaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeccionDatosActaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
