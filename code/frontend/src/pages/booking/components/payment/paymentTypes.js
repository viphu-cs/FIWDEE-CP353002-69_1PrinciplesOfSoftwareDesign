/**
 * Payment method definitions (OCP: Extensible configuration for payment channels)
 */
export const PAYMENT_METHODS = [
  {
    id: 'promptpay',
    name: 'พร้อมเพย์ QR Code',
    badge: 'แนะนำ',
    description: 'สแกนจ่ายทันที ปลอดภัย ตรวจสอบและยืนยันนัดหมายอัตโนมัติ',
  },
  {
    id: 'creditcard',
    name: 'บัตรเครดิต / บัตรเดบิต',
    badge: 'Visa · Master · JCB',
    description: 'รองรับระบบ 3D Secure ไม่มีค่าธรรมเนียมเพิ่มเติม',
  },
  {
    id: 'counter',
    name: 'ชำระที่สาขาในวันรับบริการ',
    badge: 'ชำระหน้าร้าน',
    description: 'ชำระเต็มจำนวนที่เคาน์เตอร์ในวันรับบริการ (เงินสด หรือ สแกนจ่าย)',
  },
]
