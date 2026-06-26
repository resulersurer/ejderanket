import { z } from 'zod';

export const feedbackSchema = z.object({
  passengerName: z
    .string()
    .trim()
    .min(2, 'Yolcu adı en az 2 karakter olmalıdır.')
    .max(100, 'Yolcu adı en fazla 100 karakter olmalıdır.'),
  tourName: z
    .string()
    .trim()
    .min(2, 'Tur adı en az 2 karakter olmalıdır.')
    .max(150, 'Tur adı en fazla 150 karakter olmalıdır.'),
  reservationNo: z
    .string()
    .trim()
    .min(3, 'Rezervasyon numarası en az 3 karakter olmalıdır.')
    .max(50, 'Rezervasyon numarası en fazla 50 karakter olmalıdır.')
    .regex(/^[a-zA-Z0-9\-\s]+$/, 'Rezervasyon numarası yalnızca harf, rakam ve tire içerebilir.'),
  tourSatisfaction: z
    .coerce
    .number()
    .int('Puan tamsayı olmalıdır.')
    .min(1, 'Lütfen tur memnuniyeti için 1-5 arası bir puan seçin.')
    .max(5, 'Tur memnuniyeti puanı en fazla 5 olabilir.'),
  guidePerformance: z
    .coerce
    .number()
    .int('Puan tamsayı olmalıdır.')
    .min(1, 'Lütfen rehber performansı için 1-5 arası bir puan seçin.')
    .max(5, 'Rehber performansı puanı en fazla 5 olabilir.'),
  hotelSatisfaction: z
    .coerce
    .number()
    .int('Puan tamsayı olmalıdır.')
    .min(1, 'Lütfen otel memnuniyeti için 1-5 arası bir puan seçin.')
    .max(5, 'Otel memnuniyeti puanı en fazla 5 olabilir.'),
  restaurantSatisfaction: z
    .coerce
    .number()
    .int('Puan tamsayı olmalıdır.')
    .min(1, 'Lütfen restoran memnuniyeti için 1-5 arası bir puan seçin.')
    .max(5, 'Restoran memnuniyeti puanı en fazla 5 olabilir.'),
  additionalComments: z
    .string()
    .trim()
    .max(1000, 'Ekstra yorumlarınız en fazla 1000 karakter olabilir.')
    .optional()
    .or(z.literal('')),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
