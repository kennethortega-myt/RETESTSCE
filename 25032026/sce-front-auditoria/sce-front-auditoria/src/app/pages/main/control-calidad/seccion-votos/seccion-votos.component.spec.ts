import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionVotosComponent } from './seccion-votos.component';

describe('SeccionVotosComponent', () => {
  let component: SeccionVotosComponent;
  let fixture: ComponentFixture<SeccionVotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionVotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeccionVotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
