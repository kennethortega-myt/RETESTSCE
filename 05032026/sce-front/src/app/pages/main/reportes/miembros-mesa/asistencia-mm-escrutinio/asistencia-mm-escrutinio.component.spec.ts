import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaMmEscrutinioComponent } from './asistencia-mm-escrutinio.component';

describe('AsistenciaMmEscrutinioComponent', () => {
  let component: AsistenciaMmEscrutinioComponent;
  let fixture: ComponentFixture<AsistenciaMmEscrutinioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaMmEscrutinioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaMmEscrutinioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
