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

  dateIdeas: [
    'Cook a recipe from the country you want to visit next',
    'Sunrise walk with coffee',
    'Phone-free picnic',
    'Take a class together (pottery, dance, climbing)',
    'Recreate your first date'
  ]
};
