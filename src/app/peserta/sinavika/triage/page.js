'use client';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Activity,
  Calendar,
  FileText,
  MapPin,
  User,
  Info,
  Check,
  Square,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import MobileHeader from '@/components/MobileHeader';

export default function TriagePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [questionHistory, setQuestionHistory] = useState([]); // Store all questions
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedChoices, setSelectedChoices] = useState([]); // For multi-choice questions
  const [showExitModal, setShowExitModal] = useState(false);

  // Initialize first question
  useEffect(() => {
    loadNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextQuestion = async (previousAnswer = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/triage/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory,
          currentAnswer: previousAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan');
      }

      if (data.isComplete) {
        // Proceed to final triage
        await performFinalTriage();
      } else {
        setCurrentQuestion(data);
        setCurrentAnswer('');
        setSelectedChoices([]); // Reset multi-select choices
        // Store question in history for back navigation
        setQuestionHistory(prev => [...prev, data]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Mohon isi jawaban Anda');
      return;
    }

    // Store current answer with the current step
    const answerToStore = currentAnswer.trim();

    // Add to conversation history
    const newHistory = [
      ...conversationHistory,
      {
        question: currentQuestion.nextQuestion,
        answer: answerToStore,
        timestamp: new Date().toISOString(),
      },
    ];
    setConversationHistory(newHistory);

    // Move to next step
    setCurrentStep(prev => prev + 1);

    // Clear current answer before loading next question
    setCurrentAnswer('');

    // Load next question with the updated history
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/triage/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: newHistory, // Use the updated history
          currentAnswer: answerToStore,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan');
      }

      if (data.isComplete) {
        // Pass the updated history that includes the last answer
        await performFinalTriage(newHistory);
      } else {
        setCurrentQuestion(data);
        setQuestionHistory(prev => [...prev, data]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiChoiceToggle = (choice) => {
    setSelectedChoices(prev => {
      if (prev.includes(choice)) {
        return prev.filter(c => c !== choice);
      } else {
        return [...prev, choice];
      }
    });
  };

  const handleMultiChoiceSubmit = async () => {
    if (selectedChoices.length === 0) {
      setError('Mohon pilih minimal satu pilihan');
      return;
    }

    const answer = selectedChoices.join(', ');

    // Add to conversation history
    const newHistory = [
      ...conversationHistory,
      {
        question: currentQuestion.nextQuestion,
        answer: answer,
        timestamp: new Date().toISOString(),
      },
    ];
    setConversationHistory(newHistory);

    // Move to next step
    setCurrentStep(prev => prev + 1);

    // Clear selections
    setSelectedChoices([]);

    // Load next question with the updated history
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/triage/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: newHistory,
          currentAnswer: answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan');
      }

      if (data.isComplete) {
        // Pass the updated history that includes the last answer
        await performFinalTriage(newHistory);
      } else {
        setCurrentQuestion(data);
        setQuestionHistory(prev => [...prev, data]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceClick = async (choice) => {
    // Add to conversation history
    const newHistory = [
      ...conversationHistory,
      {
        question: currentQuestion.nextQuestion,
        answer: choice,
        timestamp: new Date().toISOString(),
      },
    ];
    setConversationHistory(newHistory);

    // Move to next step
    setCurrentStep(prev => prev + 1);

    // Clear current answer
    setCurrentAnswer('');

    // Load next question with the updated history
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/triage/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: newHistory, // Use the updated history
          currentAnswer: choice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan');
      }

      if (data.isComplete) {
        // Pass the updated history that includes the last answer
        await performFinalTriage(newHistory);
      } else {
        setCurrentQuestion(data);
        setQuestionHistory(prev => [...prev, data]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const performFinalTriage = async (finalHistory = null) => {
    setLoading(true);
    setError(null);

    // Use provided history or fall back to state
    const historyToUse = finalHistory || conversationHistory;

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: historyToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan');
      }

      setTriageResult(data);

      // Save triage result to database
      try {
        await fetch('/api/triage/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            triageResult: data,
            userId: 'demo-user', // TODO: Replace with actual user ID from auth
          }),
        });
      } catch (saveError) {
        // Don't fail the whole triage if save fails
        console.error('Failed to save triage result:', saveError);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;

      // Remove last conversation item and question from history
      const newConversationHistory = conversationHistory.slice(0, -1);
      const newQuestionHistory = questionHistory.slice(0, -1);

      setConversationHistory(newConversationHistory);
      setQuestionHistory(newQuestionHistory);
      setCurrentStep(newStep);

      // Restore the current question (which is now the last one in the updated history)
      if (newStep === 0) {
        // Going back to first question
        const firstQuestion = questionHistory[0];
        setCurrentQuestion(firstQuestion);
        setCurrentAnswer(''); // First question has no previous answer
      } else {
        // Going back to a middle question
        const previousQuestion = newQuestionHistory[newQuestionHistory.length - 1];
        setCurrentQuestion(previousQuestion);

        // Restore the answer for this question
        const previousAnswer = newConversationHistory[newConversationHistory.length - 1].answer;
        setCurrentAnswer(previousAnswer);
      }
    }
  };

  const getSeverityColor = (level) => {
    switch (level) {
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const resetTriage = () => {
    setCurrentStep(0);
    setConversationHistory([]);
    setQuestionHistory([]);
    setCurrentQuestion(null);
    setCurrentAnswer('');
    setSelectedChoices([]);
    setTriageResult(null);
    setError(null);
    loadNextQuestion();
  };

  // Render results page
  if (triageResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Hasil Triase" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hasil Triase</h2>
              <p className="text-gray-600">Berikut adalah rekomendasi berdasarkan keluhan Anda</p>
            </div>

            <div className="space-y-4">
              {/* Severity Badge */}
              <div className="flex justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getSeverityColor(triageResult.tingkatKeparahan)}`}>
                  {triageResult.labelKeparahan}
                </span>
              </div>

              {/* Triage ID */}
              <div className="text-center">
                <p className="text-xs text-gray-500">ID Triase</p>
                <p className="font-mono font-semibold text-gray-900">{triageResult.triageId}</p>
              </div>

              {/* Main Recommendation */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start gap-3 mb-3">
                  <Activity className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Rekomendasi Layanan</p>
                    <p className="text-xl font-bold text-gray-900">{triageResult.rekomendasiLayanan}</p>
                    {triageResult.namaSpesialis && (
                      <p className="text-sm text-gray-600 mt-1">Spesialisasi: {triageResult.namaSpesialis}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-green-100">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Waktu: {triageResult.tanggalKunjunganDisarankan}</span>
                  </div>
                  {triageResult.estimasiWaktuTunggu && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>Est. tunggu: {triageResult.estimasiWaktuTunggu}</span>
                    </div>
                  )}
                  {triageResult.jamOperasionalDisarankan && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                      <Info className="w-4 h-4 flex-shrink-0" />
                      <span>Jam operasional: {triageResult.jamOperasionalDisarankan}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Alasan
                </h3>
                <p className="text-gray-700 leading-relaxed">{triageResult.alasan}</p>
              </div>

              {/* Actions */}
              {triageResult.tindakan && triageResult.tindakan.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Yang Harus Dilakukan</h3>
                  <ul className="space-y-2">
                    {triageResult.tindakan.map((tindakan, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{tindakan}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning Signs */}
              {triageResult.gejalaBahaya && triageResult.gejalaBahaya.length > 0 && (
                <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200">
                  <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Gejala Bahaya yang Perlu Diwaspadai
                  </h3>
                  <ul className="space-y-1">
                    {triageResult.gejalaBahaya.map((gejala, index) => (
                      <li key={index} className="text-red-800 text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{gejala}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Notes */}
              {triageResult.catatanTambahan && (
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">Catatan Tambahan</h3>
                  <p className="text-yellow-800 text-sm leading-relaxed">{triageResult.catatanTambahan}</p>
                </div>
              )}

              {/* Clinical Summary for Hospital */}
              {triageResult.ringkasanUntukRS && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Ringkasan Klinis untuk Rumah Sakit/Faskes
                  </h3>
                  <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">{triageResult.ringkasanUntukRS}</p>
                  <p className="text-xs text-blue-600 mt-3 italic">
                    Ringkasan ini akan otomatis dibagikan ke rumah sakit/faskes yang Anda pilih untuk mempercepat proses pelayanan.
                  </p>
                </div>
              )}

              {/* Referral Info */}
              {triageResult.perluRujukan && (
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-1">Perlu Rujukan</h3>
                      <p className="text-purple-800 text-sm">
                        Berdasarkan keluhan Anda, kemungkinan diperlukan rujukan ke fasilitas kesehatan tingkat lanjut.
                        Konsultasikan dengan dokter di Faskes tingkat I terlebih dahulu.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Link
                  href={`/peserta/triage/pilih-rumah-sakit?triageId=${triageResult.triageId}&serviceType=${encodeURIComponent(triageResult.rekomendasiLayanan)}`}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  {triageResult.rekomendasiLayanan === 'Faskes Tingkat Pertama'
                    ? 'Cari Faskes Terdekat'
                    : triageResult.rekomendasiLayanan === 'Perawatan Mandiri'
                    ? 'Lihat Tips Perawatan'
                    : 'Cari Rumah Sakit Terdekat'}
                </Link>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/peserta/sinavika/riwayat"
                    className="flex-1 px-6 py-3 bg-white border-2 border-[#03974a] text-[#03974a] rounded-lg font-semibold hover:bg-green-50 transition-all text-center"
                  >
                    Lihat Riwayat Triase
                  </Link>
                  <button
                    onClick={resetTriage}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all text-center"
                  >
                    Triase Baru
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Custom back handler for triage form
  const handleBackClick = (e) => {
    e.preventDefault();
    if (conversationHistory.length > 0) {
      setShowExitModal(true);
    } else {
      window.location.href = '/peserta/sinavika';
    }
  };

  // Render form interface
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Cek Keluhan" onBackClick={handleBackClick} />

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Keluar dari Cek Keluhan?
                </h3>
                <p className="text-sm text-gray-600">
                  Anda sudah menjawab {conversationHistory.length} pertanyaan. Jika keluar sekarang, semua progres akan hilang dan Anda harus mengulang dari awal.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Lanjut Cek Keluhan
              </button>
              <Link
                href="/peserta/sinavika"
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
              >
                Ya, Keluar
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Pertanyaan {currentStep + 1}
            </span>
            <span className="text-sm text-gray-500">
              {conversationHistory.length} pertanyaan dijawab
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#03974a] to-[#144782] h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((currentStep + 1) / 7) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {loading && !currentQuestion ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#03974a] mx-auto mb-4" />
              <p className="text-gray-600">Memuat pertanyaan...</p>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6 relative">
              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#03974a] mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">Memuat</p>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentQuestion.nextQuestion}
                </h2>
                {currentQuestion.reasoning && (
                  <p className="text-sm text-gray-500 italic">
                    {currentQuestion.reasoning}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {currentQuestion.questionType === 'multi-choice' && currentQuestion.choices ? (
                  // Multi-select choices
                  <div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        Anda bisa memilih lebih dari satu pilihan
                      </p>
                      {currentQuestion.choices.map((choice, index) => (
                        <button
                          key={index}
                          onClick={() => handleMultiChoiceToggle(choice)}
                          disabled={loading}
                          className={`w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all flex items-center gap-3 ${
                            selectedChoices.includes(choice)
                              ? 'border-[#03974a] bg-green-50 text-[#03974a]'
                              : 'border-gray-300 hover:border-gray-400'
                          } disabled:opacity-50`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                            selectedChoices.includes(choice)
                              ? 'bg-[#03974a] border-[#03974a]'
                              : 'border-gray-400'
                          }`}>
                            {selectedChoices.includes(choice) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="flex-1">{choice}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleMultiChoiceSubmit}
                      disabled={loading || selectedChoices.length === 0}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          Lanjut
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                ) : currentQuestion.questionType === 'choice' && currentQuestion.choices ? (
                  // Single choice
                  <div className="space-y-2">
                    {currentQuestion.choices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => handleChoiceClick(choice)}
                        disabled={loading}
                        className={`w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all ${
                          currentAnswer === choice
                            ? 'border-[#03974a] bg-green-50 text-[#03974a]'
                            : 'border-gray-300 hover:border-gray-400'
                        } disabled:opacity-50`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                ) : (
                  // Text input
                  <div>
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={currentQuestion.placeholderText || "Ketik jawaban Anda di sini..."}
                      rows="4"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#03974a] focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:bg-gray-100"
                    />
                    <div className="flex items-start gap-2 mt-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        Jawab dengan sejelas dan sedetail mungkin untuk mendapatkan rekomendasi yang lebih akurat
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons for text questions */}
          {!loading && currentQuestion && currentQuestion.questionType === 'text' && (
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Kembali
                </button>
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !currentAnswer.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#03974a] to-[#144782] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjut
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Back button for choice and multi-choice questions */}
          {!loading && currentQuestion && (currentQuestion.questionType === 'choice' || currentQuestion.questionType === 'multi-choice') && currentStep > 0 && (
            <div className="mt-8">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
            </div>
          )}
        </div>

        {/* Emergency Notice */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1 text-sm">Keadaan Darurat?</h4>
              <p className="text-sm text-red-800">
                Jika Anda mengalami gejala darurat (nyeri dada, sesak napas parah, pendarahan hebat),
                <strong> segera hubungi 119 atau datang ke IGD terdekat</strong>. Jangan menunggu hasil triase.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
