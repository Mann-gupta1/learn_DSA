import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  conceptId?: string | null;
}

interface FloatingAskAIProps {
  conceptId?: string;
}

// Separate component for chat messages to handle concept links
function ChatMessage({ message, onLinkClick }: { message: Message; onLinkClick?: () => void }) {
  const [conceptSlug, setConceptSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (message.conceptId && message.role === 'assistant') {
      // Fetch concept to get slug
      apiService.getConceptById(message.conceptId)
        .then((res) => {
          const concept = res.concept as any;
          if (concept?.slug) {
            setConceptSlug(concept.slug);
          }
        })
        .catch(() => {});
    }
  }, [message.conceptId, message.role]);

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const targetPath = `/concept/${conceptSlug || message.conceptId}`;
    
    // Close the modal first
    if (onLinkClick) {
      onLinkClick();
    }
    
    // Navigate immediately - React Router should handle it
    navigate(targetPath, { replace: false });
  };

  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {message.conceptId && message.role === 'assistant' && (
          <a
            href={`/concept/${conceptSlug || message.conceptId}`}
            onClick={handleLinkClick}
            className="inline-flex items-center gap-1 text-xs mt-2 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <FaExternalLinkAlt className="w-3 h-3" />
            View full concept page
          </a>
        )}
        <p className="text-xs mt-1 opacity-70">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

export default function FloatingAskAI({ conceptId }: FloatingAskAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Get current page context
  const getCurrentContext = () => {
    const path = location.pathname;
    
    // Extract concept slug from URL if on concept page
    const conceptMatch = path.match(/\/concept\/([^/]+)/);
    const conceptSlug = conceptMatch ? conceptMatch[1] : null;

    // Get current URL
    const currentUrl = window.location.href;

    return {
      conceptSlug,
      currentUrl,
      path,
    };
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const context = getCurrentContext();
      
      // Try to get conceptId from slug if we have a concept slug
      let finalConceptId = conceptId;
      if (!finalConceptId && context.conceptSlug) {
        try {
          const conceptResponse = await apiService.getConceptBySlug(context.conceptSlug);
          finalConceptId = (conceptResponse.concept as any)?.id;
        } catch (error) {
          console.error('Failed to fetch concept ID:', error);
        }
      }

      // Extract URL from question if present
      const urlMatch = userMessage.content.match(/(https?:\/\/[^\s]+)/);
      const urlFromQuestion = urlMatch ? urlMatch[0] : undefined;

      const response = await apiService.chat({
        question: userMessage.content,
        conceptId: finalConceptId,
        url: urlFromQuestion || (context.path !== '/' ? context.currentUrl : undefined),
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        conceptId: response.conceptId || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to get response'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full glass-card shadow-2xl hover:shadow-indigo-500/50 transition-all"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
        aria-label="Open Chatbot"
      >
        <FaRobot className="w-6 h-6 text-white" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[80vh] flex flex-col glass-card rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center gap-2">
                  <FaRobot className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={handleClear}
                      className="text-xs text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/20 transition-colors"
                      title="Clear chat"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FaTimes className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <FaRobot className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                    <p className="text-sm mb-2">👋 Hi! I'm your AI assistant.</p>
                    <p className="text-xs">
                      Ask me anything about:
                      <br />• Concepts and algorithms
                      <br />• The app features
                      <br />• Or provide a URL for context
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      onLinkClick={() => setIsOpen(false)}
                    />
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <FaSpinner className="w-4 h-4 animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question or paste a URL..."
                    rows={2}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                      <FaPaperPlane className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
