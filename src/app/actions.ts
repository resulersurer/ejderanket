'use server';

import prisma from '@/lib/prisma';
import { feedbackSchema, FeedbackInput } from '@/lib/validations/feedback';
import { sendFeedbackNotification } from '@/lib/mail';
import { revalidatePath } from 'next/cache';

export async function submitFeedbackAction(rawData: any) {
  try {
    // 1. Validate form fields using Zod schema
    const result = feedbackSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      return {
        success: false,
        error: 'Lütfen form alanlarını doğru şekilde doldurun.',
        fieldErrors,
      };
    }

    const feedbackData: FeedbackInput = result.data;

    // 2. Check if the database connection URL is configured before running database queries
    const dbUrl = process.env.DATABASE_URL;
    console.log('DEBUG: DATABASE_URL is:', typeof dbUrl, JSON.stringify(dbUrl));

    const isDbConfigured =
      dbUrl &&
      dbUrl.trim() !== '' &&
      dbUrl !== 'undefined' &&
      dbUrl !== 'null' &&
      (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) &&
      !dbUrl.includes('username:password') &&
      !dbUrl.includes('ep-xxxx') &&
      !dbUrl.includes('ep-dummy-123456');

    if (!isDbConfigured) {
      console.error('❌ DATABASE_URL is not set or invalid. Saving data will fail.');
      console.warn('⚠️ Simulating successful save for demonstration purposes.');
      
      // Attempt to send email even if DB is skipped
      await sendFeedbackNotification(feedbackData);
      
      return {
        success: true,
        simulated: true,
        message: 'Geri bildirim başarıyla alındı (Simüle edildi - DB Bağlı Değil).',
      };
    }

    // 3. Check if reservation number already exists to avoid duplicates (only if reservationNo is provided)
    if (feedbackData.reservationNo && feedbackData.reservationNo.trim()) {
      const existingFeedback = await prisma.feedback.findUnique({
        where: { reservationNo: feedbackData.reservationNo },
      });

      if (existingFeedback) {
        return {
          success: false,
          error: 'Bu rezervasyon numarasıyla daha önce bir memnuniyet anketi doldurulmuş.',
        };
      }
    }

    // 4. Save feedback in the PostgreSQL Database
    const savedFeedback = await prisma.feedback.create({
      data: {
        passengerName: feedbackData.passengerName,
        email: feedbackData.email || null,
        tourName: feedbackData.tourName || null,
        reservationNo: feedbackData.reservationNo || null,
        tourSatisfaction: feedbackData.tourSatisfaction,
        guidePerformance: feedbackData.guidePerformance,
        hotelSatisfaction: feedbackData.hotelSatisfaction,
        restaurantSatisfaction: feedbackData.restaurantSatisfaction,
        transportationSatisfaction: feedbackData.transportationSatisfaction,
        additionalComments: feedbackData.additionalComments || null,
      },
    });

    console.log('📝 Feedback successfully saved to database:', savedFeedback.id);

    // 5. Send Email Notification via SMTP (async - does not block saving DB response)
    try {
      await sendFeedbackNotification(feedbackData);
    } catch (mailErr) {
      console.error('⚠️ Database save succeeded but SMTP email dispatch failed:', mailErr);
    }

    // 6. Revalidate the dashboard cache
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Geri bildiriminiz başarıyla iletildi. Katılımınız için teşekkür ederiz!',
    };
  } catch (err: any) {
    console.error('❌ Server Action submitFeedbackAction failed:', err);
    return {
      success: false,
      error: err.message || 'Geri bildirim kaydedilirken beklenmedik bir sunucu hatası oluştu.',
    };
  }
}
