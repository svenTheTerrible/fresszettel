import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyIcon } from './copy-icon';

describe('CopyIcon', () => {
  let component: CopyIcon;
  let fixture: ComponentFixture<CopyIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(CopyIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
