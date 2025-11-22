import { supabase } from './supabase';

/**
 * Notification types for different events in the system
 */
export const NotificationType = {
  TRIAGE_NEW: 'triage_new',
  APPOINTMENT_BOOKED: 'appointment_booked',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  CLAIM_PENDING: 'claim_pending',
  CLAIM_APPROVED: 'claim_approved',
  CLAIM_REJECTED: 'claim_rejected',
};

/**
 * Recipient types
 */
export const RecipientType = {
  PESERTA: 'peserta',
  RUMAH_SAKIT: 'rumah_sakit',
  BPJS: 'bpjs',
};

/**
 * Create a notification in the database
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - User ID (can be hospital ID, patient ID, or BPJS ID)
 * @param {string} params.recipientType - Type of recipient (peserta, rumah_sakit, bpjs)
 * @param {string} params.notificationType - Type of notification
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} [params.relatedId] - Related entity ID (triage_id, appointment_id, etc.)
 * @returns {Promise<Object>} Created notification or error
 */
export async function createNotification({
  userId,
  recipientType,
  notificationType,
  title,
  message,
  relatedId = null,
}) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        recipient_type: recipientType,
        notification_type: notificationType,
        title,
        message,
        related_id: relatedId,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @param {string} recipientType - Type of recipient
 * @param {boolean} [unreadOnly=false] - Get only unread notifications
 * @returns {Promise<Object>} Notifications or error
 */
export async function getNotifications(userId, recipientType, unreadOnly = false) {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('recipient_type', recipientType)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification or error
 */
export async function markAsRead(notificationId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @param {string} recipientType - Type of recipient
 * @returns {Promise<Object>} Updated notifications or error
 */
export async function markAllAsRead(userId, recipientType) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('recipient_type', recipientType)
      .eq('read', false)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Success status or error
 */
export async function deleteNotification(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get unread notification count
 * @param {string} userId - User ID
 * @param {string} recipientType - Type of recipient
 * @returns {Promise<Object>} Count or error
 */
export async function getUnreadCount(userId, recipientType) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('recipient_type', recipientType)
      .eq('read', false);

    if (error) throw error;
    return { success: true, count };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: false, error: error.message, count: 0 };
  }
}

/**
 * Helper function to create a notification for a new triage patient at hospital
 * @param {Object} triageData - Triage data
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created notification or error
 */
export async function notifyHospitalNewPatient(triageData, appointmentData) {
  const severityLabel = {
    emergency: 'Gawat Darurat',
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah',
  };

  return createNotification({
    userId: 'rumah-sakit-demo', // In production, use actual hospital ID
    recipientType: RecipientType.RUMAH_SAKIT,
    notificationType: NotificationType.TRIAGE_NEW,
    title: 'Pasien Baru dari Triage SINAVIKA',
    message: `Pasien dengan tingkat kegawatan ${severityLabel[triageData.tingkat_keparahan]} telah menjadwalkan kunjungan ke ${appointmentData.hospital_name}. Jenis layanan: ${appointmentData.appointment_type}.`,
    relatedId: appointmentData.id,
  });
}

/**
 * Helper function to create a notification for appointment booking confirmation
 * @param {string} userId - Patient user ID
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created notification or error
 */
export async function notifyPatientAppointmentBooked(userId, appointmentData) {
  return createNotification({
    userId,
    recipientType: RecipientType.PESERTA,
    notificationType: NotificationType.APPOINTMENT_BOOKED,
    title: 'Janji Temu Berhasil Dibuat',
    message: `Janji temu Anda di ${appointmentData.hospital_name} telah berhasil dijadwalkan. Jenis layanan: ${appointmentData.appointment_type}.`,
    relatedId: appointmentData.id,
  });
}

/**
 * Helper function to create a dummy claim notification
 * @param {string} claimId - Claim ID
 * @param {string} status - Claim status (pending, approved, rejected)
 * @param {string} hospitalName - Hospital name
 * @returns {Promise<Object>} Created notification or error
 */
export async function notifyHospitalClaimStatus(claimId, status, hospitalName) {
  const statusMessages = {
    pending: {
      title: 'Klaim Memerlukan Perbaikan',
      message: `Klaim ${claimId} memerlukan perbaikan dokumen. Silakan periksa detail untuk informasi lebih lanjut.`,
      type: NotificationType.CLAIM_PENDING,
    },
    approved: {
      title: 'Klaim Disetujui',
      message: `Klaim ${claimId} telah disetujui oleh BPJS. Pembayaran akan diproses segera.`,
      type: NotificationType.CLAIM_APPROVED,
    },
    rejected: {
      title: 'Klaim Ditolak',
      message: `Klaim ${claimId} ditolak oleh BPJS. Silakan periksa alasan penolakan dan ajukan ulang jika diperlukan.`,
      type: NotificationType.CLAIM_REJECTED,
    },
  };

  const notifData = statusMessages[status];

  return createNotification({
    userId: 'rumah-sakit-demo',
    recipientType: RecipientType.RUMAH_SAKIT,
    notificationType: notifData.type,
    title: notifData.title,
    message: notifData.message,
    relatedId: claimId,
  });
}
