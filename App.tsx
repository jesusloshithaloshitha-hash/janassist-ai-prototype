
import React, { useState, useEffect } from 'react';
import { Language, ExplanationMode, ServiceResult, ServiceDetail, CodingHelpResponse } from './types';
import { searchServices, getServiceDetails, getCodingHelp } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import VoiceInput from './components/VoiceInput';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceResult | null>(null);
  const [details, setDetails] = useState<ServiceDetail | null>(null);
  const [mode, setMode] = useState<ExplanationMode>(ExplanationMode.SIMPLE);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'coding'>('search');
  const [codingInput, setCodingInput] = useState('');
  const [codingResult, setCodingResult] = useState<CodingHelpResponse | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSelectedService(null);
    setDetails(null);
    try {
      const res = await searchServices(query, lang);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodingSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!codingInput.trim()) return;
    setLoading(true);
    try {
      const res = await getCodingHelp(codingInput, lang);
      setCodingResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = async (service: ServiceResult) => {
    setSelectedService(service);
    setLoading(true);
    try {
      const detail = await getServiceDetails(service.name, lang, mode);
      setDetails(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch details when mode changes
  useEffect(() => {
    if (selectedService) {
      handleSelectService(selectedService);
    }
  }, [mode]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-orange-500">Jan</span>
          <span className="text-blue-600">Assist</span>
        </h1>
        <p className="text-gray-500 mt-1 font-medium">Digital India, Accessible to All</p>
      </header>

      <LanguageSelector currentLanguage={lang} onLanguageChange={setLang} />

      <main className="flex-grow container mx-auto max-w-4xl px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'search' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Service Search
          </button>
          <button
            onClick={() => setActiveTab('coding')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'coding' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Education & Coding
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="space-y-8">
            {/* Search Input Area */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-blue-50">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === Language.HINDI ? "अपनी आवश्यकता बताएं..." : "How can I help you today?"}
                    className="w-full pl-4 pr-12 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:outline-none text-lg transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <VoiceInput language={lang} onTranscript={(text) => { setQuery(text); handleSearch(); }} />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : 'Go'}
                </button>
              </form>
              <div className="mt-4 flex gap-4 text-xs font-medium text-gray-400">
                <span>Try: "Apply for scholarship"</span>
                <span>"Pension scheme status"</span>
                <span>"Health card application"</span>
              </div>
            </div>

            {/* Results Grid */}
            {!selectedService && results.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                {results.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectService(res)}
                    className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-1 rounded">
                        {res.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-blue-600">{res.name}</h3>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{res.description}</p>
                    <div className="mt-4 text-blue-600 font-semibold text-sm flex items-center">
                      Learn how to apply
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Service Detail View */}
            {selectedService && (
              <div className="bg-white rounded-3xl shadow-2xl border border-blue-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="mb-4 text-blue-100 hover:text-white flex items-center text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to results
                  </button>
                  <h2 className="text-3xl font-extrabold">{selectedService.name}</h2>
                  <p className="mt-2 text-blue-100 text-lg opacity-90">{selectedService.description}</p>
                  <a
                    href={selectedService.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-blue-50 transition-colors"
                  >
                    Visit Official Portal
                  </a>
                </div>

                <div className="p-8">
                  {/* Mode Selector */}
                  <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl w-full md:w-fit">
                    {Object.values(ExplanationMode).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-grow md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          mode === m ? 'bg-white shadow text-blue-600 scale-105' : 'text-gray-500'
                        }`}
                      >
                        {m} Mode
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className="py-20 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-500 font-medium">Preparing instructions in {lang}...</p>
                    </div>
                  ) : details && (
                    <div className="space-y-10">
                      <section>
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">i</span>
                          Overview
                        </h4>
                        <div className="prose prose-blue text-gray-700 leading-relaxed bg-blue-50/30 p-4 rounded-xl">
                          {details.overview}
                        </div>
                      </section>

                      <div className="grid md:grid-cols-2 gap-8">
                        <section>
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-sm">✓</span>
                            Steps to Apply
                          </h4>
                          <ul className="space-y-4">
                            {details.steps.map((step, idx) => (
                              <li key={idx} className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </span>
                                <span className="text-gray-700">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm">📁</span>
                            Documents Needed
                          </h4>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                            <ul className="space-y-3">
                              {details.documents.map((doc, idx) => (
                                <li key={idx} className="flex items-center text-gray-700">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </section>
                      </div>

                      <section className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        <h4 className="text-orange-800 font-bold mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Important Deadlines & Tips
                        </h4>
                        <p className="text-orange-700 font-medium">{details.deadlines}</p>
                      </section>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Coding Assistance Area */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50">
              <h2 className="text-2xl font-bold mb-4">Code & Technical Help in {lang}</h2>
              <p className="text-gray-500 mb-6">Enter a programming error, a technical term, or a block of code you want explained in your language.</p>
              
              <form onSubmit={handleCodingSearch} className="space-y-4">
                <textarea
                  value={codingInput}
                  onChange={(e) => setCodingInput(e.target.value)}
                  placeholder="Paste error message or ask: What is an API?"
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:outline-none min-h-[150px] font-mono text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Explain in my language'}
                </button>
              </form>
            </div>

            {codingResult && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-50 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <section>
                  <h3 className="text-xl font-bold mb-3">Explanation</h3>
                  <p className="text-gray-700 leading-relaxed bg-blue-50 p-6 rounded-2xl italic">
                    "{codingResult.explanation}"
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">Simplified Concept</h3>
                  <div className="bg-gray-900 text-blue-300 p-6 rounded-2xl font-mono text-sm overflow-x-auto shadow-inner">
                    <pre>{codingResult.simplifiedCode}</pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">Key Terms Clarified</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {codingResult.terms.map((t, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <span className="block font-bold text-blue-600 mb-1">{t.term}</span>
                        <span className="text-sm text-gray-600">{t.meaning}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !selectedService && !codingResult && activeTab === 'search' && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">No active searches yet</h3>
            <p className="text-gray-500 mt-1">Start by typing your requirement in the box above.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">100%</span>
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Inclusive</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">11+</span>
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Languages</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-800">24/7</span>
              <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Assistance</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Empowering every citizen with the power of AI. Made for Digital India.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
