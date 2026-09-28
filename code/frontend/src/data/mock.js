// Mock data กลางของระบบ — โครงสร้าง field อิงตาม ER diagram
// (doc/er-diagram.md: shops, business_hours, services, service_duration_options, therapists, rooms)
// เมื่อ backend พร้อม จะเปลี่ยนมาเรียกผ่าน src/lib/api.js แทนการ import ตรง

import atmosphereImg from '../assets/design/atmosphere.jpg'
import heroImg from '../assets/design/hero.jpg'
import mapImg from '../assets/design/map.png'
import serviceRoomImg from '../assets/design/service-room.jpg'
import therapistBuaImg from '../assets/design/therapist-bua.jpg'
import therapistMaliImg from '../assets/design/therapist-mali.jpg'
import therapistPraewImg from '../assets/design/therapist-praew.jpg'

export const images = {
  hero: heroImg,
  serviceRoom: serviceRoomImg,
  atmosphere: atmosphereImg,
  map: mapImg,
}

export const shop = {
  id: 1,
  name: 'FIWDEE',
  nameSuffix: 'MASSAGE & WELLNESS',
  tagline: 'Boutique Thai Wellness Retreat',
  city: 'ขอนแก่น',
  address: 'ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองขอนแก่น',
  // TODO: ใส่เบอร์โทร/ช่องทางติดต่อจริงของร้าน
  phone: '02-000-0000',
  email: 'contact@fiwdee-massage.co.th',
  lineId: '@fiwdee',
  openTime: '10:00',
  closeTime: '22:00',
}

export const businessHours = [{ day: 'ทุกวัน', openTime: '10:00', closeTime: '22:00' }]

export const services = [
  {
    id: 1,
    nameTh: 'นวดไทย',
    description: '60 นาที · 600 บาท / 90 นาที · 850 บาท',
    durationOptions: [
      { durationMinutes: 60, price: 600 },
      { durationMinutes: 90, price: 850 },
    ],
  },
  {
    id: 2,
    nameTh: 'นวดอโรมา',
    description: '60 นาที · 800 บาท / 90 นาที · 1,100 บาท',
    durationOptions: [
      { durationMinutes: 60, price: 800 },
      { durationMinutes: 90, price: 1100 },
    ],
  },
  {
    id: 3,
    nameTh: 'นวดน้ำมัน',
    description: '60 นาที · 750 บาท / 90 นาที · 1,000 บาท',
    durationOptions: [
      { durationMinutes: 60, price: 750 },
      { durationMinutes: 90, price: 1000 },
    ],
  },
  {
    id: 4,
    nameTh: 'นวดเท้าและผ่อนคลาย',
    description: '60 นาที · 500 บาท',
    durationOptions: [{ durationMinutes: 60, price: 500 }],
  },
]

export const therapists = [
  {
    id: 1,
    nickname: 'มะลิ',
    rating: 4.9,
    specialties: ['นวดไทย', 'อโรมา'],
    experienceYears: 6,
    imageUrl: therapistMaliImg,
    imageAlt:
      'Serene professional Thai female massage therapist named Mali smiling gently, wearing clean unbleached linen spa attire',
  },
  {
    id: 2,
    nickname: 'บัว',
    rating: 5.0,
    specialties: ['อโรมา', 'นวดน้ำมัน'],
    experienceYears: 8,
    imageUrl: therapistBuaImg,
    imageAlt: 'Warm and graceful Thai wellness therapist named Bua dressed in chocolate brown linen tunic',
  },
  {
    id: 3,
    nickname: 'แพรว',
    rating: 4.9,
    specialties: ['นวดไทย', 'นวดเท้า'],
    experienceYears: 5,
    imageUrl: therapistPraewImg,
    imageAlt: 'Gentle and poised Thai spa specialist named Praew wearing short sleeve raw linen wrap uniform',
  },
]
