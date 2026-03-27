import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MmActaEscrutinioComponent } from './mm-acta-escrutinio.component';

describe('MmActaEscrutinioComponent', () => {
  let component: MmActaEscrutinioComponent;
  let fixture: ComponentFixture<MmActaEscrutinioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MmActaEscrutinioComponent]
    });
    fixture = TestBed.createComponent(MmActaEscrutinioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
