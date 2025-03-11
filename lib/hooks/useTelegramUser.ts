import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export function useTelegramUser() {
  const [isTelegram, setIsTelegram] = useState(false)
  const [telegramUser, setTelegramUser] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const getOrCreateUser = useMutation(api.users.getOrCreateByTelegramUser)
  
  useEffect(() => {
    setIsTelegram(false)
    setTelegramUser({id: "123456", first_name: "Anonymous", last_name: "", username: "@anonymous"})
    
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      setIsTelegram(true)
      const webApp = window.Telegram.WebApp

      if (webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
        setTelegramUser(webApp.initDataUnsafe.user)
      }

      webApp.expand()
      webApp.ready()
    }
  }, [])

  useEffect(() => {
    if (telegramUser) {
      getOrCreateUser({ telegramUser })
        .then(user => {
          setCurrentUser(user)
        })
        .catch(error => console.error("Error getting/creating user:", error))
    }
  }, [telegramUser, getOrCreateUser])

  return { currentUser, isTelegram, telegramUser }
} 