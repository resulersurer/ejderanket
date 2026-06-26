import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Realistic mock data with emails and transportation satisfaction
const MOCK_FEEDBACKS = [
  {
    id: '1',
    passengerName: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@gmail.com',
    tourName: 'Büyük İskandinavya ve Fiyortlar Turu',
    reservationNo: 'EJ-9921-A',
    tourSatisfaction: 5,
    guidePerformance: 5,
    hotelSatisfaction: 4,
    restaurantSatisfaction: 4,
    transportationSatisfaction: 5,
    additionalComments: 'Rehberimizin bilgisi ve ilgisi mükemmeldi. Oteller genel olarak temizdi ancak Oslo oteli biraz küçüktü. Ulaşım ve otobüsler konforluydu. Yemekler de oldukça başarılıydı, Ejder Turizme teşekkür ederiz.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    passengerName: 'Ayşe Kaya Demir',
    email: 'ayse.demir@hotmail.com',
    tourName: 'Klasik İtalya ve Toskana Turu',
    reservationNo: 'EJ-8712-B',
    tourSatisfaction: 4,
    guidePerformance: 5,
    hotelSatisfaction: 3,
    restaurantSatisfaction: 4,
    transportationSatisfaction: 4,
    additionalComments: 'Toskana vadisindeki öğle yemeği harikaydı. Roma oteli merkeze biraz uzaktı ancak uçuşlar ve transferler çok rahattı, hiçbir aksaklık yaşamadık.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    passengerName: 'Mustafa Caner',
    email: 'm.caner@outlook.com',
    tourName: 'Japonya ve Sakura Dönemi Kültür Turu',
    reservationNo: 'EJ-7741-K',
    tourSatisfaction: 5,
    guidePerformance: 5,
    hotelSatisfaction: 5,
    restaurantSatisfaction: 5,
    transportationSatisfaction: 5,
    additionalComments: 'Hayatım boyunca katıldığım en iyi tur organizasyonuydu. Sakura çiçeklerinin açtığı döneme denk gelmesi muhteşemdi. Uçuşlar ve otobüs yolculukları çok konforluydu. Her şey için teşekkürler.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 65 * 1000).toISOString(), // 3 days ago
  },
  {
    id: '4',
    passengerName: 'Zeynep Çelik',
    email: 'zeynep.celik@yandex.com',
    tourName: 'Güney Afrika ve Victoria Şelaleleri',
    reservationNo: 'EJ-5512-Z',
    tourSatisfaction: 3,
    guidePerformance: 2,
    hotelSatisfaction: 4,
    restaurantSatisfaction: 3,
    transportationSatisfaction: 4,
    additionalComments: 'Safari deneyimi çok güzeldi. Ancak yerel rehberin organizasyonunda bazı gecikmeler yaşandı. Otellerin kalitesi güzeldi. Ulaşım rahattı.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: '5',
    passengerName: 'Mehmet Yurt',
    email: 'mehmet.yurt@gmail.com',
    tourName: 'Klasik İtalya ve Toskana Turu',
    reservationNo: 'EJ-3312-Y',
    tourSatisfaction: 4,
    guidePerformance: 4,
    hotelSatisfaction: 4,
    restaurantSatisfaction: 4,
    transportationSatisfaction: 3,
    additionalComments: 'Genel olarak başarılı bir programdı. Otobüsler konforluydu.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
];

export async function GET() {
  try {
    // 1. Check if database configuration exists
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL is not set. Returning mock data for demonstration.');
      return NextResponse.json(computeStats(MOCK_FEEDBACKS, true));
    }

    // 2. Query feedbacks from PostgreSQL database via Prisma
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (feedbacks.length === 0) {
      return NextResponse.json(computeStats([], false));
    }

    // Map Prisma model keys to API keys
    const mappedFeedbacks = feedbacks.map((f: any) => ({
      id: f.id,
      passengerName: f.passengerName,
      email: f.email,
      tourName: f.tourName,
      reservationNo: f.reservationNo,
      tourSatisfaction: f.tourSatisfaction,
      guidePerformance: f.guidePerformance,
      hotelSatisfaction: f.hotelSatisfaction,
      restaurantSatisfaction: f.restaurantSatisfaction,
      transportationSatisfaction: f.transportationSatisfaction,
      additionalComments: f.additionalComments,
      createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json(computeStats(mappedFeedbacks, false));
  } catch (err: any) {
    console.error('❌ GET /api/dashboard failed:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Veriler getirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Helper function to calculate analytics
function computeStats(items: any[], isSimulated: boolean) {
  const totalCount = items.length;

  if (totalCount === 0) {
    return {
      success: true,
      simulated: isSimulated,
      totalCount: 0,
      averages: {
        tourSatisfaction: 0,
        guidePerformance: 0,
        hotelSatisfaction: 0,
        restaurantSatisfaction: 0,
        transportationSatisfaction: 0,
        overall: 0,
      },
      distributions: {
        tourSatisfaction: [0, 0, 0, 0, 0],
        guidePerformance: [0, 0, 0, 0, 0],
        hotelSatisfaction: [0, 0, 0, 0, 0],
        restaurantSatisfaction: [0, 0, 0, 0, 0],
        transportationSatisfaction: [0, 0, 0, 0, 0],
      },
      feedbacks: [],
    };
  }

  let sumTour = 0;
  let sumGuide = 0;
  let sumHotel = 0;
  let sumRestaurant = 0;
  let sumTransportation = 0;

  // Distribution counters (indexes 0-4 correspond to ratings 1-5)
  const distTour = [0, 0, 0, 0, 0];
  const distGuide = [0, 0, 0, 0, 0];
  const distHotel = [0, 0, 0, 0, 0];
  const distRestaurant = [0, 0, 0, 0, 0];
  const distTransportation = [0, 0, 0, 0, 0];

  items.forEach((item) => {
    sumTour += item.tourSatisfaction;
    sumGuide += item.guidePerformance;
    sumHotel += item.hotelSatisfaction;
    sumRestaurant += item.restaurantSatisfaction;
    sumTransportation += item.transportationSatisfaction || 0;

    const idxTour = Math.max(1, Math.min(5, item.tourSatisfaction)) - 1;
    const idxGuide = Math.max(1, Math.min(5, item.guidePerformance)) - 1;
    const idxHotel = Math.max(1, Math.min(5, item.hotelSatisfaction)) - 1;
    const idxRestaurant = Math.max(1, Math.min(5, item.restaurantSatisfaction)) - 1;
    const idxTransportation = Math.max(1, Math.min(5, item.transportationSatisfaction || 1)) - 1;

    distTour[idxTour]++;
    distGuide[idxGuide]++;
    distHotel[idxHotel]++;
    distRestaurant[idxRestaurant]++;
    distTransportation[idxTransportation]++;
  });

  const avgTour = sumTour / totalCount;
  const avgGuide = sumGuide / totalCount;
  const avgHotel = sumHotel / totalCount;
  const avgRestaurant = sumRestaurant / totalCount;
  const avgTransportation = sumTransportation / totalCount;
  const avgOverall = (avgTour + avgGuide + avgHotel + avgRestaurant + avgTransportation) / 5;

  return {
    success: true,
    simulated: isSimulated,
    totalCount,
    averages: {
      tourSatisfaction: parseFloat(avgTour.toFixed(2)),
      guidePerformance: parseFloat(avgGuide.toFixed(2)),
      hotelSatisfaction: parseFloat(avgHotel.toFixed(2)),
      restaurantSatisfaction: parseFloat(avgRestaurant.toFixed(2)),
      transportationSatisfaction: parseFloat(avgTransportation.toFixed(2)),
      overall: parseFloat(avgOverall.toFixed(2)),
    },
    distributions: {
      tourSatisfaction: distTour,
      guidePerformance: distGuide,
      hotelSatisfaction: distHotel,
      restaurantSatisfaction: distRestaurant,
      transportationSatisfaction: distTransportation,
    },
    feedbacks: items,
  };
}
