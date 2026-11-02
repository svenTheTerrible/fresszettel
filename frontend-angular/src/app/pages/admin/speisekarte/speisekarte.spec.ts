import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Speisekarte } from './speisekarte';

describe('Speisekarte', () => {
  let component: Speisekarte;
  let fixture: ComponentFixture<Speisekarte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Speisekarte],
    }).compileComponents();

    fixture = TestBed.createComponent(Speisekarte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
