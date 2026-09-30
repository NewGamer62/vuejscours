/**
 * Règles et fonctions pures de validation pour le jeu en temps réel (Ticket 3)
 */

/**
 * RG4 & RG6 : Le bouton Piocher est actif uniquement si :
 * - C'est le tour du joueur
 * - La main contient strictement moins de 5 cartes
 * - Le deck contient au moins 1 carte
 */
export function canDrawCard(
  isMyTurn: boolean,
  handCount: number,
  deckCount: number,
): boolean {
  if (!isMyTurn) return false
  if (handCount >= 5) return false
  if (deckCount <= 0) return false
  return true
}

/**
 * RG5 & RG6 : Le bouton Attaquer est actif uniquement si :
 * - C'est le tour du joueur
 * - Le joueur a une carte active sur le plateau
 * - L'adversaire a une carte active sur le plateau
 */
export function canAttack(
  isMyTurn: boolean,
  hasMyActiveCard: boolean,
  hasOpponentActiveCard: boolean,
): boolean {
  if (!isMyTurn) return false
  if (!hasMyActiveCard || !hasOpponentActiveCard) return false
  return true
}

/**
 * RG2 (Main) : Un clic sur une carte en main ne la joue que si :
 * - C'est le tour du joueur
 * - Le joueur n'a AUCUNE carte active actuellement sur le plateau
 */
export function canPlayCardFromHand(
  isMyTurn: boolean,
  hasMyActiveCard: boolean,
): boolean {
  return Boolean(isMyTurn && !hasMyActiveCard)
}

/**
 * RG6 : Fin de tour n'est actif que si c'est le tour du joueur
 */
export function canEndTurn(isMyTurn: boolean): boolean {
  return Boolean(isMyTurn)
}

/**
 * Détermine si la partie est terminée par KOs (3 KOs requis pour la victoire)
 */
export function checkGameEndByScore(
  playerScore: number,
  opponentScore: number,
): { isEnded: boolean; winnerRole: 'player' | 'opponent' | null } {
  if (playerScore >= 3) {
    return { isEnded: true, winnerRole: 'player' }
  }
  if (opponentScore >= 3) {
    return { isEnded: true, winnerRole: 'opponent' }
  }
  return { isEnded: false, winnerRole: null }
}

/**
 * Calcule le pourcentage de PV restants (entre 0 et 100)
 */
export function calculateHpPercentage(
  currentHp: number,
  maxHp: number,
): number {
  if (maxHp <= 0) return 0
  const pct = Math.round((currentHp / maxHp) * 100)
  return Math.max(0, Math.min(100, pct))
}
