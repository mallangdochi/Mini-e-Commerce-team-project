import { create } from 'zustand';

import { getMe } from '@/api/authApi';
import { supabase } from '@/lib/supabase';
import {
  clearAuthSessionStorage,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUserInfo,
  updateStoredSummary,
} from '@/utils/storage';

const PROFILE_CACHE_TTL = 5 * 60 * 1000;

let pendingProfileRequest = null;
let pendingAuthSync = null;
let authSubscription = null;

const initialAccessToken = getAccessToken();

function clearLocalAuth(set) {
  pendingProfileRequest = null;
  clearAuthSessionStorage();

  set({
    accessToken: null,
    user: null,
    isLoggedIn: false,
    isAuthLoading: false,
    lastFetchedAt: 0,
  });
}

async function loadProfileForSession(session, set) {
  if (!session?.access_token) {
    clearLocalAuth(set);
    return null;
  }

  setAccessToken(session.access_token);

  const response = await getMe();
  const user = response?.data?.user ?? response?.user ?? null;

  if (!user) {
    throw new Error('로그인 정보를 확인할 수 없습니다.');
  }

  setStoredUserInfo(user);

  set({
    accessToken: session.access_token,
    user,
    isLoggedIn: true,
    isAuthLoading: false,
    lastFetchedAt: Date.now(),
  });

  return user;
}

function ensureAuthSubscription(set) {
  if (authSubscription) {
    return;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => {
      if (!session?.access_token) {
        clearLocalAuth(set);
        window.dispatchEvent(new Event('auth-change'));
        return;
      }

      void loadProfileForSession(session, set)
        .then(() => {
          window.dispatchEvent(new Event('auth-change'));
        })
        .catch(() => {
          clearLocalAuth(set);
          window.dispatchEvent(new Event('auth-change'));
        });
    }, 0);
  });

  authSubscription = data.subscription;
}

const useAuthStore = create((set, get) => ({
  accessToken: initialAccessToken,
  user: initialAccessToken ? getStoredUser() : null,
  isLoggedIn: Boolean(initialAccessToken),
  isAuthLoading: true,
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
      lastFetchedAt: user ? Date.now() : 0,
    });

    window.dispatchEvent(new Event('auth-change'));
  },

  syncAuthFromStorage: async () => {
    if (pendingAuthSync) {
      return pendingAuthSync;
    }

    pendingAuthSync = (async () => {
      set({
        isAuthLoading: true,
      });

      ensureAuthSubscription(set);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        clearLocalAuth(set);
        throw error;
      }

      if (!session?.access_token) {
        clearLocalAuth(set);
        return null;
      }

      try {
        await loadProfileForSession(session, set);
        return session;
      } catch (error) {
        clearLocalAuth(set);
        throw error;
      }
    })().finally(() => {
      pendingAuthSync = null;
    });

    return pendingAuthSync;
  },

  fetchMe: async ({ force = false } = {}) => {
    const state = get();

    if (!state.isLoggedIn) {
      return null;
    }

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

    set({
      isAuthLoading: true,
    });

    pendingProfileRequest = getMe()
      .then((response) => {
        const user = response?.data?.user ?? response?.user ?? null;

        if (!user) {
          throw new Error('로그인 정보를 확인할 수 없습니다.');
        }

        setStoredUserInfo(user);

        set({
          user,
          isLoggedIn: true,
          isAuthLoading: false,
          lastFetchedAt: Date.now(),
        });

        return user;
      })
      .catch((error) => {
        set({
          isAuthLoading: false,
        });
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
    clearLocalAuth(set);

    void supabase.auth.signOut().finally(() => {
      window.dispatchEvent(new Event('auth-change'));
    });
  },
}));

export default useAuthStore;
