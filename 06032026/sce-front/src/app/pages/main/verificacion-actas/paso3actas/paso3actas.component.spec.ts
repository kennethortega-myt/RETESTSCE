import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paso3actasComponent } from './paso3actas.component';

describe('Paso3actasComponent', () => {
  let component: Paso3actasComponent;
  let fixture: ComponentFixture<Paso3actasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Paso3actasComponent]
    });
    fixture = TestBed.createComponent(Paso3actasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
