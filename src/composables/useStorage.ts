/**
 * Wrapper autour du localStorage pour lire et écrire des données typées.
 */
export function useStorage() {
  /**
   * Lit une valeur depuis le localStorage.
   * Retourne `null` si la clé n'existe pas.
   * @example storage.get<string>('token')
   * @example storage.get<User>('user')
   */
  const get = <T>(key: string) => {
    const item = localStorage.getItem(key)
    if (!item) return null
    try {
      return JSON.parse(item) as T
    } catch {
      return item as unknown as T
    }
  }

  /**
   * Écrit une valeur dans le localStorage (sérialisée en JSON).
   * @example storage.set('token', 'eyJ...')
   * @example storage.set('user', { id: 1, email: '...' })
   */
  const set = <T>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  /**
   * Supprime une ou plusieurs clés du localStorage.
   * @example storage.remove('token', 'user')
   */
  const remove = (...keys: string[]) => {
    keys.forEach((key) => localStorage.removeItem(key))
  }

  return { get, set, remove }
}
