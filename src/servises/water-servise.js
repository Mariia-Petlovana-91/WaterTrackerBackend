import DayCollections from '../db/models/Day.js';
import UserCollections from '../db/models/User.js';
import mongoose from 'mongoose';

//  Додавання запису про випиту воду
export const addWaterEntry = async (userId, amount, time ) => {

    const newEntry = {
      _id: new mongoose.Types.ObjectId(),
      userId: userId,
      time: time,
      amount: amount,
    };

    // Додавання запису в масив entries
    await DayCollections.updateOne(
      { userId },
      { $push: { entries: newEntry } },
      { upsert: true }
    );

    return newEntry;
};

// Оновлення запису про випиту воду
export const updateWaterEntry = async (id, payload, userId) => {
  // Оновлення конкретного запису в масиві entries
  const result = await DayCollections.findOneAndUpdate(
    {
      userId: userId,
      'entries._id': id,
    },
    {
      $set: {
        'entries.$[elem].amount': payload.amount,
        'entries.$[elem].time': payload.time,
      },
    },
    {
      new: true,
      arrayFilters: [{ 'elem._id': id }],
    },
  );

  if (!result) return null;

  const updatedEntry = result.entries.find(
    (entry) => entry._id.toString() === id,
  );
  return updatedEntry;
};

export const deleteWaterEntry = async (_id, userId) => {
  const result = await DayCollections.updateOne(
    { userId, 'entries._id': _id },
    { $pull: { entries: { _id } } },
    { new: true },
  );

  if (result.modifiedCount === 0) {
    throw new Error('Entry not found');
  }
};

// Отримання денної статистики
export const getDailyWaterData = async (userId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const data = await DayCollections.findOne({
    userId: userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  return data ? { process: data.progress, entries: data.entries } : null;
};

// Отримання місячної статистики
export const getMonthlyWaterData = async (userId, month) => {
  const normalizedMonth = month.slice(0, 7);

  const startOfMonth = new Date(`${normalizedMonth}-01`);
  const endOfMonth = new Date(`${normalizedMonth}-01`);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const days = await DayCollections.find({
    userId: userId,
    date: { $gte: startOfMonth, $lt: endOfMonth },
  });

  if (!days || days.length === 0) {
    return {
      message: 'Nothing found.',
      data: [],
    };
  }

  const formattedData = days.map((day) => {
    const dateObj = new Date(day.date);
    const formattedDate = `${dateObj.getDate()}, ${dateObj.toLocaleString(
      'en-US',
      { month: 'long' },
    )}`;

    return {
      date: formattedDate,
      dailyGoal: (day.dailyGoal / 1000).toFixed(1) + ' L',
      percentage: day.progress.toFixed(0) + '%',
      entriesCount: day.entries.length,
    };
  });

  return formattedData;
};
// Оновлення денної норми
export const updateDailyWater = async (userId, dailyGoal) => {
  let dailyRecord = await DayCollections.findOne({
    userId,
  });

  if (!dailyRecord) {
    dailyRecord = await DayCollections.create({
      userId,
      dailyGoal,
    });
  } else {
    dailyRecord = await DayCollections.findOneAndUpdate(
      { userId },
      { dailyGoal },
      { new: true },
    );
  }

  const updatedUserDailyGoal = await UserCollections.findOneAndUpdate(
    { _id: userId },
    { dailyGoal: dailyGoal },
    { new: true },
  );

  return { dailyRecord, updatedUserDailyGoal };
};
