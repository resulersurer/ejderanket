import { Resend } from 'resend';
import { FeedbackInput } from './validations/feedback';

// Initialize Resend client only if API key is provided
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Helper to render score stars or color badge for HTML email
function getScoreBadge(score: number): string {
  const colors = {
    5: { bg: '#dcfce7', text: '#15803d', label: 'Mükemmel (5/5)' },
    4: { bg: '#f0fdf4', text: '#166534', label: 'İyi (4/5)' },
    3: { bg: '#fef9c3', text: '#854d0e', label: 'Orta (3/5)' },
    2: { bg: '#ffedd5', text: '#9a3412', label: 'Zayıf (2/5)' },
    1: { bg: '#fee2e2', text: '#991b1b', label: 'Çok Kötü (1/5)' },
  };
  const color = colors[score as keyof typeof colors] || { bg: '#f1f5f9', text: '#475569', label: `${score}/5` };
  
  return `<span style="background-color: ${color.bg}; color: ${color.text}; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 14px; display: inline-block;">${color.label}</span>`;
}

export async function sendFeedbackNotification(feedback: FeedbackInput) {
  const toEmail = process.env.NOTIFICATION_EMAIL || 'musteridestek@ejderturizm.com.tr';
  const fromEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY is not set. Skipping email notification dispatch.');
    return { success: false, error: 'Resend API key is missing' };
  }

  // Calculate overall average satisfaction (5 metrics)
  const avg = (
    (feedback.tourSatisfaction +
      feedback.guidePerformance +
      feedback.hotelSatisfaction +
      feedback.restaurantSatisfaction +
      feedback.transportationSatisfaction) / 5
  ).toFixed(2);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Yeni Tur Memnuniyet Formu</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: #7a0006;
          padding: 30px 20px;
          text-align: center;
          border-bottom: 4px solid #d97706;
        }
        .header h1 {
          color: #ffffff;
          font-size: 22px;
          margin: 0;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .header p {
          color: #fca5a5;
          font-size: 14px;
          margin: 8px 0 0 0;
        }
        .content {
          padding: 30px 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 8px;
        }
        .passenger-info {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 25px;
          border: 1px solid #f1f5f9;
        }
        .info-grid {
          width: 100%;
          border-collapse: collapse;
        }
        .info-grid td {
          padding: 6px 0;
          font-size: 14px;
        }
        .info-label {
          color: #64748b;
          font-weight: 600;
          width: 35%;
        }
        .info-value {
          color: #0f172a;
          font-weight: 500;
        }
        .score-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        .score-table th {
          background-color: #f1f5f9;
          text-align: left;
          padding: 10px 12px;
          font-size: 13px;
          color: #475569;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
        }
        .score-table td {
          padding: 12px 12px;
          font-size: 14px;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
        }
        .score-table tr:last-child td {
          border-bottom: none;
        }
        .score-table tr.highlight td {
          background-color: #fffbeb;
          font-weight: bold;
        }
        .comments-box {
          background-color: #fcfcfc;
          border-left: 4px solid #7a0006;
          padding: 15px;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #334155;
          font-size: 14.5px;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer a {
          color: #7a0006;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>Yeni Tur Memnuniyet Formu</h1>
          <p>Ejder Turizm Müşteri İlişkileri Değerlendirmesi</p>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Passenger & Tour Info -->
          <div class="section-title">Yolcu ve Rezervasyon Bilgileri</div>
          <div class="passenger-info">
            <table class="info-grid">
              <tr>
                <td class="info-label">Yolcu Adı Soyadı:</td>
                <td class="info-value">${feedback.passengerName}</td>
              </tr>
              <tr>
                <td class="info-label">E-posta Adresi:</td>
                <td class="info-value">${feedback.email || 'Belirtilmedi'}</td>
              </tr>
              <tr>
                <td class="info-label">Rezervasyon No:</td>
                <td class="info-value"><strong>${feedback.reservationNo || 'Belirtilmedi'}</strong></td>
              </tr>
              <tr>
                <td class="info-label">Tur Adı:</td>
                <td class="info-value">${feedback.tourName || 'Belirtilmedi'}</td>
              </tr>
              <tr>
                <td class="info-label">Gönderim Tarihi:</td>
                <td class="info-value">${new Date().toLocaleString('tr-TR')}</td>
              </tr>
            </table>
          </div>

          <!-- Evaluation Scores -->
          <div class="section-title">Değerlendirme Puanları</div>
          <table class="score-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Puan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tur Memnuniyeti</td>
                <td>${getScoreBadge(feedback.tourSatisfaction)}</td>
              </tr>
              <tr>
                <td>Rehber Performansı</td>
                <td>${getScoreBadge(feedback.guidePerformance)}</td>
              </tr>
              <tr>
                <td>Otel Memnuniyeti</td>
                <td>${getScoreBadge(feedback.hotelSatisfaction)}</td>
              </tr>
              <tr>
                <td>Restoran Memnuniyeti</td>
                <td>${getScoreBadge(feedback.restaurantSatisfaction)}</td>
              </tr>
              <tr>
                <td>Ulaşım Hizmetleri Memnuniyeti</td>
                <td>${getScoreBadge(feedback.transportationSatisfaction)}</td>
              </tr>
              <tr class="highlight" style="border-top: 2px solid #7a0006;">
                <td><strong>Genel Ortalama</strong></td>
                <td><strong><span style="font-size: 16px; color: #7a0006;">${avg} / 5</span></strong></td>
              </tr>
            </tbody>
          </table>

          <!-- Comments Section -->
          ${feedback.additionalComments ? `
            <div class="section-title">Ekstra Notlar ve Yorumlar</div>
            <div class="comments-box">
              "${feedback.additionalComments.replace(/\n/g, '<br>')}"
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div class="footer">
          Bu e-posta Ejder Turizm Memnuniyet Portalı tarafından otomatik olarak oluşturulmuştur.<br>
          Detaylı analiz için <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.ejderanket.com'}/dashboard">Admin Paneli</a>'ni ziyaret edebilirsiniz.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: `Ejder Turizm <${fromEmail}>`,
      to: [toEmail],
      subject: `Yeni Tur Anketi: ${feedback.passengerName} - ${feedback.tourName || 'Genel'}`,
      html: emailHtml,
    });
    console.log('📬 Notification email sent successfully via Resend:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to send email via Resend:', error);
    return { success: false, error };
  }
}
