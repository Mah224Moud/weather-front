import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AromeComponent } from './arome.component';

describe('AromeComponent', () => {
  let component: AromeComponent;
  let fixture: ComponentFixture<AromeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AromeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AromeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
