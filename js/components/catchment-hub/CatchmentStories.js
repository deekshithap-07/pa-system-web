import { renderStorySection } from "../shared/StoryCards.js";

export function renderCatchmentStories(stories, communities) {
  return renderStorySection({
    stories,
    communities,
    sectionId: "cth-stories",
    title: "Current stories",
    description:
      "Stories connected to metrics — field narratives paired with tracked impact data from this catchment.",
  });
}
