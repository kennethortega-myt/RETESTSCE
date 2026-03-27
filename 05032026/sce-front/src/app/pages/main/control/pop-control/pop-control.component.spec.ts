import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopControlComponent } from './pop-control.component';

describe('PopControlComponent', () => {
  let component: PopControlComponent;
  let fixture: ComponentFixture<PopControlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopControlComponent]
    });
    fixture = TestBed.createComponent(PopControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
