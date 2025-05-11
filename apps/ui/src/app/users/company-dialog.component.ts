import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-company-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Create New Company</h2>
    <form [formGroup]="companyForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Company Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter company name">
          <mat-error *ngIf="companyForm.get('name')?.hasError('required')">
            Company name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Industry</mat-label>
          <input matInput formControlName="industry" placeholder="Enter industry">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address" placeholder="Enter company address">
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="companyForm.invalid">Create</button>
      </mat-dialog-actions>
    </form>
  `
})
export class CompanyDialogComponent {
  companyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompanyDialogComponent>
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      industry: [''],
      address: ['']
    });
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      return;
    }

    this.dialogRef.close(this.companyForm.value);
  }
}