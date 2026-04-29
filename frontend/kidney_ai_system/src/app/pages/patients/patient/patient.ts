import { Component, Input } from '@angular/core';
import { PatientI } from '../interfaces/patients.interface';

@Component({
  selector: 'app-patient',
  imports: [],
  templateUrl: './patient.html',
  styleUrl: './patient.css',
})
export class Patient {
  @Input() patient?: PatientI;
}
