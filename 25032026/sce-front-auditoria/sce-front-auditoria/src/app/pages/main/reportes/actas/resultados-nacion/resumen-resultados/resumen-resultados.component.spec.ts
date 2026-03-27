import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenResultadosComponent } from './resumen-resultados.component';

describe('ResumenResultadosComponent', () => {
  let component: ResumenResultadosComponent;
  let fixture: ComponentFixture<ResumenResultadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResumenResultadosComponent]
    });
    fixture = TestBed.createComponent(ResumenResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
