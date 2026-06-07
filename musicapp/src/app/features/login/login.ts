import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  showForm: boolean = false;
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  // Verificar si ya hay una sesión iniciada al ingresar al sitio.
  ngOnInit() {
    if (localStorage.getItem('user_session')) {
      this.router.navigate(['/home']);
    }
  }

  abrirFormulario() {
    this.showForm = true;
  }

  cerrarFormulario() {
    this.showForm = false;
    this.loginForm.reset();
  }

  ingresar() {
      if (this.loginForm.valid) {
        const { username, password } = this.loginForm.value;
        
        if (username === 'usuario' && password === '123456') {
          localStorage.setItem('user_session', username);
          this.router.navigate(['/home']);
        } else {
          this.notificationService.show('Usuario o contraseña incorrectos.', 'error');
        }
      } else {
        this.loginForm.markAllAsTouched();
      }
  }
}