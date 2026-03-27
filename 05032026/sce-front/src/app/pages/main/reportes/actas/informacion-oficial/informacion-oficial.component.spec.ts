import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionOficialComponent } from './informacion-oficial.component';

describe('InformacionOficialComponent', () => {
  let component: InformacionOficialComponent;
  let fixture: ComponentFixture<InformacionOficialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InformacionOficialComponent]
    });
    fixture = TestBed.createComponent(InformacionOficialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
