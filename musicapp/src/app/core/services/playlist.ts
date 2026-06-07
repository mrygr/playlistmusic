import { Injectable, signal } from '@angular/core';

export interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration: string;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover: string;
  songs: Song[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  
  // Canciones de prueba
  private dummySongs: Song[] = [
    { id: 101, title: 'Bohemian Rhapsody', artist: 'Queen', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=150&q=80', duration: '5:55' },
    { id: 102, title: 'Hotel California', artist: 'Eagles', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f51508?auto=format&fit=crop&w=150&q=80', duration: '6:30' },
    { id: 103, title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80', duration: '5:56' }
  ];

  private playlistsList = signal<Playlist[]>([
    { id: 1, name: 'Rock Clásico', description: 'Los mejores éxitos de los 70s y 80s', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80', songs: [...this.dummySongs] },
    { id: 2, name: 'Para Entrenar', description: 'Música enérgica para el gimnasio', cover: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80', songs: [this.dummySongs[1], this.dummySongs[2]] },
    { id: 3, name: 'Favoritas del mes', description: '', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', songs: [] }
  ]);

  playlists = this.playlistsList.asReadonly();

  getPlaylistById(id: number): Playlist | undefined {
    return this.playlistsList().find(p => p.id === id);
  }

  createPlaylist(name: string, description: string = '') {
    const newPlaylist: Playlist = {
      id: Date.now(),
      name: name,
      description: description,
      cover: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&q=80',
      songs: []
    };
    this.playlistsList.update(current => [...current, newPlaylist]);
  }

  deletePlaylist(id: number) {
    this.playlistsList.update(current => current.filter(p => p.id !== id));
  }

  // Método para eliminar canción de playlist
  removeSongFromPlaylist(playlistId: number, songId: number) {
    this.playlistsList.update(current => 
      current.map(p => {
        if (p.id === playlistId) {
          return { ...p, songs: p.songs.filter(s => s.id !== songId) };
        }
        return p;
      })
    );
  }
}
