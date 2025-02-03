import bcrypt from 'bcrypt';

import { randomBytes } from 'crypto';

import createHttpError from 'http-errors';

import jwt from 'jsonwebtoken';

import UserCollections from '../db/models/User.js';

import SessionCollections from '../db/models/Session.js';

import { getEnvVar } from '../utils/getEnvVar.js';



import {
  accessTokenLifeTime,
  refreshTokenLifeTime,
} from '../constants/auth.js';

const createSessionData = () => ({
  accessToken: randomBytes(35).toString('base64'),
  refreshToken: randomBytes(35).toString('base64'),
  accessTokenValidUntil: Date.now() + accessTokenLifeTime,
  refreshTokenValidUntil: Date.now() + refreshTokenLifeTime,
});

export const registerUser = async (payload) => {
  const user = await UserCollections.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');


export const registerUser = async (payload) => {
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UserCollections.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await UserCollections.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Invalid email!');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw createHttpError(401, 'Invalid password!');
  }

  await SessionCollections.deleteOne({ userId: user._id });

  const sessionData = createSessionData();

  return SessionCollections.create({
    userId: user._id,
    ...sessionData,
  });
};

export const refresh = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollections.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSessionData();

  await SessionCollections.deleteOne({ _id: sessionId, refreshToken });

  return await SessionCollections.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logout = async (sessionId) => {
  await SessionCollections.deleteOne({ _id: sessionId });
};


export const getUser = (filter) => UserCollections.findOne(filter);

export const getSession = (filter) => SessionCollections.findOne(filter);
