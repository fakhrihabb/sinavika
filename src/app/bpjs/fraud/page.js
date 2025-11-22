'use client';
import { useState, useEffect } from 'react';
import BpjsNavbar from '@/components/BPJSNavbar';
import { AlertCircle, ShieldCheck, ShieldAlert, Search, Activity, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FraudDashboardPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const analyzeClaimForFraud = async (claim) => {
    try {
      // For num_procedures, we'd ideally get this from a relation, but we'll use a placeholder
      const body = {
        tarif_rs: claim.tarif_rs,
        tarif_inacbg: claim.tarif_ina_cbg,
        los_days: claim.los_days,
        num_procedures: claim.procedures?.length || 2, // Placeholder
        care_class: claim.care_class,
        diagnosis_severity: 'normal', // Placeholder
        provider_claims_count: 50, // Placeholder
        provider_fraud_history_rate: 0.1, // Placeholder
        hospital_fraud_history_rate: 0.05, // Placeholder
      };

      const response = await fetch('/api/ml/fraud-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        return result.fraud_detection;
      }
      return null;
    } catch (err) {
      console.error(`Error analyzing claim ${claim.id}:`, err);
      return null;
    }
  };


  useEffect(() => {
    const fetchAndAnalyzeClaims = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/bpjs/claims?status=all&search=${searchTerm}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Gagal mengambil data klaim');
        }

        // Set initial claims data so the table renders
        const claimsWithInitialFraudState = result.data.map(claim => ({
          ...claim,
          fraud_analysis: { loading: true } // Add a loading state for each claim
        }));
        setClaims(claimsWithInitialFraudState);

        // Now, analyze each claim for fraud
        const analysisPromises = result.data.map(claim => analyzeClaimForFraud(claim));
        const fraudResults = await Promise.all(analysisPromises);

        // Update claims with the fraud analysis results
        setClaims(currentClaims => currentClaims.map((claim, index) => {
          const fraudData = fraudResults[index];
          return {
            ...claim,
            fraud_analysis: {
              loading: false,
              risk_score: fraudData?.risk_score,
              risk_level: fraudData?.risk_level,
              reason: fraudData?.risk_factors[0]?.factor || '-',
            }
          };
        }));

      } catch (err) {
        setError(err.message);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndAnalyzeClaims();
  }, [searchTerm]);

  const getFraudChip = (potential) => {
    switch (potential) {
      case 'critical':
      case 'high':
        return <span className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-bold rounded-full flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" />Tinggi</span>;
      case 'medium':
        return <span className="px-3 py-1.5 bg-orange-100 text-orange-800 text-xs font-bold rounded-full flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />Sedang</span>;
      case 'low':
        return <span className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" />Rendah</span>;
      default:
        return <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{potential}</span>;
    }
  };
  
  const getFraudScoreColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    return 'text-green-600';
  }

  const handleSearch = (e) => {
      e.preventDefault();
      // The useEffect will refetch the data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BpjsNavbar />
      <main className="max-w-[1920px] mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ShieldAlert className="w-8 h-8 text-white" />
                  </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Deteksi Kecurangan (Fraud)</h1>
                    <p className="text-gray-600 mt-1">Dashboard untuk memonitor klaim dengan potensi kecurangan.</p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Daftar Klaim Berpotensi Fraud</h2>
                <form onSubmit={handleSearch} className="relative w-1/3">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari ID klaim, nama pasien, RS..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"/>
                </form>
            </div>

            {(loading && claims.length === 0) && (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-red-600" />
                    <p className="mt-4 text-gray-500">Memuat data klaim...</p>
                </div>
            )}
            {error && <p className="text-red-500 text-center py-16">{error}</p>}

            {(!loading || claims.length > 0) && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      ID Klaim
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Pasien / RS
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Tanggal Diajukan
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Potensi Fraud
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Skor Fraud
                    </th>
                     <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Alasan Utama
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-red-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm font-semibold text-gray-800">{claim.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{claim.patient_name}</div>
                        <div className="text-xs text-gray-500">{claim.hospital}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{new Date(claim.submitted_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</div>
                         <div className="text-xs text-gray-500">{new Date(claim.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.fraud_analysis?.loading 
                            ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-orange-500"></div>
                            : getFraudChip(claim.fraud_analysis?.risk_level)
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {claim.fraud_analysis?.loading 
                            ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-orange-500"></div>
                            : <div className={`text-2xl font-bold ${getFraudScoreColor(claim.fraud_analysis?.risk_score)}`}>
                                {claim.fraud_analysis?.risk_score}
                              </div>
                        }
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                         {claim.fraud_analysis?.loading 
                            ? <div className="h-4 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                            : claim.fraud_analysis?.reason
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/bpjs/verifikasi/${claim.id}?mode=fraud`} className="text-red-600 hover:text-red-900 font-bold flex items-center gap-2">
                          <Activity className="w-4 h-4"/>
                          Analisis
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
        </div>
      </main>
    </div>
  );
}