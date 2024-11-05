import { StateSchema } from '@/shared/lib/providers/StoreProvider';
import { GlobalWindow } from '../types/globalSliceSchema';
import { createSelector } from 'reselect';

export const getWindowsOpen = (state: StateSchema) => state.global.windowsOpen;

export const getIsWindowOpen = createSelector(getWindowsOpen, (windowsOpen) => (window: GlobalWindow) => {
  return windowsOpen.some((w) => w.window === window);
});

export const getOpenedWindow = createSelector(getWindowsOpen, (windowsOpen) => (window: GlobalWindow) => {
  return windowsOpen.find((w) => w.window === window);
});

export const getIsGlobalLoading = (state: StateSchema) => state.global.isLoading;

export const getIsWindowCurrentlyOpen = createSelector(getWindowsOpen, (windowsOpen) => (window: GlobalWindow) => {
  return windowsOpen.some((w) => w.window === window) && windowsOpen[windowsOpen.length - 1].window === window;
});

export const getStoryViewerState = (state: StateSchema) => 
  state.global.windowsOpen.some(window => window.window === GlobalWindow.StoryViewer);
