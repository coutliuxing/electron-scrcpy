export function EqualArrays(a, b) {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0, l = a.length; i < l; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}
