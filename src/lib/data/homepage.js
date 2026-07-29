import { defaultHomepage } from "@/lib/data/demo-data";

export function mergeHomepageContent(input = {}) {
  const storedTechCards = Array.isArray(input.techCards) ? input.techCards : [];
  const techCards = defaultHomepage.techCards.map((fallback, index) => ({
    ...fallback,
    ...(storedTechCards[index] || {}),
  }));

  return {
    ...defaultHomepage,
    ...input,
    hero: {
      ...defaultHomepage.hero,
      ...(input.hero || {}),
    },
    about: {
      ...defaultHomepage.about,
      ...(input.about || {}),
      skills: Array.isArray(input.about?.skills)
        ? input.about.skills
        : defaultHomepage.about.skills,
    },
    techCards,
  };
}
