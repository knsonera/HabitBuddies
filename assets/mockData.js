export const currentUserProfile = {
  avatar: 'https://via.placeholder.com/150',
  fullName: 'Jane Miller',
  login: '@superjane',
  currentStreak: 7,
  challenges: 5,
  friends: 10,
  score: 167,
  badges: [
    'https://via.placeholder.com/50',
    'https://via.placeholder.com/50',
    'https://via.placeholder.com/50'
  ],
  currentChallenges: [
    { id: '1', name: '10,000 Steps Challenge', description: 'Walk 10,000 steps every day to stay fit and healthy.', duration: '30 days', frequency: 'Daily', time: 'Anytime', participants: 120, icon: 'trophy', library: 'FontAwesome' },
    { id: '2', name: 'Read a Book Challenge', description: 'Read one book each week.', duration: '4 weeks', frequency: 'Weekly', time: 'Anytime', participants: 80, icon: 'book', library: 'FontAwesome' },
    { id: '3', name: 'Meditation Challenge', description: 'Meditate for 10 minutes daily.', duration: '21 days', frequency: 'Daily', time: 'Morning', participants: 50, icon: 'meditation', library: 'MaterialCommunityIcons' }
  ],
  pastChallenges: [
    { id: '4', name: 'No Sugar Challenge', description: 'Avoid sugar for 10 days.', duration: '10 days', frequency: 'Daily', time: 'Anytime', participants: 90, icon: 'no-food', library: 'MaterialCommunityIcons' },
    { id: '5', name: 'Yoga Challenge', description: 'Practice yoga for 15 minutes daily.', duration: '15 days', frequency: 'Daily', time: 'Morning', participants: 110, icon: 'yoga', library: 'MaterialCommunityIcons' }
  ]
};

export const friendsList = [
  {
    id: '1',
    avatar: 'https://via.placeholder.com/150',
    fullName: 'John Smith',
    login: '@johnnysmm',
    currentStreak: 10,
    challenges: 8,
    friends: 15,
    score: 200,
    badges: [
      'https://via.placeholder.com/50',
      'https://via.placeholder.com/50',
      'https://via.placeholder.com/50'
    ],
    currentChallenges: [
      { id: '6', name: '30-Day Fitness Challenge', description: 'Exercise daily for 30 minutes.', duration: '30 days', frequency: 'Daily', time: 'Evening', participants: 100, icon: 'heart', library: 'FontAwesome' },
      { id: '7', name: 'Healthy Eating Challenge', description: 'Eat at least 5 servings of fruits and vegetables daily.', duration: '7 days', frequency: 'Daily', time: 'Anytime', participants: 70, icon: 'apple', library: 'FontAwesome' }
    ],
    pastChallenges: [
      { id: '8', name: 'No Junk Food Challenge', description: 'Avoid junk food for 7 days.', duration: '7 days', frequency: 'Daily', time: 'Anytime', participants: 60, icon: 'ban', library: 'FontAwesome' },
      { id: '9', name: 'Water Drinking Challenge', description: 'Drink 8 glasses of water daily.', duration: '14 days', frequency: 'Daily', time: 'Anytime', participants: 80, icon: 'tint', library: 'FontAwesome' }
    ]
  },
  {
    id: '2',
    avatar: 'https://via.placeholder.com/150',
    fullName: 'Emma Watson',
    login: '@emmaw',
    currentStreak: 15,
    challenges: 12,
    friends: 20,
    score: 250,
    badges: [
      'https://via.placeholder.com/50',
      'https://via.placeholder.com/50',
      'https://via.placeholder.com/50'
    ],
    currentChallenges: [
      { id: '10', name: 'Daily Drawing Challenge', description: 'Draw something new every day.', duration: '30 days', frequency: 'Daily', time: 'Anytime', participants: 60, icon: 'pencil', library: 'FontAwesome' },
      { id: '11', name: 'Writing Challenge', description: 'Write 500 words daily.', duration: '14 days', frequency: 'Daily', time: 'Anytime', participants: 40, icon: 'edit', library: 'FontAwesome' }
    ],
    pastChallenges: [
      { id: '12', name: 'Vegetarian Challenge', description: 'Follow a vegetarian diet for 7 days.', duration: '7 days', frequency: 'Daily', time: 'Anytime', participants: 50, icon: 'leaf', library: 'FontAwesome' },
      { id: '13', name: 'No Caffeine Challenge', description: 'Avoid caffeine for 5 days.', duration: '5 days', frequency: 'Daily', time: 'Anytime', participants: 30, icon: 'coffee', library: 'FontAwesome' }
    ]
  }
];

// mockData.js

export const mockChallenges = {
  Popular: [
    { id: '1', name: '30-Day Fitness Challenge', description: 'Exercise daily for 30 minutes.', duration: '30 days', frequency: 'Daily', time: 'Evening', participants: 100, icon: 'heart', library: 'FontAwesome' },
    { id: '2', name: 'Meditation Mastery', description: 'Meditate for 20 minutes each day.', duration: '20 days', frequency: 'Daily', time: 'Morning', participants: 50, icon: 'meditation', library: 'MaterialCommunityIcons' },
  ],
  Sports: [
    { id: '3', name: 'Daily Running Challenge', description: 'Run 5km every day.', duration: '15 days', frequency: 'Daily', time: 'Morning', participants: 120, icon: 'heart', library: 'FontAwesome' },
    { id: '4', name: 'Yoga for Flexibility', description: 'Practice yoga for 30 minutes.', duration: '10 days', frequency: 'Daily', time: 'Evening', participants: 80, icon: 'child', library: 'FontAwesome' },
  ],
  Nutrition: [
    { id: '5', name: 'Healthy Eating Challenge', description: 'Eat at least 5 servings of fruits and vegetables daily.', duration: '7 days', frequency: 'Daily', time: 'Anytime', participants: 70, icon: 'apple', library: 'FontAwesome' },
    { id: '6', name: 'No Sugar Week', description: 'Avoid all sugar for a week.', duration: '7 days', frequency: 'Daily', time: 'Anytime', participants: 90, icon: 'ban', library: 'FontAwesome' },
  ],
  Mindfulness: [
    { id: '7', name: 'Gratitude Journal', description: 'Write down 3 things you are grateful for every day.', duration: '30 days', frequency: 'Daily', time: 'Morning', participants: 60, icon: 'book', library: 'FontAwesome' },
    { id: '8', name: 'Digital Detox', description: 'Spend one hour away from all digital devices.', duration: '7 days', frequency: 'Daily', time: 'Evening', participants: 40, icon: 'power-off', library: 'FontAwesome' },
  ],
  Skills: [
    { id: '9', name: 'Learn a New Language', description: 'Practice a new language for 30 minutes.', duration: '60 days', frequency: 'Daily', time: 'Evening', participants: 75, icon: 'language', library: 'FontAwesome' },
    { id: '10', name: 'Daily Coding Practice', description: 'Code for at least 1 hour every day.', duration: '30 days', frequency: 'Daily', time: 'Anytime', participants: 200, icon: 'code', library: 'FontAwesome' },
  ],
};
