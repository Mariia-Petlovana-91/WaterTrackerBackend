import createHttpError from 'http-errors';
// import mongoose from 'mongoose';

import {
  addWaterEntry,
  updateWaterEntry,
  deleteWaterEntry,
  getDailyWaterData,
  getMonthlyWaterData,
  updateDailyWater,
} from '../servises/water-servise.js';

// Додавання запису про випиту воду
export const addWaterEntryController = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { userId, amount, time } = req.body;

    const result = await addWaterEntry(userId, amount, time);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in addWater:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Оновлення запису про випиту воду
export const updateWaterEntryController = async (req, res) => {
  const userId = req.user._id;

  const { id: id } = req.params;

  const { time, amount } = req.body;

  if (!id) throw createHttpError(404, 'Entry not found');

  const result = await updateWaterEntry(id, { amount, time }, userId);

  if (!result) {
    throw createHttpError(404, "Water entry not found");
  }

  res.status(200).json({
    data: result,
    message: 'Water entry updated successfully',
  });
};

// Видалення запису про випиту воду
export const deleteWaterEntryController = async (req, res) => {
  const { id: _id } = req.params;
  const userId = req.user._id;

  try {
    await deleteWaterEntry(_id, userId);
  } catch (e) {
    if (e instanceof Error) {
      throw createHttpError(404, 'Entry not found');
    }
  }

  res.status(204).send();
};

// Отримання місячної статистики
export const getMonthlyWaterDataController = async (req, res) => {
  const userId = req.user._id;
  const { month } = req.params;

  if (!month) {
    return res.status(400).json({ message: 'Data invalid' });
  }
  const normalizedMonth = month.slice(0, 7);
  const monthlyData = await getMonthlyWaterData(userId, normalizedMonth);

  res.status(200).json({
    message: 'Success!The following data were found for this month.',
    monthlyData,
  });
};

// отримання денної норми
export const getDailyWaterDataController = async (req, res) => {
  const userId = req.user._id;

  const result = await getDailyWaterData(userId);

  if (!result) throw createHttpError(404, 'No daily water found');

  res.status(200).json({
    status: 200,
    data: result,
    message: 'Daily water goal retrieved successfully',
  });
};

// Оновлення денної норми
export const updateDailyWaterController = async (req, res) => {
  const userId = req.user._id;
  const { dailyGoal } = req.body;

  const { dayRecord, updatedUserDailyGoal } = await updateDailyWater(
    userId,
    dailyGoal,
  );

  if (!dayRecord && !updatedUserDailyGoal)
    throw createHttpError(404, 'Users daily goal not found');

  res.status(200).json({
    status: 200,
    message: 'Successfully updated daily goal!',
  });
};
