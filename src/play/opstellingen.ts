/**
 * Beginstellingen per tegenstander.
 *
 * De eerste tegenstanders spelen niet met een volledig bord: een partij met 32 stukken
 * is voor een zesjarige geen oefening maar een chaos. Het pionnenspel is de klassieke
 * eerste "echte" partij — alleen pionnen, en wie het eerst de overkant haalt, wint.
 *
 * chess.js eist twee koningen in elke stelling, dus die staan er ook in het pionnenspel
 * bij. Ze doen gewoon mee; dat is didactisch prima.
 */
export type Opstelling = { fen?: string; winBijPromotie?: boolean; uitleg: string }

export const OPSTELLING: Record<string, Opstelling> = {
  mila: {
    fen: '4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1',
    winBijPromotie: true,
    uitleg: 'Het pionnenspel: alleen pionnen en de koningen. Wie het eerst de overkant haalt, wint.',
  },
  kiki: {
    fen: '4k3/3ppp2/8/8/8/8/3PPP2/4K3 w - - 0 1',
    winBijPromotie: true,
    uitleg: 'Drie pionnen en een koning. Kort en overzichtelijk.',
  },
  rens: {
    fen: 'r3k3/3ppp2/8/8/8/8/3PPP2/R3K3 w - - 0 1',
    uitleg: 'Nu ook een toren erbij. Let op je stukken!',
  },
  bas: { uitleg: 'Een gewone partij met alle stukken. Bas kijkt een zetje vooruit.' },
  fien: { uitleg: 'Volledig bord. Fien geeft niet zomaar iets weg.' },
  oscar: { uitleg: 'Volledig bord. Oscar denkt drie zetten vooruit.' },
  bram: { uitleg: 'Volledig bord, en Bram speelt altijd zijn beste zet.' },
  samen: {
    uitleg: 'Een gewone partij, samen op één tablet.',
  },
}
