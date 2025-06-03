import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImagePageComponent } from './product-image-page.component';

describe('ProductImagePageComponent', () => {
  let component: ProductImagePageComponent;
  let fixture: ComponentFixture<ProductImagePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductImagePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductImagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
