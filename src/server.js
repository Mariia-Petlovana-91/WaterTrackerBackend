import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import waterRouter from './routers/water.js';
import userRouter from './routers/user.js';
import authRouter from './routers/auth.js';

import { getEnvVar } from './utils/getEnvVar.js';

import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

export const setupServer = () => {
  const app = express();

  // код для заміни який буде використано після деплою і запуску фронта

  //  const allowedOrigins = ['http://localhost:3000', 'https://myfrontend.com'];

  //  app.use(
  //    cors({
  //      origin: function (origin, callback) {
  //        if (!origin || allowedOrigins.includes(origin)) {
  //          callback(null, true);
  //        } else {
  //          callback(new Error('Not allowed by CORS'));
  //        }
  //      },
  //      credentials: true,
  //    }),
  //  );

  // код який дозволяє усі корси, запити з усіх серверів

  app.use(
    cors({
      origin: function (origin, callback) {
        callback(null, true);
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.static('uploads'));
  app.use(cookieParser());

  // app.use(logger);

  app.use('/water', waterRouter);
  app.use('/user', userRouter);
  app.use('/auth', authRouter);
  app.use('/api-docs', swaggerDocs());

  app.use(notFoundHandler);

  app.use(errorHandler);

  const port = Number(getEnvVar('PORT', 3000));

  app.listen(port, () => console.log('Server running on 3000 port'));
};