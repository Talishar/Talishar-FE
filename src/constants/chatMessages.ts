/**
 * Map of quick chat option numbers to their message text
 * Used for sending quick chat messages in game
 */
export const CHAT_WHEEL = new Map<number, string>([
  [1, 'Hello'],
  [2, 'Good luck, have fun'],
  [3, 'Are you there?'],
  [4, 'Be right back'],
  [5, 'Can I undo?'],
  [6, 'Thanks for the game!'],
  [7, 'No problem!'],
  [8, 'Thinking... Please bear with me!'],
  [9, 'Sorry'],
  [10, 'Do you want to undo?'],
  [11, 'Good Game!'],
  [12, 'I have to go'],
  [13, 'I think there is a bug'],
  [14, 'No thanks'],
  [15, 'Okay!'],
  [16, 'Refresh the page'],
  [17, 'Rematch?'],
  [18, 'Thanks!'],
  [19, 'That was really cool!'],
  [20, 'Want to Chat?'],
  [21, 'Well played!'],
  [22, 'Whoops!'],
  [23, 'Yes']
]);

/**
 * Create a reverse mapping from message text to quick chat option number
 */
export const messageToQuickChat = (): Record<string, string> => {
  const map: Record<string, string> = {};
  CHAT_WHEEL.forEach((message, optionNumber) => {
    map[message] = String(optionNumber);
  });
  return map;
};
