import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PlaylistService, Playlist } from '../../core/services/playlist';
import { NotificationService } from '../../core/services/notification';
import { PlayerService } from '../../core/services/player';
import { Player } from '../player/player';

// Componente principal del layout de la aplicación, maneja la estructura general, el menú lateral y el reproductor global
// Implementa un menú lateral con navegación entre vistas y un menú global para gestionar canciones y playlists desde cualquier parte de la app
// Incluye un reproductor global que se mantiene accesible en todo momento, permitiendo controlar la reproducción sin importar dónde estemos en la app

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, Player],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayout implements OnInit {
  private router = inject(Router);
  playlistService = inject(PlaylistService);
  notificationService = inject(NotificationService);
  username: string = 'Usuario';
  isSidebarCollapsed: boolean = false;
  newPlaylistName: string = '';
  newPlaylistDesc: string = '';

  constructor(public playerService: PlayerService) {
  }

  // Variable para controlar qué vista del menú deslizable mostramos
  menuView: 'main' | 'playlists' = 'main';

  ngOnInit() {
    const session = localStorage.getItem('user_session');
    if (session) this.username = session;
  }

  toggleSidebar() { this.isSidebarCollapsed = !this.isSidebarCollapsed; }
  
  cerrarSesion() { 
    this.playerService.stopAndClearQueue(); 
    localStorage.removeItem('user_session'); 
    this.router.navigate(['/login']); 
  }

  // --- LÓGICA DEL MENÚ GLOBAL ---
  get availablePlaylists(): Playlist[] {
    const state = this.playlistService.globalMenuSignal();
    const all = this.playlistService.playlists();
    // Excluye la playlist actual si estamos dentro de una
    if (state?.excludePlaylistId) {
      return all.filter(p => p.id !== state.excludePlaylistId);
    }
    return all;
  }

  showPlaylistsMenu(event: Event) { event.stopPropagation(); this.menuView = 'playlists'; }
  goBackInMenu(event: Event) { event.stopPropagation(); this.menuView = 'main'; }
  
  closeGlobalMenu() {
    this.playlistService.closeGlobalSongMenu();
    setTimeout(() => this.menuView = 'main', 300); // Resetea la vista
  }

  addSongToPlaylist(playlist: Playlist, event: Event) {
    event.stopPropagation();
    const song = this.playlistService.globalMenuSignal()?.song;
    if (song) {
      const added = this.playlistService.addSongToPlaylist(playlist.id, song);
      if (added) this.notificationService.show(`Agregada a ${playlist.name}`, 'success');
      else this.notificationService.show(`La canción ya está en ${playlist.name}`, 'info');
    }
    this.closeGlobalMenu();
  }

  openCreateModalFromMenu(event: Event) {
    event.stopPropagation();
    const song = this.playlistService.globalMenuSignal()?.song;
    this.playlistService.openGlobalCreateModal(song);
    this.closeGlobalMenu();
  }

  // --- LÓGICA DEL MODAL GLOBAL ---
  closeGlobalModal() {
    this.playlistService.closeGlobalCreateModal();
    this.newPlaylistName = '';
    this.newPlaylistDesc = '';
  }

  confirmGlobalCreate() {
    if (!this.newPlaylistName.trim()) {
      this.notificationService.show('El nombre es obligatorio', 'error');
      return;
    }
    const initialSong = this.playlistService.globalModalSignal().initialSong;
    this.playlistService.createPlaylist(this.newPlaylistName.trim(), this.newPlaylistDesc.trim(), initialSong);
    
    if (initialSong) this.notificationService.show('Playlist creada y canción agregada', 'success');
    else this.notificationService.show('Playlist creada', 'success');
    
    this.closeGlobalModal();
  }
}