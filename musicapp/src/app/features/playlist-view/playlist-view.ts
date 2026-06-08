import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; 
import { PlaylistService, Playlist, Song } from '../../core/services/playlist';
import { NotificationService } from '../../core/services/notification';

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
  private cdr = inject(ChangeDetectorRef); // Solución al bug de rutas hijas

  currentView: 'all' | 'detail' = 'all';
  selectedPlaylist: Playlist | null = null;
  activeMenuPlaylistId: number | null = null;

  get playlists(): Playlist[] { return this.playlistService.playlists(); }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id === 'all' || !id) {
        this.currentView = 'all';
        this.selectedPlaylist = null;
      } else {
        this.currentView = 'detail';
        this.loadPlaylist(Number(id));
      }
      this.cdr.detectChanges(); // Fuerza el refresco visual inmediato
    });
  }

  loadPlaylist(id: number) {
    const playlist = this.playlistService.getPlaylistById(id);
    if (playlist) this.selectedPlaylist = playlist;
    else this.router.navigate(['/playlist/all']);
  }

  goToDetail(id: number) { this.router.navigate(['/playlist', id]); }
  goBack() { this.router.navigate(['/playlist/all']); }

  playAll() { this.notificationService.show(`Reproduciendo toda la playlist "${this.selectedPlaylist?.name}"`, 'success'); }
  playSong(song: Song) { this.notificationService.show(`Reproduciendo: ${song.title}`, 'info'); }

  removeSong(song: Song, event: Event) {
    event.stopPropagation();
    if (this.selectedPlaylist) {
      this.playlistService.removeSongFromPlaylist(this.selectedPlaylist.id, song.id);
      this.notificationService.show(`"${song.title}" eliminada`, 'info');
      this.loadPlaylist(this.selectedPlaylist.id);
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