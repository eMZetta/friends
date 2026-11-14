// Alles, was Galip von sich aus oder auf Antippen tun kann (zusätzlich zu Laufen, Freuen und Schüchternsein).
// Vorne: er sitzt und macht etwas. Seitlich: er ist unterwegs und bleibt kurz stehen.
export type GalipAction =
  | 'tilt' // Kopf neugierig schief legen
  | 'yawn' // gähnen
  | 'lie' // hinlegen
  | 'sleep' // schlafen (mit Zzz)
  | 'shake' // sich schütteln
  | 'beg' // Männchen machen
  | 'spin' // sich auf der Stelle drehen
  | 'jump' // Freudensprung
  | 'sniff' // schnüffeln (Seitenansicht)
  | 'bow' // Spielaufforderung: Vorderkörper runter, Hinterteil hoch (Seitenansicht)

/** Kleine Kunststücke, die beim Antippen drankommen. */
export const TRICKS: GalipAction[] = ['jump', 'spin', 'beg', 'shake', 'tilt']

/** Sachen, die er im Sitzen von allein macht, wenn es ruhig ist. */
export const IDLE_ACTIONS: GalipAction[] = ['tilt', 'tilt', 'yawn', 'shake', 'beg', 'jump', 'spin']

/** Wie lange jede Aktion läuft (Millisekunden), bevor Galip wieder normal dasitzt. */
export const ACTION_MS: Record<GalipAction, number> = {
  tilt: 2600,
  yawn: 2800,
  lie: 2200,
  sleep: 5000,
  shake: 1500,
  beg: 2600,
  spin: 1700,
  jump: 1500,
  sniff: 2400,
  bow: 2200,
}
