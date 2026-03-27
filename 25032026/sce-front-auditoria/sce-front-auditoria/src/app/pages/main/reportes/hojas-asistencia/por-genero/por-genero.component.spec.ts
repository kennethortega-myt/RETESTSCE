import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorGeneroComponent } from './por-genero.component';

describe('PorGeneroComponent', () => {
  let component: PorGeneroComponent;
  let fixture: ComponentFixture<PorGeneroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PorGeneroComponent]
    });
    fixture = TestBed.createComponent(PorGeneroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
