import { useState, useRef, useEffect } from 'react';
import {
  Leaf,
  Search,
  MessageCircle,
  X,
  Send,
  Loader,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { generateFoodByCategory, chatWithNutriBot } from '../utils/gemini';
import { getUserProfile } from '../utils/storage';

const TABS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];

function FoodCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-base leading-tight">{item.name}</h3>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.description}</p>
          </div>
          <span className="text-brand-mid font-bold text-sm bg-brand-mid/10 px-2.5 py-1 rounded-full whitespace-nowrap">
            {item.calories} kcal
          </span>
        </div>

        <div className="flex items-center gap-4 mt-3">
          {item.prepTime && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              {item.prepTime}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Flame size={12} />
            {item.calories} kcal
          </span>
        </div>

        {/* Nutrients toggle */}
        {item.nutrients && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-brand-mid font-medium mt-3"
          >
            Nutrition {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}

        {open && item.nutrients && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(item.nutrients).map(([k, v]) => (
              <span key={k} className="text-xs bg-brand-mid/10 text-brand-dark px-2.5 py-1 rounded-full">
                {k}: {v}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabContent({ tab }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const profile = getUserProfile();

  async function loadSuggestions() {
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const data = await generateFoodByCategory(tab, profile);
      setItems(data);
      setLoaded(true);
    } catch (err) {
      setError(err.message || 'Failed to load suggestions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setItems([]);
    setLoaded(false);
    setError('');
  }, [tab]);

  if (!loaded && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-mid/10 flex items-center justify-center">
          <Leaf size={28} className="text-brand-mid" />
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-semibold">Get {tab} Ideas</p>
          <p className="text-gray-400 text-sm mt-1">AI will suggest personalized options for you</p>
        </div>
        <button
          onClick={loadSuggestions}
          className="bg-brand-yellow text-brand-darkest font-bold px-6 py-3 rounded-xl text-sm active:scale-95 transition-transform"
        >
          Generate Suggestions
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex justify-between mb-2">
              <div className="w-36 h-5 bg-gray-100 rounded" />
              <div className="w-16 h-5 bg-gray-100 rounded" />
            </div>
            <div className="w-full h-3 bg-gray-100 rounded mt-2" />
            <div className="w-3/4 h-3 bg-gray-100 rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4 text-sm text-red-600">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {items.map((item, i) => (
        <FoodCard key={i} item={item} />
      ))}
      <button
        onClick={loadSuggestions}
        className="w-full border border-brand-mid/30 text-brand-mid font-medium py-3 rounded-xl text-sm hover:bg-brand-mid/5 transition"
      >
        Refresh Suggestions
      </button>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-mid flex items-center justify-center flex-shrink-0 mt-1">
          <Leaf size={14} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-mid text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm NutriBot 🌿 Ask me anything about food, recipes, or nutrition tips!",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const profile = getUserProfile();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    try {
      const reply = await chatWithNutriBot(newMessages, profile);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I ran into an error: ${err.message}` },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} msg={m} />
        ))}
        {sending && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-mid flex items-center justify-center">
              <Leaf size={14} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Loader size={16} className="animate-spin text-brand-mid" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex gap-2 pt-3 border-t border-gray-100"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about food or recipes..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-mid"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-12 h-12 bg-brand-mid rounded-xl flex items-center justify-center text-white disabled:opacity-50 active:scale-95 transition-transform"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('Breakfast');
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col">
      {/* Header */}
      <div className="bg-brand-darkest px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Leaf size={20} className="text-brand-yellow" />
          <span className="text-white font-bold tracking-tight">NutriToday</span>
        </div>
        <h1 className="text-white text-2xl font-bold">Explore Foods</h1>
        <p className="text-gray-400 text-sm mt-1">AI-personalized suggestions for every meal</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex overflow-x-auto no-scrollbar px-4 gap-1 py-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-brand-mid text-white'
                  : 'text-gray-500 hover:text-brand-mid'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 flex-1">
        <TabContent tab={activeTab} />
      </div>

      {/* Chat FAB */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-20 right-5 w-14 h-14 bg-brand-mid rounded-full flex items-center justify-center shadow-xl text-white active:scale-95 transition-transform z-40"
        aria-label="Open NutriBot"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat drawer */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowChat(false)}
          />
          <div className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col h-[70vh] max-w-lg w-full mx-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-mid flex items-center justify-center">
                  <Leaf size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">NutriBot</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden px-4 py-3 flex flex-col">
              <Chatbot />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
