export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Generic function to set data in localStorage
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Generic function to remove data from localStorage
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

// NEW: Functions for sessionStorage
export function getSessionItem<T>(key: string, defaultValue: T): T {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from sessionStorage:`, error);
    return defaultValue;
  }
}

export function setSessionItem<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to sessionStorage:`, error);
  }
}

export function removeSessionItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from sessionStorage:`, error);
  }
}

// Constants for storage keys
export const STORAGE_KEYS = {
  AUTH_USER: "auth_user",
  AUTH_STATE: "auth_state",
  USER_EXAMS: "user_exams",
  EXAM_RESULTS: "exam_results",
  CURRENT_STUDENT: "current_student",
};
