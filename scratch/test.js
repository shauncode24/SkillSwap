const { computeMatches } = require('../backend/services/matchingService');

const currentUser = {
  _id: '1',
  name: 'Alice',
  learnSkills: [
    { name: 'React', priority: 'High' },
    { name: 'Node.js', priority: 'Medium' }
  ],
  availability: [
    { day: 'Monday' },
    { day: 'Wednesday' }
  ]
};

const allUsers = [
  {
    _id: '2',
    name: 'Bob',
    teachSkills: [
      { name: 'react' },
      { name: 'css' }
    ],
    availability: [
      { day: 'monday' },
      { day: 'friday' }
    ],
    rating: 4.5,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago -> 1.0
  },
  {
    _id: '3',
    name: 'Charlie',
    teachSkills: [
      { name: 'python' }
    ],
    availability: [
      { day: 'tuesday' }
    ],
    rating: 3,
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago -> 0.2
  }
];

const matches = computeMatches(currentUser, allUsers);
console.log(JSON.stringify(matches, null, 2));
