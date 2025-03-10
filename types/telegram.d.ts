interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  initData: string
  initDataUnsafe: any
  themeParams: {
    bg_color: string
    text_color: string
    hint_color: string
    link_color: string
    button_color: string
    button_text_color: string
    secondary_bg_color: string
  }
  showShareScreen: (params: { text: string; buttonText: string }) => void
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}

