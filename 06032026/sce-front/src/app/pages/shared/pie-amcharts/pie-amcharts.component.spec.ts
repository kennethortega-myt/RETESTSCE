import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieAmchartsComponent } from './pie-amcharts.component';

describe('PieAmchartsComponent', () => {
  let component: PieAmchartsComponent;
  let fixture: ComponentFixture<PieAmchartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PieAmchartsComponent]
    });
    fixture = TestBed.createComponent(PieAmchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
