import { uid, daysFromNow, txnId, orderNumber, computeFees } from '@/lib/helpers';

export const IMAGES = {
  conf: [
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587878818_5b946159.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587878588_8de167df.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587880751_3e07fa5c.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587881099_c86f40e6.jpg',
  ],
  music: [
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587901205_735f0379.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587902166_9617afef.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587901551_8a5e9806.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587904287_4f28e655.jpg',
  ],
  community: [
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587919369_a62dcb2b.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587921253_1eba8f3f.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587921295_433d1747.jpg',
    'https://d64gsuwffb70l.cloudfront.net/6aaaf105eac86ad0a4b6b276_1789587922051_6ef6b9fa.jpg',
  ],
};

const FIRST = ['Sarah', 'David', 'Maria', 'James', 'Grace', 'Michael', 'Ruth', 'Daniel', 'Naomi', 'Peter', 'Hannah', 'Caleb', 'Esther', 'Isaac', 'Leah', 'Samuel', 'Abigail', 'Josiah', 'Tabitha', 'Elijah'];
const LAST = ['Johnson', 'Okafor', 'Reyes', 'Bennett', 'Adeyemi', 'Carter', 'Nguyen', 'Brooks', 'Silva', 'Mensah', 'Patel', 'Torres', 'Hughes', 'Kim', 'Dawson', 'Moreau'];

export const avatar = (name: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5,7c3aed,ea580c,0f766e`;

function person(i: number) {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 7 + 3) % LAST.length];
  const name = `${first} ${last}`;
  return {
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
    phone: `+1 (415) 555-${String(1000 + i).slice(-4)}`,
  };
}

export function buildSeed() {
  const now = new Date().toISOString();

  /* ---------------- Users ---------------- */
  const users: any[] = [
    { id: 'u_attendee', name: 'Ava Thompson', email: 'attendee@demo.redeemedevents.com', password: 'Demo123!', phone: '+1 (415) 555-0110', roles: ['attendee'], avatar: avatar('Ava Thompson'), createdAt: now },
    { id: 'u_org', name: 'Marcus Reed', email: 'organizer@demo.redeemedevents.com', password: 'Demo123!', phone: '+1 (415) 555-0120', roles: ['attendee', 'organizer'], organizerId: 'org_1', avatar: avatar('Marcus Reed'), createdAt: now },
    { id: 'u_staff', name: 'Priya Nair', email: 'staff@demo.redeemedevents.com', password: 'Demo123!', phone: '+1 (415) 555-0130', roles: ['attendee', 'team'], teamMemberId: 'tm_1', organizerId: 'org_1', avatar: avatar('Priya Nair'), createdAt: now },
    { id: 'u_admin', name: 'Jordan Blake', email: 'admin@demo.redeemedevents.com', password: 'Demo123!', phone: '+1 (415) 555-0140', roles: ['attendee', 'admin'], avatar: avatar('Jordan Blake'), createdAt: now },
  ];

  const organizers: any[] = [
    { id: 'org_1', userId: 'u_org', name: 'Redeemed Collective', email: 'hello@redeemedcollective.org', phone: '+1 (415) 555-0120', bio: 'Faith-driven conferences, worship nights and community outreach across the Bay Area.', avatar: avatar('Redeemed Collective'), website: 'redeemedcollective.org', status: 'Active', stripe: { connected: true, accountEmail: 'payouts@redeemedcollective.org', verification: 'Verified', available: 1284500, pending: 316000, schedule: 'Automatic · Daily' }, createdAt: now },
    { id: 'org_2', userId: 'u_org2', name: 'Harbor City Worship', email: 'team@harborcityworship.com', phone: '+1 (206) 555-0144', bio: 'Worship nights and creative arts gatherings.', avatar: avatar('Harbor City Worship'), website: 'harborcityworship.com', status: 'Active', stripe: { connected: true, accountEmail: 'finance@harborcityworship.com', verification: 'Verified', available: 412000, pending: 89000, schedule: 'Automatic · Weekly' }, createdAt: now },
    { id: 'org_3', userId: 'u_org3', name: 'City Serve Network', email: 'connect@cityserve.org', phone: '+1 (312) 555-0199', bio: 'Mobilizing volunteers for city-wide outreach.', avatar: avatar('City Serve Network'), website: 'cityserve.org', status: 'Active', stripe: { connected: false, accountEmail: '', verification: 'Onboarding incomplete', available: 0, pending: 0, schedule: 'Not set' }, createdAt: now },
  ];
  users.push(
    { id: 'u_org2', name: 'Elena Cruz', email: 'elena@harborcityworship.com', password: 'Demo123!', phone: '+1 (206) 555-0144', roles: ['attendee', 'organizer'], organizerId: 'org_2', avatar: avatar('Elena Cruz'), createdAt: now },
    { id: 'u_org3', name: 'Tobi Adeyemi', email: 'tobi@cityserve.org', password: 'Demo123!', phone: '+1 (312) 555-0199', roles: ['attendee', 'organizer'], organizerId: 'org_3', avatar: avatar('Tobi Adeyemi'), createdAt: now }
  );

  const teamMembers: any[] = [
    {
      id: 'tm_1', organizerId: 'org_1', userId: 'u_staff', name: 'Priya Nair', email: 'staff@demo.redeemedevents.com', phone: '+1 (415) 555-0130', status: 'Active',
      permissions: { scan: true, finances: false, attendees: true, announcements: false, editEvent: false, deleteEvent: false, coupon: false, resend: false }, createdAt: now,
    },
    {
      id: 'tm_2', organizerId: 'org_1', userId: null, name: 'Andre Wallace', email: 'andre@redeemedcollective.org', phone: '+1 (415) 555-0161', status: 'Invited',
      permissions: { scan: true, finances: true, attendees: true, announcements: true, editEvent: true, deleteEvent: false, coupon: true, resend: true }, createdAt: now,
    },
  ];

  /* ---------------- Attendee pool ---------------- */
  const attendees: any[] = [];
  for (let i = 0; i < 34; i++) {
    const p = person(i);
    attendees.push({ id: `u_a${i}`, ...p, password: 'Demo123!', roles: ['attendee'], avatar: avatar(p.name), createdAt: now });
  }
  users.push(...attendees);

  /* ---------------- Events ---------------- */
  const events: any[] = [];
  const ticketTypes: any[] = [];
  const questions: any[] = [];

  const mk = (e: any) => { events.push(e); return e; };

  const SHOW = 'evt_showcase';
  mk({
    id: SHOW, organizerId: 'org_1', title: 'Redeemed Leadership Conference 2026', category: 'Conference',
    image: IMAGES.conf[0], gallery: IMAGES.conf,
    capacity: 900, sold: 0, status: 'published',
    description: 'Three days of practical leadership training, worship and connection with leaders from across the nation. Includes plenary sessions, breakout workshops and a seated banquet dinner.',
    startDate: daysFromNow(46, 9), endDate: daysFromNow(48, 21), startTime: '09:00', endTime: '21:00', timezone: 'America/Los_Angeles',
    address: '747 Howard St', city: 'San Francisco', state: 'CA', zip: '94103', venue: 'Moscone Center West',
    externalLink: 'https://redeemedcollective.org/leadership', videos: ['https://youtube.com/watch?v=redeemed2026'],
    socials: { instagram: '@redeemedcollective', facebook: 'redeemedcollective' },
    guests: [
      { id: uid('g'), name: 'Dr. Naomi Ellis', about: 'Author of "Leading From Rest" and executive coach.', photo: avatar('Naomi Ellis'), social: '@naomiellis' },
      { id: uid('g'), name: 'Pastor Andre King', about: 'Lead pastor, Harbor City. Church planting strategist.', photo: avatar('Andre King'), social: '@andreking' },
      { id: uid('g'), name: 'Chidi Okafor', about: 'Nonprofit operations director and speaker.', photo: avatar('Chidi Okafor'), social: '@chidispeaks' },
    ],
    agenda: [
      { id: uid('ag'), title: 'Opening Plenary', guest: 'Dr. Naomi Ellis', startDate: daysFromNow(46, 9), endDate: daysFromNow(46, 9), startTime: '09:00', endTime: '10:30', description: 'Kickoff session and vision casting.' },
      { id: uid('ag'), title: 'Breakout Workshops', guest: 'Multiple', startDate: daysFromNow(46, 11), endDate: daysFromNow(46, 11), startTime: '11:00', endTime: '12:30', description: 'Choose a track: Teams, Finance, or Community.' },
      { id: uid('ag'), title: 'Banquet Dinner', guest: 'Pastor Andre King', startDate: daysFromNow(46, 18), endDate: daysFromNow(46, 18), startTime: '18:00', endTime: '21:00', description: 'Seated dinner with table hosts.' },
    ],
    createdAt: now,
  });
  ticketTypes.push(
    { id: 'tt_ga', eventId: SHOW, title: 'General Admission', price: 4900, quantity: 500, sold: 0, available: true, absorbFees: false, salesStart: daysFromNow(-30), salesStartTime: '09:00', deadline: daysFromNow(45), deadlineTime: '23:59', description: 'Access to all plenary sessions and breakouts.', sortOrder: 0 },
    { id: 'tt_vip', eventId: SHOW, title: 'VIP', price: 9900, quantity: 150, sold: 0, available: true, absorbFees: false, salesStart: daysFromNow(-30), salesStartTime: '09:00', deadline: daysFromNow(45), deadlineTime: '23:59', description: 'Priority seating, banquet dinner and speaker reception.', sortOrder: 1 },
    { id: 'tt_vol', eventId: SHOW, title: 'Volunteer', price: 0, quantity: 100, sold: 0, available: true, absorbFees: true, salesStart: daysFromNow(-30), salesStartTime: '09:00', deadline: daysFromNow(40), deadlineTime: '23:59', description: 'Free entry for approved volunteers. Includes meals.', sortOrder: 2 },
  );
  questions.push(
    { id: 'q_1', eventId: SHOW, type: 'Text', question: 'Church / Organization', options: [], required: true, applyToAll: false },
    { id: 'q_2', eventId: SHOW, type: 'Dropdown', question: 'Meal preference', options: ['Standard', 'Vegetarian', 'Gluten free'], required: true, applyToAll: false },
    { id: 'q_3', eventId: SHOW, type: 'Multiple Choice', question: 'Which breakout track interests you most?', options: ['Teams', 'Finance', 'Community'], required: false, applyToAll: true },
  );

  const others = [
    ['Night of Worship: Harbor City', 'Music', 'org_2', 8, IMAGES.music[0], 'Seattle', 'WA', 'The Paramount', 3500, 400],
    ['City Serve Day', 'Community', 'org_3', 14, IMAGES.community[0], 'Chicago', 'IL', 'Grant Park Pavilion', 0, 600],
    ['Creative Arts Summit', 'Conference', 'org_1', 24, IMAGES.conf[1], 'Austin', 'TX', 'Palmer Center', 7900, 320],
    ['Gospel Choir Festival', 'Music', 'org_2', 33, IMAGES.music[1], 'Atlanta', 'GA', 'Fox Theatre', 4500, 900],
    ['Neighborhood Food Drive', 'Community', 'org_3', 5, IMAGES.community[1], 'Oakland', 'CA', 'Lakeside Hall', 0, 250],
    ['Youth Leaders Intensive', 'Conference', 'org_1', 61, IMAGES.conf[2], 'Denver', 'CO', 'Summit Hall', 5900, 280],
    ['Acoustic Worship Evening', 'Music', 'org_2', 11, IMAGES.music[2], 'Portland', 'OR', 'Revival Room', 2500, 120],
    ['Mentorship Breakfast', 'Community', 'org_1', 19, IMAGES.community[2], 'San Jose', 'CA', 'The Grove', 1500, 90],
    ['Worship Nights: Encore', 'Music', 'org_2', -21, IMAGES.music[3], 'Seattle', 'WA', 'The Paramount', 3500, 400],
    ['Winter Outreach 2025', 'Community', 'org_3', -48, IMAGES.community[3], 'Chicago', 'IL', 'Navy Pier Hall', 0, 500],
    ['Founders Roundtable', 'Conference', 'org_1', 27, IMAGES.conf[3], 'San Francisco', 'CA', 'Pier 27 Loft', 12900, 60],
  ];
  others.forEach((o, idx) => {
    const [title, category, organizerId, offset, image, city, state, venue, price, cap] = o as any;
    const id = `evt_${idx + 2}`;
    const soldOut = idx === 3;
    mk({
      id, organizerId, title, category, image, gallery: [image],
      capacity: cap, sold: soldOut ? cap : Math.floor(cap * 0.35),
      status: 'published',
      description: `${title} brings the community together for an unforgettable experience. Doors open one hour before start time. Accessible seating available on request.`,
      startDate: daysFromNow(offset, 18), endDate: daysFromNow(offset, 22), startTime: '18:00', endTime: '22:00', timezone: 'America/Los_Angeles',
      address: `${100 + idx * 13} Main St`, city, state, zip: `9${4000 + idx}`, venue,
      externalLink: '', videos: [], socials: {}, guests: [], agenda: [], createdAt: now,
    });
    ticketTypes.push({
      id: `tt_${id}_a`, eventId: id, title: price === 0 ? 'Free Registration' : 'General Admission', price, quantity: cap,
      sold: soldOut ? cap : Math.floor(cap * 0.35), available: !soldOut, absorbFees: price === 0,
      salesStart: daysFromNow(-40), salesStartTime: '09:00', deadline: daysFromNow(Math.max(offset - 1, -50)), deadlineTime: '23:59',
      description: 'Standard entry.', sortOrder: 0,
    });
    if (price > 0) {
      ticketTypes.push({
        id: `tt_${id}_b`, eventId: id, title: 'VIP', price: price + 3000, quantity: Math.round(cap * 0.1),
        sold: soldOut ? Math.round(cap * 0.1) : 4, available: !soldOut, absorbFees: false,
        salesStart: daysFromNow(-40), salesStartTime: '09:00', deadline: daysFromNow(Math.max(offset - 1, -50)), deadlineTime: '23:59',
        description: 'Front section + meet & greet.', sortOrder: 1,
      });
    }
  });

  // A draft event
  mk({
    id: 'evt_draft', organizerId: 'org_1', title: 'Fall Prayer Retreat (Draft)', category: 'Community', image: IMAGES.community[2],
    gallery: [], capacity: 120, sold: 0, status: 'draft',
    description: 'Weekend retreat in the redwoods.', startDate: daysFromNow(88, 15), endDate: daysFromNow(90, 12),
    startTime: '15:00', endTime: '12:00', timezone: 'America/Los_Angeles', address: '1 Redwood Rd', city: 'Santa Cruz', state: 'CA', zip: '95060',
    venue: 'Redwood Lodge', externalLink: '', videos: [], socials: {}, guests: [], agenda: [], createdAt: now,
  });
  ticketTypes.push({ id: 'tt_draft_a', eventId: 'evt_draft', title: 'Retreat Pass', price: 15900, quantity: 120, sold: 0, available: true, absorbFees: false, salesStart: daysFromNow(0), salesStartTime: '09:00', deadline: daysFromNow(85), deadlineTime: '23:59', description: 'Lodging + meals included.', sortOrder: 0 });

  /* ---------------- Layouts for showcase event ---------------- */
  const layouts: any[] = [];
  const units: any[] = [];

  const dinner = { id: 'lay_dinner', eventId: SHOW, name: 'Dinner Seating', mode: 'hybrid', locked: false, waitlistEnabled: true, keepTogether: true, description: 'Banquet dinner on night one.', createdAt: now, campaign: null as any };
  layouts.push(dinner);
  for (let i = 1; i <= 10; i++) {
    units.push({
      id: `unit_t${i}`, layoutId: dinner.id, parentUnitId: null, type: 'Table', label: `Table ${i}`,
      capacity: 8, description: i <= 2 ? 'Front row, closest to stage' : 'Main floor', priceAdjust: i <= 2 ? 2000 : 0,
      selectable: true, allowedTicketTypes: [], locked: i === 10, sortOrder: i,
      x: ((i - 1) % 5) * 19 + 6, y: Math.floor((i - 1) / 5) * 34 + 14, width: 15, height: 22, rotation: 0,
      waitlist: [] as any[],
    });
  }
  const breakout = { id: 'lay_breakout', eventId: SHOW, name: 'Breakout Sessions', mode: 'post', locked: false, waitlistEnabled: true, keepTogether: false, description: 'Choose your workshop room.', createdAt: now, campaign: { open: daysFromNow(-1), cutoff: daysFromNow(30), reminder: 'Weekly', fallback: 'auto' } };
  layouts.push(breakout);
  [['Room A', 25], ['Room B', 30], ['Room C', 25]].forEach((r, i) => {
    units.push({
      id: `unit_r${i}`, layoutId: breakout.id, parentUnitId: null, type: 'Room', label: r[0] as string,
      capacity: r[1] as number, description: ['Teams track', 'Finance track', 'Community track'][i], priceAdjust: 0,
      selectable: true, allowedTicketTypes: [], locked: false, sortOrder: i,
      x: 8 + i * 30, y: 24, width: 24, height: 32, rotation: 0, waitlist: [],
    });
  });

  const templates: any[] = [
    { id: 'tpl_1', name: '20 Round Tables of 8', unitType: 'Table', createdAt: now, units: Array.from({ length: 20 }, (_, i) => ({ label: `Table ${i + 1}`, type: 'Table', capacity: 8, priceAdjust: 0 })) },
    { id: 'tpl_2', name: '10 Hotel Rooms', unitType: 'Room', createdAt: now, units: Array.from({ length: 10 }, (_, i) => ({ label: `Room ${101 + i}`, type: 'Room', capacity: 4, priceAdjust: 0 })) },
    { id: 'tpl_3', name: 'Sections A–D', unitType: 'Section', createdAt: now, units: ['A', 'B', 'C', 'D'].map((s) => ({ label: `Section ${s}`, type: 'Section', capacity: 50, priceAdjust: 0 })) },
    { id: 'tpl_4', name: 'Small Groups (12)', unitType: 'Group', createdAt: now, units: Array.from({ length: 12 }, (_, i) => ({ label: `Group ${i + 1}`, type: 'Group', capacity: 6, priceAdjust: 0 })) },
  ];

  /* ---------------- Orders / tickets / placements ---------------- */
  const orders: any[] = [];
  const tickets: any[] = [];
  const payments: any[] = [];
  const placements: any[] = [];
  const checkIns: any[] = [];
  const audit: any[] = [];

  let attendeeIdx = 0;
  const makeOrder = (eventId: string, ttId: string, qty: number, buyer: any, opts: any = {}) => {
    const tt = ticketTypes.find((t) => t.id === ttId)!;
    const ev = events.find((e) => e.id === eventId)!;
    const subtotal = tt.price * qty;
    const fees = computeFees(subtotal, { absorbFees: tt.absorbFees });
    const oid = uid('ord');
    const tid = txnId();
    const createdAt = opts.createdAt || new Date(Date.now() - Math.random() * 20 * 864e5).toISOString();
    orders.push({
      id: oid, number: orderNumber(), eventId, organizerId: ev.organizerId, userId: buyer.id, buyerName: buyer.name, buyerEmail: buyer.email,
      status: opts.status || 'paid', subtotal, adminFee: fees.adminFee, paymentFee: fees.paymentFee, discount: 0, placementAdjust: 0,
      total: fees.total, transactionId: tid, couponCode: null, createdAt,
      address: { country: 'United States', line1: '221 Market St', city: ev.city, state: ev.state, zip: ev.zip },
    });
    payments.push({ id: uid('pay'), orderId: oid, userId: buyer.id, eventId, transactionId: tid, amount: fees.total, status: opts.status === 'refunded' ? 'Refunded' : 'Succeeded', method: 'Card •••• 4242', createdAt });
    const made: any[] = [];
    for (let i = 0; i < qty; i++) {
      const holder = i === 0 ? buyer : attendees[(attendeeIdx++) % attendees.length];
      const t = {
        id: uid('tkt'), code: 'RDM-' + Math.random().toString(36).slice(2, 8).toUpperCase(), orderId: oid, eventId,
        ticketTypeId: ttId, ticketTypeTitle: tt.title, userId: buyer.id, holderName: holder.name, holderEmail: holder.email,
        price: tt.price, status: opts.status === 'refunded' ? 'refunded' : 'valid', checkInStatus: 'Not Checked In',
        answers: {}, createdAt, walletAdded: false,
      };
      tickets.push(t); made.push(t);
    }
    tt.sold += qty;
    ev.sold += qty;
    return { order: orders[orders.length - 1], tickets: made };
  };

  // Showcase event: 84 tickets across many orders
  const buyers = attendees.slice(0, 30);
  let created = 0;
  while (created < 84) {
    const buyer = buyers[created % buyers.length];
    const qty = created % 5 === 0 ? 2 : 1;
    const ttId = created % 7 === 0 ? 'tt_vip' : created % 11 === 0 ? 'tt_vol' : 'tt_ga';
    makeOrder(SHOW, ttId, qty, buyer);
    created += qty;
  }
  // Attendee demo account owns tickets too
  const demoUser = users[0];
  const demoShow = makeOrder(SHOW, 'tt_vip', 2, demoUser, { createdAt: daysFromNow(-6, 12) });
  makeOrder('evt_2', 'tt_evt_2_a', 1, demoUser, { createdAt: daysFromNow(-12, 10) });
  const refundSample = makeOrder('evt_4', 'tt_evt_4_a', 1, demoUser, { createdAt: daysFromNow(-20, 10) });
  makeOrder('evt_10', 'tt_evt_10_a', 2, demoUser, { createdAt: daysFromNow(-30, 10) });

  // Place ~60% of showcase tickets at dinner tables
  const showTickets = tickets.filter((t) => t.eventId === SHOW);
  const tableUnits = units.filter((u) => u.layoutId === 'lay_dinner' && !u.locked);
  let ui = 0;
  showTickets.slice(0, 52).forEach((t, i) => {
    const unit = tableUnits[ui % tableUnits.length];
    const count = placements.filter((p) => p.unitId === unit.id && p.status !== 'released').length;
    if (count >= unit.capacity - 1) ui++;
    const u2 = tableUnits[ui % tableUnits.length];
    placements.push({
      id: uid('pl'), layoutId: 'lay_dinner', unitId: u2.id, ticketId: t.id, orderId: t.orderId, attendeeName: t.holderName,
      attendeeEmail: t.holderEmail, userId: t.userId, assignedBy: 'Organizer Demo', status: 'confirmed', heldUntil: null, version: 1,
      createdAt: now, updatedAt: now,
    });
    if (i % 9 === 0) ui++;
  });
  // Breakout placements for a few
  showTickets.slice(0, 18).forEach((t, i) => {
    const room = units.filter((u) => u.layoutId === 'lay_breakout')[i % 3];
    placements.push({
      id: uid('pl'), layoutId: 'lay_breakout', unitId: room.id, ticketId: t.id, orderId: t.orderId, attendeeName: t.holderName,
      attendeeEmail: t.holderEmail, userId: t.userId, assignedBy: 'Attendee', status: 'confirmed', heldUntil: null, version: 1,
      createdAt: now, updatedAt: now,
    });
  });
  // Demo user's tickets seated at Table 4
  demoShow.tickets.forEach((t) => {
    placements.push({
      id: uid('pl'), layoutId: 'lay_dinner', unitId: 'unit_t4', ticketId: t.id, orderId: t.orderId, attendeeName: t.holderName,
      attendeeEmail: t.holderEmail, userId: t.userId, assignedBy: 'Organizer Demo', status: 'confirmed', heldUntil: null, version: 1,
      createdAt: now, updatedAt: now,
    });
  });
  // Safety pass: never allow a seeded unit to exceed its capacity.
  // Demo-account placements are prioritised so Table 4 always stays reserved for them.
  const perUnit: Record<string, number> = {};
  const ordered = [
    ...placements.filter((p) => p.userId === 'u_attendee'),
    ...placements.filter((p) => p.userId !== 'u_attendee'),
  ];
  const capped = ordered.filter((p) => {
    const unit = units.find((u) => u.id === p.unitId);
    if (!unit) return false;
    perUnit[p.unitId] = (perUnit[p.unitId] || 0) + 1;
    return perUnit[p.unitId] <= unit.capacity;
  });
  placements.length = 0;
  placements.push(...capped);


  // waitlist demo
  const waitTicket = showTickets[70] || showTickets[showTickets.length - 1];
  const t1 = units.find((u) => u.id === 'unit_t1');
  if (t1 && waitTicket) t1.waitlist = [{ ticketId: waitTicket.id, name: waitTicket.holderName, at: now }];



  audit.push(
    { id: uid('aud'), eventId: SHOW, layoutId: 'lay_dinner', actor: 'Organizer Demo', action: 'Auto Assign', detail: 'Placed 52 attendees across 9 tables', oldValue: 'Unassigned', newValue: 'Dinner Seating', createdAt: daysFromNow(-3, 11) },
    { id: uid('aud'), eventId: SHOW, layoutId: 'lay_breakout', actor: 'Attendee', action: 'Selected', detail: 'David chose Room B', oldValue: '-', newValue: 'Room B', createdAt: daysFromNow(-2, 14) }
  );

  // check in a handful
  showTickets.slice(0, 9).forEach((t) => {
    t.checkInStatus = 'Checked In';
    checkIns.push({ id: uid('ci'), ticketId: t.id, eventId: SHOW, by: 'Priya Nair', at: daysFromNow(-1, 9), action: 'Check In' });
  });

  /* ---------------- Coupons ---------------- */
  const coupons: any[] = [
    { id: 'cp_1', eventId: SHOW, code: 'WELCOME10', description: 'Welcome discount', percent: 10, maxDiscount: 2000, totalUsers: 200, used: 14, active: true, createdAt: now },
    { id: 'cp_2', eventId: SHOW, code: 'EARLY20', description: 'Early bird', percent: 20, maxDiscount: 4000, totalUsers: 100, used: 63, active: true, createdAt: now },
    { id: 'cp_3', eventId: SHOW, code: 'VIP25', description: 'VIP partner code', percent: 25, maxDiscount: 5000, totalUsers: 50, used: 8, active: true, createdAt: now },
    { id: 'cp_4', eventId: 'evt_2', code: 'WELCOME10', description: 'Welcome discount', percent: 10, maxDiscount: 1500, totalUsers: 100, used: 3, active: true, createdAt: now },
  ];

  /* ---------------- Social / comms ---------------- */
  const follows: any[] = [
    { id: uid('fl'), userId: 'u_attendee', organizerId: 'org_1', createdAt: now },
    ...attendees.slice(0, 22).map((a) => ({ id: uid('fl'), userId: a.id, organizerId: 'org_1', createdAt: now })),
    ...attendees.slice(5, 14).map((a) => ({ id: uid('fl'), userId: a.id, organizerId: 'org_2', createdAt: now })),
  ];

  const enquiries: any[] = [
    { id: uid('enq'), organizerId: 'org_1', eventId: SHOW, name: 'Grace Bennett', email: 'grace.bennett@example.com', message: 'Is there accessible seating near the stage for the banquet dinner?', read: false, replies: [], createdAt: daysFromNow(-1, 10) },
    { id: uid('enq'), organizerId: 'org_1', eventId: 'evt_4', name: 'Samuel Kim', email: 'samuel.kim@example.com', message: 'Do volunteer tickets include the workshop sessions?', read: true, replies: [{ body: 'Yes — volunteers get full access between shifts.', at: daysFromNow(-2, 12) }], createdAt: daysFromNow(-4, 9) },
    { id: uid('enq'), organizerId: 'org_1', eventId: SHOW, name: 'Esther Silva', email: 'esther.silva@example.com', message: 'Can I transfer my ticket to a colleague?', read: false, replies: [], createdAt: daysFromNow(0, 8) },
  ];

  const announcements: any[] = [
    { id: uid('ann'), organizerId: 'org_1', eventId: SHOW, subject: 'Parking details released', message: 'Garage B on Howard St is reserved for attendees. Bring your ticket QR for validation.', audience: 'All Attendees', audienceValue: '', status: 'Sent', scheduledFor: null, createdAt: daysFromNow(-5, 16), recipients: 84 },
    { id: uid('ann'), organizerId: 'org_1', eventId: SHOW, subject: 'VIP reception moved to 5:30 PM', message: 'VIP guests, the speaker reception now begins at 5:30 PM in the Terrace Room.', audience: 'Ticket Type', audienceValue: 'VIP', status: 'Scheduled', scheduledFor: daysFromNow(20, 9), createdAt: daysFromNow(-2, 11), recipients: 12 },
  ];

  const notifications: any[] = [
    { id: uid('nt'), userId: 'u_attendee', type: 'Placement Assigned', title: 'You have a table', body: 'You have been assigned to Table 4 for the Dinner Seating.', route: 'tickets', params: {}, read: false, createdAt: daysFromNow(-1, 12) },
    { id: uid('nt'), userId: 'u_attendee', type: 'Organizer Announcement', title: 'Parking details released', body: 'Garage B on Howard St is reserved for attendees.', route: 'event', params: { id: SHOW }, read: false, createdAt: daysFromNow(-5, 16) },
    { id: uid('nt'), userId: 'u_attendee', type: 'Event Reminder', title: 'Redeemed Leadership Conference 2026', body: 'Your event is coming up soon. Tap to view your tickets.', route: 'tickets', params: {}, read: true, createdAt: daysFromNow(-3, 9) },
    { id: uid('nt'), userId: 'u_org', type: 'New Order', title: 'New order received', body: 'Ava Thompson purchased 2 VIP tickets.', route: 'org-orders', params: {}, read: false, createdAt: daysFromNow(-6, 12) },
    { id: uid('nt'), userId: 'u_org', type: 'Payout Sent', title: 'Payout sent', body: '$8,420.00 is on its way to your bank account.', route: 'org-payouts', params: {}, read: true, createdAt: daysFromNow(-4, 8) },
    { id: uid('nt'), userId: 'u_org', type: 'Stripe Setup Incomplete', title: 'Finish Stripe setup', body: 'Add a payout method to receive funds faster.', route: 'org-payouts', params: {}, read: false, createdAt: daysFromNow(-2, 8) },
  ];

  const analytics: any[] = [
    { id: uid('an'), name: 'event_view', props: { eventId: SHOW }, at: daysFromNow(-1, 12) },
    { id: uid('an'), name: 'purchase_completed', props: { eventId: SHOW, total: 21800 }, at: daysFromNow(-6, 12) },
    { id: uid('an'), name: 'placement_reassigned', props: { from: 'Table 2', to: 'Table 7' }, at: daysFromNow(-3, 11) },
  ];

  const payouts: any[] = [
    { id: uid('po'), organizerId: 'org_1', amount: 842000, status: 'Paid', arrival: daysFromNow(-4, 8), destination: 'Chase •••• 4411' },
    { id: uid('po'), organizerId: 'org_1', amount: 316000, status: 'Pending', arrival: daysFromNow(2, 8), destination: 'Chase •••• 4411' },
    { id: uid('po'), organizerId: 'org_1', amount: 129500, status: 'Paid', arrival: daysFromNow(-18, 8), destination: 'Chase •••• 4411' },
  ];

  const deliveries: any[] = [];
  const supportTickets: any[] = [
    { id: uid('sup'), type: 'Technical / Billing', subject: 'Receipt not received', issueType: 'Billing', description: 'I did not get an email receipt for my order.', orderNumber: orders[0]?.number || '', email: 'ruth.nguyen3@example.com', status: 'Open', createdAt: daysFromNow(-2, 10) },
  ];
  const mailingList: any[] = [
    { id: uid('ml'), firstName: 'Hannah', lastName: 'Brooks', role: 'Attendee', email: 'hannah.brooks@example.com', createdAt: daysFromNow(-7, 10) },
  ];

  return {
    users, organizers, teamMembers, events, ticketTypes, questions, layouts, units, placements, audit, templates,
    orders, tickets, payments, checkIns, coupons, follows, enquiries, announcements, notifications, analytics,
    payouts, deliveries, supportTickets, mailingList, transfers: [] as any[],
    showcaseEventId: SHOW, refundSampleOrderId: refundSample.order.id,
  };
}

export type SeedData = ReturnType<typeof buildSeed>;
