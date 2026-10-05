import PromoBanner from '../../../components/booking/PromoBanner.jsx'
import { PAYMENT_METHODS } from './payment/paymentTypes.js'
import { PaymentStrategyContent } from './payment/paymentStrategies.jsx'

/**
 * BookingStepPayment - ขั้นตอนที่ 3: ชำระเงินและยืนยันการนัดหมาย (SRP + OCP)
 * ใช้ Payment Strategies ในการ render ฟอร์มชำระเงินแต่ละวิธี
 */
export default function BookingStepPayment({
  paymentMethod,
  setPaymentMethod,
  activeService,
  selectedService,
  selectedTherapist,
  selectedDate,
  selectedTimeSlot,
  bookingRef,
  formatCountdown,
  promoState,
  onPrev,
  onConfirm,
}) {
  const { promoApplied, finalPrice, finalPriceLabel, discountLabel, promoInfo } =
    promoState

  return (
    <div className="max-w-7xl mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-6 md:py-8 relative">
      {/* จุดวางกล่องโปรโมชั่น */}
      <div
        id="promo-anchor"
        className="relative z-40 ml-auto w-full max-w-[340px] mb-4 lg:absolute lg:top-5 lg:right-10 lg:mb-0"
      >
        <PromoBanner />
      </div>

      {/* Top Back Navigation */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-200 font-label-md text-label-md uppercase cursor-pointer py-1 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-x-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>ย้อนกลับไปขั้นตอนที่ 2</span>
        </button>
      </div>

      <div className="max-w-3xl mb-space-lg md:mb-space-xl">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary block mb-space-xs">
          ขั้นตอนสุดท้ายเพื่อการพักผ่อน
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-normal tracking-tight">
          ชำระเงินและยืนยันการนัดหมาย
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          ตรวจสอบข้อมูลการนัดหมายและเลือกช่องทางการชำระเงินเพื่อล็อกคิวเวลาของท่าน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-gutter-desktop items-start">
        {/* Left: 7 cols */}
        <section className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Payment Methods Box */}
          <div className="bg-surface-container-low p-space-md md:p-space-lg rounded">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                เลือกวิธีการชำระเงิน
              </h2>
              <span className="font-label-caps text-label-caps text-secondary uppercase">
                Secure Transaction
              </span>
            </div>

            <div className="space-y-space-sm">
              {PAYMENT_METHODS.map((strategy) => {
                const isSelected = paymentMethod === strategy.id
                return (
                  <div
                    key={strategy.id}
                    className={`p-space-md rounded transition-all duration-200 ${
                      isSelected
                        ? 'bg-surface-container-lowest shadow-sm'
                        : 'bg-surface-container'
                    }`}
                  >
                    <label className="flex items-start gap-space-sm cursor-pointer select-none">
                      <input
                        checked={isSelected}
                        onChange={() => setPaymentMethod(strategy.id)}
                        className="mt-1 accent-primary w-4 h-4 cursor-pointer"
                        name="payment_method"
                        type="radio"
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            {strategy.name}
                          </span>
                          <span
                            className={`font-label-caps text-label-caps ${
                              strategy.id === 'promptpay'
                                ? 'text-primary bg-secondary-container px-2 py-0.5 rounded'
                                : 'text-secondary'
                            }`}
                          >
                            {strategy.badge}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {strategy.description}
                        </p>
                      </div>
                    </label>

                    {isSelected && (
                      <PaymentStrategyContent
                        method={strategy.id}
                        activeService={activeService}
                        finalPrice={finalPrice}
                        finalPriceLabel={finalPriceLabel}
                        bookingRef={bookingRef}
                        formatCountdown={formatCountdown}
                        promoState={promoState}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="bg-surface-container-low p-space-md md:p-space-lg rounded">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-normal mb-space-xs">
              ช่องทางรับใบเสร็จและการยืนยันนัดหมาย
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              ระบบจะจัดส่งเอกสารยืนยันการจอง รหัสคิว และแผนที่การเดินทางทันทีหลังการชำระเงิน
            </p>
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded border border-outline-variant/20">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-xl">sms</span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block">
                      ข้อความ SMS
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      089-456-7890
                    </span>
                  </div>
                </div>
                <span className="font-label-caps text-label-caps text-secondary font-medium">
                  ยืนยันแล้ว
                </span>
              </div>

              <div className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded border border-outline-variant/20">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-xl">chat</span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block">
                      LINE Official Account
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      แจ้งเตือนเตือนความจำล่วงหน้า 2 ชม.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span className="font-label-caps text-label-caps font-semibold">เชื่อมต่อ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="flex items-center justify-between pt-space-xs">
            <button
              type="button"
              onClick={onPrev}
              className="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group cursor-pointer"
            >
              <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              ย้อนกลับไปแก้ไขวันเวลา
            </button>
            <span className="font-label-caps text-label-caps text-secondary hidden sm:inline-block">
              FIWDEE BOUTIQUE WELLNESS
            </span>
          </div>
        </section>

        {/* Right: 5 cols (Summary Sidebar) */}
        <aside className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-low rounded overflow-hidden shadow-sm sticky top-28">
            <div className="relative w-full h-48 md:h-56 bg-surface-container overflow-hidden">
              <img
                alt="ห้องนวดไทยราชสำนัก บรรยากาศเงียบสงบ"
                className="w-full h-full object-cover"
                src="/images/booking/suite-room.jpg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-surface">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-secondary-fixed">
                    Private Sanctuary
                  </span>
                  <p className="font-headline-sm text-headline-sm text-surface font-normal">
                    ห้องเดี่ยวส่วนตัว Private Suite
                  </p>
                </div>
                <span className="font-label-caps text-label-caps px-2 py-0.5 bg-surface/20 backdrop-blur-sm rounded text-surface">
                  พร้อมบริการ
                </span>
              </div>
            </div>

            <div className="p-space-md md:p-space-lg space-y-space-md">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-1">
                  สรุปการนัดหมาย
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
                  {selectedService.name}
                </h3>
                <p className="font-body-sm text-body-sm text-secondary">
                  {selectedService.desc} ({activeService.duration})
                </p>
              </div>

              <div className="space-y-space-xs text-on-surface pt-space-xs">
                <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                  <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">location_on</span>
                    สาขา
                  </span>
                  <span className="font-label-md text-label-md text-on-surface text-right">
                    ขอนแก่น (ถ.มิตรภาพ ซอย 12)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                  <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
                    วันนัดหมาย
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-medium">
                    {selectedDate.fullText}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                  <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">schedule</span>
                    ช่วงเวลา
                  </span>
                  <span className="font-label-md text-label-md text-primary font-semibold">
                    {selectedTimeSlot.timeRange || selectedTimeSlot.time}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                  <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">person</span>
                    หมอนวดผู้ดูแล
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">
                    {selectedTherapist.shortName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 bg-surface-container/60 px-3 rounded">
                  <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">badge</span>
                    ผู้รับบริการ
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">
                    คุณอภิสิทธิ์ วัฒนากุล
                  </span>
                </div>
              </div>

              <div className="pt-space-xs space-y-2">
                <div className="flex justify-between font-body-sm text-body-sm">
                  <span className="text-secondary">ค่าบริการบำบัด ({activeService.duration})</span>
                  <span className={`font-medium ${promoApplied ? 'line-through text-stone-400' : 'text-on-surface'}`}>
                    {activeService.price}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between font-body-sm text-body-sm text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">local_offer</span>
                      ส่วนลดโปรโมชั่น ({promoInfo.code} · {promoInfo.discount})
                    </span>
                    <span className="font-semibold">{discountLabel}</span>
                  </div>
                )}
                <div className="flex justify-between font-body-sm text-body-sm">
                  <span className="text-secondary">ห้องทรีตเมนต์เดี่ยว &amp; เวลคัมดริ๊งก์สมุนไพร</span>
                  <span className="text-primary font-medium">ฟรี (รวมในแพ็กเกจ)</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm">
                  <span className="text-secondary">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                  <span className="text-secondary">รวมในราคาแล้ว</span>
                </div>

                <div className="pt-space-sm flex items-baseline justify-between border-t border-outline-variant/30">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-secondary">
                      ยอดรวมสุทธิ
                    </span>
                    <p className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                      {paymentMethod === 'deposit' ? '฿300 (มัดจำ)' : finalPriceLabel}
                    </p>
                  </div>
                  <span className="font-label-caps text-label-caps text-secondary">
                    {paymentMethod === 'deposit' ? 'ยอดมัดจำออนไลน์' : 'สุทธิ (Net Price)'}
                  </span>
                </div>
              </div>

              <div className="pt-space-xs">
                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full bg-primary hover:opacity-90 active:scale-[0.99] text-on-primary py-3.5 px-space-md rounded font-label-md text-label-md tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  ยืนยันการจองและชำระเงิน ({paymentMethod === 'deposit' ? '฿300' : finalPriceLabel})
                </button>
              </div>

              <div className="p-space-sm bg-surface-container rounded flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">
                  shield
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  <span className="font-medium text-on-surface">การันตีล็อกเวลาทันที:</span>{' '}
                  ยกเลิกหรือเลื่อนนัดหมายได้โดยไม่มีค่าปรับ เมื่อแจ้งล่วงหน้าอย่างน้อย 4 ชั่วโมงก่อนเวลาเข้ารับบริการ
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
