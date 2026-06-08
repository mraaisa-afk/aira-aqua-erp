import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['bn', 'en'] as const
export const defaultLocale = 'bn' as const

/**
 * next-intl setup WITHOUT i18n routing (no locale URL prefix).
 * The active locale is read from a `locale` cookie and falls back to Bengali.
 * Set the cookie from a language switcher (e.g. cookies().set('locale', 'en')).
 */
export default getRequestConfig(async () => {
  const store = await cookies()
  const cookieLocale = store.get('locale')?.value
  const locale = (locales as readonly string[]).includes(cookieLocale ?? '')
    ? (cookieLocale as string)
    : defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
