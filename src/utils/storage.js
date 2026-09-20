// Keys used in localStorage
export const STORAGE_KEYS = {
  USER_PROFILE: 'nutritoday_user_profile',
  MEAL_HISTORY: 'nutritoday_meal_history',
  APP_START_DATE: 'nutritoday_app_start_date',
  FOOD_LOG: 'nutritoday_food_log',
};

// User profile: { name, age, gender, weight, height }
export function getUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUserProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

export function deleteUserProfile() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

// App start date (ISO string) — set once when user completes onboarding
export function getAppStartDate() {
  return localStorage.getItem(STORAGE_KEYS.APP_START_DATE);
}

export function setAppStartDate() {
  if (!localStorage.getItem(STORAGE_KEYS.APP_START_DATE)) {
    localStorage.setItem(STORAGE_KEYS.APP_START_DATE, new Date().toISOString());
  }
}

export function getElapsedDays() {
  const start = getAppStartDate();
  if (!start) return 0;
  const diff = Date.now() - new Date(start).getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

// Meal / food log: array of { id, date, meal, name, calories, nutrients, image? }
export function getFoodLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOOD_LOG);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFoodEntry(entry) {
  const log = getFoodLog();
  log.unshift({ ...entry, id: Date.now(), date: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify(log));
  return log;
}

export function deleteFoodEntry(id) {
  const log = getFoodLog().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify(log));
  return log;
}

// Meal recommendations cache: { date, recommendations }
export function getMealRecommendations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEAL_HISTORY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveMealRecommendations(recs) {
  localStorage.setItem(
    STORAGE_KEYS.MEAL_HISTORY,
    JSON.stringify({ date: new Date().toDateString(), recommendations: recs })
  );
}
