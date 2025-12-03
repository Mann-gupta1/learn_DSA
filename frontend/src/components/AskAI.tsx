import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { FAQ } from '../types';

interface AskAIProps {
  conceptId: string;
}

export default function AskAI({ conceptId }: AskAIProps) {
  const [question, setQuestion] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FAQ[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, [conceptId]);

  const fetchFAQs = async () => {
    try {
      const response = await apiService.getFAQsByConceptId(conceptId);
      setFaqs(response.faqs as FAQ[]);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
  };

  const searchFAQ = async () => {
    if (!question.trim()) {
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchFAQs(question, conceptId);
      setSearchResults(response.faqs as FAQ[]);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      searchFAQ();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">💬 Ask AI (FAQ)</h3>
        <p className="text-sm text-gray-600">
          Ask questions about this concept. For now, we search through stored FAQs.
        </p>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setShowResults(false);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={searchFAQ}
            disabled={loading || !question.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {showResults && (
        <div className="mt-4">
          {searchResults.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                No matching FAQs found. This question will be stored for future answers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Found {searchResults.length} answer(s):</h4>
              {searchResults.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{faq.question}</h5>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {faqs.length > 0 && !showResults && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Frequently Asked Questions:</h4>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => {
                setQuestion(faq.question);
                setSearchResults([faq]);
                setShowResults(true);
              }}>
                <h5 className="font-medium text-gray-900 mb-1">{faq.question}</h5>
                <p className="text-gray-600 text-sm line-clamp-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

