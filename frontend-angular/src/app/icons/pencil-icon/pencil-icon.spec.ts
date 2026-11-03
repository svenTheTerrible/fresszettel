import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PencilIcon } from './pencil-icon';

describe('PencilIcon', () => {
  let component: PencilIcon;
  let fixture: ComponentFixture<PencilIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PencilIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(PencilIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
