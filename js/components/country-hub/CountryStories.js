import { renderStorySection } from "../shared/StoryCards.js";

export function renderCountryStories(stories, communities) {
  return renderStorySection({
    stories,
    communities,
    sectionId: "ch-stories",
    title: "Current stories",
    description:
      "Stories connected to metrics — see exactly where investment makes a difference. Each narrative is paired with live field data from the tracking system.",
  });
}
