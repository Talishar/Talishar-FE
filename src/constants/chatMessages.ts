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
  [6, 'Do you want to undo?'],
  [7, 'Good game!'],
  [8, 'Got to go'],
  [9, 'I think there is a bug'],
  [10, 'No'],
  [11, 'No problem!'],
  [12, 'Okay!'],
  [13, 'Refresh the page'],
  [14, 'Rematch?'],
  [15, 'Sorry!'],
  [16, 'Thanks!'],
  [17, 'That was really cool!'],
  [18, 'Thinking... Please bear with me!'],
  [19, 'Want to Chat?'],
  [20, 'Whoops!'],
  [21, 'Yes']
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
