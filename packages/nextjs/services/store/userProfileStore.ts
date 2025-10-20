import { create } from 'zustand';

export type UserProfile = 'seller' | 'buyer';

type UserProfileState = {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
};

export const useUserProfileStore = create<UserProfileState>((set) => ({
  userProfile: 'seller',
  setUserProfile: (profile) => set({ userProfile: profile }),
}));