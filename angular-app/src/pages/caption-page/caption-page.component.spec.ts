import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptionPageComponent } from './caption-page.component';

describe('CaptionPageComponent', () => {
  let component: CaptionPageComponent;
  let fixture: ComponentFixture<CaptionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
