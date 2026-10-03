import React from 'react'

/**
 * Payment Strategy Components (OCP: Strategy Pattern)
 */

export function PromptPayStrategy({
  activeService,
  finalPriceLabel,
  bookingRef,
  formatCountdown,
  promoState,
}) {
  const {
    promoApplied,
    promoInput,
    setPromoInput,
    promoError,
    handleApplyPromo,
    handleRemovePromo,
    promoInfo,
  } = promoState

  return (
    <div className="mt-space-md pt-space-md bg-surface-container-low/60 rounded p-space-md flex flex-col sm:flex-row items-center gap-space-md">
      {/* Minimalist PromptPay QR Code */}
      <div className="w-44 h-44 bg-surface-container-lowest p-3 rounded flex flex-col items-center justify-between shrink-0 shadow-sm border border-outline-variant/30">
        <div className="w-full flex items-center justify-between pb-1">
          <span className="font-label-caps text-label-caps text-on-surface font-bold tracking-tight">
            PromptPay
          </span>
          <span className="material-symbols-outlined text-primary text-sm">
            qr_code_scanner
          </span>
        </div>
        <svg className="w-32 h-32 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
          <rect fill="none" height="26" stroke="currentColor" strokeWidth="4" width="26" x="5" y="5" />
          <rect height="14" width="14" x="11" y="11" />
          <rect fill="none" height="26" stroke="currentColor" strokeWidth="4" width="26" x="69" y="5" />
          <rect height="14" width="14" x="75" y="11" />
          <rect fill="none" height="26" stroke="currentColor" strokeWidth="4" width="26" x="5" y="69" />
          <rect height="14" width="14" x="11" y="75" />
          <rect height="6" width="6" x="36" y="8" />
          <rect height="6" width="8" x="46" y="8" />
          <rect height="6" width="6" x="58" y="12" />
          <rect height="6" width="8" x="36" y="20" />
          <rect height="8" width="6" x="48" y="20" />
          <rect height="8" width="8" x="8" y="38" />
          <rect height="6" width="6" x="22" y="42" />
          <rect height="6" width="6" x="36" y="36" />
          <rect height="8" width="8" x="46" y="36" />
          <rect height="6" width="6" x="60" y="38" />
          <rect height="6" width="6" x="74" y="36" />
          <rect height="8" width="8" x="86" y="42" />
          <rect height="6" width="8" x="38" y="48" />
          <rect height="8" width="6" x="50" y="50" />
          <rect height="6" width="6" x="62" y="48" />
          <rect height="6" width="8" x="76" y="54" />
          <rect height="6" width="6" x="36" y="62" />
          <rect height="6" width="6" x="48" y="64" />
          <rect height="6" width="6" x="58" y="62" />
          <rect height="8" width="6" x="72" y="68" />
          <rect height="8" width="8" x="84" y="62" />
          <rect height="6" width="8" x="36" y="76" />
          <rect height="6" width="6" x="50" y="78" />
          <rect height="6" width="6" x="60" y="76" />
          <rect height="8" width="8" x="74" y="82" />
          <rect height="6" width="6" x="86" y="78" />
          <rect height="6" width="6" x="38" y="88" />
          <rect height="6" width="8" x="48" y="88" />
          <rect height="6" width="6" x="62" y="88" />
        </svg>
        <span className="font-label-caps text-label-caps text-secondary text-center text-[10px]">
          FIWDEE RETREAT
        </span>
      </div>

      <div className="flex-1 w-full space-y-space-xs text-left">
        <div>
          <span className="font-label-caps text-label-caps text-secondary uppercase block">
            พร้อมเพย์สแกนได้ทุกธนาคาร
          </span>
          <p className="font-headline-sm text-headline-sm text-primary font-medium">
            ยอดชำระ:{' '}
            {promoApplied && (
              <span className="font-body-sm text-body-sm text-stone-400 line-through mr-1.5">
                {activeService.price}
              </span>
            )}
            {finalPriceLabel}
          </p>
        </div>
        <div className="pt-1">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            เลขอ้างอิง:{' '}
            <span className="font-mono text-on-surface font-medium">{bookingRef}</span>
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
            <span>
              กรุณาชำระภายใน{' '}
              <span className="font-mono text-primary font-semibold">
                {formatCountdown()}
              </span>{' '}
              นาที
            </span>
          </p>
        </div>
        <div className="pt-space-xs">
          <button
            type="button"
            onClick={() => alert('บันทึกรูปภาพ QR Code สำเร็จ')}
            className="font-label-caps text-label-caps uppercase text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">download</span> บันทึกรูปภาพ QR ลงอุปกรณ์
          </button>
        </div>

        {/* ช่องกรอกรหัสโปรโมชั่น */}
        <div className="mt-2 pt-3 border-t border-outline-variant/30 space-y-2">
          <span className="font-label-caps text-label-caps text-secondary uppercase block">
            รหัสโปรโมชั่น (ถ้ามี)
          </span>
          {promoApplied ? (
            <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <span className="font-body-sm text-body-sm text-emerald-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>
                  ใช้โค้ด <span className="font-mono font-bold">{promoInfo.code}</span> สำเร็จ · ส่วนลด {promoInfo.discount}
                </span>
              </span>
              <button
                type="button"
                onClick={handleRemovePromo}
                aria-label="ถอนโค้ดโปรโมชั่น"
                className="w-6 h-6 rounded-full text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="กรอกรหัส เช่น FIWDEE20"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/50 font-mono text-sm uppercase tracking-wider text-on-surface placeholder:font-body-sm placeholder:normal-case placeholder:tracking-normal placeholder:text-outline/70 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                >
                  ใช้โค้ด
                </button>
              </div>
              {promoError && (
                <p className="font-body-sm text-xs text-rose-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {promoError}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function CreditCardStrategy() {
  return (
    <div className="mt-space-md pt-space-sm space-y-space-sm">
      <div className="space-y-1">
        <label className="font-label-caps text-label-caps uppercase text-secondary">
          หมายเลขบัตร
        </label>
        <input
          className="w-full bg-surface-container-lowest px-space-sm py-2 rounded font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
          placeholder="•••• •••• •••• ••••"
          type="text"
        />
      </div>
      <div className="grid grid-cols-2 gap-space-sm">
        <div className="space-y-1">
          <label className="font-label-caps text-label-caps uppercase text-secondary">
            วันหมดอายุ (MM/YY)
          </label>
          <input
            className="w-full bg-surface-container-lowest px-space-sm py-2 rounded font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
            placeholder="MM / YY"
            type="text"
          />
        </div>
        <div className="space-y-1">
          <label className="font-label-caps text-label-caps uppercase text-secondary">
            CVV / CVC
          </label>
          <input
            className="w-full bg-surface-container-lowest px-space-sm py-2 rounded font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
            maxLength={4}
            placeholder="•••"
            type="password"
          />
        </div>
      </div>
    </div>
  )
}

export function DepositStrategy({ finalPrice }) {
  const remainingPrice = Math.max(0, finalPrice - 300)
  return (
    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 pl-7">
      ชำระมัดจำออนไลน์ ฿300 เพื่อล็อกห้องนวดและตารางเวลา ยอดคงเหลือ ฿{remainingPrice.toLocaleString('en-US')} ชำระที่เคาน์เตอร์
    </p>
  )
}

export function PaymentStrategyContent({ method, ...props }) {
  if (method === 'promptpay') {
    return <PromptPayStrategy {...props} />
  }
  if (method === 'creditcard') {
    return <CreditCardStrategy {...props} />
  }
  if (method === 'deposit') {
    return <DepositStrategy {...props} />
  }
  return null
}
