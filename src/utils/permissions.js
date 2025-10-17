export const RANK_HIERARCHY = {
  OWNERSHIP: ["Chairman", "President"],
  PRESIDENTIAL: ["Senior Vice President", "Vice President"],
  ADMINISTRATIVE_STAFF: ["Chief Staffing Officer", "Chief Operations Officer", "Chief Communications Officer"],
  CORPORATE_STAFF: ["Corporate Director", "Officer", "Corporate Associate"],
}

export function hasPermission(member, requiredLevel) {
  const roles = member.roles.cache.map((role) => role.name)

  switch (requiredLevel) {
    case "OWNERSHIP":
      return roles.some((role) => RANK_HIERARCHY.OWNERSHIP.includes(role))

    case "PRESIDENTIAL":
      return (
        roles.some((role) => RANK_HIERARCHY.OWNERSHIP.includes(role)) ||
        roles.some((role) => RANK_HIERARCHY.PRESIDENTIAL.includes(role))
      )

    case "ADMINISTRATIVE_STAFF":
      return (
        roles.some((role) => RANK_HIERARCHY.OWNERSHIP.includes(role)) ||
        roles.some((role) => RANK_HIERARCHY.PRESIDENTIAL.includes(role)) ||
        roles.some((role) => RANK_HIERARCHY.ADMINISTRATIVE_STAFF.includes(role))
      )

    case "CORPORATE_STAFF":
      return (
        roles.some((role) => RANK_HIERARCHY.OWNERSHIP.includes(role)) ||
        roles.some((role) => RANK_HIERARCHY.PRESIDENTIAL.includes(role)) ||
        roles.some((role) => RANK_HIERARCHY.ADMINISTRATIVE_STAFF.includes(role)) ||
        roles.some((role) => RANK_HIERARCHY.CORPORATE_STAFF.includes(role))
      )

    default:
      return false
  }
}

export function getHighestRank(member) {
  const roles = member.roles.cache.map((role) => role.name)

  if (roles.some((role) => RANK_HIERARCHY.OWNERSHIP.includes(role))) return "OWNERSHIP"
  if (roles.some((role) => RANK_HIERARCHY.PRESIDENTIAL.includes(role))) return "PRESIDENTIAL"
  if (roles.some((role) => RANK_HIERARCHY.ADMINISTRATIVE_STAFF.includes(role))) return "ADMINISTRATIVE_STAFF"
  if (roles.some((role) => RANK_HIERARCHY.CORPORATE_STAFF.includes(role))) return "CORPORATE_STAFF"

  return null
}
