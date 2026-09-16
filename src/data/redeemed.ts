// ─────────────────────────────────────────────────────────────
// Redeemed Events — single source of truth for all demo data
// ─────────────────────────────────────────────────────────────

export const IMG = {
  conference: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591489307_95d7dbd0.jpg',
  conferenceAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591490366_067bee9b.jpg',
  gala: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591513423_1262b702.jpg',
  galaAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591508258_d95fa6a7.jpg',
  worship: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591534180_be5e0d86.jpg',
  worshipAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591534220_5283d058.jpg',
  outdoor: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591549811_ff83af7a.jpg',
  outdoorAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591550389_b916159d.jpg',
  summit: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591571830_1d3dc961.jpg',
  summitAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591573902_501f65ed.jpg',
  stage: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591587768_28ae3949.jpg',
  stageAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591589499_e8d0626c.jpg',
  dinner: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591631160_e298f6c1.jpg',
  dinnerAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591632668_3129e3fd.jpg',
  venue: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591651455_422613a2.jpg',
  venueAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591653079_85892714.jpg',
  mark: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591667218_db8027cd.jpg',
  markAlt: 'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591668753_dabed309.jpg',
};

export const PORTRAITS = [
  'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591609629_88b49606.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591608426_238e8b35.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591613233_033b4083.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591613402_0f50a518.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591613781_e4598089.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6aaaff412da03efcb2cca2ff_1789591615536_3652f614.jpg',
];

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  perks: string[];
  remaining: number;
  badge?: string;
}

export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  organizerImage: string;
  category: 'Conference' | 'Music' | 'Community' | 'Dinner';
  dateLabel: string;
  dayShort: string;
  dayNum: string;
  timeLabel: string;
  venue: string;
  address: string;
  city: string;
  image: string;
  imageAlt: string;
  fromPrice: number;
  about: string;
  tagline: string;
  tags: string[];
  tickets: TicketTier[];
  placement: 'tables' | 'general';
  attending: number;
}

export const USER = {
  name: 'Maya Johnson',
  first: 'Maya',
  email: 'maya@example.com',
  phone: '+1 (404) 555-0139',
  avatar: PORTRAITS[0],
  city: 'Atlanta, GA',
  member: 'Member since 2023',
};

export const ORGANIZER_USER = {
  name: 'Alex Rivera',
  first: 'Alex',
  role: 'Director of Events · Redeemed Collective',
  avatar: PORTRAITS[3],
};

export const EVENTS: EventItem[] = [
  {
    id: 'redeem-2026',
    title: 'Redeem Conference 2026',
    organizer: 'Redeemed Collective',
    organizerImage: IMG.mark,
    category: 'Conference',
    dateLabel: 'September 24–26, 2026',
    dayShort: 'SEP',
    dayNum: '24',
    timeLabel: '9:00 AM – 8:00 PM',
    venue: 'Atlanta Convention Center',
    address: '285 Andrew Young International Blvd NW',
    city: 'Atlanta, GA',
    image: IMG.conference,
    imageAlt: IMG.stage,
    fromPrice: 79,
    tagline: 'Leadership • Community',
    about:
      'Three days built for the people who carry the weight of a room. Redeem Conference gathers 1,200 leaders, creatives and community builders for main-stage teaching, intimate breakout labs and late-night table conversations that actually go somewhere. Expect honest rooms, generous people and a city that shows up.',
    tags: ['Leadership', 'Community', '3 Days'],
    placement: 'general',
    attending: 1248,
    tickets: [
      { id: 'ga', name: 'General Admission', price: 79, remaining: 212, perks: ['All 3 main-stage sessions', 'Access to breakout labs', 'Digital session library'] },
      { id: 'premium', name: 'Premium', price: 149, remaining: 48, badge: 'Most popular', perks: ['Reserved center seating', 'Friday welcome reception', 'Printed conference journal', 'Early room entry'] },
      { id: 'vip', name: 'VIP Experience', price: 249, remaining: 9, badge: 'Almost gone', perks: ['Front-row reserved seat', 'Speaker dinner Thursday', 'Backstage lounge access', 'Curated gift set'] },
    ],
  },
  {
    id: 'light-sound',
    title: 'Light & Sound Worship Night',
    organizer: 'Redeemed Collective',
    organizerImage: IMG.markAlt,
    category: 'Music',
    dateLabel: 'October 11, 2026',
    dayShort: 'OCT',
    dayNum: '11',
    timeLabel: '7:30 PM – 10:00 PM',
    venue: 'The Eastern',
    address: '777 Memorial Dr SE',
    city: 'Atlanta, GA',
    image: IMG.worship,
    imageAlt: IMG.worshipAlt,
    fromPrice: 35,
    tagline: 'Live • Immersive',
    about:
      'A single room, a full band and two and a half hours of nothing but sound. Light & Sound is an immersive worship night designed around a 360° light rig and a resident 14-piece ensemble. Doors at 6:45 PM, no opener, no filler.',
    tags: ['Live Band', 'Immersive', 'All Ages'],
    placement: 'general',
    attending: 860,
    tickets: [
      { id: 'ga', name: 'General Admission', price: 35, remaining: 340, perks: ['Standing floor access', 'Digital live recording'] },
      { id: 'premium', name: 'Premium Balcony', price: 65, remaining: 62, badge: 'Best view', perks: ['Reserved balcony seat', 'Early entry at 6:30 PM', 'Signed set list'] },
    ],
  },
  {
    id: 'gathering-atl',
    title: 'The Gathering ATL',
    organizer: 'Common Ground ATL',
    organizerImage: PORTRAITS[2],
    category: 'Community',
    dateLabel: 'September 19, 2026',
    dayShort: 'SEP',
    dayNum: '19',
    timeLabel: '5:00 PM – 9:00 PM',
    venue: 'Historic Fourth Ward Park',
    address: '680 Dallas St NE',
    city: 'Atlanta, GA',
    image: IMG.outdoor,
    imageAlt: IMG.outdoorAlt,
    fromPrice: 0,
    tagline: 'Free • Outdoors',
    about:
      'Long tables, local kitchens and a neighborhood that actually talks to each other. The Gathering ATL is a free monthly community dinner in the park with live acoustic sets, a kids corner and food from six rotating Atlanta chefs.',
    tags: ['Free Entry', 'Family', 'Outdoors'],
    placement: 'general',
    attending: 430,
    tickets: [
      { id: 'ga', name: 'Free RSVP', price: 0, remaining: 118, perks: ['Entry for one', 'Community dinner seating'] },
      { id: 'supporter', name: 'Supporter', price: 25, remaining: 90, perks: ['Entry for one', 'Covers a neighbor’s meal', 'Reserved table seating'] },
    ],
  },
  {
    id: 'women-purpose',
    title: 'Women of Purpose Summit',
    organizer: 'Purpose House',
    organizerImage: PORTRAITS[4],
    category: 'Conference',
    dateLabel: 'November 7, 2026',
    dayShort: 'NOV',
    dayNum: '07',
    timeLabel: '10:00 AM – 5:00 PM',
    venue: 'The Estate Buckhead',
    address: '3109 Piedmont Rd NE',
    city: 'Atlanta, GA',
    image: IMG.summit,
    imageAlt: IMG.summitAlt,
    fromPrice: 95,
    tagline: 'Summit • Brunch',
    about:
      'A one-day summit for women building something that matters — companies, ministries, families, neighborhoods. Six speakers, a seated brunch and a room of 300 women who came to be useful to each other.',
    tags: ['Seated Brunch', 'Mentorship', '300 Guests'],
    placement: 'tables',
    attending: 296,
    tickets: [
      { id: 'ga', name: 'Summit Seat', price: 95, remaining: 74, perks: ['All sessions', 'Seated brunch', 'Summit workbook'] },
      { id: 'premium', name: 'Premium Table', price: 165, remaining: 22, badge: 'Reserved table', perks: ['Reserved front table', 'Mentor round-table', 'Gift set'] },
    ],
  },
  {
    id: 'impact-dinner',
    title: 'Community Celebration Dinner',
    organizer: 'Redeemed Collective',
    organizerImage: IMG.mark,
    category: 'Dinner',
    dateLabel: 'September 25, 2026',
    dayShort: 'SEP',
    dayNum: '25',
    timeLabel: '6:30 PM – 10:00 PM',
    venue: 'Atlanta Convention Center · Hall C',
    address: '285 Andrew Young International Blvd NW',
    city: 'Atlanta, GA',
    image: IMG.gala,
    imageAlt: IMG.galaAlt,
    fromPrice: 120,
    tagline: 'Seated • Black tie optional',
    about:
      'The centerpiece evening of Redeem week. Ninety-six guests, twelve round tables, a four-course seated dinner and stories from the neighborhoods your ticket supports. Choose your table when you check out.',
    tags: ['Seated Dinner', '12 Tables', 'Live Strings'],
    placement: 'tables',
    attending: 91,
    tickets: [
      { id: 'seat', name: 'Individual Seat', price: 120, remaining: 14, perks: ['Four-course dinner', 'Choose your table', 'Program keepsake'] },
      { id: 'premium', name: 'Premium Seat', price: 185, remaining: 8, badge: 'Near stage', perks: ['Priority table selection', 'Wine pairing', 'Host reception at 6:00 PM'] },
      { id: 'table', name: 'Full Table of 8', price: 1200, remaining: 3, perks: ['Entire reserved table', 'Named table signage', 'Dedicated table host'] },
    ],
  },
  {
    id: 'next-gen',
    title: 'Next Generation Leadership Forum',
    organizer: 'Civic Futures',
    organizerImage: PORTRAITS[5],
    category: 'Conference',
    dateLabel: 'October 24, 2026',
    dayShort: 'OCT',
    dayNum: '24',
    timeLabel: '9:00 AM – 4:00 PM',
    venue: 'Georgia Tech Exhibition Hall',
    address: '460 4th St NW',
    city: 'Atlanta, GA',
    image: IMG.conferenceAlt,
    imageAlt: IMG.stageAlt,
    fromPrice: 45,
    tagline: 'Forum • Ages 18–30',
    about:
      'A working forum for leaders under 30. Morning case sessions with city leaders, an afternoon of hands-on civic labs, and a closing panel with three founders who started before they felt ready.',
    tags: ['Under 30', 'Civic Labs', 'Lunch Included'],
    placement: 'general',
    attending: 512,
    tickets: [
      { id: 'student', name: 'Student', price: 45, remaining: 160, perks: ['All sessions', 'Lunch included', 'Valid student ID required'] },
      { id: 'ga', name: 'General Admission', price: 85, remaining: 210, perks: ['All sessions', 'Lunch included', 'Civic lab materials'] },
    ],
  },
  {
    id: 'founders-table',
    title: 'The Founders Table',
    organizer: 'Common Ground ATL',
    organizerImage: PORTRAITS[1],
    category: 'Dinner',
    dateLabel: 'September 20, 2026',
    dayShort: 'SEP',
    dayNum: '20',
    timeLabel: '7:00 PM – 10:30 PM',
    venue: 'Mercer Room, Ponce City Market',
    address: '675 Ponce De Leon Ave NE',
    city: 'Atlanta, GA',
    image: IMG.dinner,
    imageAlt: IMG.dinnerAlt,
    fromPrice: 140,
    tagline: 'Intimate • 24 seats',
    about:
      'Twenty-four seats, one table, no name tags. A quiet dinner for founders and operators, hosted family-style with three guided conversations and a chef who cooks in front of you.',
    tags: ['24 Seats', 'Family Style', 'No Pitching'],
    placement: 'tables',
    attending: 24,
    tickets: [
      { id: 'seat', name: 'Single Seat', price: 140, remaining: 6, perks: ['Family-style dinner', 'Guided conversation', 'Wine included'] },
      { id: 'pair', name: 'Seat for Two', price: 260, remaining: 4, badge: 'Bring a peer', perks: ['Two adjacent seats', 'Wine included'] },
    ],
  },
];

export const featuredEvent = EVENTS[0];
export const dinnerEvent = EVENTS[4];

export const CATEGORIES = ['For You', 'Music', 'Community', 'Conference', 'Dinner'] as const;

export const ORGANIZERS = [
  { name: 'Redeemed Collective', image: IMG.mark, followers: '18.4k', events: 26 },
  { name: 'Common Ground ATL', image: PORTRAITS[2], followers: '6.1k', events: 14 },
  { name: 'Purpose House', image: PORTRAITS[4], followers: '9.7k', events: 11 },
];

export const GUESTS = [
  { name: 'Dr. Naomi Clarke', role: 'Opening Keynote', image: PORTRAITS[4] },
  { name: 'Marcus Bell', role: 'Leadership Lab', image: PORTRAITS[1] },
  { name: 'Priya Raman', role: 'Panel Host', image: PORTRAITS[2] },
  { name: 'Elijah Grant', role: 'Worship Direction', image: PORTRAITS[5] },
  { name: 'Simone Adeyemi', role: 'Closing Night', image: PORTRAITS[0] },
];

export const AGENDA = [
  { time: '8:00 AM', title: 'Doors & Coffee Hall', detail: 'Level 2 atrium · local roasters', accent: false },
  { time: '9:00 AM', title: 'Opening Keynote', detail: 'Dr. Naomi Clarke · Main Stage', accent: true },
  { time: '10:45 AM', title: 'Leadership Labs', detail: 'Six concurrent breakout rooms', accent: false },
  { time: '12:30 PM', title: 'Table Lunch', detail: 'Assigned tables · Hall C', accent: false },
  { time: '2:00 PM', title: 'Panel: Building in Public', detail: 'Priya Raman + three founders', accent: false },
  { time: '4:30 PM', title: 'Community Hour', detail: 'Open rooms, no agenda', accent: false },
  { time: '6:30 PM', title: 'Celebration Dinner', detail: 'Hall C · assigned seating', accent: true },
];

// ── Seating ──────────────────────────────────────────────────
export interface TableSeat {
  id: number;
  label: string;
  seats: number;
  taken: number;
  note: string;
  guests: string[];
}

export const TABLES: TableSeat[] = [
  { id: 1, label: 'Table 1', seats: 8, taken: 6, note: 'Near stage · Great view', guests: ['Alicia R.', 'Dev P.', 'Naomi C.'] },
  { id: 2, label: 'Table 2', seats: 8, taken: 8, note: 'Near stage', guests: ['Marcus B.', 'Tia W.', 'Owen L.'] },
  { id: 3, label: 'Table 3', seats: 8, taken: 3, note: 'Center floor', guests: ['Jordan M.', 'Renee K.'] },
  { id: 4, label: 'Table 4', seats: 8, taken: 7, note: 'Center floor', guests: ['Priya R.', 'Sam O.', 'Lena F.'] },
  { id: 5, label: 'Table 5', seats: 8, taken: 8, note: 'Aisle access', guests: ['Caleb D.', 'Mia S.', 'Andre T.'] },
  { id: 6, label: 'Table 6', seats: 8, taken: 4, note: 'Quiet corner', guests: ['Grace H.', 'Noah B.'] },
  { id: 7, label: 'Table 7', seats: 8, taken: 3, note: 'Near stage · Great view', guests: ['Jordan M.', 'Chris A.', 'Simone A.'] },
  { id: 8, label: 'Table 8', seats: 8, taken: 6, note: 'Center floor', guests: ['Elijah G.', 'Kara N.', 'Ruth M.'] },
  { id: 9, label: 'Table 9', seats: 8, taken: 2, note: 'Back of hall', guests: ['Theo W.'] },
  { id: 10, label: 'Table 10', seats: 8, taken: 8, note: 'Aisle access', guests: ['Bianca L.', 'Wes A.', 'Omar H.'] },
  { id: 11, label: 'Table 11', seats: 8, taken: 5, note: 'Back of hall', guests: ['Dana V.', 'Isaac Y.'] },
  { id: 12, label: 'Table 12', seats: 8, taken: 1, note: 'Quiet corner', guests: ['Nadia P.'] },
];

export type TableState = 'available' | 'almost' | 'full' | 'selected';

export function tableState(t: TableSeat, selectedId: number | null): TableState {
  if (selectedId === t.id) return 'selected';
  const left = t.seats - t.taken;
  if (left <= 0) return 'full';
  if (left <= 2) return 'almost';
  return 'available';
}

// ── Attendees ────────────────────────────────────────────────
export interface Attendee {
  id: string;
  name: string;
  email: string;
  tier: 'General' | 'Premium' | 'VIP';
  table: number | null;
  checkedIn: boolean;
  time?: string;
  avatar: string;
  paid: string;
}

const names = [
  'Maya Johnson', 'Jordan Mitchell', 'Chris Aldridge', 'Simone Adeyemi', 'Marcus Bell',
  'Priya Raman', 'Devon Parks', 'Renee Kim', 'Caleb Dunn', 'Grace Hollis',
  'Andre Thomas', 'Lena Ferrell', 'Noah Bright', 'Tia Walker', 'Omar Haddad',
  'Bianca Lowe', 'Theo Winters', 'Nadia Price', 'Isaac Yates', 'Dana Vega',
];

export const ATTENDEES: Attendee[] = names.map((name, i) => ({
  id: `RE-8261${(94 + i).toString()}`,
  name,
  email: `${name.split(' ')[0].toLowerCase()}@example.com`,
  tier: i % 7 === 1 ? 'VIP' : i % 3 === 0 ? 'Premium' : 'General',
  table: i === 0 ? 7 : i === 1 ? 3 : i > 15 ? null : ((i % 12) + 1),
  checkedIn: i % 3 !== 1,
  time: i % 3 !== 1 ? ['9:42 AM', '9:18 AM', '8:55 AM', '10:04 AM', '9:31 AM'][i % 5] : undefined,
  avatar: PORTRAITS[i % PORTRAITS.length],
  paid: i % 9 === 4 ? 'Refunded' : 'Paid',
}));

// ── Organizer metrics ───────────────────────────────────────
export const KPIS = {
  sold: 1248,
  revenue: 94720,
  checkedIn: 842,
  capacityPct: 72,
  goal: 1730,
};

export const REVENUE_SERIES: Record<'Week' | 'Month' | 'Year', { label: string; value: number }[]> = {
  Week: [
    { label: 'Mon', value: 4200 }, { label: 'Tue', value: 6100 }, { label: 'Wed', value: 5400 },
    { label: 'Thu', value: 9300 }, { label: 'Fri', value: 12800 }, { label: 'Sat', value: 15200 },
    { label: 'Sun', value: 8700 },
  ],
  Month: [
    { label: 'W1', value: 12400 }, { label: 'W2', value: 18600 }, { label: 'W3', value: 24100 },
    { label: 'W4', value: 39620 },
  ],
  Year: [
    { label: 'Apr', value: 9200 }, { label: 'May', value: 14100 }, { label: 'Jun', value: 21800 },
    { label: 'Jul', value: 18400 }, { label: 'Aug', value: 32600 }, { label: 'Sep', value: 47300 },
  ],
};

export const ORG_EVENTS = {
  Upcoming: [
    { id: 'redeem-2026', title: 'Redeem Conference 2026', date: 'Sep 24–26', sold: 1248, cap: 1730, image: IMG.conference, status: 'On sale' },
    { id: 'impact-dinner', title: 'Community Celebration Dinner', date: 'Sep 25', sold: 91, cap: 96, image: IMG.gala, status: 'Nearly full' },
    { id: 'light-sound', title: 'Light & Sound Worship Night', date: 'Oct 11', sold: 860, cap: 1200, image: IMG.worship, status: 'On sale' },
  ],
  Past: [
    { id: 'gathering-aug', title: 'The Gathering ATL · August', date: 'Aug 15', sold: 430, cap: 450, image: IMG.outdoor, status: 'Completed' },
    { id: 'summit-25', title: 'Women of Purpose Summit 2025', date: 'Nov 8, 2025', sold: 288, cap: 300, image: IMG.summit, status: 'Completed' },
  ],
  Drafts: [
    { id: 'founders-table', title: 'The Founders Table · Fall', date: 'Date not set', sold: 0, cap: 24, image: IMG.dinner, status: 'Draft' },
  ],
};

export const NOTIFICATIONS = [
  { id: 1, kind: 'seat', title: 'Your table is confirmed', body: 'You’re seated at Table 7 for the Community Celebration Dinner.', time: '12m ago', unread: true },
  { id: 2, kind: 'reminder', title: 'Event starts tomorrow', body: 'Redeem Conference begins tomorrow at 9:00 AM. Doors open at 8:00.', time: '2h ago', unread: true },
  { id: 3, kind: 'new', title: 'New event from Redeemed Collective', body: 'The Gathering ATL is now live. Free RSVP closes Friday.', time: 'Yesterday', unread: false },
  { id: 4, kind: 'wallet', title: 'Receipt · $158.62', body: 'Premium ticket for Redeem Conference 2026. Card ending 4242.', time: '2 days ago', unread: false },
];

export const PAYMENT_HISTORY = [
  { id: 'RE-826194', event: 'Redeem Conference 2026', amount: 158.62, date: 'Sep 12, 2026', method: 'Apple Pay' },
  { id: 'RE-811420', event: 'Light & Sound Worship Night', amount: 70.9, date: 'Aug 30, 2026', method: 'Visa · 4242' },
  { id: 'RE-798013', event: 'The Gathering ATL · August', amount: 25.0, date: 'Aug 2, 2026', method: 'Visa · 4242' },
];

export const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;

export const SERVICE_FEE_RATE = 0.0645;
