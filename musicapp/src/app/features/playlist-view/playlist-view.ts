import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; 
import { PlaylistService, Playlist, Song } from '../../core/services/playlist';
import { NotificationService } from '../../core/services/notification';
import { PlayerService } from '../../core/services/player';

// Componente principal para la vista de playlists, maneja tanto la lista de playlists como el detalle de cada una
// Implementa una experiencia de usuario fluida con skeletons durante la carga y actualizaciones dinámicas sin recargar toda la vista
// Permite navegar entre la vista general de playlists y el detalle de cada playlist, así como reproducir canciones y gestionar playlists

@Component({
  selector: 'app-playlist-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist-view.html',
  styleUrl: './playlist-view.scss'
})
export class PlaylistView implements OnInit {
  playlistService = inject(PlaylistService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public playerService = inject(PlayerService);

  currentView: 'all' | 'detail' = 'all';
  selectedPlaylist: Playlist | null = null;
  activeMenuPlaylistId: number | null = null;

  public isLoading: boolean = true;
  public skeletonArray = [1, 2]; 

  get playlists(): Playlist[] { return this.playlistService.playlists(); }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id === 'all' || !id) {
        this.currentView = 'all';
        this.selectedPlaylist = null;
        this.simulateLoading();
      } else {
        this.currentView = 'detail';
        this.loadPlaylist(Number(id));
      }
    });
  }

  // Simula una carga con skeletons para mejorar la experiencia de usuario
  simulateLoading() {
    this.isLoading = true;
    this.cdr.detectChanges(); 
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); 
    }, 800);
  }

  loadPlaylist(id: number) {
    const playlist = this.playlistService.getPlaylistById(id);
    if (playlist) {
      this.selectedPlaylist = playlist;
      this.simulateLoading();
    } else {
      this.router.navigate(['/playlist/all']);
    }
  }

  goToDetail(id: number) { this.router.navigate(['/playlist', id]); }
  goBack() { this.router.navigate(['/playlist/all']); }

  playAll() { 
    if (this.selectedPlaylist) this.playerService.playPlaylist(this.selectedPlaylist);
  }

  playSong(song: Song) { this.playerService.playSong(song); }

  removeSong(song: Song, event: Event) {
    event.stopPropagation();
    if (this.selectedPlaylist) {
      this.playlistService.removeSongFromPlaylist(this.selectedPlaylist.id, song.id);
      this.notificationService.show(`"${song.title}" eliminada`, 'info');
      // Actualización limpia sin recargar esqueletos
      const updatedPlaylist = this.playlistService.getPlaylistById(this.selectedPlaylist.id);
      if (updatedPlaylist) this.selectedPlaylist = updatedPlaylist;
    }
  }

  toggleContextMenu(playlistId: number, event: Event) {
    event.stopPropagation();
    this.activeMenuPlaylistId = this.activeMenuPlaylistId === playlistId ? null : playlistId;
  }
  
  closeMenu() { this.activeMenuPlaylistId = null; }

  deletePlaylist(playlist: Playlist, event: Event) {
    event.stopPropagation();
    this.playlistService.deletePlaylist(playlist.id);
    this.notificationService.show(`Playlist eliminada`, 'info');
    this.closeMenu();
  }
}