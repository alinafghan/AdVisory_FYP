import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiencePageComponent } from './audience-page.component';

describe('AudiencePageComponent', () => {
  let component: AudiencePageComponent;
  let fixture: ComponentFixture<AudiencePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudiencePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudiencePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
