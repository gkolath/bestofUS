// Static content: prompts, card decks, vibes, rituals.
window.UsTwoContent = {
  dailyPrompts: [
    "What's one moment from this week when you wanted me and didn't say so?",
    "What's something I do without thinking that you find unreasonably attractive?",
    "When did you last feel truly seen by me? What was I doing?",
    "What's one thing you'd like more of from me this week, in or out of bed?",
    "Describe the first time you knew you wanted me. Be specific.",
    "What part of our life together do you think we've stopped noticing?",
    "If we had tonight completely to ourselves, no phones and no plans, how would you want it to go?",
    "What's a fantasy you've had about us that you've never said out loud?",
    "What's something about my body you think I don't know you love?",
    "When do you feel most desired by me, and when do you feel least?",
    "What's one small thing that would make you feel more looked after right now?",
    "What do you miss about how we were at the very beginning, and what's better now?"
  ],

  decks: {
    deep: {
      label: 'Deep',
      cards: [
        "Is there something you've been wanting to ask or tell me, but haven't found the right moment?",
        "What's a fear or worry you're carrying right now that I could help hold?",
        "Where do you think we've grown most as a couple this year, and where have we stalled?",
        "What does feeling safe with me look like in the middle of an argument?",
        "What's something you need from me that you've been afraid to ask for?",
        "When have you felt lonely in our relationship, even with me right there?"
      ]
    },
    playful: {
      label: 'Playful',
      cards: [
        "Free plane tickets for tomorrow morning: where are we going, and what are we eating first?",
        "What was your first impression of me, honestly, and how wrong was it?",
        "If we swapped lives for a week, what part of my day would break you first?",
        "Which of my habits do you pretend to hate but secretly love?",
        "What's the most attractive thing I've ever done without realizing it?",
        "What song makes you think of us, and why that one?"
      ]
    },
    afterdark: {
      label: 'After Dark',
      cards: [
        "What's something we used to do in bed that you'd love to bring back?",
        "Tell me, in detail, about the best night we've ever had together.",
        "What's one thing you've wanted to try with me but haven't asked for yet?",
        "Where on your body do you most want my mouth tonight?",
        "What do I wear, or not wear, that you can't stop looking at?",
        "Describe your perfect slow evening with me, from the first kiss to falling asleep.",
        "What do you want me to say to you more often when we're alone?",
        "Is there a place, outside our bedroom, where you've imagined us?"
      ]
    },
    appreciation: {
      label: 'Appreciation',
      cards: [
        "What's one strength of mine you think I underestimate?",
        "Name a time I showed up for you that you still think about.",
        "What's something about the way I love you that feels completely ours?",
        "Finish the sentence: \"I'm proud of you for...\""
      ]
    }
  },

  vibes: [
    'In the mood',
    'Playful',
    'Want to be held',
    'Quiet night in',
    'Distracted, talk later',
    'Running on empty'
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

  // "Spark" intimacy tab. Text-only, gender-neutral wording ("one of you", "the other").
  // heat: 1 = Sweet (romantic, sensual), 2 = Steamy (sexual), 3 = Scorching (adventurous).
  // energy: the lowest shared energy it suits: 'low' | 'medium' | 'high'.
  // when: 'weekday' | 'weekend' | 'any'. kind: 'closeness' (non-sexual), 'tease', 'play', 'position'.
  spark: {
    heats: [
      { value: 1, label: 'Sweet', hint: 'Romantic and sensual' },
      { value: 2, label: 'Steamy', hint: 'Sexual, with plenty of build-up' },
      { value: 3, label: 'Scorching', hint: 'Bold, playful, adventurous' }
    ],
    // How each pulse vibe maps to energy for tonight. 'rest' means suggest only non-sexual closeness.
    vibeEnergy: {
      'In the mood': 'high',
      'Playful': 'high',
      'Want to be held': 'low',
      'Quiet night in': 'low',
      'Distracted, talk later': 'medium',
      'Running on empty': 'rest'
    },
    ideas: [
      // ---- Closeness: the only suggestions when either of you needs rest ----
      { id: 'c-cuddle', kind: 'closeness', heat: 1, energy: 'low', when: 'any', minutes: 15,
        title: 'Skin to skin', desc: 'Clothes off, lights off, phones in another room. Just hold each other, bare skin against bare skin, and breathe together for fifteen minutes. Nothing else is expected, which is exactly why it feels so good.' },
      { id: 'c-bath', kind: 'closeness', heat: 1, energy: 'low', when: 'any', minutes: 30,
        title: 'Run them a bath', desc: 'Draw a hot bath with candles and something to drink. Climb in behind them, wash their hair, trace slow circles on their shoulders. Let it stay soothing tonight.' },
      { id: 'c-hold', kind: 'closeness', heat: 1, energy: 'low', when: 'weekday', minutes: 10,
        title: 'Fall asleep tangled', desc: 'Get into bed ten minutes early, face to face. Tell them one thing about their body you love and one thing about them you\'d never want to change. Fall asleep touching.' },

      // ---- Sweet: romantic, sensual ----
      { id: 's-kiss', kind: 'tease', heat: 1, energy: 'low', when: 'weekday', minutes: 10,
        title: 'The ten-minute kiss', desc: 'Set a timer and do nothing but kiss for ten minutes. No hands below the neck. Slow, deep, with pauses where you just breathe on each other\'s lips. Most couples haven\'t kissed like this since the beginning.' },
      { id: 's-massage', kind: 'play', heat: 1, energy: 'low', when: 'any', minutes: 30,
        title: 'Oil massage, no rules broken', desc: 'Warm the oil in your hands first. Work down their back, thighs and the backs of their knees, getting slowly closer to where they want you without ever arriving. When it\'s their turn, they have to keep the same rule.' },
      { id: 's-undress', kind: 'tease', heat: 1, energy: 'medium', when: 'any', minutes: 20,
        title: 'Undress me slowly', desc: 'Take turns removing one piece of clothing from each other, and kiss every bit of skin you reveal before moving on. Whoever rushes has to start over.' },
      { id: 's-dance', kind: 'tease', heat: 1, energy: 'medium', when: 'weekend', minutes: 30,
        title: 'Slow dance, bedroom ending', desc: 'Put on the song from your early days and slow dance in the kitchen, pressed close. Keep dancing as the songs get slower, and let it drift toward the bedroom on its own.' },
      { id: 's-eyes', kind: 'position', heat: 1, energy: 'low', when: 'any', minutes: 30,
        title: 'Face to face, eyes open', desc: 'Lie on your sides facing each other, legs intertwined, and make love slowly without closing your eyes. It feels almost too intimate at first, then it becomes the most connected you\'ve felt in months.' },
      { id: 's-morning', kind: 'play', heat: 1, energy: 'low', when: 'weekend', minutes: 45,
        title: 'Lazy morning in bed', desc: 'No alarm. Wake them up with slow kisses down their neck and back, and see where the morning goes. Coffee can wait.' },

      // ---- Steamy: sexual, with build-up ----
      { id: 'h-text', kind: 'tease', heat: 2, energy: 'low', when: 'weekday', minutes: 0,
        title: 'Slow-burn texts', desc: 'Through the day, send three messages, each more explicit than the last, describing exactly what you\'re going to do to them tonight. Then make sure you follow through on every word.' },
      { id: 'h-shower', kind: 'play', heat: 2, energy: 'medium', when: 'weekday', minutes: 20,
        title: 'Shower together', desc: 'Soap each other up slowly, hands everywhere, steam and wet skin. Press them against the cool tiles. If you don\'t finish there, you\'ll finish the moment you\'re dry.' },
      { id: 'h-spoon', kind: 'position', heat: 2, energy: 'low', when: 'weekday', minutes: 20,
        title: 'Spooning, slow and deep', desc: 'Lie on your sides, one of you wrapped around the other from behind. Free hands roam over chest, stomach and between the legs, and kisses go to the back of the neck. Perfect for a tired night that still deserves to end well.' },
      { id: 'h-oral', kind: 'play', heat: 2, energy: 'low', when: 'any', minutes: 20,
        title: 'All about you', desc: 'Tonight one of you only receives. The giver goes down slowly, takes their time, and listens to every breath and sound to learn what works. The receiver\'s only job is to relax and say "more" or "right there".' },
      { id: 'h-mirror', kind: 'play', heat: 2, energy: 'medium', when: 'any', minutes: 30,
        title: 'Watch yourselves', desc: 'Move a mirror where you can both see it, or move yourselves to one. Seeing your bodies together from the outside is surprisingly intense. Keep glancing up and catching each other\'s eyes in the reflection.' },
      { id: 'h-touch', kind: 'play', heat: 2, energy: 'low', when: 'any', minutes: 20,
        title: 'Show me how you touch yourself', desc: 'Take turns touching yourselves while the other watches from close up. Then guide their hand to copy exactly what you were doing. You\'ll each learn more in ten minutes than in years of guessing.' },
      { id: 'h-top', kind: 'position', heat: 2, energy: 'medium', when: 'any', minutes: 25,
        title: 'You set the pace', desc: 'One of you lies back, and the other climbs on top and takes complete control of rhythm and depth. The one underneath only gets to touch with their hands and to beg for faster or slower. Switch control halfway if you like.' },
      { id: 'h-pillow', kind: 'position', heat: 2, energy: 'medium', when: 'weekday', minutes: 20,
        title: 'Missionary, with a pillow', desc: 'Slide a firm pillow under the hips of the partner on their back. The new angle means deeper and more direct contact, and often a much stronger finish. Hold hands above their head as you move.' },
      { id: 'h-edge', kind: 'position', heat: 2, energy: 'high', when: 'any', minutes: 25,
        title: 'Edge of the bed', desc: 'One of you lies back at the edge of the bed, legs over the other\'s shoulders or wrapped around their waist, while the other stands or kneels. Easy on the knees, and a great view for both of you.' },
      { id: 'h-lotus', kind: 'position', heat: 2, energy: 'medium', when: 'weekend', minutes: 30,
        title: 'Lotus', desc: 'One sits cross-legged and the other settles into their lap facing them, arms and legs wrapped around. Rock rather than thrust: it\'s all grinding, kissing and breathing into each other\'s mouth.' },
      { id: 'h-couch', kind: 'position', heat: 2, energy: 'high', when: 'weekend', minutes: 20,
        title: 'Not in the bedroom', desc: 'The couch, the kitchen counter, the floor in front of the fire. Start kissing wherever you are when the mood hits and don\'t let yourselves move to the bed.' },
      { id: 'h-behind', kind: 'position', heat: 2, energy: 'high', when: 'weekend', minutes: 25,
        title: 'From behind', desc: 'One of you on hands and knees or bent over the bed, the other behind holding their hips. Reach around to touch them too. Since you can\'t see faces, check in out loud and tell them how good it feels.' },

      // ---- Scorching: bold, playful, adventurous ----
      { id: 'x-blindfold', kind: 'play', heat: 3, energy: 'medium', when: 'any', minutes: 40,
        title: 'Blindfolded', desc: 'Blindfold one of you with a tie or scarf. The other teases them with mouth, fingertips, ice and warm breath, never letting them guess what\'s next. Agree a word that means "pause" before you start.' },
      { id: 'x-tied', kind: 'play', heat: 3, energy: 'medium', when: 'weekend', minutes: 45,
        title: 'Hands tied', desc: 'Loosely tie one partner\'s wrists to the headboard with a soft scarf, loose enough to slip out of. The other has total control and takes their time. Use a safeword and check in often, then swap next time.' },
      { id: 'x-edging', kind: 'play', heat: 3, energy: 'medium', when: 'any', minutes: 40,
        title: 'Edging', desc: 'Bring one of you right to the edge, then stop. Wait, kiss, start again. Do it three times before you let them finish. The release at the end is in a different league.' },
      { id: 'x-talk', kind: 'tease', heat: 3, energy: 'medium', when: 'any', minutes: 25,
        title: 'Say it out loud', desc: 'Tonight neither of you is allowed to be quiet. Narrate what you\'re doing, what you want next, how they feel and taste. If dirty talk is new to you, start with whispers in their ear.' },
      { id: 'x-roleplay', kind: 'play', heat: 3, energy: 'high', when: 'weekend', minutes: 120,
        title: 'Strangers at the bar', desc: 'Arrive separately at a bar and pretend you\'ve never met. Flirt, let them "pick you up", and go home together. Stay in character as long as you can.' },
      { id: 'x-toy', kind: 'play', heat: 3, energy: 'medium', when: 'any', minutes: 30,
        title: 'Bring in a toy', desc: 'Use a vibrator on the other partner during foreplay, or keep it between you during sex. If you don\'t own one, choose one together online tonight. Picking it out is foreplay in itself.' },
      { id: 'x-standing', kind: 'position', heat: 3, energy: 'high', when: 'weekend', minutes: 15,
        title: 'Up against the wall', desc: 'Start kissing the moment you walk through the door and don\'t make it to the bed. Press them against the wall, and lift a leg around your hip. Fast, urgent, and hard to forget.' },
      { id: 'x-69', kind: 'position', heat: 3, energy: 'medium', when: 'weekend', minutes: 20,
        title: 'Sixty-nine', desc: 'Lie on your sides head to toe so nobody has to hold themselves up, and pleasure each other at the same time. It\'s a game of focus: whoever gets more distracted loses.' },
      { id: 'x-reverse', kind: 'position', heat: 3, energy: 'high', when: 'weekend', minutes: 20,
        title: 'Reverse on top', desc: 'The partner on top faces away, toward the feet, and leans forward or back to change the angle. The one underneath gets a view they\'ll remember and two free hands for their hips.' },
      { id: 'x-yesno', kind: 'tease', heat: 3, energy: 'low', when: 'weekday', minutes: 30,
        title: 'Yes / No / Maybe list', desc: 'Separately, each write ten things you\'ve fantasized about but never said. Swap lists and mark each one yes, no or maybe. No explaining a "no". The yeses are your next month of weekends.' },
      { id: 'x-quickie', kind: 'position', heat: 3, energy: 'high', when: 'weekday', minutes: 10,
        title: 'Ten-minute quickie', desc: 'Before work or the moment you\'re both home. Skirts up, pants down, no undressing. The urgency is the whole point, and you\'ll both be smiling for the rest of the day.' },
      { id: 'x-hotel', kind: 'play', heat: 3, energy: 'high', when: 'weekend', minutes: 0,
        title: 'Hotel night', desc: 'Book a room in your own city, even for one night. Pack the outfit you\'d never wear at home. New sheets and no laundry in sight make you different people.' }
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
