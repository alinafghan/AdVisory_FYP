import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DarkModeToggleComponent } from './dark-mode-toggle.component';
import { By } from '@angular/platform-browser';

describe('DarkModeToggleComponent', () => {
  let component: DarkModeToggleComponent;
  let fixture: ComponentFixture<DarkModeToggleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DarkModeToggleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DarkModeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dark mode when clicked', () => {
    // Check if the body has the 'dark' class initially
    expect(document.body.classList.contains('dark')).toBeFalsy();

    // Find the toggle button and click it
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);

    // After clicking, the 'dark' class should be added
    expect(document.body.classList.contains('dark')).toBeTruthy();

    // Click again to toggle back to light mode
    button.triggerEventHandler('click', null);

    // After the second click, the 'dark' class should be removed
    expect(document.body.classList.contains('dark')).toBeFalsy();
  });
});
