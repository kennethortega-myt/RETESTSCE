import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActasCorregirComponent } from './actas-corregir.component';

describe('ActasCorregirComponent', () => {
  let component: ActasCorregirComponent;
  let fixture: ComponentFixture<ActasCorregirComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActasCorregirComponent]
    });
    fixture = TestBed.createComponent(ActasCorregirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
