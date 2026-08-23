const TEMPLATES = {
  curator: {
    identity: 'You read like a Curator, choosing each book with intention and thought.',
    strengths: [
      'Your high standards mean every book gets careful consideration.',
      'You write thoughtful reviews that help others discover quality reads.',
      'Your selective reading list is a mark of refined taste.',
    ],
    explanation: 'You fit the Curator archetype because you emphasize quality over quantity. Your reviews are detailed and your ratings show discrimination — you know what you like and why.',
    explorationSuggestion: 'Consider revisiting an old favorite — Curators often discover new depths in familiar pages.',
  },
  completionist: {
    identity: 'You read like a Completionist, methodically working through your list.',
    strengths: [
      'Your consistent reading habit shows dedication.',
      'You rarely leave a book unfinished.',
      'Your reading log is a testament to your commitment.',
    ],
    explanation: 'You fit the Completionist archetype because of your steady, consistent reading pattern. You turn reading into a rewarding routine.',
    explorationSuggestion: 'Try a genre you\'ve been putting off — even Completionists need a change of pace.',
  },
  critic: {
    identity: 'You read like a Critic — every book gets a thorough examination.',
    strengths: [
      'Your analytical reviews help the community discover great reads.',
      'You have a keen eye for what works and what doesn\'t.',
      'Your varied ratings show discriminating taste.',
    ],
    explanation: 'You fit the Critic archetype because you engage deeply with every book you read. Your reviews are thoughtful and your ratings show you distinguish clearly between what works and what doesn\'t.',
    explorationSuggestion: 'Try a genre outside your comfort zone — your analytical approach would bring fresh perspective.',
  },
  enthusiast: {
    identity: 'You read like an Enthusiast, embracing every book with open arms.',
    strengths: [
      'Your generous ratings spread positivity in the community.',
      'You read with enthusiasm and joy.',
      'Your love for reading is contagious.',
    ],
    explanation: 'You fit the Enthusiast archetype because you approach every book with optimism. Your generous ratings and frequent reviews show you truly love the act of reading.',
    explorationSuggestion: 'Challenge yourself with a critically divisive book — even Enthusiasts benefit from a balanced perspective.',
  },
  explorer: {
    identity: 'You read like an Explorer, always seeking new literary horizons.',
    strengths: [
      'You fearlessly explore new genres and authors.',
      'Your diverse reading list is impressively varied.',
      'You discover hidden gems others might miss.',
    ],
    explanation: 'You fit the Explorer archetype because you constantly seek variety. Your genre diversity and discovery of obscure books show a restless, curious reading spirit.',
    explorationSuggestion: 'Try deepening your exploration — pick one genre and read 5 books in a row to see what you discover.',
  },
  connoisseur: {
    identity: 'You read like a Connoisseur, with refined taste and deep knowledge.',
    strengths: [
      'You develop deep expertise in your favorite genres.',
      'Your thoughtful reviews reflect genuine understanding.',
      'You know exactly what makes a book great.',
    ],
    explanation: 'You fit the Connoisseur archetype because you combine deep genre knowledge with discriminating taste. You don\'t just read — you study and appreciate.',
    explorationSuggestion: 'Share your expertise — write a guide to your favorite genre for fellow readers.',
  },
  snob: {
    identity: 'You read like a Snob, holding every book to the highest standard.',
    strengths: [
      'Your high standards ensure you only recommend the best.',
      'You have an impeccable eye for quality.',
      'Your selective praise carries weight in the community.',
    ],
    explanation: 'You fit the Snob archetype because you reserve your praise for truly exceptional books. Your high standards make your recommendations valuable.',
    explorationSuggestion: 'Try a guilty pleasure read — sometimes the best books are the ones that just make you happy.',
  },
  marathonRunner: {
    identity: 'You read like a Marathon Runner, day after day, never missing a beat.',
    strengths: [
      'Your reading streak is a testament to your dedication.',
      'You\'ve turned reading into an unbreakable habit.',
      'Your consistency is truly inspiring.',
    ],
    explanation: 'You fit the Marathon Runner archetype because reading is a non-negotiable part of your daily routine. Your streak shows remarkable dedication.',
    explorationSuggestion: 'Celebrate your streak milestone with a special book you\'ve been saving.',
  },
  fanButterfly: {
    identity: 'You read like a Fan Butterfly, following your favorite authors everywhere.',
    strengths: [
      'Your loyalty to favorite authors is admirable.',
      'You explore genres through the lens of authors you love.',
      'You build deep connections with writers\' bodies of work.',
    ],
    explanation: 'You fit the Fan Butterfly archetype because you follow authors across genres. Your loyalty to writers drives your reading choices.',
    explorationSuggestion: 'Try an author recommended by a friend with different taste — you might find a new favorite.',
  },
  loner: {
    identity: 'You read like a Loner, finding treasure where few others look.',
    strengths: [
      'You discover remarkable books that fly under the radar.',
      'Your unique taste sets you apart from the crowd.',
      'You\'re a true original in your reading choices.',
    ],
    explanation: 'You fit the Loner archetype because you consistently read books outside the mainstream. You\'re a genuine discoverer of hidden literary gems.',
    explorationSuggestion: 'Share one of your hidden gems with the community — someone else might love it too.',
  },
  nostalgist: {
    identity: 'You read like a Nostalgist, finding comfort in familiar pages.',
    strengths: [
      'You build deep, lasting relationships with books.',
      'Your re-reads reveal new depths each time.',
      'You treasure the emotional connections books create.',
    ],
    explanation: 'You fit the Nostalgist archetype because you return to books that moved you. Your reading is driven by emotional connection and comfort.',
    explorationSuggestion: 'Try a modern book in the same vein as your favorites — you might discover a new classic.',
  },
  polymath: {
    identity: 'You read like a Polymath, drawing knowledge from every corner of the library.',
    strengths: [
      'Your reading spans an impressively broad range.',
      'You connect ideas across genres and disciplines.',
      'Your balanced approach shows genuine intellectual curiosity.',
    ],
    explanation: 'You fit the Polymath archetype because your reading is both broad and deep. You explore diverse genres, authors, and perspectives with equal enthusiasm.',
    explorationSuggestion: 'Pick a subject you know nothing about and read three books on it — your polymath mind will thank you.',
  },
};

const DEFAULT = TEMPLATES.curator;

export function templateFallback(primaryArchetypeId) {
  return TEMPLATES[primaryArchetypeId] || DEFAULT;
}
