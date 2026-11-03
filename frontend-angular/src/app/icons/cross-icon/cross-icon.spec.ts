import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrossIcon } from './cross-icon';

describe('CrossIcon', () => {
  let component: CrossIcon;
  let fixture: ComponentFixture<CrossIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(CrossIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
