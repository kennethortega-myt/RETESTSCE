import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbablesCandidatosElectosComponent } from './probables-candidatos-electos.component';

describe('ProbablesCandidatosElectosComponent', () => {
  let component: ProbablesCandidatosElectosComponent;
  let fixture: ComponentFixture<ProbablesCandidatosElectosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbablesCandidatosElectosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbablesCandidatosElectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
