import { create } from 'zustand';

import { getMe } from '@/api/authApi';
import {
  clearAuthSessionStorage,
  getAccessToken,
  getStoredUser,
  resolveUserProfile,
  setAccessToken,
  setStoredUserInfo,
  updateStoredSummary,
} from '@/utils/storage';

const PROFILE_CACHE_TTL = 5 * 60 * 1000;
let pendingProfileRequest = null;

const initialAccessToken = getAccessToken();

const useAuthStore = create((set, get) => ({
  accessToken: initialAccessToken,
  user: initialAccessToken ? getStoredUser() : null,
  isLoggedIn: Boolean(initialAccessToken),
  isAuthLoading: false,
  lastFetchedAt: 0,

  setSession: ({ accessToken, user }) => {
    if (!accessToken) {
      return;
    }

    setAccessToken(accessToken);
    setStoredUserInfo(user ?? null);

    set({
      accessToken,
      user: user ?? null,
      isLoggedIn: true,
      isAuthLoading: false,
      lastFetchedAt: 0,
    });

    window.dispatchEvent(new Event('auth-change'));
  },

  syncAuthFromStorage: () => {
    const accessToken = getAccessToken();

    set({
      accessToken,
      user: accessToken ? getStoredUser() : null,
      isLoggedIn: Boolean(accessToken),
      isAuthLoading: false,
      lastFetchedAt: 0,
    });
  },

  fetchMe: async ({ force = false } = {}) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      set({
        accessToken: null,
        user: null,
        isLoggedIn: false,
        isAuthLoading: false,
        lastFetchedAt: 0,
      });
      return null;
    }

    const state = get();
    const hasFreshProfile =
      !force &&
      state.user &&
      state.lastFetchedAt > 0 &&
      Date.now() - state.lastFetchedAt < PROFILE_CACHE_TTL;

    if (hasFreshProfile) {
      return state.user;
    }

    if (pendingProfileRequest) {
      return pendingProfileRequest;
    }

    set({ isAuthLoading: true });

    pendingProfileRequest = getMe()
      .then((response) => {
        const user = resolveUserProfile(response);

        setStoredUserInfo(user);
        set({
          accessToken,
          user,
          isLoggedIn: true,
          isAuthLoading: false,
          lastFetchedAt: Date.now(),
        });

        return user;
      })
      .catch((error) => {
        set({ isAuthLoading: false });
        throw error;
      })
      .finally(() => {
        pendingProfileRequest = null;
      });

    return pendingProfileRequest;
  },

  patchUserSummary: (partialSummary) => {
    if (!partialSummary || typeof partialSummary !== 'object') {
      return;
    }

    updateStoredSummary(partialSummary);

    set((state) => ({
      user: {
        ...(state.user ?? getStoredUser() ?? {}),
        ...partialSummary,
      },
    }));
  },

  logout: () => {
    pendingProfileRequest = null;
    clearAuthSessionStorage();

    set({
      accessToken: null,
      user: null,
      isLoggedIn: false,
      isAuthLoading: false,
      lastFetchedAt: 0,
    });

    window.dispatchEvent(new Event('auth-change'));
  },
}));

export default useAuthStore;
