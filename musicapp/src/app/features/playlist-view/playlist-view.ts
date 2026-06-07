import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // <- Importaciones necesarias
import { PlaylistService, Playlist, Song } from '../../core/services/playlist';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-playlist-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-view.html',
  styleUrl: './playlist-view.scss'
})
export class PlaylistView implements OnInit {
  playlistService = inject(PlaylistService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Estados de vista
  currentView: 'all' | 'detail' = 'all';
  selectedPlaylist: Playlist | null = null;

  get playlists(): Playlist[] {
    return this.playlistService.playlists();
  }

  showCreateModal = false;
  newPlaylistName = '';
  newPlaylistDesc = '';
  activeMenuPlaylistId: number | null = null;

  ngOnInit() {
    // Escuchamos los cambios en la URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id === 'all' || !id) {
        this.currentView = 'all';
        this.selectedPlaylist = null;
      } else {
        this.currentView = 'detail';
        this.loadPlaylist(Number(id));
      }
    });
  }

  loadPlaylist(id: number) {
    const playlist = this.playlistService.getPlaylistById(id);
    if (playlist) {
      this.selectedPlaylist = playlist;
    } else {
      this.router.navigate(['/playlist/all']); // Regresa si no existe
    }
  }

  goToDetail(id: number) {
    this.router.navigate(['/playlist', id]);
  }

  goBack() {
    this.router.navigate(['/playlist/all']);
  }

  // --- Funciones del Detalle de Playlist ---
  playAll() {
    this.notificationService.show(`Reproduciendo toda la playlist "${this.selectedPlaylist?.name}"`, 'success');
  }

  playSong(song: Song) {
    this.notificationService.show(`Reproduciendo: ${song.title}`, 'info');
  }

  removeSong(song: Song, event: Event) {
    event.stopPropagation(); // Evita que se dispare el play de la fila
    if (this.selectedPlaylist) {
      this.playlistService.removeSongFromPlaylist(this.selectedPlaylist.id, song.id);
      this.notificationService.show(`"${song.title}" eliminada de la playlist`, 'info');
  
      this.loadPlaylist(this.selectedPlaylist.id);
    }
  }

  // --- Funciones (crear, modal, menu) ---
  toggleContextMenu(playlistId: number, event: Event) {
    event.stopPropagation();
    this.activeMenuPlaylistId = this.activeMenuPlaylistId === playlistId ? null : playlistId;
  }
  closeMenu() { this.activeMenuPlaylistId = null; }
  openModal() { this.showCreateModal = true; this.newPlaylistName = ''; this.newPlaylistDesc = ''; }
  closeModal() { this.showCreateModal = false; }

  confirmCreate() {
    if (!this.newPlaylistName.trim()) {
      this.notificationService.show('El nombre no puede estar vacío', 'error');
      return;
    }
    this.playlistService.createPlaylist(this.newPlaylistName.trim(), this.newPlaylistDesc.trim());
    this.notificationService.show(`Playlist creada`, 'success');
    this.closeModal();
  }

  deletePlaylist(playlist: Playlist, event: Event) {
    event.stopPropagation();
    this.playlistService.deletePlaylist(playlist.id);
    this.notificationService.show(`Playlist eliminada`, 'info');
    this.closeMenu();
  }
}