import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../shared/user.service';
import { CompanyService } from '../shared/company.service';
import { User, Company } from '../shared/user.model';
import { CompanyDialogComponent } from './company-dialog.component';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  userId: string | null = null;
  isNewUser = true;
  companies: Company[] = [];
  isSubmitting = false;
  submitError: string | null = null;

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
    this.isNewUser = !this.userId || this.userId === 'new';

    if (!this.isNewUser && this.userId) {
      this.loadUser(this.userId);
    }
  }

  loadUser(id: string): void {
    this.userService.getUser(id).subscribe({
      next: (user) => {
        console.log('Loaded user:', user);
        this.userForm.patchValue({
          name: user.name,
          position: user.position,
          email: user.email,
          address: user.address,
          companyId: user.company?.id || null
        });
      },
      error: (err) => {
        console.error('Error loading user:', err);
        alert('Error loading user. Please try again.');
      }
    });
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        console.log('Loaded companies:', companies);
        this.companies = companies;
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    console.log('Form submitted with values:', this.userForm.value);
    this.isSubmitting = true;
    this.submitError = null;

    const userData = this.userForm.value;
    console.log('Sending data to service:', userData);

    if (this.isNewUser) {
      // Debugging: Log request before sending
      console.log('About to call createUser with data:', userData);
      
      this.userService.createUser(userData)
        .pipe(
          catchError(err => {
            console.error('Error caught in component:', err);
            this.submitError = `Failed to create user: ${err.status} ${err.statusText || err.message}`;
            return of(null);
          }),
          finalize(() => {
            console.log('Request completed (success or error)');
            this.isSubmitting = false;
          })
        )
        .subscribe(response => {
          if (response) {
            console.log('User created successfully:', response);
            this.router.navigate(['/users']);
          }
        });
    } else if (this.userId) {
      this.userService.updateUser(this.userId, userData)
        .pipe(
          catchError(err => {
            console.error('Error updating user:', err);
            this.submitError = 'Failed to update user. Please try again.';
            return of(null);
          }),
          finalize(() => this.isSubmitting = false)
        )
        .subscribe(response => {
          if (response) {
            console.log('User updated successfully:', response);
            this.router.navigate(['/users']);
          }
        });
    }
  }

  openCompanyDialog(): void {
    const dialogRef = this.dialog.open(CompanyDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.createCompany(result).subscribe({
          next: (newCompany) => {
            console.log('Company created successfully:', newCompany);
            this.companies = [...this.companies, newCompany];
            this.userForm.patchValue({ companyId: newCompany.id });
          },
          error: (err) => {
            console.error('Error creating company:', err);
            alert('Failed to create company. Please try again.');
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}