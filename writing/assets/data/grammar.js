/* ==========================================================================
   grammar.js — authoritative language-arts dataset for Writing Lab
   Loaded as a plain <script>, exposes a global `WL_GRAMMAR`.
   Every module reads its parts-of-speech definitions and example
   sentences from here so colors, labels, and wording stay consistent.
   ========================================================================== */
(function (root) {
  "use strict";

  /* Part-of-speech definitions. `color` mirrors the CSS variables in
     assets/css/base.css so JS-driven swatches match the stylesheet. */
  const PARTS = {
    noun:         { label: "Noun",         color: "#6fb3ff", short: "N",
      blurb: "Names a person, place, thing, or idea.",
      examples: ["teacher", "harbor", "kite", "freedom"] },
    pronoun:      { label: "Pronoun",      color: "#4fd6c9", short: "Pn",
      blurb: "Stands in for a noun so you don't repeat it.",
      examples: ["she", "they", "it", "who"] },
    verb:         { label: "Verb",         color: "#ff7a90", short: "V",
      blurb: "Shows an action or a state of being.",
      examples: ["runs", "is", "imagined", "will grow"] },
    adjective:    { label: "Adjective",    color: "#ffd166", short: "Adj",
      blurb: "Describes or limits a noun.",
      examples: ["bright", "seven", "curious", "ancient"] },
    adverb:       { label: "Adverb",       color: "#f0883e", short: "Adv",
      blurb: "Describes a verb, adjective, or another adverb — often how, when, or where.",
      examples: ["quickly", "very", "yesterday", "here"] },
    preposition:  { label: "Preposition",  color: "#c792ea", short: "Prep",
      blurb: "Shows a relationship in space, time, or direction.",
      examples: ["under", "before", "with", "across"] },
    conjunction:  { label: "Conjunction",  color: "#9ad07a", short: "Conj",
      blurb: "Joins words, phrases, or clauses.",
      examples: ["and", "but", "because", "or"] },
    article:      { label: "Article",      color: "#8891b4", short: "Art",
      blurb: "A tiny word (a, an, the) that points at a noun.",
      examples: ["a", "an", "the"] },
    interjection: { label: "Interjection", color: "#ff9ecb", short: "Interj",
      blurb: "A burst of feeling that stands apart from the sentence.",
      examples: ["wow", "ouch", "hey", "oh"] },
  };

  /* Example sentences. Each token carries its part of speech (`pos`) and a
     `role` in the sentence's core structure:
       subject   — who/what the sentence is about
       predicate — the verb and what follows it
       modifier  — words that attach to subject or predicate
     `head` marks the simple subject and simple predicate (the bare core). */
  const SENTENCES = [
    {
      id: "kite",
      text: "The curious child flew a bright kite across the windy field.",
      note: "A classic subject–predicate sentence with modifiers on both sides.",
      tokens: [
        { w: "The",     pos: "article",     role: "subject" },
        { w: "curious", pos: "adjective",   role: "subject" },
        { w: "child",   pos: "noun",        role: "subject",   head: true },
        { w: "flew",    pos: "verb",        role: "predicate", head: true },
        { w: "a",       pos: "article",     role: "predicate" },
        { w: "bright",  pos: "adjective",   role: "predicate" },
        { w: "kite",    pos: "noun",        role: "predicate" },
        { w: "across",  pos: "preposition", role: "predicate" },
        { w: "the",     pos: "article",     role: "predicate" },
        { w: "windy",   pos: "adjective",   role: "predicate" },
        { w: "field",   pos: "noun",        role: "predicate" },
      ],
    },
    {
      id: "storm",
      text: "Suddenly, dark clouds gathered and the storm broke.",
      note: "Two independent clauses joined by a conjunction — a compound sentence.",
      tokens: [
        { w: "Suddenly", pos: "adverb",      role: "modifier" },
        { w: "dark",     pos: "adjective",   role: "subject" },
        { w: "clouds",   pos: "noun",        role: "subject",   head: true },
        { w: "gathered", pos: "verb",        role: "predicate", head: true },
        { w: "and",      pos: "conjunction", role: "modifier" },
        { w: "the",      pos: "article",     role: "subject" },
        { w: "storm",    pos: "noun",        role: "subject" },
        { w: "broke",    pos: "verb",        role: "predicate" },
      ],
    },
    {
      id: "gift",
      text: "She quietly handed him the old letter.",
      note: "A pronoun subject with a direct and indirect object.",
      tokens: [
        { w: "She",     pos: "pronoun",   role: "subject",   head: true },
        { w: "quietly", pos: "adverb",    role: "predicate" },
        { w: "handed",  pos: "verb",      role: "predicate", head: true },
        { w: "him",     pos: "pronoun",   role: "predicate" },
        { w: "the",     pos: "article",   role: "predicate" },
        { w: "old",     pos: "adjective", role: "predicate" },
        { w: "letter",  pos: "noun",      role: "predicate" },
      ],
    },
    {
      id: "wow",
      text: "Wow, the tiny robot danced gracefully on the table!",
      note: "Opens with an interjection; watch the adverb modify the verb.",
      tokens: [
        { w: "Wow",       pos: "interjection", role: "modifier" },
        { w: "the",       pos: "article",      role: "subject" },
        { w: "tiny",      pos: "adjective",    role: "subject" },
        { w: "robot",     pos: "noun",         role: "subject",   head: true },
        { w: "danced",    pos: "verb",         role: "predicate", head: true },
        { w: "gracefully",pos: "adverb",       role: "predicate" },
        { w: "on",        pos: "preposition",  role: "predicate" },
        { w: "the",       pos: "article",      role: "predicate" },
        { w: "table",     pos: "noun",         role: "predicate" },
      ],
    },
  ];

  /* A flat bank of words tagged with a single "best" part of speech,
     used by sorting games. Kept deliberately unambiguous for beginners. */
  // ~250 words, each tagged with the single part of speech it clearly plays in
  // ordinary use, so sorting games stay fair. Built by category, then flattened.
  const WORD_BANK = [].concat(
    ["elephant","mountain","river","courage","teacher","kitchen","planet","forest",
     "castle","engine","pillow","seashell","giraffe","orchestra","umbrella","biology",
     "freedom","thunder","diamond","sister","penguin","volcano","blanket","garden",
     "island","ceiling","monster","wizard","journey","muscle","jungle","rocket",
     "tunnel","sandwich","holiday","library","hospital","autumn","valley","glacier",
     "meadow","cabin","canyon","comet","cottage","cousin","avalanche","dragon",
     "feather","galaxy","kingdom","lantern","needle","orchard","pebble","ribbon",
     "temple","treasure","village","zebra","breakfast","calendar","chimney","daughter",
     "fountain","grandmother","hallway","iceberg","kitten","ladder","notebook","telescope"
    ].map(w => ({ w, pos: "noun" })),

    ["become","explore","imagine","discover","believe","protect","rescue","decorate",
     "celebrate","apologize","investigate","participate","negotiate","illuminate",
     "evaporate","hibernate","memorize","exaggerate","hesitate","devour","conquer",
     "stumble","giggle","tremble","wander","scatter","gather","squeeze","whispered",
     "sprinted","galloped","arrived","vanished","collapsed","flourished","wondered",
     "admired","obeyed","invented","explored","imagined","protected","celebrated",
     "discovered","believed","hesitated","apologized","decorated","examined","delivered",
     "scattered","gathered","trembled","wandered","giggled","shivered"
    ].map(w => ({ w, pos: "verb" })),

    ["golden","fragile","enormous","silent","curious","ancient","brilliant","gentle",
     "fierce","slippery","gigantic","delicate","mysterious","cheerful","gloomy","radiant",
     "sturdy","crooked","luminous","weary","jagged","ferocious","transparent","magnificent",
     "peculiar","invisible","tremendous","adorable","courageous","glorious","hideous",
     "marvelous","nimble","obedient","precious","quaint","ridiculous","spectacular",
     "victorious","wobbly","youthful","zealous","dazzling","elegant","graceful","humble",
     "jolly","lively","narrow","plump","shiny","tender","vivid","clumsy","grumpy","fluffy"
    ].map(w => ({ w, pos: "adjective" })),

    ["slowly","often","everywhere","carefully","quickly","silently","gracefully","eagerly",
     "rarely","suddenly","gently","bravely","cheerfully","quietly","loudly","swiftly",
     "wearily","boldly","calmly","clumsily","curiously","eventually","fiercely","frantically",
     "gladly","greedily","honestly","hungrily","joyfully","kindly","lazily","neatly",
     "nervously","patiently","politely","proudly","rapidly","roughly","sharply","smoothly",
     "softly","tightly","warmly","wisely"
    ].map(w => ({ w, pos: "adverb" })),

    ["she","they","it","we","he","you","him","her","them","us","everyone","nobody"
    ].map(w => ({ w, pos: "pronoun" })),

    ["beneath","between","during","toward","above","across","behind","beyond","inside",
     "under","within","against","among","around","before","below","beside","through",
     "underneath","upon"
    ].map(w => ({ w, pos: "preposition" })),

    ["and","but","because","although","or","nor","yet","so","while","unless","since","whether"
    ].map(w => ({ w, pos: "conjunction" })),

    ["a","an","the"].map(w => ({ w, pos: "article" })),

    ["wow","ouch","hey","oh","yikes","hooray","oops","phew","aha","ugh"
    ].map(w => ({ w, pos: "interjection" })),
  );

  /* ======================================================================
     UNIT 1 — extra datasets
     ====================================================================== */

  /* Word-Shape Lab: one root that shifts across parts of speech. */
  const WORD_FORMS = [
    { root: "beauty",
      forms: { noun: "beauty", verb: "beautify", adjective: "beautiful", adverb: "beautifully" },
      examples: {
        noun: "Her ___ amazed everyone.",
        verb: "Volunteers ___ the park each spring.",
        adjective: "It was a ___ morning.",
        adverb: "The room was ___ decorated." } },
    { root: "strength",
      forms: { noun: "strength", verb: "strengthen", adjective: "strong", adverb: "strongly" },
      examples: {
        noun: "Her ___ surprised the coach.",
        verb: "Exercise will ___ your muscles.",
        adjective: "He has a ___ grip.",
        adverb: "She ___ disagreed." } },
    { root: "decision",
      forms: { noun: "decision", verb: "decide", adjective: "decisive", adverb: "decisively" },
      examples: {
        noun: "It was a hard ___.",
        verb: "You must ___ soon.",
        adjective: "She gave a ___ answer.",
        adverb: "The team acted ___." } },
    { root: "danger",
      forms: { noun: "danger", verb: "endanger", adjective: "dangerous", adverb: "dangerously" },
      examples: {
        noun: "They sensed ___ ahead.",
        verb: "Litter can ___ wildlife.",
        adjective: "That is a ___ road.",
        adverb: "He drove ___ fast." } },
    { root: "creation",
      forms: { noun: "creation", verb: "create", adjective: "creative", adverb: "creatively" },
      examples: {
        noun: "The mural was her ___.",
        verb: "Artists ___ every day.",
        adjective: "She has a ___ mind.",
        adverb: "They solved it ___." } },
  ];

  /* Part-of-Speech Detective: the same spelling doing different jobs.
     `idx` is the zero-based position of the target word when the sentence
     is split on spaces. */
  const DISGUISES = [
    { word: "book", uses: [
      { pos: "noun", text: "I finally finished the book.", idx: 4 },
      { pos: "verb", text: "Please book a table for two.", idx: 1 } ] },
    { word: "light", uses: [
      { pos: "noun",      text: "She switched off the light.", idx: 4 },
      { pos: "verb",      text: "They light the candles at dusk.", idx: 1 },
      { pos: "adjective", text: "He packed a light jacket.", idx: 3 } ] },
    { word: "fast", uses: [
      { pos: "adjective", text: "She drives a fast car.", idx: 3 },
      { pos: "adverb",    text: "The cheetah runs fast.", idx: 3 } ] },
    { word: "well", uses: [
      { pos: "adverb", text: "He sings very well.", idx: 3 },
      { pos: "noun",   text: "They drew water from the well.", idx: 5 } ] },
    { word: "run", uses: [
      { pos: "verb", text: "We run before breakfast.", idx: 1 },
      { pos: "noun", text: "She hit a home run.", idx: 4 } ] },
    { word: "watch", uses: [
      { pos: "noun", text: "She wore a silver watch.", idx: 4 },
      { pos: "verb", text: "They watch the sunset.", idx: 1 } ] },
    { word: "play", uses: [
      { pos: "noun", text: "We saw a funny play.", idx: 4 },
      { pos: "verb", text: "Children play in the yard.", idx: 1 } ] },
    { word: "kind", uses: [
      { pos: "adjective", text: "She is a kind person.", idx: 3 },
      { pos: "noun",      text: "What kind of tree is that?", idx: 1 } ] },
    { word: "rock", uses: [
      { pos: "noun", text: "He sat on a rock.", idx: 4 },
      { pos: "verb", text: "Waves rock the small boat.", idx: 1 } ] },
    { word: "point", uses: [
      { pos: "noun", text: "She made a good point.", idx: 4 },
      { pos: "verb", text: "Do not point at strangers.", idx: 2 } ] },
    { word: "train", uses: [
      { pos: "noun", text: "The train left the station.", idx: 1 },
      { pos: "verb", text: "Coaches train the young players.", idx: 1 } ] },
    { word: "dark", uses: [
      { pos: "adjective", text: "We entered the dark cave.", idx: 3 },
      { pos: "noun",      text: "She is afraid of the dark.", idx: 5 } ] },
    { word: "clean", uses: [
      { pos: "verb",      text: "Please clean your room.", idx: 1 },
      { pos: "adjective", text: "He wore a clean shirt.", idx: 3 } ] },
    { word: "hard", uses: [
      { pos: "adjective", text: "This is a hard puzzle.", idx: 3 },
      { pos: "adverb",    text: "She studies very hard.", idx: 3 } ] },
  ];

  /* ======================================================================
     UNIT 2 — subject / predicate, building, fragments
     ====================================================================== */

  /* Splitter: `splitIndex` = number of words in the complete subject; the
     complete predicate begins at that word index (split on spaces). */
  const CORE_SENTENCES = [
    { text: "The curious child flew a bright kite.",
      subject: "The curious child", predicate: "flew a bright kite.", splitIndex: 3 },
    { text: "My little brother reads comic books every night.",
      subject: "My little brother", predicate: "reads comic books every night.", splitIndex: 3 },
    { text: "The old wooden bridge creaked loudly.",
      subject: "The old wooden bridge", predicate: "creaked loudly.", splitIndex: 4 },
    { text: "Three noisy crows landed on the fence.",
      subject: "Three noisy crows", predicate: "landed on the fence.", splitIndex: 3 },
    { text: "She smiled.",
      subject: "She", predicate: "smiled.", splitIndex: 1 },
    { text: "A tiny robot on the shelf blinked twice.",
      subject: "A tiny robot on the shelf", predicate: "blinked twice.", splitIndex: 6 },
  ];

  /* Sentence Builder: pick one from each column. Subject + verb are required;
     object and extra are optional. Every combination is grammatical. */
  const BUILDER = {
    subjects: ["The dog", "A tiny robot", "She", "My best friend", "The old wizard", "Three squirrels"],
    verbs:    ["chased", "built", "whispered to", "found", "juggled", "startled"],
    objects:  ["the ball", "a strange machine", "the new kid", "the golden key", "three apples", "the sleepy cat"],
    extras:   ["quickly", "in the park", "at dawn", "without a sound", "on Tuesday", "again and again"],
  };

  /* Complete-or-Fragment: is it a full sentence? Why or why not? */
  const FRAGMENTS = [
    { text: "The train finally arrived.", complete: true,
      why: "Has a subject (train) and a predicate (arrived) — a complete thought." },
    { text: "Running down the crowded street.", complete: false,
      why: "A phrase with no subject doing the running — who ran?" },
    { text: "Because the power went out.", complete: false,
      why: "A dependent clause. 'Because' leaves you waiting for the rest." },
    { text: "Birds sing every morning.", complete: true,
      why: "Subject (birds) + predicate (sing) = a complete thought." },
    { text: "The tall man in the gray hat.", complete: false,
      why: "All subject, no predicate — the man never does anything." },
    { text: "After the long, tiring game.", complete: false,
      why: "A prepositional phrase, not a sentence. After it, what happened?" },
    { text: "We won.", complete: true,
      why: "Short, but it has a subject (we) and a verb (won). Complete!" },
    { text: "Whenever you are ready.", complete: false,
      why: "A dependent clause — it sets a condition but states no main event." },
  ];

  /* ======================================================================
     UNIT 3 — objects, phrases, clauses
     ====================================================================== */

  /* Object Tracker: each token tagged with its job in the clause. */
  const OBJECTS = [
    { text: "She handed him the letter.",
      tokens: [
        { w: "She",    role: "subject" }, { w: "handed", role: "verb" },
        { w: "him",    role: "indirect" }, { w: "the",   role: "direct" },
        { w: "letter", role: "direct" } ],
      note: "him receives the letter (indirect); the letter is what was handed (direct)." },
    { text: "The teacher gave the students homework.",
      tokens: [
        { w: "The", role: "subject" }, { w: "teacher", role: "subject" },
        { w: "gave", role: "verb" }, { w: "the", role: "indirect" },
        { w: "students", role: "indirect" }, { w: "homework", role: "direct" } ],
      note: "the students get it (indirect); homework is the thing given (direct)." },
    { text: "We baked Grandma a cake.",
      tokens: [
        { w: "We", role: "subject" }, { w: "baked", role: "verb" },
        { w: "Grandma", role: "indirect" }, { w: "a", role: "direct" },
        { w: "cake", role: "direct" } ],
      note: "Grandma receives it (indirect); a cake is what we baked (direct)." },
    { text: "I read a mystery.",
      tokens: [
        { w: "I", role: "subject" }, { w: "read", role: "verb" },
        { w: "a", role: "direct" }, { w: "mystery", role: "direct" } ],
      note: "Only a direct object here — nobody is receiving anything." },
    { text: "They sent me a postcard.",
      tokens: [
        { w: "They", role: "subject" }, { w: "sent", role: "verb" },
        { w: "me", role: "indirect" }, { w: "a", role: "direct" },
        { w: "postcard", role: "direct" } ],
      note: "me is the recipient (indirect); a postcard is what was sent (direct)." },
  ];

  const OBJECT_ROLES = {
    subject:  { label: "Subject",         color: "#6fb3ff" },
    verb:     { label: "Verb",            color: "#ff7a90" },
    direct:   { label: "Direct object",   color: "#ffd166" },
    indirect: { label: "Indirect object", color: "#4fd6c9" },
  };

  /* Phrase Painter: highlight phrase spans by word index range [start,end]. */
  const PHRASE_TYPES = {
    prepositional: { label: "Prepositional phrase", color: "#c792ea" },
    noun:          { label: "Noun phrase",          color: "#6fb3ff" },
    verb:          { label: "Verb phrase",          color: "#ff7a90" },
  };
  const PHRASES = [
    { text: "The cat with green eyes slept on the warm windowsill.",
      words: ["The","cat","with","green","eyes","slept","on","the","warm","windowsill."],
      spans: [
        { type: "noun",          start: 0, end: 4, note: "the whole subject" },
        { type: "prepositional", start: 2, end: 4, note: "describes the cat" },
        { type: "verb",          start: 5, end: 9, note: "what the cat did" },
        { type: "prepositional", start: 6, end: 9, note: "tells where" } ] },
    { text: "A boy in a red coat waved from the window.",
      words: ["A","boy","in","a","red","coat","waved","from","the","window."],
      spans: [
        { type: "noun",          start: 0, end: 5, note: "the whole subject" },
        { type: "prepositional", start: 2, end: 5, note: "describes the boy" },
        { type: "verb",          start: 6, end: 9, note: "what the boy did" },
        { type: "prepositional", start: 7, end: 9, note: "tells where" } ] },
    { text: "The tired hikers rested under a tall pine.",
      words: ["The","tired","hikers","rested","under","a","tall","pine."],
      spans: [
        { type: "noun",          start: 0, end: 2, note: "the whole subject" },
        { type: "verb",          start: 3, end: 7, note: "what the hikers did" },
        { type: "prepositional", start: 4, end: 7, note: "tells where" } ] },
  ];

  /* Clause Combiner: two independent clauses + connectors that fuse them.
     Each option's result is precomputed and correct. */
  const CLAUSES = [
    { a: "The rain fell hard", b: "we stayed inside",
      options: [
        { connector: "and",     type: "coordinating",  result: "The rain fell hard, and we stayed inside." },
        { connector: "so",      type: "coordinating",  result: "The rain fell hard, so we stayed inside." },
        { connector: "because", type: "subordinating", result: "Because the rain fell hard, we stayed inside." },
        { connector: "while",   type: "subordinating", result: "While the rain fell hard, we stayed inside." } ] },
    { a: "She studied for weeks", b: "she passed the exam",
      options: [
        { connector: "and",     type: "coordinating",  result: "She studied for weeks, and she passed the exam." },
        { connector: "so",      type: "coordinating",  result: "She studied for weeks, so she passed the exam." },
        { connector: "because", type: "subordinating", result: "Because she studied for weeks, she passed the exam." },
        { connector: "after",   type: "subordinating", result: "After she studied for weeks, she passed the exam." } ] },
    { a: "The music started", b: "the crowd cheered",
      options: [
        { connector: "and",   type: "coordinating",  result: "The music started, and the crowd cheered." },
        { connector: "so",    type: "coordinating",  result: "The music started, so the crowd cheered." },
        { connector: "when",  type: "subordinating", result: "When the music started, the crowd cheered." },
        { connector: "as",    type: "subordinating", result: "As the music started, the crowd cheered." } ] },
  ];

  /* ======================================================================
     UNIT 4 — sentence types, punctuation, run-ons
     ====================================================================== */

  const SENTENCE_TYPES = [
    { text: "The dog barked.", type: "simple",
      why: "One independent clause. Just a subject and a predicate." },
    { text: "Birds and squirrels chattered in the oak.", type: "simple",
      why: "A compound subject, but still one clause — so it's simple." },
    { text: "The sun set, and the stars appeared.", type: "compound",
      why: "Two independent clauses joined by a comma + 'and'." },
    { text: "I called her, but she did not answer.", type: "compound",
      why: "Two complete clauses joined by a comma + 'but'." },
    { text: "Because it rained, we canceled the picnic.", type: "complex",
      why: "One dependent clause ('Because it rained') + one independent clause." },
    { text: "The book that you lent me was wonderful.", type: "complex",
      why: "An independent clause with a dependent clause tucked inside." },
    { text: "When the bell rang, the students left, and the hall grew quiet.", type: "compound-complex",
      why: "A dependent clause + TWO independent clauses. Complex and compound." },
    { text: "She sang while he played, so the room fell silent.", type: "compound-complex",
      why: "Dependent 'while he played' plus two independent clauses." },
  ];
  const SENTENCE_TYPE_INFO = {
    "simple":           { label: "Simple",           blurb: "1 independent clause" },
    "compound":         { label: "Compound",         blurb: "2+ independent clauses" },
    "complex":          { label: "Complex",          blurb: "1 independent + 1+ dependent" },
    "compound-complex": { label: "Compound-complex", blurb: "2+ independent + 1+ dependent" },
  };

  /* Punctuation Playground: a comma (or its absence) flips the meaning. */
  const PUNCTUATION_PAIRS = [
    { id: "grandma", base: "Let's eat Grandma",
      variants: [
        { text: "Let's eat, Grandma.", meaning: "You're inviting Grandma to eat. (talking TO her)" },
        { text: "Let's eat Grandma.",  meaning: "Grandma is on the menu! (yikes)" } ] },
    { id: "pets", base: "I love cooking my family and my dog",
      variants: [
        { text: "I love cooking, my family, and my dog.", meaning: "Three things you love: cooking, family, dog." },
        { text: "I love cooking my family and my dog.",   meaning: "You cook your family and your dog. (yikes)" } ] },
    { id: "panda", base: "The panda eats shoots and leaves",
      variants: [
        { text: "The panda eats shoots and leaves.",   meaning: "A diet: it eats bamboo shoots and leaves." },
        { text: "The panda eats, shoots, and leaves.", meaning: "Three actions: it eats, fires a gun, then departs." } ] },
  ];

  /* Run-on Repair: a broken sentence and three correct ways to fix it. */
  const RUNONS = [
    { text: "I love to write it is my favorite hobby.", kind: "fused sentence (no punctuation between clauses)",
      fixes: [
        { label: "Period",              result: "I love to write. It is my favorite hobby." },
        { label: "Semicolon",           result: "I love to write; it is my favorite hobby." },
        { label: "Comma + conjunction", result: "I love to write, and it is my favorite hobby." } ] },
    { text: "The rain stopped, we went outside.", kind: "comma splice (only a comma between clauses)",
      fixes: [
        { label: "Period",              result: "The rain stopped. We went outside." },
        { label: "Semicolon",           result: "The rain stopped; we went outside." },
        { label: "Comma + conjunction", result: "The rain stopped, so we went outside." } ] },
    { text: "She trained every day she wanted to win.", kind: "fused sentence (no punctuation between clauses)",
      fixes: [
        { label: "Period",              result: "She trained every day. She wanted to win." },
        { label: "Semicolon",           result: "She trained every day; she wanted to win." },
        { label: "Subordinate clause",  result: "She trained every day because she wanted to win." } ] },
  ];

  /* ======================================================================
     STYLE & STRUCTURE — branch point
     ====================================================================== */

  const ACTIVE_PASSIVE = [
    { active: "The chef cooked the meal.",        passive: "The meal was cooked by the chef.",
      doer: "the chef", receiver: "the meal", action: "cooked" },
    { active: "Lightning struck the tower.",       passive: "The tower was struck by lightning.",
      doer: "lightning", receiver: "the tower", action: "struck" },
    { active: "The committee approved the plan.",  passive: "The plan was approved by the committee.",
      doer: "the committee", receiver: "the plan", action: "approved" },
    { active: "A dog chased the mail carrier.",    passive: "The mail carrier was chased by a dog.",
      doer: "a dog", receiver: "the mail carrier", action: "chased" },
  ];

  /* Rhythm & Length: word counts are computed in the module from the text. */
  const RHYTHM = [
    { id: "monotone", label: "All the same length",
      sentences: ["The dog ran fast.", "The cat sat still.", "The bird flew high.", "The fish swam deep."] },
    { id: "varied", label: "Varied rhythm",
      sentences: ["The dog ran.", "Fast.",
        "Then, without any warning at all, the cat leaped from the fence and vanished into the tall grass.",
        "Silence."] },
  ];

  /* Combining & Reducing. */
  const COMBINE = [
    { choppy: ["The dog was small.", "The dog was brown.", "The dog barked loudly."],
      combined: "The small brown dog barked loudly.",
      note: "Fold the descriptions into one noun; keep the one real action." },
    { choppy: ["Maria opened the door.", "Maria saw a package.", "The package was on the step."],
      combined: "When Maria opened the door, she saw a package on the step.",
      note: "Subordinate the setup; merge the repeated 'package'." },
  ];
  const REDUCE = [
    { bloated: "Due to the fact that it was raining, we made the decision to stay at home.",
      trimmed: "Because it was raining, we decided to stay home." },
    { bloated: "In the event that you are able to attend, please respond back to me.",
      trimmed: "If you can attend, please reply." },
  ];

  /* Parallelism Tuner: mismatched list items vs. aligned ones. */
  const PARALLELISM = [
    { broken: "She likes running, to swim, and biking.",
      fixed:  "She likes running, swimming, and biking.",
      note: "Make all three items -ing gerunds." },
    { broken: "The coach told us to hustle, that we should focus, and staying positive.",
      fixed:  "The coach told us to hustle, to focus, and to stay positive.",
      note: "Match all three as 'to ___' infinitives." },
    { broken: "The job requires typing, to file, and answering phones.",
      fixed:  "The job requires typing, filing, and answering phones.",
      note: "Line up all three as -ing forms." },
  ];

  root.WL_GRAMMAR = {
    PARTS, SENTENCES, WORD_BANK,
    POS_ORDER: [
      "noun", "pronoun", "verb", "adjective", "adverb",
      "preposition", "conjunction", "article", "interjection",
    ],
    // Unit 1
    WORD_FORMS, DISGUISES,
    // Unit 2
    CORE_SENTENCES, BUILDER, FRAGMENTS,
    // Unit 3
    OBJECTS, OBJECT_ROLES, PHRASE_TYPES, PHRASES, CLAUSES,
    // Unit 4
    SENTENCE_TYPES, SENTENCE_TYPE_INFO, PUNCTUATION_PAIRS, RUNONS,
    // Style & structure
    ACTIVE_PASSIVE, RHYTHM, COMBINE, REDUCE, PARALLELISM,
  };
})(typeof window !== "undefined" ? window : this);
