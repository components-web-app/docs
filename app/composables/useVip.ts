export const useVip = () => {
  const vipCookie = useCookie<boolean>('vip', {
    default: () => false
  })
  return {
    isVip: vipCookie
  }
}
