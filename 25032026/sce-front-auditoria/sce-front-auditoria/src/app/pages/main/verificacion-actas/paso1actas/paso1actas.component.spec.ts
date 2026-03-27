import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paso1actasComponent } from './paso1actas.component';

describe('Paso1actasComponent', () => {
  let component: Paso1actasComponent;
  let fixture: ComponentFixture<Paso1actasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Paso1actasComponent]
    });
    fixture = TestBed.createComponent(Paso1actasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
