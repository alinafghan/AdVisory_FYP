import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpPageComponent } from './pp-page.component';

describe('PpPageComponent', () => {
  let component: PpPageComponent;
  let fixture: ComponentFixture<PpPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
