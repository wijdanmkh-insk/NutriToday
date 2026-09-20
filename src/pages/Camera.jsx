import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Loader,
  Leaf,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  FlipHorizontal,
} from 'lucide-react';
import { analyzeFoodImage } from '../utils/gemini';
import { addFoodEntry, getUserProfile } from '../utils/storage';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

function getMealTypeByTime() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 16) return 'Lunch';
  return 'Dinner';
}

function NutrientBadge({ label, value }) {
  return (
    <div className="flex flex-col items-center bg-brand-mid/10 rounded-xl px-3 py-2">
      <span className="text-brand-dark font-bold text-sm">{value}</span>
      <span className="text-gray-500 text-xs mt-0.5 capitalize">{label}</span>
    </div>
  );
}

export default function CameraPage() {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [base64Data, setBase64Data] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(getMealTypeByTime);
  const [saved, setSaved] = useState(false);
  const [showNutrients, setShowNutrients] = useState(true);
  const [facingMode, setFacingMode] = useState('environment');

  const profile = getUserProfile();

  useEffect(() => {
    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // result is "data:image/jpeg;base64,XXXXX"
        const base64 = result.split(',')[1];
        resolve({ base64, dataUrl: result });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Handle file upload
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    setError('');
    setResult(null);
    setSaved(false);
    const { base64, dataUrl } = await fileToBase64(file);
    setImageDataUrl(dataUrl);
    setBase64Data(base64);
    setMimeType(file.type || 'image/jpeg');
  }

  // Start camera
  async function startCamera() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      streamRef.current = stream;
      setShowCamera(true);
      // Attach after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setError('Camera access denied. Please use the upload option instead.');
    }
  }

  // Flip camera
  async function flipCamera() {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setError('Could not switch camera.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }

  // Capture frame
  function capturePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];
    setImageDataUrl(dataUrl);
    setBase64Data(base64);
    setMimeType('image/jpeg');
    setResult(null);
    setSaved(false);
    stopCamera();
  }

  // Analyze with Gemini
  const analyzeImage = useCallback(async () => {
    if (!base64Data) return;
    setAnalyzing(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeFoodImage(base64Data, mimeType);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [base64Data, mimeType]);

  // Save to food log
  function saveEntry() {
    if (!result) return;
    addFoodEntry({
      meal: selectedMeal,
      name: result.dishName,
      calories: result.estimatedCalories,
      nutrients: result.nutrients,
      image: imageDataUrl,
    });
    setSaved(true);
  }

  function reset() {
    setImageDataUrl(null);
    setBase64Data(null);
    setResult(null);
    setError('');
    setSaved(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 ">
      {/* Header */}
      <div className="bg-brand-darkest px-6 pt-12 pb-6 global-padding">
        <div className="flex items-center gap-2 mb-2">
          <Leaf size={20} className="text-brand-yellow" />
          <span className="text-white font-bold tracking-tight">NutriToday</span>
        </div>
        <h1 className="text-white text-2xl font-bold">Food Scanner</h1>
        <p className="text-gray-400 text-sm mt-1">Snap or upload a photo to analyze nutrition</p>
      </div>

      <div className="px-4 py-5 space-y-4 w-full h-full mx-auto items-center justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Camera viewer */}
        {showCamera && (
          <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full object-cover"
            />
            {/* Camera frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/60 rounded-2xl" />
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 items-center">
              <button
                onClick={flipCamera}
                className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
              >
                <FlipHorizontal size={20} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
                aria-label="Upload food photo"
              >
                <Upload size={20} />
              </button>
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full border-4 border-brand-yellow shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              >
                <Camera size={28} className="text-brand-darkest" />
              </button>
              <button
                onClick={stopCamera}
                className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
                aria-label="Close camera"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Image preview */}
        {imageDataUrl && !showCamera && (
          <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <img
              src={imageDataUrl}
              alt="Food preview"
              className="w-full aspect-[4/3] object-cover"
            />
            <button
              onClick={reset}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Capture / Upload buttons */}
        {!showCamera && !imageDataUrl && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCamera}
              className="flex flex-col items-center justify-center gap-2 bg-brand-darkest text-white py-8 rounded-2xl shadow active:scale-95 transition-transform"
            >
              <Camera size={128} className="text-brand-yellow" />
              <span className="text-sm font-medium">Open Camera</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-8 rounded-2xl shadow-sm active:scale-95 transition-transform"
            >
              <Upload size={28} className="text-brand-mid" />
              <span className="text-sm font-medium">Upload Photo</span>
            </button>
          </div>
        )}

        {/* Meal type selector */}
        {imageDataUrl && !showCamera && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Log as
            </p>
            <div className="flex gap-2 flex-wrap">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMeal(m)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                    selectedMeal === m
                      ? 'bg-brand-mid text-white border-brand-mid'
                      : 'border-gray-200 text-gray-500 hover:border-brand-mid'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analyze button */}
        {imageDataUrl && !showCamera && !result && (
          <button
            onClick={analyzeImage}
            disabled={analyzing}
            className="w-full bg-brand-yellow text-brand-darkest font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition-transform disabled:opacity-60"
          >
            {analyzing ? (
              <>
                <Loader size={18} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Leaf size={18} />
                Analyze Nutrition
              </>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Results card */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Dish header */}
            <div className="bg-brand-darkest px-5 py-4">
              <h3 className="text-white font-bold text-lg">{result.dishName}</h3>
              <p className="text-gray-300 text-sm mt-1">{result.description}</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Calories */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Estimated Calories</span>
                <span className="text-brand-mid font-bold text-lg">
                  {result.estimatedCalories} kcal
                </span>
              </div>

              {/* Side dishes */}
              {result.sideDishes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Serves with
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.sideDishes.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-brand-mid/10 text-brand-dark px-3 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrients */}
              <div>
                <button
                  onClick={() => setShowNutrients((v) => !v)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2"
                >
                  Nutritional Info
                  {showNutrients ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {showNutrients && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.nutrients).map(([k, v]) => (
                      <NutrientBadge key={k} label={k} value={v} />
                    ))}
                  </div>
                )}
              </div>

              {/* Health notes */}
              {result.healthNotes && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
                  💡 {result.healthNotes}
                </p>
              )}

              {/* Save / Reset */}
              <div className="flex gap-3 pt-1">
                {!saved ? (
                  <button
                    onClick={saveEntry}
                    className="flex-1 bg-brand-mid text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
                  >
                    Save to Log
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 font-semibold py-3 rounded-xl text-sm border border-green-100">
                    <CheckCircle size={16} />
                    Saved!
                  </div>
                )}
                <button
                  onClick={reset}
                  className="flex-1 border border-gray-200 text-gray-500 font-medium py-3 rounded-xl text-sm hover:border-brand-mid transition"
                >
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
