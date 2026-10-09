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
    serviceCode: 'THAI',
    image: '/images/services/service-thai.jpg',
    durationOptions: [
      { durationMinutes: 60, price: 500 },
      { durationMinutes: 90, price: 700 },
      { durationMinutes: 120, price: 900 },
    ],
  },
  {
    id: 2,
    serviceCode: 'AROMA',
    image: '/images/services/service-aroma.jpg',
    durationOptions: [
      { durationMinutes: 60, price: 700 },
      { durationMinutes: 90, price: 950 },
      { durationMinutes: 120, price: 1200 },
    ],
  },
  {
    id: 3,
    serviceCode: 'HOT_OIL',
    image: '/images/services/service-warm-oil.jpg',
    durationOptions: [
      { durationMinutes: 60, price: 800 },
      { durationMinutes: 90, price: 1100 },
      { durationMinutes: 120, price: 1400 },
    ],
  },
  {
    id: 4,
    serviceCode: 'FOOT',
    image: '/images/services/service-foot.jpg',
    durationOptions: [
      { durationMinutes: 60, price: 400 },
      { durationMinutes: 90, price: 550 },
      { durationMinutes: 120, price: 700 },
    ],
  },
]

export const therapists = [
  {
    id: 1,
    nickname: 'มะลิ',
    englishName: 'Mali',
    fullName: 'มะลิ กัลยาณี',
    roleKey: 'professional',
    rating: 4.9,
    reviewCount: 120,
    specialties: ['thai', 'aroma'],
    experienceYears: 6,
    availableTime: '14:00',
    code: '01 / SANCTUARY',
    imageUrl: therapistMaliImg,
    detailPortrait: '/images/profile/therapist-portrait-detail.jpg',
    pressureLevel: 'ปานกลาง - แน่นลึก',
    signatureTechnique: 'อโรมาเธอราปี',
    roomName: 'สาขาขอนแก่น · ห้องส่วนตัวศิลาดล',
    roomDesc: 'พื้นที่ส่วนตัวพร้อมเสียงดนตรีบรรเลงและกลิ่นหอมอบเชยไม้กฤษณา',
    roomImage: '/images/profile/room-celadon.jpg',
    bio: 'เชี่ยวชาญการนวดคลายเส้นผสมผสานศาสตร์การกดจุดแบบโบราณและอโรมาเธอราปี ให้คุณผ่อนคลายลึกถึงกล้ามเนื้อด้วยจังหวะที่นุ่มนวลและสงบนิ่ง',
    bioSub: 'ผ่านการรับรองมาตรฐานวิชาชีพการนวดไทยราชสำนักและศาสตร์สุคนธบำบัด มุ่งเน้นการปรับสมดุลลมหายใจและสลายความตึงเครียดสะสมบริเวณคอบ่าไหล่',
  },
  {
    id: 2,
    nickname: 'บัว',
    englishName: 'Bua',
    fullName: 'บัว รวีวรรณ',
    roleKey: 'aromaSpecialist',
    rating: 5.0,
    reviewCount: 145,
    specialties: ['aroma', 'oil'],
    experienceYears: 8,
    availableTime: '15:30',
    code: '02 / SANCTUARY',
    imageUrl: therapistBuaImg,
    detailPortrait: therapistBuaImg,
    pressureLevel: 'นุ่มนวล - ปานกลาง',
    signatureTechnique: 'สุคนธบำบัด & น้ำมันอุ่น',
    roomName: 'สาขาขอนแก่น · ห้องส่วนตัวบุษบัน',
    roomDesc: 'ห้องกระจายกลิ่นหอมดอกบัวหลวงและสมุนไพรสดชื่นพร้อมอ่างแช่เท้าส่วนตัว',
    roomImage: '/images/profile/room-celadon.jpg',
    bio: 'ผู้เชี่ยวชาญศาสตร์อโรมาและนวดน้ำมันอุ่น ด้วยน้ำหนักมือที่อ่อนโยนและจังหวะประณีต ช่วยปลอบประโลมระบบประสาทและฟื้นฟูความสดชื่นอย่างล้ำลึก',
    bioSub: 'ผ่านการอบรมศาสตร์สปาระดับพรีเมียมและความรู้ด้านน้ำมันหอมระเหยอินทรีย์ชั้นสูง เหมาะสำหรับผู้ที่มีความเครียดสะสมหรือนอนไม่หลับ',
  },
  {
    id: 3,
    nickname: 'แพรว',
    englishName: 'Praew',
    fullName: 'แพรว พรทิพา',
    roleKey: 'professional',
    rating: 4.9,
    reviewCount: 98,
    specialties: ['thai', 'foot'],
    experienceYears: 5,
    availableTime: '13:00',
    code: '03 / SANCTUARY',
    imageUrl: therapistPraewImg,
    detailPortrait: therapistPraewImg,
    pressureLevel: 'แน่นลึก - คลายจุดสะบัก',
    signatureTechnique: 'นวดกดจุดสะท้อนเท้า',
    roomName: 'สาขาขอนแก่น · ห้องส่วนตัวพฤกษา',
    roomDesc: 'บรรยากาศโทนไม้สักธรรมชาติและกลิ่นอายสมุนไพรไพลสด ผ่อนคลายระดับลึก',
    roomImage: '/images/profile/room-celadon.jpg',
    bio: 'ชำนาญการนวดกดจุดสะท้อนฝ่าเท้าและนวดไทยคลายเส้นสายสะบักหลัง สามารถแก้อาการปวดเมื่อยจากการทำงานหนักได้อย่างตรงจุด',
    bioSub: 'ผ่านการรับรองหลักสูตรหัตเวชกรรมแผนไทย ชำนาญการตรวจจุดตึงและให้คำแนะนำในการปรับสรีระร่างกายหลังการนวด',
  },
]
