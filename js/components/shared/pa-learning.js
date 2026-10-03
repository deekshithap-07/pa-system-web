/**
 * "What we've learned" — drawn only from PA's own published stories (narrative.impact),
 * one per program, each linked back to the full story.
 */

import { PA_PROGRAMMES } from "./pa-programmes.js";
import { programmeIdFor } from "./pa-model.js";

function clip(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const sentenceEnd = t.slice(0, max).lastIndexOf(". ");
  if (sentenceEnd > max * 0.5) return t.slice(0, sentenceEnd + 1);
  const sp = t.slice(0, max).lastIndexOf(" ");
  return `${t.slice(0, sp > 0 ? sp : max)}…`;
}

export function learnedFromStories(data, { max = 220 } = {}) {
  const stories = data.stories?.stories || [];
  const countries = data.countries?.countries || [];
  return PA_PROGRAMMES.map((programme) => {
    const story = stories.find((s) => s.narrative?.impact && programmeIdFor(s.program) === programme.id);
    if (!story) return null;
    const country = countries.find((c) => c.id === story.countryId) || null;
    return { programme, story, country, text: clip(story.narrative.impact, max) };
  }).filter(Boolean);
}
