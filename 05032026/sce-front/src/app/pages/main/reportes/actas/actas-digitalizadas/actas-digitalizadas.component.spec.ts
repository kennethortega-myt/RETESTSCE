import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActasDigitalizadasComponent } from './actas-digitalizadas.component';

describe('ActasDigitalizadasComponent', () => {
  let component: ActasDigitalizadasComponent;
  let fixture: ComponentFixture<ActasDigitalizadasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActasDigitalizadasComponent]
    });
    fixture = TestBed.createComponent(ActasDigitalizadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
