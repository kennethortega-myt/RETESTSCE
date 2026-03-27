import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CifraRepartidoraComponent } from './cifra-repartidora.component';

describe('CifraRepartidoraComponent', () => {
  let component: CifraRepartidoraComponent;
  let fixture: ComponentFixture<CifraRepartidoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CifraRepartidoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CifraRepartidoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
