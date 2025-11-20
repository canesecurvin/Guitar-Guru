export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum Style {
  Chords = 'Chords',
  Fingerpicking = 'Fingerpicking',
}

export enum FingerpickingFocus {
  Melody = 'Melody Only',
  ChordMelody = 'Chord & Melody',
}

export interface NotePlayback {
  note: string;
  duration: string;
  time: number;
  string: number;
}

export interface TutorialSection {
  title: string;
  chords: string | null;
  chordDiagrams?: string; // New field for chord diagrams
  tablature: string;
  instructions: string;
  repetitions: number;
  audioSnippet: NotePlayback[] | null;
}

export interface Tutorial {
  songTitle: string;
  artist: string;
  difficulty: Difficulty;
  style: Style | null;
  introduction: string;
  sections: TutorialSection[];
}

export interface NoteDetails {
  noteName: string;
  detune: number;
  octave: number;
  frequency: number;
}