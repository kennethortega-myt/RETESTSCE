import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelacionPuestaCeroComponent } from './relacion-puesta-cero.component';

describe('RelacionPuestaCeroComponent', () => {
  let component: RelacionPuestaCeroComponent;
  let fixture: ComponentFixture<RelacionPuestaCeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelacionPuestaCeroComponent]
    });
    fixture = TestBed.createComponent(RelacionPuestaCeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
