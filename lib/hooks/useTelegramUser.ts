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
      // Strip down telegramUser to only include necessary properties
      const strippedUser = {
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name || "",
        username: telegramUser.username || ""
      }
      
      getOrCreateUser({ telegramUser: strippedUser })
        .then(user => {
          setCurrentUser(user)
        })
        .catch(error => console.error("Error getting/creating user:", error))
    }
  }, [telegramUser, getOrCreateUser])

  return { currentUser, isTelegram, telegramUser }
} 