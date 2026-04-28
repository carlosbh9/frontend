
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup,FormBuilder, FormsModule,ReactiveFormsModule,Validators } from '@angular/forms';
import { AuthService } from '../../Services/AuthService/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent{
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.errorMessage = null;
      this.isSubmitting = true;
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.isSubmitting = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.errorMessage = this.getErrorMessage(error);
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Connection error. Please check the server and try again.';
    }

    if (error.status === 401) {
      return 'Incorrect email or password.';
    }

    if (error.status >= 500) {
      return 'Server unavailable. Please try again in a moment.';
    }

    return 'We could not sign you in. Please verify your information.';
  }
}
