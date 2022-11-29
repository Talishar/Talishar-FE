export default interface CardText {
  cardNumber: string; // Card number = card ID (e.g. WTR000 = Heart of Fyendal)
  name: string; // name of the card, e.g Heart of Fyendal
  pitchValue: number; // how much does it pitch for? 0 = grey, 1 = red, 2 = yellow, 3 = blue.
}
