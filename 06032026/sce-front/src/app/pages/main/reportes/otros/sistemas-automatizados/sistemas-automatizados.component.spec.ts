import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SistemasAutomatizadosComponent } from './sistemas-automatizados.component';

describe('SistemasAutomatizadosComponent', () => {
  let component: SistemasAutomatizadosComponent;
  let fixture: ComponentFixture<SistemasAutomatizadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SistemasAutomatizadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SistemasAutomatizadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
