export interface Card {
  cardNumber: string; // Card number = card ID (e.g. WTR000 = Heart of Fyendal)
  action?: number; // action = (ProcessInput2 mode)
  overlay?: 'none' | 'disabled'; // overlay = 0 is none, 1 is grayed out/disabled
  borderColor?: string; // borderColor = Border Color
  counters?: number; // Counters = number of counters
  actionDataOverride?: string; // actionDataOverride = The value to give to ProcessInput2
  lifeCounters?: number; // lifeCounters = Number of life counters
  defCounters?: number; // defCounters = Number of defense counters
  atkCounters?: number; // atkCounters = Number of attack counters
  controller?: number; // controller = Player that controls it (maybe enum?)
  type?: string; // type = card type
  sType?: string; // sType = card subtype
  restriction?: string; // restriction = something preventing the card from being played (or "" if nothing)
  isBroken?: boolean; // isBroken = 1 if card is destroyed
  onChain?: boolean; // onChain = 1 if card is on combat chain (mostly for equipment)
  isFrozen?: boolean; // isFrozen = 1 if frozen
  gem?: 'none' | 'inactive' | 'active'; // gem = (0, 1, 2?)
  cardIndex?: number;
  countersMap?: { [key: string]: number }; // string = name of counter, number = number of counters
  label?: string;
  zone?: string;
  facing?: 'UP' | 'DOWN' | 'DOWNALL';
  layer?: number; // layer ID number
  reorderable?: boolean; // can be reordered in the active layers window
  numUses?: number; //How many uses it has remaining (number of weapon attacks for example)
  subcards?: string[]; //What cards are under this one? (For example, Material cards)
}
