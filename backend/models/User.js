const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String },
    level: { type: String },    // e.g. 'Beginner', 'Intermediate', 'Expert'
    priority: { type: String }, // used for learnSkills: 'Low', 'Medium', 'High'
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String },        // e.g. 'Monday'
    slots: { type: [String] },    // e.g. ['9:00-10:00', '14:00-15:00']
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  teachSkills: {
    type: [skillSchema],
    default: [],
  },
  learnSkills: {
    type: [skillSchema],
    default: [],
  },
  availability: {
    type: [availabilitySchema],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook — hash password only when it has been modified
// NOTE: Mongoose 7+ async hooks must NOT accept or call next() — the
// resolved promise signals completion automatically.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method — compare plain password to stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
