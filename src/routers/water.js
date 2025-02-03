import { Router } from 'express';

import * as waterControllers from '../controllers/water.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';

import { waterEntrySchema, dailyGoalSchema } from '../validation/water.js';

const waterRouter = Router();

// waterRouter.use(authenticate);
// Додавання запису по спожитій воді
waterRouter.post(
  '/water-entry',
  validateBody(waterEntrySchema),
  ctrlWrapper(waterControllers.addWaterEntryController),
);

// Редагування запису по спожитій воді
waterRouter.patch(
  '/water-entry/:id',
  // T9-updateWaterEntr
  validateBody(waterEntrySchema),
  ctrlWrapper(waterControllers.updateWaterEntryController),
);

waterRouter.delete(
  '/water-entry/:id',
  ctrlWrapper(waterControllers.deleteWaterEntryController),
);

waterRouter.get(
  '/today',
  ctrlWrapper(waterControllers.getDailyWaterDataController),
);

waterRouter.get(
  '/month/:month',
  ctrlWrapper(waterControllers.getMonthlyWaterDataController),
);

// Оновлення денної норми споживання води
waterRouter.patch(
  '/daily-norma',
  validateBody(dailyGoalSchema),
  ctrlWrapper(waterControllers.updateDailyWaterController),
);

export default waterRouter;
