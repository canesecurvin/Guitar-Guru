import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import `Difficulty` as a value because it's used to access enum members, while `Style` and `Tutorial` are correctly imported as types.
import { Difficulty, Style, FingerpickingFocus, type Tutorial } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const tutorialSchema = {
  type: Type.OBJECT,
  properties: {
    songTitle: { type: Type.STRING, description: "The title of the song." },
    artist: { type: Type.STRING, description: "The original artist of the song." },
    difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'], description: "The difficulty level of the tutorial." },
    style: { type: Type.STRING, enum: ['Chords', 'Fingerpicking'], nullable: true, description: "The playing style, if applicable." },
    introduction: { type: Type.STRING, description: "A brief introduction to the song and the tutorial." },
    sections: {
      type: Type.ARRAY,
      description: "An array of tutorial sections (e.g., Verse, Chorus).",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the section (e.g., 'Verse 1', 'Chorus')." },
          chords: { type: Type.STRING, nullable: true, description: "The chord progression for this section (e.g., 'Am - G - C - F')." },
          chordDiagrams: { type: Type.STRING, nullable: true, description: "Text-based diagrams for chords in this section. Format each on a new line like 'ChordName: x02210', where 'x' is a muted string and digits are frets for strings EADGBe." },
          tablature: { type: Type.STRING, description: "The guitar tablature for this section, formatted as a monospaced block with newlines." },
          instructions: { type: Type.STRING, description: "Playing instructions and tips for this section." },
          repetitions: { type: Type.NUMBER, description: "The recommended number of times to repeat playing this section for practice." },
          audioSnippet: {
            type: Type.ARRAY,
            nullable: true,
            description: "An array of note objects for audio playback, representing the tablature. This can be null if not applicable.",
            items: {
              type: Type.OBJECT,
              properties: {
                note: { type: Type.STRING, description: "The musical note in scientific pitch notation (e.g., 'E4', 'G3')." },
                duration: { type: Type.STRING, description: "The duration of the note in Tone.js format (e.g., '8n' for eighth note, '4n' for quarter note)." },
                time: { type: Type.NUMBER, description: "The start time of the note in seconds from the beginning of the snippet." },
                string: { type: Type.NUMBER, description: "The guitar string number (1-6) on which the note is played." }
              },
              required: ["note", "duration", "time", "string"]
            }
          }
        },
        required: ["title", "tablature", "instructions", "repetitions"]
      }
    }
  },
  required: ["songTitle", "artist", "difficulty", "introduction", "sections"]
};


export const generateTutorial = async (
  song: string,
  artist: string,
  difficulty: Difficulty,
  style?: Style,
  fingerpickingFocus?: FingerpickingFocus
): Promise<Tutorial> => {
  let stylePrompt = "";
    if (style) {
    if (style === Style.Chords) {
      stylePrompt = `The tutorial should be in a 'Chords' style. Focus on common strumming patterns and simple chord voicings appropriate for the '${difficulty}' level.`;
    } else if (style === Style.Fingerpicking && (difficulty === Difficulty.Easy || difficulty === Difficulty.Medium)) {
      if (fingerpickingFocus === FingerpickingFocus.Melody) {
        stylePrompt = `
          The tutorial should be in an 'Easy Fingerpicking - Melody Only' style.
          IMPORTANT: This is for a beginner. The tablature must focus exclusively on a simple, single-note melody line of the song.
          DO NOT include chords or multiple notes played at once. The 'chords' and 'chordDiagrams' fields for all sections in the JSON response must be null.
        `;
      } else if (fingerpickingFocus === FingerpickingFocus.ChordMelody) {
        stylePrompt = `
          The tutorial should be in a 'Fingerpicking - Chord & Melody' style.
          Create a simple arpeggiated pattern that combines bass notes on the beat with melody or chord tones.
          For '${difficulty}' level, keep the pattern consistent and avoid complex syncopation. The chords can be simplified.
        `;
      }
    }
  }

  const artistPrompt = artist ? ` by "${artist}"` : "";
  
  const prompt = `
    You are a world-class guitar instructor. Your task is to generate a detailed and accurate guitar tutorial.

    Song Request: "${song}"${artistPrompt}
    Difficulty Level: ${difficulty}
    ${stylePrompt}

    Please provide a complete tutorial including an introduction, and break down the song into logical sections like 'Verse', 'Chorus', 'Bridge', etc.

    For each section, provide:
    1. The chord progression (if applicable).
    2. For the 'Easy' and 'Medium' difficulties, if chords are present, provide text-based chord diagrams for each new chord introduced in this section. Format each diagram on a new line like 'Am: x02210', where the digits/x correspond to frets on strings EADGBe respectively.
    3. Full guitar tablature in standard tuning (E-A-D-G-B-e). Format it as a monospaced text block with newlines (\\n) separating the strings.
    4. Clear playing instructions.
    5. A recommended number of 'repetitions' for practice.
    6. An 'audioSnippet' for playback. This MUST be an array of note objects representing the tablature. Each object needs:
        - 'note': The note in scientific pitch notation (e.g., 'E4', 'A2').
        - 'duration': The note's duration in Tone.js format (e.g., '8n' for an eighth note, '4n' for a quarter note, '8t' for an eighth note triplet).
        - 'time': The start time of the note in seconds, assuming a reasonable tempo for the song.
        - 'string': The guitar string number (1-6).

    Return the entire tutorial in a single JSON object that strictly adheres to the provided schema. Do not include any markdown formatting or extraneous text outside of the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: tutorialSchema,
      },
    });

    const jsonText = response.text;
    const tutorialData = JSON.parse(jsonText);
    
    // Validate and cast to ensure type safety
    if (tutorialData && typeof tutorialData === 'object') {
        return tutorialData as Tutorial;
    } else {
        throw new Error("Invalid response format from API.");
    }

  } catch (error) {
    console.error("Error generating tutorial:", error);
    throw new Error("Failed to generate the guitar tutorial. The model may be unable to process this request. Please try a different song or check your connection.");
  }
};