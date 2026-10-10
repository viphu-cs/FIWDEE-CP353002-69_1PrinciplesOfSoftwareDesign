/**
 * Utility functions for matching therapist skills with services.
 * Keeps logic clean, testable, and reusable across booking steps.
 */

/**
 * Normalizes text for lenient matching (e.g., removing extra spaces, lowercase).
 */
export function normalizeSkillText(str) {
  if (!str) return ''
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[()\-•]/g, '')
}

/**
 * Checks if a given therapist skill string matches a specific service.
 * @param {string} skill - The skill name from therapist.skills or badges (e.g. 'นวดไทยแผนโบราณ', 'อโรม่าบำบัด')
 * @param {Object} service - The service object (with name, serviceCode, id)
 * @returns {boolean}
 */
export function doesSkillMatchService(skill, service) {
  if (!skill || !service) return false

  const sSkill = normalizeSkillText(skill)
  const sName = normalizeSkillText(service.name)
  const sCode = (service.serviceCode || '').toUpperCase()

  // 1. Direct or substring matching
  if (sName.includes(sSkill) || sSkill.includes(sName)) {
    return true
  }

  // 2. Keyword-based matching between common terms and service codes / categories
  // THAI
  if (sCode.includes('THAI') || sName.includes('ไทย')) {
    if (sSkill.includes('ไทย') || sSkill.includes('thai') || sSkill.includes('ราชสำนัก') || sSkill.includes('แก้อาการ')) {
      return true
    }
  }

  // AROMA
  if (sCode.includes('AROMA') || sName.includes('อโรมา') || sName.includes('อโรม่า')) {
    if (sSkill.includes('อโรมา') || sSkill.includes('อโรม่า') || sSkill.includes('aroma') || sSkill.includes('สุคนธบำบัด') || sSkill.includes('กลิ่นบำบัด')) {
      return true
    }
  }

  // FOOT
  if (sCode.includes('FOOT') || sName.includes('เท้า')) {
    if (sSkill.includes('เท้า') || sSkill.includes('foot') || sSkill.includes('สะท้อน')) {
      return true
    }
  }

  // WARM_OIL / HOT_OIL
  if (sCode.includes('OIL') || sName.includes('น้ำมัน')) {
    if (sSkill.includes('น้ำมัน') || sSkill.includes('oil') || sSkill.includes('สมุนไพรอุ่น') || sSkill.includes('น้ำมันร้อน')) {
      return true
    }
  }

  // HERBAL COMPRESS
  if (sCode.includes('HERBAL') || sName.includes('ประคบ')) {
    if (sSkill.includes('ประคบ') || sSkill.includes('สมุนไพร')) {
      return true
    }
  }

  return false
}

/**
 * Checks whether a therapist can perform a given service.
 * Note: 'any' concierge therapist can perform any service.
 * @param {Object} therapist
 * @param {Object} service
 * @returns {boolean}
 */
export function therapistCanPerformService(therapist, service) {
  if (!therapist || !service) return true
  if (therapist.id === 'any' || therapist.isConcierge) return true

  const skills = Array.isArray(therapist.skills) && therapist.skills.length > 0
    ? therapist.skills
    : (Array.isArray(therapist.badges) ? therapist.badges : [])

  if (skills.length === 0) return true

  return skills.some((skill) => doesSkillMatchService(skill, service))
}

/**
 * Returns list of services that this therapist can perform.
 * If 'any' or empty, returns all services.
 */
export function getAvailableServicesForTherapist(therapist, allServices) {
  if (!therapist || therapist.id === 'any' || therapist.isConcierge || !Array.isArray(allServices)) {
    return allServices || []
  }
  return allServices.filter((svc) => therapistCanPerformService(therapist, svc))
}

/**
 * Returns list of therapists who can perform this service.
 * Always includes the 'any' concierge therapist.
 */
export function getTherapistsForService(service, allTherapists) {
  if (!service || !Array.isArray(allTherapists)) {
    return allTherapists || []
  }
  return allTherapists.filter((thp) => {
    if (thp.id === 'any' || thp.isConcierge) return true
    return therapistCanPerformService(thp, service)
  })
}
