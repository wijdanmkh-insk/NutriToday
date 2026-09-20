import { useState } from 'react';
import { Clock3, History as HistoryIcon, Leaf, Trash2 } from 'lucide-react';
import { deleteFoodEntry, getFoodLog } from '../utils/storage';

function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

function NutrientList({ nutrients }) {
  if (!nutrients || Object.keys(nutrients).length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {Object.entries(nutrients).map(([label, value]) => (
        <div key={label} className="rounded-xl bg-brand-mid/10 px-3 py-2">
          <p className="truncate text-xs capitalize text-gray-500">{label}</p>
          <p className="mt-0.5 text-sm font-bold text-brand-dark">{value}</p>
        </div>
      ))}
    </div>
  );
}

function HistoryEntry({ entry, onDelete }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex gap-4 p-4">
        {entry.image ? (
          <img
            src={entry.image}
            alt={entry.name}
            className="h-24 w-24 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-brand-mid/10">
            <Leaf size={28} className="text-brand-mid" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-mid">
                {entry.meal}
              </p>
              <h2 className="mt-1 truncate text-lg font-bold text-gray-800">{entry.name}</h2>
            </div>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              aria-label={`Delete ${entry.name} from history`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="font-bold text-brand-dark">{entry.calories} kcal</span>
            <span className="flex items-center gap-1">
              <Clock3 size={13} />
              {formatDate(entry.date)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Nutritional Info
        </p>
        <NutrientList nutrients={entry.nutrients} />
      </div>
    </article>
  );
}

export default function History() {
  const [entries, setEntries] = useState(() => getFoodLog());

  function handleDelete(id) {
    setEntries(deleteFoodEntry(id));
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand-darkest px-6 pb-8 pt-12 global-padding">
        <div className="mb-2 flex items-center gap-2">
          <Leaf size={20} className="text-brand-yellow" />
          <span className="font-bold tracking-tight text-white">NutriToday</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Food History</h1>
        <p className="mt-1 text-sm text-gray-400">
          Every meal you have analyzed and saved.
        </p>
      </div>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <HistoryEntry key={entry.id} entry={entry} onDelete={handleDelete} />
          ))
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-mid/10">
              <HistoryIcon size={30} className="text-brand-mid" />
            </div>
            <h2 className="mt-4 font-bold text-gray-800">No saved meals yet</h2>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-gray-500">
              Analyze a food photo from the camera and save it to see the meal here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}