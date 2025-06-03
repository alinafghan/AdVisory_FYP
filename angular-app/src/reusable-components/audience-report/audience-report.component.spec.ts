import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudienceReportComponent } from './audience-report.component';

describe('AudienceReportComponent', () => {
  let component: AudienceReportComponent;
  let fixture: ComponentFixture<AudienceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudienceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudienceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
