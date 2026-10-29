// Static content: prompts, card decks, vibes, rituals.
window.UsTwoContent = {
  dailyPrompts: [
    "What is one small moment from this past week where you felt really connected to me?",
    "How can I best support you or make your life 10% easier over the next few days?",
    "What is a memory of us that always makes you smile when it pops into your head?",
    "When do you feel most loved and desired by me?",
    "What's something you're looking forward to that we haven't talked about yet?",
    "What's one thing I did recently that you didn't say thank you for, but noticed?",
    "If today had a soundtrack, what song would be playing and why?"
  ],

  decks: {
    deep: {
      label: '🌊 Deep & Vulnerable',
      cards: [
        "Is there something you've been wanting to ask or tell me lately, but haven't found the right moment?",
        "What is one fear or stressor you're carrying right now that I can help hold?",
        "How have we grown the most as a couple in the last year?",
        "What does emotional safety look like to you during a disagreement?"
      ]
    },
    playful: {
      label: '✨ Playful',
      cards: [
        "If we had a free plane ticket to anywhere tomorrow morning, where are we going and what are we eating first?",
        "What was your very first impression of me vs. what you know now?",
        "If we swapped jobs for a week, what part of my day would drive you crazy first?",
        "What's a weird quirk of mine that you secretly find endearing?"
      ]
    },
    spicy: {
      label: '🔥 Intimate & Spicy',
      cards: [
        "What is something we haven't done in a while that you'd love to bring back into the bedroom?",
        "What outfit or look of mine immediately catches your eye?",
        "Describe your ideal slow, uninterrupted evening together from start to finish.",
        "Where is your favorite place to be kissed or touched when we're winding down?"
      ]
    },
    appreciation: {
      label: '💛 Appreciation',
      cards: [
        "What's one strength of mine you think I underestimate?",
        "Name a time I showed up for you that you still think about.",
        "What's something about how I love you that feels uniquely 'us'?",
        "Finish the sentence: 'I'm proud of you for...'"
      ]
    }
  },

  vibes: [
    '⚡ Energized & Chatty',
    '🌙 Quiet Cuddles',
    '🔋 Low Battery (Need TLC)',
    '🔥 Feeling Romantic',
    '🧠 Heads-down, talk later',
    '🤗 Need a hug'
  ],

  // Weekly check-in, loosely inspired by the Gottman Institute's "State of the Union" meeting.
  // This is an adaptation, not the official format.
  checkinTemplate: [
    { key: 'appreciations', label: 'Appreciations', hint: 'Five things I appreciated about you this week.' },
    { key: 'going_well', label: "What's going well", hint: 'Something that felt good about us lately.' },
    { key: 'one_topic', label: 'One thing to talk about', hint: 'One issue, stated gently, as "I feel... about... I need..."' },
    { key: 'need', label: 'What I need this week', hint: 'One concrete request.' },
    { key: 'ahead', label: 'Looking ahead', hint: 'Plans, dates, or busy days coming up.' }
  ],

  challenges: [
    {
      id: 'touch7', title: '7 days of intentional touch', days: 7,
      steps: [
        'A 20-second hug before one of you leaves.',
        'Hold hands on a walk or on the couch for 10 minutes.',
        'A slow, no-agenda kiss.',
        'Give a 5-minute shoulder or foot rub.',
        'Fall asleep touching (a hand, a foot, anything).',
        'Dance to one song in the kitchen.',
        'Take turns describing what touch feels most loving to you.'
      ]
    },
    {
      id: 'gratitude7', title: '7 days of gratitude', days: 7,
      steps: [
        'Drop one note in the Love Jar.',
        'Thank your partner for something they do that usually goes unnoticed.',
        'Tell a friend (or your partner) one thing you admire about them.',
        'Recreate a small kindness they did for you.',
        'Share a favorite photo of the two of you and why you love it.',
        'Name a quality of theirs you hope rubs off on you.',
        'Write a short "year in review" of what they bring to your life.'
      ]
    },
    {
      id: 'curiosity5', title: '5 nights of curiosity', days: 5,
      steps: [
        'Draw a Deep card and answer it phone-free.',
        'Ask about a childhood memory you have never heard.',
        'Ask what a "perfect ordinary day" looks like to them.',
        'Ask what they are quietly worried about.',
        'Ask what they want more of from you this month.'
      ]
    }
  ],

  // "Spark" intimacy tab. Text-only, inclusive wording ("one partner", "the other"), nothing graphic.
  // level: gentle (weekday-friendly, low effort) | warm | adventurous (weekend-friendly).
  // energy: the lowest shared energy it suits: 'low' | 'medium' | 'high'.
  // when: 'weekday' | 'weekend' | 'any'. kind: 'closeness' (non-sexual), 'play', 'position'.
  spark: {
    // How each pulse vibe maps to energy for tonight. 'rest' means suggest only non-sexual closeness.
    vibeEnergy: {
      '⚡ Energized & Chatty': 'high',
      '🔥 Feeling Romantic': 'high',
      '🌙 Quiet Cuddles': 'low',
      '🤗 Need a hug': 'low',
      '🧠 Heads-down, talk later': 'low',
      '🔋 Low Battery (Need TLC)': 'rest'
    },
    ideas: [
      // Closeness: always available, and the only suggestions when either partner needs rest.
      { id: 'c-cuddle', kind: 'closeness', level: 'gentle', energy: 'low', when: 'any', minutes: 15,
        title: 'Phones-down cuddle', desc: 'Lights low, phones in another room. Lie close for fifteen minutes and just breathe together. Nothing else is expected.' },
      { id: 'c-massage', kind: 'closeness', level: 'gentle', energy: 'low', when: 'any', minutes: 20,
        title: 'Ten minutes each', desc: 'Take turns giving a slow back or shoulder massage, ten minutes each. The receiver says "softer" or "more" as you go.' },
      { id: 'c-bath', kind: 'closeness', level: 'gentle', energy: 'low', when: 'any', minutes: 30,
        title: 'Shared bath or shower', desc: 'Warm water, a candle, no agenda. Wash each other\'s hair. Let it stay relaxing unless you both want more.' },
      { id: 'c-kiss', kind: 'closeness', level: 'gentle', energy: 'low', when: 'weekday', minutes: 5,
        title: 'The two-minute kiss', desc: 'Set a timer for two minutes and kiss slowly until it rings. Then decide together whether to stop there.' },

      // Play: setting the mood, communication, anticipation.
      { id: 'p-yesnomaybe', kind: 'play', level: 'warm', energy: 'medium', when: 'any', minutes: 30,
        title: 'Yes / No / Maybe night', desc: 'Separately, each write a few things you\'d like to try, then share them and sort each into yes, no or maybe. No explaining a "no" needed.' },
      { id: 'p-tease', kind: 'play', level: 'warm', energy: 'medium', when: 'weekday', minutes: 0,
        title: 'Slow-burn day', desc: 'Send each other one flirty message during the day about what you\'re looking forward to. Keep it to words; the payoff is tonight.' },
      { id: 'p-guide', kind: 'play', level: 'warm', energy: 'medium', when: 'any', minutes: 30,
        title: 'Show me how', desc: 'One partner guides the other\'s hand to show exactly the touch they like best, then swap. Go slowly and talk.' },
      { id: 'p-scene', kind: 'play', level: 'adventurous', energy: 'high', when: 'weekend', minutes: 90,
        title: 'Set the scene', desc: 'Change the room: candles, a playlist you pick together, fresh sheets. Start with a long massage and let the evening take its time.' },
      { id: 'p-new-room', kind: 'play', level: 'adventurous', energy: 'high', when: 'weekend', minutes: 60,
        title: 'Somewhere new', desc: 'Pick a different room or a different time of day than usual, like a lazy weekend morning. Novelty alone makes it memorable.' },
      { id: 'p-blindfold', kind: 'play', level: 'adventurous', energy: 'medium', when: 'weekend', minutes: 45,
        title: 'Blindfold & senses', desc: 'One partner wears a blindfold or scarf while the other uses touch, temperature and taste. Agree on a word that means "pause" before you start.' },

      // Positions: described plainly, comfort-first.
      { id: 'x-spoon', kind: 'position', level: 'gentle', energy: 'low', when: 'weekday', minutes: 20,
        title: 'Spooning', desc: 'Both lie on your sides facing the same way, one partner wrapped around the other from behind. Close, slow and low-effort: ideal for tired nights.' },
      { id: 'x-face-side', kind: 'position', level: 'gentle', energy: 'low', when: 'any', minutes: 20,
        title: 'Side by side, face to face', desc: 'Lie on your sides facing each other with legs intertwined. Lots of eye contact and kissing, and no one carries the effort.' },
      { id: 'x-pillow', kind: 'position', level: 'warm', energy: 'medium', when: 'weekday', minutes: 20,
        title: 'Classic, with a pillow', desc: 'Face to face with one partner on their back and a pillow under their hips. A small change in angle that often makes a familiar position feel new.' },
      { id: 'x-on-top', kind: 'position', level: 'warm', energy: 'medium', when: 'any', minutes: 25,
        title: 'One partner on top', desc: 'One partner lies back while the other sits astride and sets the pace. The partner on top leads; the other just enjoys and follows.' },
      { id: 'x-lotus', kind: 'position', level: 'adventurous', energy: 'medium', when: 'weekend', minutes: 30,
        title: 'Lotus', desc: 'One partner sits cross-legged and the other sits in their lap facing them, wrapping arms and legs around. More about closeness and rhythm than speed.' },
      { id: 'x-edge', kind: 'position', level: 'adventurous', energy: 'high', when: 'weekend', minutes: 25,
        title: 'Edge of the bed', desc: 'One partner lies back at the edge of the bed while the other kneels or stands. Easy on the knees, and a nice change of view.' },
      { id: 'x-from-behind', kind: 'position', level: 'adventurous', energy: 'high', when: 'weekend', minutes: 25,
        title: 'From behind, kneeling', desc: 'One partner on hands and knees or resting on pillows, the other kneeling behind. Keep checking in, since you can\'t see each other\'s faces.' }
    ]
  },

  dateIdeas: [
    'Cook a recipe from the country you want to visit next',
    'Sunrise walk with coffee',
    'Phone-free picnic',
    'Take a class together (pottery, dance, climbing)',
    'Recreate your first date'
  ]
};
