import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        'sans': ['DM Sans', ...defaultTheme.fontFamily.sans],
        'script': ['Caveat'],
        'mono': ['"JetBrains Mono"'],
        'source-code': ['"Source Code Pro"']
      },
      colors: {
        vip: '#D3BB75',
        feature: '#0A3640',
        gray: {
          400: colors.gray['300']
        }
      }
    }
  }
}
