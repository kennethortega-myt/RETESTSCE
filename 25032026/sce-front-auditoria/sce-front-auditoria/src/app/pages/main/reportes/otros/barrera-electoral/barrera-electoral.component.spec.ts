import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarreraElectoralComponent } from './barrera-electoral.component';

describe('BarreraElectoralComponent', () => {
  let component: BarreraElectoralComponent;
  let fixture: ComponentFixture<BarreraElectoralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarreraElectoralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarreraElectoralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
