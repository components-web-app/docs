export const useVip = () => {
  const vipCookie = useCookie<boolean>('vip')
  return {
    isVip: vipCookie
  }
}
