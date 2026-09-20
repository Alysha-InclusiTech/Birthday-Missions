// Seed data for the 27 Birthday Missions.
// Points scale with tag difficulty: Easy Mode < Explorer < Challenge < Chaos < Final Boss.
const POINTS = {
  'Easy Mode': 5,
  Explorer: 10,
  Challenge: 15,
  Chaos: 20,
  'Final Boss': 40,
};

const raw = [
  // Easy Mode (7)
  ['Easy Mode', 'Birthday Selfie', 'Take a selfie with the birthday person wearing a party hat.'],
  ['Easy Mode', 'Sign the Card', 'Write a heartfelt (or hilarious) message in the birthday card and photograph it.'],
  ['Easy Mode', 'Cheers!', 'Raise a glass and get a photo of the toast.'],
  ['Easy Mode', 'Candle Power', 'Capture a video of the birthday candles being blown out.'],
  ['Easy Mode', 'Gift Wrap Fail', 'Show off the worst-wrapped gift on the table.'],
  ['Easy Mode', 'Party Playlist', 'Get a video of everyone singing along to one song from the party playlist.'],
  ['Easy Mode', 'Decoration Duty', 'Photograph yourself hanging at least one balloon or streamer.'],

  // Explorer (7)
  ['Explorer', 'Snack Hunt', 'Find and photograph three different snacks hidden around the venue.'],
  ['Explorer', 'Neighborhood Scout', 'Take a photo outside a nearby landmark, shop, or park within a 10 minute walk.'],
  ['Explorer', 'Guest Bingo', 'Get a photo with three different guests you haven’t talked to yet tonight.'],
  ['Explorer', 'Menu Detective', 'Track down and photograph the birthday person’s favorite food or drink at the party.'],
  ['Explorer', 'Photo Booth Corner', 'Find or build a makeshift photo booth spot and take a group picture in it.'],
  ['Explorer', 'Old Memory', 'Dig up an old photo of the birthday person and get a video reaction from them seeing it.'],
  ['Explorer', 'Room Tour', 'Record a 15-second tour of the party venue narrated like a nature documentary.'],

  // Challenge (6)
  ['Challenge', 'Dance Battle', 'Record a 20-second dance-off between two guests.'],
  ['Challenge', 'Trivia Time', 'Ask the birthday person three trivia questions about their own life and film their answers.'],
  ['Challenge', 'Human Pyramid', 'Attempt (safely!) a 3-person human pyramid and get it on video.'],
  ['Challenge', 'Tongue Twister', 'Film someone attempting a birthday-themed tongue twister three times fast.'],
  ['Challenge', 'Blindfolded Cake Feed', 'Blindfold a volunteer and film them being fed a bite of cake by someone else.'],
  ['Challenge', 'Speed Wrap', 'Time yourself wrapping a gift in under 60 seconds and film the countdown.'],

  // Chaos (5)
  ['Chaos', 'Icing on Someone’s Face', 'Get a dab of frosting onto someone’s nose (with consent!) and photograph the aftermath.'],
  ['Chaos', 'Costume Swap', 'Swap an item of clothing or an accessory with another guest and take a photo of the new look.'],
  ['Chaos', 'Balloon Pop Surprise', 'Pop a balloon with a hidden dare inside and film the reaction to the dare.'],
  ['Chaos', 'Musical Chairs Mayhem', 'Organize a mini round of musical chairs with at least 4 players and film the final round.'],
  ['Chaos', 'Impromptu Toast Roast', 'Deliver a 30-second improvised roast-toast for the birthday person and film it.'],

  // Final Boss (2)
  ['Final Boss', 'The Ultimate Group Video', 'Gather every single guest at the party into one video shouting "Happy Birthday!" together.'],
  ['Final Boss', 'Birthday Speech Showdown', 'Film the birthday person giving an unscripted 60-second speech about the best part of their year.'],
];

const missions = raw.map(([tag, title, description], index) => ({
  number: index + 1,
  tag,
  title,
  description,
  points: POINTS[tag],
}));

module.exports = { missions, POINTS };
