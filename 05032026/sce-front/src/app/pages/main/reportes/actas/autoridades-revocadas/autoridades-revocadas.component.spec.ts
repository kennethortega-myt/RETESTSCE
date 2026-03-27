import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoridadesRevocadasComponent } from './autoridades-revocadas.component';

describe('AutoridadesRevocadasComponent', () => {
  let component: AutoridadesRevocadasComponent;
  let fixture: ComponentFixture<AutoridadesRevocadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoridadesRevocadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoridadesRevocadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
