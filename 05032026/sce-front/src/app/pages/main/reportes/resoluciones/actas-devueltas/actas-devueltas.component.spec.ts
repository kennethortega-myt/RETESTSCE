import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActasDevueltasComponent } from './actas-devueltas.component';

describe('ActasDevueltasComponent', () => {
  let component: ActasDevueltasComponent;
  let fixture: ComponentFixture<ActasDevueltasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActasDevueltasComponent]
    });
    fixture = TestBed.createComponent(ActasDevueltasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
