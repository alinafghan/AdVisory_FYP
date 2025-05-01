import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FluxPageComponent } from './flux-page.component';

describe('FluxPageComponent', () => {
  let component: FluxPageComponent;
  let fixture: ComponentFixture<FluxPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FluxPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FluxPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
