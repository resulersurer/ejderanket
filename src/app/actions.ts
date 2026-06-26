'use server';

import prisma from '@/lib/prisma';
import { feedbackSchema, FeedbackInput } from '@/lib/validations/feedback';
import { sendFeedbackNotification } from '@/lib/mail';
import { revalidatePath } from 'next/cache';

export async function submitFeedbackAction(rawData: any) {
  try {
    // 1. Form alanlarını Zod şemasıyla doğrula
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

    // 2. Daha önce aynı rezervasyon numarasıyla anket doldurulmuş mu kontrol et
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

    // 3. Geri bildirimi PostgreSQL veritabanına kaydet
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

    console.log('📝 Geri bildirim veritabanına kaydedildi:', savedFeedback.id);

    // 4. E-posta bildirimi gönder (DB kaydını engellemez)
    try {
      await sendFeedbackNotification(feedbackData);
    } catch (mailErr) {
      console.error('⚠️ Veritabanı kaydı başarılı ama SMTP e-posta gönderilemedi:', mailErr);
    }

    // 5. Dashboard cache'ini yenile
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Geri bildiriminiz başarıyla iletildi. Katılımınız için teşekkür ederiz!',
    };
  } catch (err: any) {
    console.error('❌ submitFeedbackAction hata verdi:', err);
    return {
      success: false,
      error: err.message || 'Geri bildirim kaydedilirken beklenmedik bir sunucu hatası oluştu.',
    };
  }
}
