export interface QuizOption {
  title: string
  description: string
}

export interface QuizQuestion {
  id: string
  text: string
  options: QuizOption[]
}

export interface RecommendedProduct {
  name: string
  price: number
  image: string
  whyItMatches: string
}

export interface SportQuizData {
  sportId: string
  sportName: string
  questions: QuizQuestion[]
  results: Record<string, RecommendedProduct[]>
}

export const SPORT_QUIZ_DATA: SportQuizData[] = [
  {
    sportId: 'badminton',
    sportName: 'BADMINTON',
    questions: [
      {
        id: 'q1',
        text: 'What level are you currently playing at?',
        options: [
          { title: 'Beginner', description: 'Easy-to-use rackets with better control and forgiveness.' },
          { title: 'Intermediate', description: 'Balanced rackets for improving power, speed, and accuracy.' },
          { title: 'Advanced', description: 'Performance rackets designed for specific playing styles.' }
        ]
      },
      {
        id: 'q2',
        text: 'What kind of player are you?',
        options: [
          { title: 'Power Attacker', description: 'I like strong smashes and aggressive shots.' },
          { title: 'Fast Defender', description: 'I rely on quick reactions, speed, and control.' },
          { title: 'All-Round Player', description: 'I want a good balance of power, speed, and control.' }
        ]
      },
      {
        id: 'q3',
        text: 'What matters most to you when choosing a racket?',
        options: [
          { title: 'Lightweight Feel', description: 'I want something easy to swing and less tiring.' },
          { title: 'More Smash Power', description: 'I want stronger shots and deeper clears.' },
          { title: 'Better Control', description: 'I want accuracy, placement, and cleaner touch shots.' }
        ]
      }
    ],
    results: {} // Hooked into match engine
  },
  {
    sportId: 'cricket',
    sportName: 'CRICKET',
    questions: [
      {
        id: 'q1',
        text: 'What are you looking for?',
        options: [
          { title: 'Cricket Bat', description: 'I need a bat for batting performance.' },
          { title: 'Batting/Wicket Keeping Gloves', description: 'I need hand protection and grip.' },
          { title: 'Protection Gear & Bags', description: 'I need pads, helmets, guards, or equipment storage.' }
        ]
      },
      {
        id: 'q2',
        text: 'What type of ball do you play with?',
        options: [
          { title: 'Leather Ball', description: 'I play professional, club, or hardball cricket.' },
          { title: 'Tennis/Tape Ball', description: 'I play casual matches, street cricket, or tournament tape-ball.' }
        ]
      },
      {
        id: 'q3',
        text: 'What is your skill level or age group?',
        options: [
          { title: 'Junior / Kids', description: 'Lightweight, smaller size gear for safe development.' },
          { title: 'Beginner / Casual Adult', description: 'Easy budget options for starting out.' },
          { title: 'Intermediate / Club Player', description: 'Premium wood/materials for high performance.' }
        ]
      }
    ],
    results: {}
  },
  {
    sportId: 'volleyball',
    sportName: 'VOLLEYBALL',
    questions: [
      {
        id: 'q1',
        text: 'Where do you mostly play volleyball?',
        options: [
          { title: 'Indoor Court', description: 'I need high grip, indoor balls and court shoes.' },
          { title: 'Beach / Outdoor', description: 'I play on sand or grass; need soft-touch, weatherproof gear.' }
        ]
      },
      {
        id: 'q2',
        text: 'What are you looking for?',
        options: [
          { title: 'Volleyball', description: 'Game or training balls matching my environment.' },
          { title: 'Knee Pads / Supports', description: 'Impact protection for diving and floor defense.' },
          { title: 'Net / Accessories', description: 'Pumps, nets, or boundary lines for setup.' }
        ]
      },
      {
        id: 'q3',
        text: 'What is your level of play?',
        options: [
          { title: 'Casual / Fun', description: 'Soft, recreational gear focused on comfort.' },
          { title: 'Training / Match', description: 'Durable, high-spec gear for serious team setups.' }
        ]
      }
    ],
    results: {}
  },
  {
    sportId: 'pickleball',
    sportName: 'PICKLEBALL',
    questions: [
      {
        id: 'q1',
        text: 'What level of pickleball do you play?',
        options: [
          { title: 'Beginner', description: 'Wide sweet spot, lightweight paddles for easy learning.' },
          { title: 'Intermediate', description: 'Balanced spin, power, and control styles.' },
          { title: 'Advanced', description: 'High-performance carbon fiber faces for tournament play.' }
        ]
      },
      {
        id: 'q2',
        text: 'What is your preferred playing style?',
        options: [
          { title: 'Power Player', description: 'I like heavy drives and fast put-aways from the baseline.' },
          { title: 'Control / Kitchen Specialist', description: 'I rely on soft dinks, resets, and precise placement.' },
          { title: 'All-Court Player', description: 'I need a versatile paddle that changes smoothly between offense and defense.' }
        ]
      },
      {
        id: 'q3',
        text: 'What type of ball do you need?',
        options: [
          { title: 'Outdoor Balls', description: 'Heavier with smaller holes to withstand wind on rough courts.' },
          { title: 'Indoor Balls', description: 'Softer with larger holes for reliable bounce on gym floors.' },
          { title: 'No Balls, Just Paddle', description: 'I am only looking to upgrade my main paddle setup right now.' }
        ]
      }
    ],
    results: {}
  },
  {
    sportId: 'tennis',
    sportName: 'TENNIS',
    questions: [
      {
        id: 'q1',
        text: 'What is your current playing level?',
        options: [
          { title: 'Beginner', description: 'Lightweight frames with large heads for easy power.' },
          { title: 'Intermediate', description: 'Balanced weight for control, depth, and swing speed.' },
          { title: 'Advanced', description: 'Heavier player-spec frames for precision, spin, and stability.' }
        ]
      },
      {
        id: 'q2',
        text: 'What kind of player are you?',
        options: [
          { title: 'Baseline Power', description: 'I stay back and hit big groundstrokes to finish rallies.' },
          { title: 'Net / Fast Player', description: 'I like quick movement, volleys, and fast reactions.' },
          { title: 'All-Round Player', description: 'I want a racket that can handle every part of the game.' }
        ]
      },
      {
        id: 'q3',
        text: 'What do you want more from your racket?',
        options: [
          { title: 'More Power', description: 'I want easier depth and stronger shots.' },
          { title: 'More Spin', description: 'I want better topspin and ball control.' },
          { title: 'More Comfort', description: 'I want less strain on my arm and easier handling.' }
        ]
      }
    ],
    results: {}
  },
  {
    sportId: 'swimming',
    sportName: 'SWIMMING',
    questions: [
      {
        id: 'q1',
        text: 'What are you shopping for?',
        options: [
          { title: 'Training Swimwear', description: 'I need swimwear for regular swimming or lessons.' },
          { title: 'Goggles/Caps', description: 'I need comfort, visibility, or hair protection.' },
          { title: 'Training Accessories', description: 'I need kickboards, fins, pull buoys, or practice equipment.' }
        ]
      },
      {
        id: 'q2',
        text: 'What type of swimming do you do?',
        options: [
          { title: 'Casual/Beginner', description: 'I swim for fun, lessons, or basic fitness.' },
          { title: 'Fitness Training', description: 'I swim regularly for exercise and improvement.' },
          { title: 'Competitive / Performance', description: 'I need gear for serious training or racing.' }
        ]
      },
      {
        id: 'q3',
        text: 'What is your main concern?',
        options: [
          { title: 'Comfort', description: 'I want gear that feels easy and comfortable.' },
          { title: 'Durability', description: 'I want something that lasts through regular use.' },
          { title: 'Performance', description: 'I want speed, fit, grip, and serious training support.' }
        ]
      }
    ],
    results: {}
  }
];