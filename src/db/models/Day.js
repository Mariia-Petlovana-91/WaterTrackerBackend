import { Schema, model } from 'mongoose';
import { handleSaveError, setUpdateSettings } from './hooks.js';

const waterEntrySchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  time: {
    type: String,
    required: false,
    default: () => new Date().toISOString(),
  },
  amount: {
    type: Number,
    required: false,
    min: 50,
    max: 5000,
  },
});

const waterTrackingSchema = new Schema({
  userId: {
    type: String,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  dailyGoal: {
    type: Number,
    required: true,
    min: 50,
    max: 15000,
    default: 2000,
  },
  entries: {
    type: [waterEntrySchema],
    default: [],
  },
  progress: {
    type: Number,
    default: 0,
  },
});

//  Функція для перерахунку прогресу
const calculateProgress = (entries, dailyGoal) => {
  const totalConsumed = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return dailyGoal > 0 ? Math.min((totalConsumed / dailyGoal) * 100, 100) : 0;
};

waterTrackingSchema.pre('save', function (next) {
  this.progress = calculateProgress(this.entries, this.dailyGoal);
  next();
});

waterTrackingSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  const existingDoc = await this.model.findOne(this.getQuery());

  if (!existingDoc) {
    return next();
  }

  let updatedEntries = [...existingDoc.entries];

  if (update.$push && update.$push.entries) {
    updatedEntries.push(update.$push.entries);
  }

  if (update.$pull && update.$pull.entries) {
    const condition = update.$pull.entries;
    updatedEntries = updatedEntries.filter((entry) => {
      return !Object.keys(condition).every(
        (key) => entry[key] === condition[key],
      );
    });
  }

  if (update.$set && update.$set['entries.$']) {
    const updatedEntry = update.$set['entries.$'];
    updatedEntries = updatedEntries.map((entry) =>
      entry._id.equals(updatedEntry._id)
        ? { ...entry, ...updatedEntry }
        : entry,
    );
  }

  update.$set = update.$set || {};
  update.$set.progress = calculateProgress(
    updatedEntries,
    update.$set.dailyGoal || existingDoc.dailyGoal,
  );

  next();
});

waterTrackingSchema.post('save', handleSaveError);
waterTrackingSchema.pre('findOneAndUpdate', setUpdateSettings);
waterTrackingSchema.post('findOneAndUpdate', handleSaveError);

const DayCollections = model('day', waterTrackingSchema);
export default DayCollections;
