import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAdComponent } from './productad.component';

describe('ProductAdComponent', () => {
  let component: ProductAdComponent;
  let fixture: ComponentFixture<ProductAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
