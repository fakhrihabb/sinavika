// Simple Indonesian name generator for demo purposes
// Generates consistent names based on user_id hash

const firstNames = [
  'Ahmad', 'Budi', 'Siti', 'Dewi', 'Rina', 'Joko', 'Ani', 'Eko',
  'Sri', 'Agus', 'Putri', 'Hadi', 'Ratna', 'Yanto', 'Indah', 'Dedi',
  'Maya', 'Rudi', 'Lestari', 'Bambang', 'Nurul', 'Wati', 'Andi', 'Sari',
  'Hendra', 'Fitri', 'Ari', 'Yuni', 'Bagus', 'Lina', 'Tono', 'Widya',
  'Fajar', 'Ayu', 'Reza', 'Nur', 'Dian', 'Yoga', 'Mega', 'Irwan'
];

const lastNames = [
  'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Utomo', 'Saputra', 'Wibowo',
  'Hidayat', 'Setiawan', 'Purnomo', 'Rahman', 'Kurniawan', 'Surya', 'Firmansyah',
  'Nugroho', 'Hakim', 'Dharma', 'Putra', 'Saputri', 'Cahaya', 'Anggraini',
  'Permata', 'Mahardika', 'Jaya', 'Budiman', 'Sanjaya', 'Pratiwi', 'Laksono',
  'Anwar', 'Fitriani', 'Ramadhan', 'Maharani', 'Pradana', 'Arifin', 'Handayani'
];

/**
 * Generate a consistent Indonesian name based on a seed string (like user_id)
 * @param {string} seed - A string to use as seed (e.g., user_id, triage_id)
 * @returns {string} Generated Indonesian name
 */
export function generateIndonesianName(seed) {
  if (!seed) {
    return 'Pasien Anonim';
  }

  // Simple hash function to generate consistent index from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value to avoid negative numbers
  hash = Math.abs(hash);

  // Generate indices for first and last name
  const firstNameIndex = hash % firstNames.length;
  const lastNameIndex = Math.floor(hash / firstNames.length) % lastNames.length;

  return `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]}`;
}

/**
 * Generate patient ID display format
 * @param {string} userId - User ID
 * @param {string} triageId - Triage ID (optional)
 * @returns {string} Formatted patient identifier
 */
export function formatPatientId(userId, triageId = null) {
  if (triageId) {
    // Extract number from triage ID (e.g., "TRG-2025-4996" -> "4996")
    const match = triageId.match(/(\d+)$/);
    if (match) {
      return `P-${match[1]}`;
    }
  }

  // Fallback: use hash of userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  const patientNum = Math.abs(hash) % 10000;
  return `P-${String(patientNum).padStart(4, '0')}`;
}
