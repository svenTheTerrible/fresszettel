import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemRow } from './menu-item-row';

describe('MenuItemRow', () => {
  let component: MenuItemRow;
  let fixture: ComponentFixture<MenuItemRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemRow],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuItemRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
