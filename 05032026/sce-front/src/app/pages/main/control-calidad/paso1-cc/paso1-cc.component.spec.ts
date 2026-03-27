import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paso1CcComponent } from './paso1-cc.component';

describe('Paso1CcComponent', () => {
  let component: Paso1CcComponent;
  let fixture: ComponentFixture<Paso1CcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paso1CcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paso1CcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
