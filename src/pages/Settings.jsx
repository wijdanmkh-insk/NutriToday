import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  User,
  Weight,
  Ruler,
  Calendar,
  Users,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  getUserProfile,
  saveUserProfile,
  deleteUserProfile,
  getElapsedDays,
  getFoodLog,
} from '../utils/storage';

function Field({ label, name, icon: Icon, value, onChange, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-mid transition ${
            error ? 'border-red-400' : 'border-gray-200'
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const profile = getUserProfile();
  const [form, setForm] = useState({
    name: profile?.name || '',
    age: profile?.age?.toString() || '',
    gender: profile?.gender || '',
    weight: profile?.weight?.toString() || '',
    height: profile?.height?.toString() || '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const elapsedDays = getElapsedDays();
  const logCount = getFoodLog().length;
  const bmi =
    form.weight && form.height
      ? (parseFloat(form.weight) / (parseFloat(form.height) / 100) ** 2).toFixed(1)
      : '–';

  function getBMILabel(bmi) {
    const val = parseFloat(bmi);
    if (isNaN(val)) return '';
    if (val < 18.5) return 'Underweight';
    if (val < 25) return 'Normal';
    if (val < 30) return 'Overweight';
    return 'Obese';
  }

  function getBMIColor(bmi) {
    const val = parseFloat(bmi);
    if (isNaN(val)) return 'text-gray-400';
    if (val < 18.5) return 'text-blue-500';
    if (val < 25) return 'text-green-500';
    if (val < 30) return 'text-yellow-500';
    return 'text-red-500';
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSaved(false);
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.age || isNaN(form.age) || +form.age < 1) errs.age = 'Enter a valid age.';
    if (!form.gender) errs.gender = 'Please select a gender.';
    if (!form.weight || isNaN(form.weight) || +form.weight < 1) errs.weight = 'Enter a valid weight.';
    if (!form.height || isNaN(form.height) || +form.height < 1) errs.height = 'Enter a valid height.';
    return errs;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    saveUserProfile({
      name: form.name.trim(),
      age: parseInt(form.age, 10),
      gender: form.gender,
      weight: parseFloat(form.weight),
      height: parseFloat(form.height),
    });
    setSaved(true);
  }

  function handleDelete() {
    deleteUserProfile();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-brand-darkest px-6 pt-12 pb-8 global-padding">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={20} className="text-brand-yellow" />
              <span className="text-white font-bold tracking-tight">NutriToday</span>
            </div>
            <h1 className="text-white text-2xl font-bold">Settings</h1>

            {/* Profile avatar */}
            <div className="flex items-center gap-4 mt-5">
              <div className="w-16 h-16 rounded-full bg-brand-mid flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{profile.name}</p>
                <p className="text-gray-400 text-sm">{profile.gender} · {profile.age} years old</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-28 py-3 text-center rounded-2xl bg-white px-3 shadow-md">
              <p className="text-gray-400 text-xs">Days</p>
              <p className="text-brand-dark font-bold text-base mt-0.5">{elapsedDays}</p>
            </div>

            <div className="flex-1 md:w-28 py-3 text-center rounded-2xl bg-white px-3 shadow-md">
              <p className="text-gray-400 text-xs">Meals Logged</p>
              <p className="text-brand-dark font-bold text-base mt-0.5">{logCount}</p>
            </div>

            <div className="flex-1 md:w-28 py-3 text-center rounded-2xl bg-white px-3 shadow-md">
              <p className="text-gray-400 text-xs">BMI</p>
              <p className={`font-bold text-base mt-0.5 ${getBMIColor(bmi)}`}>{bmi}</p>
              <p className={`text-xs ${getBMIColor(bmi)}`}>{getBMILabel(bmi)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="px-4 mt-6 space-y-4 max-w-md mx-auto">
        <h2 className="font-bold text-gray-800">Edit Profile</h2>

        <Field
          label="Full Name"
          name="name"
          icon={User}
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Your name"
        />

        <Field
          label="Age"
          name="age"
          icon={Calendar}
          value={form.age}
          onChange={handleChange}
          error={errors.age}
          type="number"
          min={1}
          max={120}
          placeholder="e.g. 25"
        />

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Gender
          </label>
          <div className="flex gap-3">
            {['Male', 'Female'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, gender: g }));
                  setErrors((prev) => ({ ...prev, gender: '' }));
                  setSaved(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition ${
                  form.gender === g
                    ? 'bg-brand-mid text-white border-brand-mid'
                    : 'border-gray-200 text-gray-600 hover:border-brand-mid'
                }`}
              >
                <Users size={15} />
                {g}
              </button>
            ))}
          </div>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>

        <Field
          label="Weight (kg)"
          name="weight"
          icon={Weight}
          value={form.weight}
          onChange={handleChange}
          error={errors.weight}
          type="number"
          min={1}
          step="0.1"
          placeholder="e.g. 65"
        />

        <Field
          label="Height (cm)"
          name="height"
          icon={Ruler}
          value={form.height}
          onChange={handleChange}
          error={errors.height}
          type="number"
          min={1}
          placeholder="e.g. 170"
        />

        {/* Save button */}
        <button
          type="submit"
          className="w-full bg-brand-yellow text-brand-darkest font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition-transform"
        >
          {saved ? (
            <>
              <CheckCircle size={18} />
              Changes Saved!
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </form>

      {/* Danger zone */}
      <div className="px-4 mt-8 max-w-md mx-auto">
        <h2 className="font-bold text-gray-800 mb-3">Account</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
            <span className="flex-1 text-left font-medium text-sm">Delete Account & Data</span>
            <ChevronRight size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 px-1">
          This will permanently remove all your data stored on this device.
        </p>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>

            <h3 className="font-bold text-gray-800 text-lg">Delete Account?</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              This will permanently delete your profile, meal history, and all data stored on this device. This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
