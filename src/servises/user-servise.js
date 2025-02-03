import UserCollections from '../db/models/User.js';

export const getUserById = async (userId) => {};

export const updateUserById = async (userId, updatedData) => {
  //TODO: add search by sessionID and userID
  const updatingResult = await UserCollections.findOneAndUpdate(
    { _id: userId },
    updatedData,
    {
      new: true,
    },
  );

  return updatingResult;
};

export const updateAvatarById = async (userId, avatarURL) => {
  const Hello="world";
  console.log(Hello);
};
