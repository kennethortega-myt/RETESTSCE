import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActasNoDevueltasComponent } from './actas-no-devueltas.component';

describe('ActasNoDevueltasComponent', () => {
  let component: ActasNoDevueltasComponent;
  let fixture: ComponentFixture<ActasNoDevueltasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActasNoDevueltasComponent]
    });
    fixture = TestBed.createComponent(ActasNoDevueltasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
