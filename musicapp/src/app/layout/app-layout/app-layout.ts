import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayout implements OnInit {
  private router = inject(Router);

  username: string = 'Usuario';
  isSidebarCollapsed: boolean = false;
  showCreateModal: boolean = false;
  newPlaylistName: string = '';
  newPlaylistDesc: string = '';

  ngOnInit() {
    // Recuperar el nombre de usuario de la sesión localStorage
    const session = localStorage.getItem('user_session');
    if (session) this.username = session;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  openModal() {
    this.showCreateModal = true;
  }

  closeModal() {
    this.showCreateModal = false;
    this.newPlaylistName = '';
    this.newPlaylistDesc = '';
  }

  crearPlaylist() {
    console.log('Creando playlist:', this.newPlaylistName);
    this.closeModal();
  }

  cerrarSesion() {
    localStorage.removeItem('user_session');
    this.router.navigate(['/login']);
  }
}