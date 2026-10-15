// Walks through the app the way a child and a parent would.

const GAMES = ['shapes', 'count', 'balloons', 'animals', 'memory', 'patterns', 'music', 'shadows', 'sizes', 'paint', 'letters']

describe('Galip', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('lumi.settings', JSON.stringify({ lang: 'de' }))
        // Skip the first-time hand demo so it doesn't cover the screen.
        win.localStorage.setItem('lumi.seenGames', JSON.stringify(GAMES))
      },
    })
  })

  it('shows a tile for every game', () => {
    cy.get('.tile').should('have.length', GAMES.length)
  })

  it('opens every game and leaves it by holding the home button', () => {
    for (const game of GAMES) {
      cy.visit(`/#/play/${game}`)
      cy.get('.shell').should('exist')
      // During the page transition the old and the new screen are both there for a moment.
      cy.get('.round-btn.home').should('have.length', 1).trigger('pointerdown', { force: true })
      cy.location('hash', { timeout: 4000 }).should('eq', '#/')
    }
  })

  it('does not leave a game on a short tap of the home button', () => {
    cy.get('.tile').first().click()
    cy.get('.round-btn.home').should('have.length', 1).trigger('pointerdown', { force: true })
    cy.get('.round-btn.home').trigger('pointerup', { force: true })
    cy.location('hash').should('include', '/play/')
  })

  it('hides a game from the home screen via the parent area', () => {
    cy.contains('button', 'Für Eltern').click()
    // The gate shows the number spelled out; read it and type it in.
    cy.get('.words')
      .invoke('text')
      .then((words) => {
        const number = NUMBERS[words.trim()]
        if (number === undefined) throw new Error(`Unknown gate number: ${words.trim()}`)
        for (const digit of String(number)) cy.get('.keypad button').contains(digit).click()
      })
    cy.contains('h2', 'Einstellungen')
    cy.contains('.chips button', 'Memory').click()
    cy.contains('button', 'Schließen').click()
    cy.get('.tile').should('have.length', GAMES.length - 1)
  })

  it('locks the parent gate after three wrong answers', () => {
    cy.contains('button', 'Für Eltern').click()
    for (let i = 0; i < 3; i++) {
      // The gate only asks for numbers from 21 up, so 10 is always wrong.
      for (const digit of '10') cy.get('.keypad button').contains(digit).click()
      // After the last wrong answer the keypad is replaced by the lock message.
      if (i < 2) cy.get('.entry').should('not.have.class', 'shake')
    }
    cy.contains('Zu viele Versuche')
  })
})

// Spelled-out German numbers 21–99 as the gate shows them.
const ones = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
const tens = ['', 'zehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']
const NUMBERS: Record<string, number> = {}
for (let t = 2; t <= 9; t++) {
  for (let o = 1; o <= 9; o++) NUMBERS[`${ones[o]}und${tens[t]}`] = t * 10 + o
}
