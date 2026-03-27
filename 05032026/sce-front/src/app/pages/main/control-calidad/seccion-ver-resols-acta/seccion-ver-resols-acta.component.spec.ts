import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionVerResolsActaComponent } from './seccion-ver-resols-acta.component';

describe('SeccionVerResolsActaComponent', () => {
  let component: SeccionVerResolsActaComponent;
  let fixture: ComponentFixture<SeccionVerResolsActaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionVerResolsActaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeccionVerResolsActaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
