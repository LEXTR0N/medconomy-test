import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UserService } from '../shared/user.service';
import { CompanyService } from '../shared/company.service';
import { User, Company } from '../shared/user.model';
import { CompanyDialogComponent } from './company-dialog.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule
  ],
  template: `
    <div class="container mt-8">
      <div class="flex justify-between items-center mb-4">
        <h1>{{ isNewUser ? 'Create New User' : 'Edit User' }}</h1>
        <button mat-button color="primary" (click)="goBack()">Back to List</button>
      </div>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="mt-4">
        <mat-card>
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" placeholder="Enter name">
                <mat-error *ngIf="userForm.get('name')?.hasError('required')">
                  Name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Position</mat-label>
                <input matInput formControlName="position" placeholder="Enter position">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" placeholder="Enter email">
                <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address" placeholder="Enter address">
              </mat-form-field>

              <div class="flex items-center">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Company</mat-label>
                  <mat-select formControlName="companyId">
                    <mat-option [value]="null">None</mat-option>
                    <mat-option *ngFor="let company of companies" [value]="company.id">
                      {{ company.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <button 
                  type="button" 
                  mat-mini-fab 
                  color="primary" 
                  class="ml-2"
                  (click)="openCompanyDialog()"
                >
                  +
                </button>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button type="button" (click)="goBack()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid">
              {{ isNewUser ? 'Create' : 'Update' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </form>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  userId: string | null = null;
  isNewUser = true;
  companies: Company[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private companyService: CompanyService,
    private dialog: MatDialog
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      position: [''],
      email: ['', [Validators.email]],
      address: [''],
      companyId: [null]
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
    
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isNewUser = this.userId === 'new';

    if (!this.isNewUser && this.userId) {
      this.loadUser(this.userId);
    }
  }

  loadUser(id: string): void {
    this.userService.getUser(id).subscribe(user => {
      this.userForm.patchValue({
        name: user.name,
        position: user.position,
        email: user.email,
        address: user.address,
        companyId: user.company?.id || null
      });
    });
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe(companies => {
      this.companies = companies;
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    const userData = this.userForm.value;

    if (this.isNewUser) {
      this.userService.createUser(userData).subscribe(() => {
        this.router.navigate(['/users']);
      });
    } else if (this.userId) {
      this.userService.updateUser(this.userId, userData).subscribe(() => {
        this.router.navigate(['/users']);
      });
    }
  }

  openCompanyDialog(): void {
    const dialogRef = this.dialog.open(CompanyDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.createCompany(result).subscribe(newCompany => {
          this.companies = [...this.companies, newCompany];
          this.userForm.patchValue({ companyId: newCompany.id });
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}