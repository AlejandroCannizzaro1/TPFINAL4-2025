import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichaTurno } from './ficha-turno';

describe('FichaTurno', () => {
  let component: FichaTurno;
  let fixture: ComponentFixture<FichaTurno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichaTurno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FichaTurno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
