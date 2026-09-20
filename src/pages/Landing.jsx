import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Weight,
  Ruler,
  Users,
  AlertCircle,
} from 'lucide-react';
import { saveUserProfile, setAppStartDate } from '../utils/storage';

const STEPS = { LANDING: 'landing', FORM: 'form' };

const genderOptions = ['Male', 'Female'];

export default function Landing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.LANDING);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.age || isNaN(form.age) || +form.age < 1 || +form.age > 120)
      errs.age = 'Enter a valid age (1–120).';
    if (!form.gender) errs.gender = 'Please select a gender.';
    if (!form.weight || isNaN(form.weight) || +form.weight < 1)
      errs.weight = 'Enter a valid weight in kg.';
    if (!form.height || isNaN(form.height) || +form.height < 1)
      errs.height = 'Enter a valid height in cm.';
    return errs;
  }

  function handleSubmit(e) {
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
    setAppStartDate();
    navigate('/dashboard');
  }

  // ——— Landing Screen ———
  if (step === STEPS.LANDING) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-between px-6 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2 text-white">
          <Leaf size={28} className="text-brand-yellow" />
          <span className="text-xl font-bold tracking-tight">NutriToday</span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-12">
          <div className="w-20 h-20 rounded-full bg-brand-dark flex items-center justify-center shadow-xl">
            <Leaf size={42} className="text-brand-yellow" />
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Eat smarter,<br />
            <span className="text-brand-yellow">live better.</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xs leading-relaxed">
            NutriToday helps you plan balanced meals tailored to your age,
            weight, and health goals — every single day.
          </p>

          {/* Feature bullets */}
          <ul className="text-left space-y-3 mt-2">
            {[
              'Personalized daily meal plans',
              'AI-powered food analysis',
              'Track your nutrition journey',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-gray-200 text-sm">
                <span className="w-5 h-5 rounded-full bg-brand-mid flex items-center justify-center flex-shrink-0">
                  <Leaf size={11} className="text-white" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={() => setStep(STEPS.FORM)}
          className="w-full max-w-xs bg-brand-yellow text-brand-darkest font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          Get Started
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // ——— Onboarding Form ———
  return (
    <div className="min-h-screen bg-brand-darkest flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-6">
        <div className="flex items-center gap-2 text-white mb-6">
          <Leaf size={22} className="text-brand-yellow" />
          <span className="font-bold tracking-tight">NutriToday</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Tell us about you</h2>
        <p className="text-gray-400 text-sm mt-1">
          We'll use this to tailor your meal plan.
        </p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-32 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Wijdan"
                className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-mid transition ${
                  errors.name ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Age
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 25"
                min={1}
                max={120}
                className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-mid transition ${
                  errors.age ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Gender
            </label>
            <div className="flex gap-3">
              {genderOptions.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, gender: g }));
                    setErrors((prev) => ({ ...prev, gender: '' }));
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

          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Weight (kg)
            </label>
            <div className="relative">
              <Weight size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="e.g. 65"
                min={1}
                step="0.1"
                className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-mid transition ${
                  errors.weight ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Height (cm)
            </label>
            <div className="relative">
              <Ruler size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                placeholder="e.g. 170"
                min={1}
                className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-mid transition ${
                  errors.height ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDisclaimer((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-500 hover:text-brand-mid transition"
            >
              <AlertCircle size={15} />
              <span className="flex-1 text-left">Why do you need these data?</span>
              {showDisclaimer ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {showDisclaimer && (
              <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                It is used to help us organize the preferences of food and
                adjusting the recommended foods based on your profile. Your
                data is stored only on this device and never shared.
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-brand-yellow text-brand-darkest font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition-transform mt-2"
          >
            Start My Journey
            <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
