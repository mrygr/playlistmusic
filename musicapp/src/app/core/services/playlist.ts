import { Injectable, signal } from '@angular/core';

export interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  url: string;
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
    { id: 1, title: 'Epic Journey', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80', duration: '6:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 2, title: 'Night Vibe', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=300&q=80', duration: '7:05', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 3, title: 'Summer Breeze', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', duration: '5:44', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 4, title: 'Neon Lights', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', duration: '5:02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 5, title: 'Deep Ocean', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&w=300&q=80', duration: '5:53', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 6, title: 'Morning Coffee', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80', duration: '4:58', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: 7, title: 'Mountain Peak', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80', duration: '5:22', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { id: 8, title: 'City Streets', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=300&q=80', duration: '7:46', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'},
    { id: 9, title: 'Desert Wind', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=300&q=80', duration: '5:51', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'},
    { id: 10, title: 'Space Drift', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80', duration: '6:42', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'},
    { id: 11, title: 'Cyber Punk', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80', duration: '6:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3'},
    { id: 12, title: 'Chill Lo-Fi', artist: 'SoundHelix', cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f51508?auto=format&fit=crop&w=300&q=80', duration: '5:33', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3'}
  ];

  // PLAYLISTS DE PRUEBA PRE-CARGADAS
  private playlistsList = signal<Playlist[]>([
    { 
      id: 1, 
      name: 'Focus & Coding', 
      description: 'Música ideal para concentrarse y escribir código sin distracciones.', 
      cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', 
      songs: [this.allSongs[4], this.allSongs[9], this.allSongs[11], this.allSongs[8]] // Deep Ocean, Space Drift, Chill Lo-Fi, Desert Wind
    },
    { 
      id: 2, 
      name: 'Night Drive', 
      description: 'Ritmos sintéticos y bajos profundos para manejar de noche.', 
      cover: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=600&q=80', 
      songs: [this.allSongs[1], this.allSongs[3], this.allSongs[7], this.allSongs[10]] // Night Vibe, Neon Lights, City Streets, Cyber Punk
    },
    { 
      id: 3, 
      name: 'Morning Energy', 
      description: 'Empieza el día con la mejor actitud y energía positiva.', 
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', 
      songs: [this.allSongs[5], this.allSongs[2], this.allSongs[6], this.allSongs[0]] // Morning Coffee, Summer Breeze, Mountain Peak, Epic Journey
    },
    { 
      id: 4, 
      name: 'Mi Playlist Vacía', 
      description: 'Lista creada recientemente sin canciones.', 
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', 
      songs: [] // Para probar el estado de "Aún no hay canciones"
    }
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