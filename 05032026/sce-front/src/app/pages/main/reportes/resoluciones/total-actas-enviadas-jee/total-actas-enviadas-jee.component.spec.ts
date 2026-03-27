import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalActasEnviadasJeeComponent } from './total-actas-enviadas-jee.component';

describe('TotalActasEnviadasJeeComponent', () => {
  let component: TotalActasEnviadasJeeComponent;
  let fixture: ComponentFixture<TotalActasEnviadasJeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalActasEnviadasJeeComponent]
    });
    fixture = TestBed.createComponent(TotalActasEnviadasJeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
