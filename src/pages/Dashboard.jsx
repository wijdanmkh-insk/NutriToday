import { useState, useEffect, useCallback } from 'react';
import {
  Leaf,
  CalendarDays,
  RefreshCw,
  Utensils,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
} from 'lucide-react';
import {
  getUserProfile,
  getElapsedDays,
  getMealRecommendations,
  saveMealRecommendations,
} from '../utils/storage';
import { generateMealSuggestions } from '../utils/gemini';

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Breakfast', icon: Sun },
  { key: 'lunch', label: 'Lunch', icon: Sunset },
  { key: 'dinner', label: 'Dinner', icon: Moon },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function MealCard({ slot, data }) {
  const Icon = slot.icon;
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-brand-mid/10 flex items-center justify-center">
          <Icon size={16} className="text-brand-mid" />
        </div>
        <span className="font-semibold text-gray-700 text-sm">{slot.label}</span>
        {data && (
          <span className="ml-auto text-xs text-brand-mid font-medium bg-brand-mid/10 px-2 py-0.5 rounded-full">
            {data.calories} kcal
          </span>
        )}
      </div>

      {data ? (
        <div>
          <p className="font-bold text-gray-800 text-base leading-tight">{data.name}</p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">{data.description}</p>
          <div className="flex gap-3 mt-3">
            {Object.entries(data.nutrients).map(([k, v]) => (
              <div key={k} className="text-center">
                <p className="text-xs font-bold text-brand-dark">{v}</p>
                <p className="text-xs text-gray-400 capitalize">{k}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 text-gray-300 gap-2">
          <Utensils size={28} />
          <p className="text-xs text-gray-400 text-center">No data yet!<br />Let's take your first meal.</p>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [profile] = useState(getUserProfile);
  const elapsedDays = getElapsedDays();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load cached or fresh recommendations
  const loadRecommendations = useCallback(async (force = false) => {
    if (!profile) return;

    const cached = getMealRecommendations();
    const todayStr = new Date().toDateString();

    if (!force && cached && cached.date === todayStr) {
      setRecommendations(cached.recommendations);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const recs = await generateMealSuggestions(profile);
      saveMealRecommendations(recs);
      setRecommendations(recs);
    } catch (err) {
      setError(err.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-brand-darkest px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Leaf size={20} className="text-brand-yellow" />
          <span className="text-white font-bold tracking-tight">NutriToday</span>
        </div>
        <p className="text-gray-400 text-sm">{getGreeting()},</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">{profile.name} 👋</h1>

        {/* Elapsed days pill */}
        <div className="flex items-center gap-2 mt-4 bg-brand-dark rounded-xl px-4 py-3 w-fit">
          <CalendarDays size={16} className="text-brand-yellow" />
          <span className="text-white text-sm font-medium">
            Day {elapsedDays} on NutriToday
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex divide-x divide-gray-100">
        {[
          { label: 'Age', value: `${profile.age} yr` },
          { label: 'Weight', value: `${profile.weight} kg` },
          { label: 'Height', value: `${profile.height} cm` },
        ].map(({ label, value }) => (
          <div key={label} className="flex-1 py-3 text-center">
            <p className="text-gray-400 text-xs">{label}</p>
            <p className="text-brand-dark font-bold text-sm mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Recommendations Section */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-base">Today's Meal Plan</h2>
          <button
            onClick={() => loadRecommendations(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-brand-mid font-medium py-1.5 px-3 rounded-full border border-brand-mid/30 hover:bg-brand-mid/5 transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100" />
                  <div className="w-24 h-4 rounded bg-gray-100 mt-1" />
                </div>
                <div className="w-40 h-5 rounded bg-gray-100 mb-2" />
                <div className="w-full h-3 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {MEAL_SLOTS.map((slot) => (
              <MealCard
                key={slot.key}
                slot={slot}
                data={recommendations ? recommendations[slot.key] : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
