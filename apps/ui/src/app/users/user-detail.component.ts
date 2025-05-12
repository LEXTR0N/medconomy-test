import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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