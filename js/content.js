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
      { value: 1, label: 'Horny', hint: 'Slow, close and easy to say yes to' },
      { value: 2, label: 'Hornier', hint: 'More adventurous positions, more passion' },
      { value: 3, label: 'Horniest', hint: 'Bold, athletic, nothing held back' }
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
    // Tonight's main suggestion. Roles are written without gender so they work for every couple:
    // each position says what's in it for both of you.
    positions: [
      // ---- Horny: slow, close, easy to say yes to ----
      { id: 'p-eyes', heat: 1, energy: 'low', when: 'any',
        title: 'Face to face, eyes open', desc: 'Lying on your sides, wrapped up in each other, moving slowly without ever looking away.',
        how: ['Lie on your sides facing each other.', 'Hook your top leg over their hip and pull them in close.', 'Keep your eyes open the whole time, however intense it feels.'],
        roles: [['For you both', 'Nobody is holding their weight, so you can last a long time and kiss the whole way through.'], ['Why it lands', 'Eye contact during sex feels exposed at first. That vulnerability is what makes it so connecting.']],
        tip: 'Lights low but not off. You want to see each other.' },
      { id: 'p-spoon', heat: 1, energy: 'low', when: 'any',
        title: 'Spooning', desc: 'Lying on your sides, one wrapped around the other from behind. Lazy, warm and deep.',
        how: ['The little spoon lies on their side and pushes back into the big spoon.', 'The big spoon enters from behind and wraps an arm around their chest.', 'Move together in small, slow rocks rather than big thrusts.'],
        roles: [['In front', 'You\'re held completely, and their free hand can reach between your legs while they move.'], ['Behind', 'Your mouth is right at their neck and ear. Kiss, whisper, and feel every reaction.']],
        tip: 'The little spoon can bend forward at the hips to change the angle.' },
      { id: 'p-skin', heat: 1, energy: 'low', when: 'any',
        title: 'Missionary, full body', desc: 'The classic, done properly: chest to chest, grinding rather than thrusting.',
        how: ['One lies back, the other lies fully on top, skin pressed to skin.', 'Instead of thrusting in and out, grind in slow circles.', 'Hold hands above their head and keep kissing.'],
        roles: [['Underneath', 'The steady grinding pressure hits the outside as well as the inside, which is what many people actually need.'], ['On top', 'You feel all of them against all of you, and you can watch every expression up close.']],
        tip: 'Slow down whenever you want to speed up.' },
      { id: 'p-wrapped', heat: 1, energy: 'low', when: 'any',
        title: 'Legs wrapped around', desc: 'Missionary where the one underneath locks their legs around the other and pulls them in.',
        how: ['Start in missionary.', 'The one underneath wraps their legs around the other\'s waist or lower back.', 'They use their legs to pull them deeper and set the rhythm.'],
        roles: [['Underneath', 'You\'re in control from the bottom. Pull them in exactly as deep and as fast as you want.'], ['On top', 'Being pulled in by someone who clearly wants you is a turn-on all of its own.']],
        tip: 'Cross your ankles for a tighter grip.' },
      { id: 'p-pillow', heat: 1, energy: 'low', when: 'weekday',
        title: 'Missionary with a pillow', desc: 'One firm pillow under the hips changes everything about the angle.',
        how: ['Slide a firm pillow under the hips of the one on their back.', 'The one on top kneels between their legs or lies forward.', 'Experiment with the pillow\'s position until you both feel the difference.'],
        roles: [['Underneath', 'Tilted hips usually mean deeper, more direct contact without any extra effort from you.'], ['On top', 'Better angle, better view, and it\'s easier on your arms.']],
        tip: 'A folded towel on the pillow saves the laundry argument.' },
      { id: 'p-lotus', heat: 1, energy: 'medium', when: 'any',
        title: 'Lotus', desc: 'Sitting up, wrapped together face to face. All rocking, kissing and breathing into each other.',
        how: ['One sits cross-legged on the bed or floor.', 'The other sits in their lap facing them and wraps their legs around their back.', 'Rock together instead of thrusting.'],
        roles: [['On the lap', 'You set the rhythm, and the grinding gives you pressure exactly where you want it.'], ['Underneath', 'Arms full of them, faces an inch apart. It\'s the most intimate way to be inside someone.']],
        tip: 'Put pillows behind the one sitting so they can lean back.' },
      { id: 'p-slowride', heat: 1, energy: 'medium', when: 'any',
        title: 'Slow ride', desc: 'One on top, leaning forward chest to chest, moving slowly.',
        how: ['One lies back; the other straddles them.', 'The rider leans all the way forward so you\'re chest to chest.', 'Move slowly with small rolls of the hips.'],
        roles: [['On top', 'You control depth and speed, and leaning forward puts pressure right where it feels best.'], ['Underneath', 'You get to lie back, hold their hips or their face, and kiss them the whole time.']],
        tip: 'The one underneath can bend their knees to give the rider something to lean on.' },
      { id: 'p-flat', heat: 1, energy: 'low', when: 'any',
        title: 'Flat and close', desc: 'One lies face down, the other lies on top of them from behind. Heavy, warm and slow.',
        how: ['One lies flat on their stomach with legs slightly apart.', 'The other lies along their back and enters from behind.', 'Stay pressed together and move in small strokes.'],
        roles: [['Underneath', 'The weight on you is comforting, and the bed gives you friction with every movement.'], ['On top', 'Your mouth is at their ear and neck. Tell them what they feel like.']],
        tip: 'A pillow under their hips makes it easier for both of you.' },
      { id: 'p-scissors', heat: 1, energy: 'low', when: 'any',
        title: 'Interlocked', desc: 'Lying at an angle with your legs scissored together, so neither of you has to carry any weight.',
        how: ['One lies on their back, the other on their side at a right angle to them.', 'Slide your legs between each other\'s like scissors.', 'Rock together slowly.'],
        roles: [['For you both', 'No arms or knees to hold you up, and both of you have free hands to touch.'], ['Why it lands', 'It feels new, and new is half of what makes sex feel exciting again.']],
        tip: 'Takes a minute to find the fit. Laugh about it; that\'s part of it.' },
      { id: 'p-morning', heat: 1, energy: 'low', when: 'weekend',
        title: 'Before you\'re awake', desc: 'Weekend morning, still half asleep, no alarms. Start spooning and let it happen slowly.',
        how: ['Whoever wakes first pulls the other close from behind.', 'Kisses on the neck and shoulders until they wake up properly.', 'Stay on your sides. Nobody gets out of bed for anything.'],
        roles: [['Waking up', 'Being wanted before you\'ve even opened your eyes is a very good way to start the day.'], ['Waking them', 'You get to feel them go from sleepy to wanting you.']],
        tip: 'Agree in advance that morning wake-ups are welcome.' },

      // ---- Hornier: more adventurous, more passion ----
      { id: 'p-pace', heat: 2, energy: 'medium', when: 'any',
        title: 'You set the pace', desc: 'One sits upright on top and takes complete control. The other just has to take it.',
        how: ['One lies back; the other straddles them, sitting upright.', 'The rider decides everything: depth, speed, when to stop.', 'The one underneath can only use their hands and beg for faster or slower.'],
        roles: [['On top', 'Complete control of the angle and the rhythm, so you can chase exactly what feels best.'], ['Underneath', 'Nothing to do but watch and touch. The view is the point.']],
        tip: 'Switch control halfway if you both want a turn.' },
      { id: 'p-behind', heat: 2, energy: 'high', when: 'any',
        title: 'From behind', desc: 'On hands and knees, the other kneeling behind holding the hips. Primal and deep.',
        how: ['One goes on hands and knees on the bed.', 'The other kneels behind and holds their hips.', 'Reach around to touch them while you move.'],
        roles: [['In front', 'Deep and intense, and you can push back to control how hard it gets.'], ['Behind', 'Hands on their hips, a view of their whole back. It feels powerful.']],
        tip: 'You can\'t see faces, so talk. Tell them how good it feels.' },
      { id: 'p-edge', heat: 2, energy: 'medium', when: 'any',
        title: 'Edge of the bed', desc: 'One lies back at the edge of the bed while the other stands. Easy on the knees, great view.',
        how: ['One lies back with their hips right at the edge of the bed.', 'The other stands or kneels on a pillow on the floor between their legs.', 'Legs over the shoulders, around the waist, or held open.'],
        roles: [['Lying back', 'You get to relax completely while they do the work, and you can touch yourself freely.'], ['Standing', 'Full control of the rhythm, both hands free, and nothing in the way of the view.']],
        tip: 'If the bed is too high or low, use the arm of the couch.' },
      { id: 'p-reverse', heat: 2, energy: 'high', when: 'any',
        title: 'Reverse on top', desc: 'The one on top faces away toward the feet, leaning forward or back to change the angle.',
        how: ['One lies back; the other straddles them facing their feet.', 'Lean forward onto their legs, or back onto your hands.', 'Try both and notice which angle works.'],
        roles: [['On top', 'A completely different angle from facing forward, and you set the pace.'], ['Underneath', 'A view you\'ll think about the next day, and both hands free for their hips.']],
        tip: 'Go slowly at first; the angle is different and needs care.' },
      { id: 'p-shoulders', heat: 2, energy: 'medium', when: 'any',
        title: 'Legs on the shoulders', desc: 'Missionary with the ankles up on their shoulders. As deep as it gets.',
        how: ['Start in missionary with the one on top kneeling upright.', 'The one underneath rests their ankles on the other\'s shoulders.', 'Lean forward slowly to go deeper; check in as you do.'],
        roles: [['Underneath', 'The deepest angle there is, and you can push back with your legs to control it.'], ['On top', 'You\'re holding their legs, watching them, in charge of how much.']],
        tip: 'One leg up and one down is a softer version.' },
      { id: 'p-chair', heat: 2, energy: 'medium', when: 'any',
        title: 'In the chair', desc: 'One sits on a sturdy chair, the other straddles them facing them.',
        how: ['Pick an armless, sturdy chair.', 'One sits; the other climbs on facing them with feet on the floor.', 'The rider uses their feet to move up and down.'],
        roles: [['On top', 'Feet on the floor gives you leverage and total control.'], ['In the chair', 'Your hands are free to roam and your face is buried in them.']],
        tip: 'Start with a lap dance, clothes on.' },
      { id: 'p-counter', heat: 2, energy: 'high', when: 'weekend',
        title: 'Bent over', desc: 'Standing, one bent over the bed, the table or the kitchen counter, the other behind.',
        how: ['One bends forward over a surface at hip height.', 'The other stands behind them and holds their hips.', 'Hands on the counter, or one hand pulling them back by the shoulder.'],
        roles: [['In front', 'Feels urgent and a little bit naughty, especially outside the bedroom.'], ['Behind', 'Standing gives you power and depth, and a free hand to reach around.']],
        tip: 'Check the height first. A step or a book under the shorter one\'s feet fixes it.' },
      { id: 'p-sidesaddle', heat: 2, energy: 'medium', when: 'any',
        title: 'Side-saddle', desc: 'On top, but sitting sideways across their hips. Unusual angle, very easy to move.',
        how: ['One lies back.', 'The other sits on them sideways with both legs off to one side.', 'Lean back on one hand and rock.'],
        roles: [['On top', 'A new angle you can adjust just by leaning forward or back.'], ['Underneath', 'You can see them in profile and touch them anywhere.']],
        tip: 'Swap the side you face halfway through.' },
      { id: 'p-69', heat: 2, energy: 'medium', when: 'any',
        title: 'Sixty-nine', desc: 'Pleasure each other with your mouths at the same time.',
        how: ['Lie on your sides head to toe, so nobody has to hold themselves up.', 'Each of you uses your mouth and hands on the other.', 'Take turns concentrating if doing both at once is too much.'],
        roles: [['For you both', 'Giving and receiving at the same time. Neither of you is waiting.'], ['Why it lands', 'Feeling someone react while you\'re getting the same is a feedback loop.']],
        tip: 'Side by side is much easier than one on top.' },
      { id: 'p-shower', heat: 2, energy: 'medium', when: 'weekend',
        title: 'In the shower', desc: 'Hot water, slippery skin, one up against the tiles.',
        how: ['Shower together and take turns washing each other.', 'One faces the wall with their hands on the tiles.', 'The other stands behind them, holding on.'],
        roles: [['Against the wall', 'Warm water over your back and their hands everywhere.'], ['Behind', 'Everything feels different when it\'s wet. And you have a reason to go slowly.']],
        tip: 'Use a non-slip mat, and silicone lube because water washes the other kind away.' },

      // ---- Horniest: bold, athletic, nothing held back ----
      { id: 'p-wall', heat: 3, energy: 'high', when: 'weekend',
        title: 'Up against the wall', desc: 'Don\'t make it to the bed. Pressed against the wall, one leg lifted.',
        how: ['Start kissing the moment you get through the door.', 'Press them back against the wall.', 'Lift one of their legs around your hip, or lift them completely if you can.'],
        roles: [['Against the wall', 'Being wanted so badly they couldn\'t wait is the whole thrill.'], ['Holding them', 'Urgent and physical. You\'ll feel very strong.']],
        tip: 'Stairs fix any height difference.' },
      { id: 'p-quickie', heat: 3, energy: 'high', when: 'weekday',
        title: 'The ten-minute quickie', desc: 'Before work, or the moment you\'re both home. No undressing.',
        how: ['Pick a moment that isn\'t bedtime.', 'Clothes stay on; just pull aside what\'s in the way.', 'Bent over, against the counter, on the couch. Ten minutes, no more.'],
        roles: [['For you both', 'The urgency is the turn-on. You\'ll be thinking about it for the rest of the day.'], ['Why it lands', 'It breaks the "only at night, only in bed" routine.']],
        tip: 'Lube in a kitchen drawer is not a bad idea.' },
      { id: 'p-squat', heat: 3, energy: 'high', when: 'any',
        title: 'Feet planted on top', desc: 'On top, squatting with feet flat on the bed, bouncing rather than rocking.',
        how: ['One lies back.', 'The other straddles them in a squat with feet flat on the bed.', 'Hands on their chest or knees for balance, and move up and down.'],
        roles: [['On top', 'Maximum depth and speed, entirely on your terms.'], ['Underneath', 'Hold their hips and help lift them. The view is unreal.']],
        tip: 'It\'s a workout. Drop to your knees whenever your thighs say so.' },
      { id: 'p-pinned', heat: 3, energy: 'medium', when: 'any',
        title: 'Pinned', desc: 'Face down with wrists held, the other on top behind. Consensual and controlled.',
        how: ['Agree on a word that means stop before you start.', 'One lies face down; the other lies on top and holds their wrists above their head.', 'Move slowly at first and keep checking in.'],
        roles: [['Underneath', 'Letting go of control completely can be a huge turn-on when you trust them.'], ['On top', 'Being trusted with that control is its own kind of intense.']],
        tip: 'Swap roles next time; plenty of people discover they like both.' },
      { id: 'p-mouth', heat: 3, energy: 'medium', when: 'any',
        title: 'Ride their mouth', desc: 'The receiver straddles the giver\'s face and is in total control.',
        how: ['The giver lies back with a pillow under their head.', 'The receiver kneels over their face, facing the headboard.', 'The receiver moves; the giver just keeps going.'],
        roles: [['On top', 'You control exactly where, how hard and how fast. Nothing to be shy about.'], ['Underneath', 'Being completely surrounded by them, and feeling everything they feel.']],
        tip: 'Hold the headboard. The giver can tap a thigh to pause.' },
      { id: 'p-folded', heat: 3, energy: 'high', when: 'weekend',
        title: 'Folded', desc: 'Knees pulled up to the chest, the other leaning over them. Intense and deep.',
        how: ['The one underneath pulls their knees up to their chest.', 'The one on top kneels and leans forward over them, arms either side.', 'Slow and deep first, then decide together.'],
        roles: [['Underneath', 'An intense, deep angle, with them right on top of you.'], ['On top', 'You can see everything, and every movement goes further.']],
        tip: 'Feet on their chest lets the one underneath push back if it\'s too much.' },
      { id: 'p-table', heat: 3, energy: 'high', when: 'weekend',
        title: 'On the table', desc: 'One sits on the edge of the kitchen table, the other standing between their legs.',
        how: ['Clear the table.', 'One sits right on the edge and leans back on their hands.', 'The other stands between their legs and pulls them in by the hips.'],
        roles: [['On the table', 'Somewhere you eat dinner every night. You\'ll never look at it the same way.'], ['Standing', 'Perfect height, both hands free, full control.']],
        tip: 'A towel underneath. And close the curtains.' },
      { id: 'p-mirror', heat: 3, energy: 'high', when: 'any',
        title: 'In front of the mirror', desc: 'From behind, standing or kneeling, facing a mirror so you can both watch.',
        how: ['Move to the biggest mirror you have.', 'One in front, the other behind, both facing the mirror.', 'Keep eye contact in the reflection.'],
        roles: [['In front', 'Watching their face while they watch you is a different level of intimate.'], ['Behind', 'You get to see what you\'re doing to them from the front and from behind.']],
        tip: 'Leave a lamp on; mirrors need light.' },
      { id: 'p-reversechair', heat: 3, energy: 'medium', when: 'any',
        title: 'Reverse in the chair', desc: 'One sits in a chair, the other sits on them facing away.',
        how: ['One sits in a sturdy armless chair.', 'The other lowers onto them facing away, feet on the floor.', 'The one sitting reaches around with both hands.'],
        roles: [['On top', 'Feet on the floor means total control, and their hands are all over you.'], ['In the chair', 'Both hands are free to touch everywhere at once while they ride.']],
        tip: 'Do it in front of the mirror and you\'ve combined two.' },
      { id: 'p-anywhere', heat: 3, energy: 'high', when: 'weekend',
        title: 'Somewhere new', desc: 'Any position you like, anywhere that isn\'t your bed: the car, the balcony, a hotel, the floor by the fire.',
        how: ['Pick the place together, privately and legally.', 'Choose a position from your "both want to try" list.', 'Keep it quick if it needs to be.'],
        roles: [['For you both', 'A new place makes even a familiar position feel brand new.'], ['Why it lands', 'You\'ll have a story only the two of you know.']],
        tip: 'Private means private: nowhere you could be seen.' }
    ],
    // Warm-ups to go with tonight's position, and closeness ideas for nights when one of you needs rest.
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
      { id: 's-morning', kind: 'play', heat: 1, energy: 'low', when: 'weekend', minutes: 45,
        title: 'Lazy morning in bed', desc: 'No alarm. Wake them up with slow kisses down their neck and back, and see where the morning goes. Coffee can wait.' },

      // ---- Steamy: sexual, with build-up ----
      { id: 'h-text', kind: 'tease', heat: 2, energy: 'low', when: 'weekday', minutes: 0,
        title: 'Slow-burn texts', desc: 'Through the day, send three messages, each more explicit than the last, describing exactly what you\'re going to do to them tonight. Then make sure you follow through on every word.' },
      { id: 'h-shower', kind: 'play', heat: 2, energy: 'medium', when: 'weekday', minutes: 20,
        title: 'Shower together', desc: 'Soap each other up slowly, hands everywhere, steam and wet skin. Press them against the cool tiles. If you don\'t finish there, you\'ll finish the moment you\'re dry.' },
      { id: 'h-oral', kind: 'play', heat: 2, energy: 'low', when: 'any', minutes: 20,
        title: 'All about you', desc: 'Tonight one of you only receives. The giver goes down slowly, takes their time, and listens to every breath and sound to learn what works. The receiver\'s only job is to relax and say "more" or "right there".' },
      { id: 'h-mirror', kind: 'play', heat: 2, energy: 'medium', when: 'any', minutes: 30,
        title: 'Watch yourselves', desc: 'Move a mirror where you can both see it, or move yourselves to one. Seeing your bodies together from the outside is surprisingly intense. Keep glancing up and catching each other\'s eyes in the reflection.' },
      { id: 'h-touch', kind: 'play', heat: 2, energy: 'low', when: 'any', minutes: 20,
        title: 'Show me how you touch yourself', desc: 'Take turns touching yourselves while the other watches from close up. Then guide their hand to copy exactly what you were doing. You\'ll each learn more in ten minutes than in years of guessing.' },
      { id: 'h-couch', kind: 'play', heat: 2, energy: 'high', when: 'weekend', minutes: 20,
        title: 'Not in the bedroom', desc: 'The couch, the kitchen counter, the floor in front of the fire. Start kissing wherever you are when the mood hits and don\'t let yourselves move to the bed.' },

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
      { id: 'x-yesno', kind: 'tease', heat: 3, energy: 'low', when: 'weekday', minutes: 30,
        title: 'Yes / No / Maybe list', desc: 'Separately, each write ten things you\'ve fantasized about but never said. Swap lists and mark each one yes, no or maybe. No explaining a "no". The yeses are your next month of weekends.' },
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
