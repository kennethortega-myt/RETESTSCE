import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopCargoComponent } from './pop-cargo.component';

describe('PopCargoComponent', () => {
  let component: PopCargoComponent;
  let fixture: ComponentFixture<PopCargoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopCargoComponent]
    });
    fixture = TestBed.createComponent(PopCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
