// Mock data กลางของระบบ — เก็บเฉพาะโครงสร้างข้อมูล (ตัวเลข, id, รูป)
// ข้อความแสดงผลทุกภาษาอยู่ที่ src/i18n/locales/{th,en}.js
// โครงสร้าง field อิงตาม ER diagram (doc/er-diagram.md)
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
  // TODO: ใส่เบอร์โทร/ช่องทางติดต่อจริงของร้าน
  phone: '02-000-0000',
  email: 'contact@fiwdee-massage.co.th',
  lineId: '@fiwdee',
  openTime: '10:00',
  closeTime: '22:00',
}

export const services = [
  {
    id: 1,
    durationOptions: [
      { durationMinutes: 60, price: 600 },
      { durationMinutes: 90, price: 850 },
    ],
  },
  {
    id: 2,
    durationOptions: [
      { durationMinutes: 60, price: 800 },
      { durationMinutes: 90, price: 1100 },
    ],
  },
  {
    id: 3,
    durationOptions: [
      { durationMinutes: 60, price: 750 },
      { durationMinutes: 90, price: 1000 },
    ],
  },
  {
    id: 4,
    durationOptions: [{ durationMinutes: 60, price: 500 }],
  },
]

export const therapists = [
  {
    id: 1,
    nickname: 'มะลิ',
    roleKey: 'professional',
    rating: 4.9,
    specialties: ['thai', 'aroma'],
    experienceYears: 6,
    availableTime: '14:00',
    code: '01 / SANCTUARY',
    imageUrl: therapistMaliImg,
  },
  {
    id: 2,
    nickname: 'บัว',
    roleKey: 'aromaSpecialist',
    rating: 5.0,
    specialties: ['aroma', 'oil'],
    experienceYears: 8,
    availableTime: '15:30',
    code: '02 / SANCTUARY',
    imageUrl: therapistBuaImg,
  },
  {
    id: 3,
    nickname: 'แพรว',
    roleKey: 'professional',
    rating: 4.9,
    specialties: ['thai', 'foot'],
    experienceYears: 5,
    availableTime: '13:00',
    code: '03 / SANCTUARY',
    imageUrl: therapistPraewImg,
  },
]
