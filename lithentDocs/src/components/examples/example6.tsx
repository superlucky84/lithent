import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface Song {
  id: number;
  title: string;
  artist: string;
  genre: 'pop' | 'rock' | 'jazz' | 'hiphop';
  duration: string;
  plays: number;
  color: string;
}

const SongCard = mount<{
  song: Song;
  onPlay: () => void;
  onRemove: () => void;
  key?: any;
}>((_r, props) => {
  const getGenreIcon = (genre: string) => {
    switch (genre) {
      case 'pop':
        return '🎵';
      case 'rock':
        return '🎸';
      case 'jazz':
        return '🎷';
      case 'hiphop':
        return '🎤';
      default:
        return '🎵';
    }
  };

  return () => {
    const s = props.song;
    return (
      <div
        class={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${s.color} bg-white dark:bg-gray-800 hover:shadow-md`}
      >
        <div class="text-3xl">{getGenreIcon(s.genre)}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {s.title}
            </h4>
            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              ID: {s.id}
            </span>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {s.artist} • {s.duration}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="text-center px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <div class="text-xs text-purple-600 dark:text-purple-400 font-semibold">
              {s.plays}
            </div>
            <div class="text-xs text-purple-500 dark:text-purple-500">
              plays
            </div>
          </div>
          <button
            onClick={props.onPlay}
            class="w-8 h-8 flex items-center justify-center rounded-full bg-[#42b883] hover:bg-[#36996b] text-white transition-colors"
            title="Play"
          >
            ▶
          </button>
          <button
            onClick={props.onRemove}
            class="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors text-xs"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };
});

export const Example6 = mount(r => {
  const songs = state<Song[]>(
    [
      {
        id: 1,
        title: 'Summer Vibes',
        artist: 'The Waves',
        genre: 'pop',
        duration: '3:24',
        plays: 0,
        color: 'border-pink-300',
      },
      {
        id: 2,
        title: 'Electric Dreams',
        artist: 'Neon Knights',
        genre: 'rock',
        duration: '4:15',
        plays: 0,
        color: 'border-red-300',
      },
      {
        id: 3,
        title: 'Midnight Jazz',
        artist: 'Smooth Trio',
        genre: 'jazz',
        duration: '5:02',
        plays: 0,
        color: 'border-blue-300',
      },
      {
        id: 4,
        title: 'Street Flow',
        artist: 'MC Rhythm',
        genre: 'hiphop',
        duration: '3:45',
        plays: 0,
        color: 'border-purple-300',
      },
      {
        id: 5,
        title: 'Ocean Waves',
        artist: 'Chill Beats',
        genre: 'pop',
        duration: '3:58',
        plays: 0,
        color: 'border-teal-300',
      },
    ],
    r
  );

  let nextId = 6;

  const playSong = (id: number) => {
    songs.v = songs.v.map(s =>
      s.id === id ? { ...s, plays: s.plays + 1 } : s
    );
  };

  const removeSong = (id: number) => {
    songs.v = songs.v.filter(s => s.id !== id);
  };

  const shufflePlaylist = () => {
    const shuffled = [...songs.v];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    songs.v = shuffled;
  };

  const sortByTitle = () => {
    songs.v = [...songs.v].sort((a, b) => a.title.localeCompare(b.title));
  };

  const sortByPlays = () => {
    songs.v = [...songs.v].sort((a, b) => b.plays - a.plays);
  };

  const addRandomSong = () => {
    const titles = [
      'Starlight',
      'Thunder Road',
      'Golden Hour',
      'Neon Lights',
      'Blue Moon',
    ];
    const artists = [
      'Dream Band',
      'Solo Star',
      'The Legends',
      'New Wave',
      'Classic Crew',
    ];
    const genres: Array<'pop' | 'rock' | 'jazz' | 'hiphop'> = [
      'pop',
      'rock',
      'jazz',
      'hiphop',
    ];
    const colors = [
      'border-pink-300',
      'border-red-300',
      'border-blue-300',
      'border-purple-300',
      'border-teal-300',
      'border-orange-300',
      'border-green-300',
    ];

    const newSong: Song = {
      id: nextId++,
      title: titles[Math.floor(Math.random() * titles.length)],
      artist: artists[Math.floor(Math.random() * artists.length)],
      genre: genres[Math.floor(Math.random() * genres.length)],
      duration: `${Math.floor(Math.random() * 3 + 2)}:${Math.floor(
        Math.random() * 60
      )
        .toString()
        .padStart(2, '0')}`,
      plays: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    songs.v = [...songs.v, newSong];
  };

  const reverseOrder = () => {
    songs.v = [...songs.v].reverse();
  };

  return () => {
    return (
      <div class="w-full max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              🎧 My Playlist
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {songs.v.length} songs • Total plays:{' '}
              {songs.v.reduce((sum, s) => sum + s.plays, 0)}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            onClick={addRandomSong}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#42b883] hover:bg-[#36996b] transition-colors"
          >
            ➕ Add Song
          </button>
          <button
            onClick={shufflePlaylist}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            🔀 Shuffle
          </button>
          <button
            onClick={reverseOrder}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            🔄 Reverse
          </button>
          <button
            onClick={sortByTitle}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            🔤 Sort by Title
          </button>
          <button
            onClick={sortByPlays}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            📊 Sort by Plays
          </button>
        </div>

        {/* Playlist */}
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {songs.v.length === 0 ? (
            <div class="text-center py-8 text-gray-500 dark:text-gray-400">
              <p class="text-sm">Your playlist is empty</p>
              <p class="text-xs mt-1">Click "Add Song" to get started</p>
            </div>
          ) : (
            songs.v.map(song => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => playSong(song.id)}
                onRemove={() => removeSong(song.id)}
              />
            ))
          )}
        </div>

        <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p class="text-xs text-blue-800 dark:text-blue-200">
            💡 <strong>Checking key behavior:</strong> Play a few songs to
            increase their counters, then use Shuffle or Sort. You should see
            that each song&apos;s ID and plays counter stay attached to the
            correct card thanks to the <code>key</code> prop.
          </p>
        </div>
      </div>
    );
  };
});
