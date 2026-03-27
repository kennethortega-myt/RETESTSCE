import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosNacionComponent } from './resultados-nacion.component';

describe('ResultadosNacionComponent', () => {
  let component: ResultadosNacionComponent;
  let fixture: ComponentFixture<ResultadosNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResultadosNacionComponent]
    });
    fixture = TestBed.createComponent(ResultadosNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
