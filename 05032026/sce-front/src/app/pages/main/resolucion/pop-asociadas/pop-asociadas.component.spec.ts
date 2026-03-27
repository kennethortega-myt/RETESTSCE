import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAsociadasComponent } from './pop-asociadas.component';

describe('PopAsociadasComponent', () => {
  let component: PopAsociadasComponent;
  let fixture: ComponentFixture<PopAsociadasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopAsociadasComponent]
    });
    fixture = TestBed.createComponent(PopAsociadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
