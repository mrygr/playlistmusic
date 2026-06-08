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

export interface GlobalMenuState {
  song: Song;
  top: string;
  bottom: string;
  left: string;
  right: string;
  allowCreate: boolean;
  excludePlaylistId?: number;
  horizontalPos: 'left' | 'right';
  verticalPos: 'top' | 'bottom';
}

export interface GlobalModalState {
  show: boolean;
  initialSong?: Song;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  
  public allSongs: Song[] = [
    { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80', duration: '5:55' },
    { id: 2, title: 'Hotel California', artist: 'Eagles', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f51508?auto=format&fit=crop&w=300&q=80', duration: '6:30' },
    { id: 3, title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', duration: '5:56' },
    { id: 4, title: 'Back In Black', artist: 'AC/DC', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', duration: '4:15' },
    { id: 5, title: 'Smells Like Teen Spirit', artist: 'Nirvana', cover: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&w=300&q=80', duration: '5:02' },
    { id: 6, title: 'Billie Jean', artist: 'Michael Jackson', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80', duration: '3:50' },
    { id: 7, title: 'Stairway to Heaven', artist: 'Led Zeppelin', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80', duration: '8:02' },
    { id: 8, title: 'Imagine', artist: 'John Lennon', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=300&q=80', duration: '3:03'},
    { id: 9, title: 'Like a Rolling Stone', artist: 'Bob Dylan', cover: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=300&q=80', duration: '6:13'},
    { id: 10, title: 'Wonderwall', artist: 'Oasis', cover: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80', duration: '4:18'}
  ];

  private playlistsList = signal<Playlist[]>([
    { id: 1, name: 'Rock Clásico', description: 'Los mejores éxitos de los 70s y 80s', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80', songs: [this.allSongs[0], this.allSongs[1], this.allSongs[2]] },
    { id: 2, name: 'Para Entrenar', description: 'Música enérgica para el gimnasio', cover: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80', songs: [this.allSongs[3], this.allSongs[4]] },
    { id: 3, name: 'Favoritas del mes', description: '', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', songs: [] }
  ]);

  playlists = this.playlistsList.asReadonly();

  globalMenuSignal = signal<GlobalMenuState | null>(null);
  globalModalSignal = signal<GlobalModalState>({ show: false });

  openGlobalSongMenu(song: Song, event: MouseEvent, allowCreate: boolean, excludePlaylistId?: number) {
    event.stopPropagation();
    event.preventDefault();

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect(); 

    const menuWidth = 220;
    const estimatedHeight = 250; 
    const gap = 12; 

    let horizontalPos: 'left' | 'right' = 'right';
    let verticalPos: 'top' | 'bottom' = 'top';
    
    let top = 'auto';
    let bottom = 'auto';
    let left = 'auto';
    let right = 'auto';

    // 1. ¿Abre a la izquierda o derecha?
    if (rect.right + gap + menuWidth > window.innerWidth) {
      horizontalPos = 'left';
      // Anclamos su lado DERECHO a la pantalla
      right = `${window.innerWidth - rect.left + gap}px`; 
    } else {
      horizontalPos = 'right';
      // Anclamos su lado IZQUIERDO a la pantalla
      left = `${rect.right + gap}px`; 
    }

    // 2. ¿Abre hacia arriba o hacia abajo?
    if (rect.top + estimatedHeight > window.innerHeight - 15) {
      verticalPos = 'bottom';
      // MAGIA AQUÍ: Anclamos el menú desde ABAJO. Así crece hacia arriba naturalmente.
      bottom = `${window.innerHeight - rect.bottom - 10}px`;
    } else {
      verticalPos = 'top';
      // Anclamos el menú desde ARRIBA.
      top = `${rect.top - 10}px`;
    }

    this.globalMenuSignal.set({ 
      song, top, bottom, left, right, allowCreate, excludePlaylistId, horizontalPos, verticalPos 
    });
  }

  closeGlobalSongMenu() {
    this.globalMenuSignal.set(null);
  }

  openGlobalCreateModal(initialSong?: Song) {
    this.globalModalSignal.set({ show: true, initialSong });
  }

  closeGlobalCreateModal() {
    this.globalModalSignal.set({ show: false });
  }

  getPlaylistById(id: number): Playlist | undefined {
    return this.playlistsList().find(p => p.id === id);
  }

  createPlaylist(name: string, description: string = '', initialSong?: Song) {
    const newPlaylist: Playlist = {
      id: Date.now(),
      name: name,
      description: description,
      cover: initialSong ? initialSong.cover : 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&q=80',
      songs: initialSong ? [initialSong] : []
    };
    this.playlistsList.update(current => [...current, newPlaylist]);
  }

  deletePlaylist(id: number) {
    this.playlistsList.update(current => current.filter(p => p.id !== id));
  }

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

  addSongToPlaylist(playlistId: number, song: Song): boolean {
    let added = false;
    this.playlistsList.update(current => current.map(p => {
      if (p.id === playlistId) {
        const exists = p.songs.some(s => s.id === song.id || (s.title === song.title && s.artist === song.artist));
        
        if (!exists) {
          added = true;
          return { ...p, songs: [...p.songs, song] };
        }
      }
      return p;
    }));
    return added;
  }
}