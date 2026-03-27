import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopControlSCComponent } from './pop-control-sc.component';

describe('PopControlComponent', () => {
  let component: PopControlSCComponent;
  let fixture: ComponentFixture<PopControlSCComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopControlSCComponent]
    });
    fixture = TestBed.createComponent(PopControlSCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
