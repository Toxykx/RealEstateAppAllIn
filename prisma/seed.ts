import {
  PrismaClient,
  Role,
  PropertyType,
  ListingStatus,
  DealStage,
  DealType,
  KeyStatus,
  ActivityType,
  type Prisma,
  type User,
  type Property,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Passw0rd!";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function resetDemoData() {
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.propertyDocument.deleteMany();
  await prisma.propertyUpdate.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
}

const CITIES = [
  "מודיעין", "תל אביב", "זכרון יעקב", "חיפה", "רעננה",
  "הרצליה", "נתניה", "ראשון לציון", "רמת גן", "כפר סבא",
];
const STREETS = [
  "הרצל", "רוטשילד", "הגפן", "בן גוריון", "הנשיא",
  "אבן גבירול", "ויצמן", "בגין", "סוקולוב", "דיזנגוף",
];
const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
];
const PROPERTY_TYPES = [
  PropertyType.APARTMENT,
  PropertyType.APARTMENT,
  PropertyType.HOUSE,
  PropertyType.VILLA,
  PropertyType.LAND,
  PropertyType.COMMERCIAL,
];

function priceFor(type: PropertyType, i: number) {
  const base: Record<string, number> = {
    APARTMENT: 1800000,
    HOUSE: 3200000,
    VILLA: 5200000,
    LAND: 900000,
    COMMERCIAL: 2800000,
  };
  return base[type] + (i % 7) * 145000;
}

function specsFor(type: PropertyType, i: number) {
  switch (type) {
    case "APARTMENT":
      return { bedrooms: 2 + (i % 4), bathrooms: 1 + (i % 2), areaSqm: 60 + (i % 5) * 15 };
    case "HOUSE":
      return { bedrooms: 4 + (i % 3), bathrooms: 2 + (i % 2), areaSqm: 140 + (i % 4) * 20 };
    case "VILLA":
      return { bedrooms: 5 + (i % 3), bathrooms: 3 + (i % 2), areaSqm: 220 + (i % 4) * 25 };
    case "LAND":
      return { bedrooms: null, bathrooms: null, areaSqm: 300 + (i % 6) * 50 };
    default:
      return { bedrooms: null, bathrooms: 1, areaSqm: 90 + (i % 5) * 20 };
  }
}

// Thresholds scaled proportionally from the original 20-property loop to the
// current 28-property loop, so the same mix of statuses/stages is preserved.
function listingFor(i: number, dealType: DealType) {
  if (i <= 15) return { listingStatus: ListingStatus.AVAILABLE, dealStage: [DealStage.PHOTOS_COMPLETED, DealStage.PUBLISHED, DealStage.VISITS][i % 3] };
  if (i <= 21) return { listingStatus: ListingStatus.IN_PROGRESS, dealStage: i % 2 === 0 ? DealStage.VISITS : DealStage.NEGOTIATION };
  if (i <= 24) return { listingStatus: dealType === "RENT" ? ListingStatus.RENTED : ListingStatus.SOLD, dealStage: DealStage.SOLD };
  if (i === 25) return { listingStatus: ListingStatus.DRAFT, dealStage: DealStage.CONTRACT_SIGNED };
  if (i === 26) return { listingStatus: ListingStatus.ARCHIVED, dealStage: DealStage.SOLD };
  return { listingStatus: ListingStatus.AVAILABLE, dealStage: DealStage.PUBLISHED };
}

const UPDATE_MESSAGES = [
  "עדכנו את תיאור הנכס ואת התמונות הראשיות.",
  "התקבלה פנייה נוספת מקונה פוטנציאלי.",
  "המחיר נבחן מחדש מול תנאי השוק הנוכחיים.",
  "המוכר אישר תיאום ביקור נוסף בסוף השבוע.",
  "נשלחו מסמכים נוספים לעורך הדין לבדיקה.",
  "העדכון האחרון כלל שיפור בתיאור השיווקי.",
  "המתווך יצר קשר טלפוני לעדכון סטטוס.",
  "התקבל אישור עקרוני ממשרד המשכנתאות של הקונה.",
];

// Flattens e.g. [14, 9, 5] into [0,0,...(14),1,1,...(9),2,2,...(5)] — used to
// assign an uneven number of clients/properties to agents[0..2] in order.
function expandCounts(counts: number[]): number[] {
  const result: number[] = [];
  counts.forEach((count, agentIndex) => {
    for (let k = 0; k < count; k++) result.push(agentIndex);
  });
  return result;
}

async function main() {
  await resetDemoData();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const manager = await prisma.user.create({
    data: { name: "דנה כהן", email: "manager@horizonrealty.demo", passwordHash, role: Role.MANAGER, phone: "+972-50-1000001" },
  });

  // [יוסי לוי (senior), נועה מזרחי (mid-level), דוד פרץ (newer)] — the
  // uneven workload distribution below is keyed to this exact order.
  const agentNames = ["יוסי לוי", "נועה מזרחי", "דוד פרץ"];
  const agents: User[] = [];
  for (let i = 0; i < agentNames.length; i++) {
    agents.push(
      await prisma.user.create({
        data: {
          name: agentNames[i],
          email: `agent${i + 1}@horizonrealty.demo`,
          passwordHash,
          role: Role.AGENT,
          phone: `+972-50-100000${i + 2}`,
        },
      }),
    );
  }

  const CLIENT_NAMES: [string, string][] = [
    ["אבי", "כהן"], ["מיכל", "לוי"], ["תומר", "בר"], ["שירה", "אזולאי"], ["רון", "דהן"],
    ["טליה", "גבאי"], ["עידן", "פרץ"], ["הילה", "ביטון"], ["גיא", "אוחיון"], ["קרן", "מזרחי"],
    ["אורי", "שפירא"], ["ליאת", "אשכנזי"], ["נדב", "סבן"], ["יעל", "פרידמן"], ["אלון", "קפלן"],
    ["מאיה", "חדד"], ["עומר", "וקנין"], ["שני", "מלכה"],
  ];
  // Yossi manages 9 clients, Noa 6, David 3 — 18 total.
  const CLIENT_AGENT_COUNTS = [9, 6, 3];
  const clientAgentIndex = expandCounts(CLIENT_AGENT_COUNTS);

  const clients: User[] = [];
  for (let i = 0; i < CLIENT_NAMES.length; i++) {
    const [first, last] = CLIENT_NAMES[i];
    clients.push(
      await prisma.user.create({
        data: {
          name: `${first} ${last}`,
          email: `client${i + 1}@example.com`,
          passwordHash,
          role: Role.CLIENT,
          phone: `+972-50-200000${i}`,
          managingAgentId: agents[clientAgentIndex[i]].id,
        },
      }),
    );
  }

  const activityRows: Prisma.ActivityLogCreateManyInput[] = [];
  const properties: Property[] = [];

  // Yossi gets 14 properties, Noa 9, David 5 — 28 total.
  const PROPERTY_AGENT_COUNTS = [14, 9, 5];
  const propertyAgentIndex = expandCounts(PROPERTY_AGENT_COUNTS);

  for (let i = 0; i < propertyAgentIndex.length; i++) {
    const type = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
    const dealType = i % 3 === 0 ? DealType.RENT : DealType.SALE;
    const { listingStatus, dealStage } = listingFor(i, dealType);
    const agent = agents[propertyAgentIndex[i]];
    const owner = i % 4 === 3 ? null : clients[i % clients.length];
    const city = CITIES[i % CITIES.length];
    const street = STREETS[i % STREETS.length];
    const specs = specsFor(type, i);
    const createdAt = daysAgo(60 - i * 2);

    let keyStatus: KeyStatus = KeyStatus.IN_OFFICE;
    let keyHolderId: string | null = null;
    let keyLastTakenAt: Date | null = null;
    if (i === 2) { keyStatus = KeyStatus.WITH_AGENT; keyHolderId = agent.id; keyLastTakenAt = daysAgo(5); }
    if (i === 7) { keyStatus = KeyStatus.WITH_AGENT; keyHolderId = agent.id; keyLastTakenAt = daysAgo(1); }
    if (i === 13) { keyStatus = KeyStatus.WITH_AGENT; keyHolderId = agent.id; keyLastTakenAt = daysAgo(2); }
    if (i === 9) { keyStatus = KeyStatus.LOST; }
    if (i === 16) { keyStatus = KeyStatus.DUPLICATED; }

    const property = await prisma.property.create({
      data: {
        title: `${street} ${5 + i * 3}`,
        city,
        addressLine: `רחוב ${street} ${5 + i * 3}`,
        description: `${type === "APARTMENT" ? "דירה" : type === "HOUSE" ? "בית פרטי" : type === "VILLA" ? "וילה" : type === "LAND" ? "מגרש" : "נכס מסחרי"} מטופח ב${city}, קרוב למרכזי קניות ותחבורה ציבורית.`,
        price: priceFor(type, i),
        propertyType: type,
        dealType,
        bedrooms: specs.bedrooms,
        bathrooms: specs.bathrooms,
        areaSqm: specs.areaSqm,
        listingStatus,
        dealStage,
        keyStatus,
        keyHolderId,
        keyLastTakenAt,
        slug: `seed-property-${i + 1}-${Date.now().toString(36)}`,
        agentId: agent.id,
        ownerClientId: owner?.id ?? null,
        createdAt,
        images: {
          create: [{ url: COVER_IMAGES[i % COVER_IMAGES.length], storageKey: `seed/prop-${i}-cover.jpg`, isCover: true, sortOrder: 0 }],
        },
      },
    });
    properties.push(property);

    activityRows.push({
      activityType: ActivityType.PROPERTY_CREATED,
      description: `הנכס "${property.title}" נוצר במערכת.`,
      propertyId: property.id,
      agentId: agent.id,
      createdAt,
    });
    if (listingStatus !== "DRAFT") {
      activityRows.push({
        activityType: ActivityType.PROPERTY_PUBLISHED,
        description: `הנכס "${property.title}" פורסם בקטלוג.`,
        propertyId: property.id,
        agentId: agent.id,
        createdAt: daysAgo(60 - i * 2 - 2),
      });
    }
    if (i % 3 === 0) {
      activityRows.push({
        activityType: ActivityType.PRICE_CHANGED,
        description: `המחיר עודכן עבור "${property.title}".`,
        propertyId: property.id,
        agentId: agent.id,
        createdAt: daysAgo(Math.max(1, 40 - i)),
      });
    }
    if (listingStatus === "SOLD" || listingStatus === "RENTED") {
      activityRows.push({
        activityType: ActivityType.DEAL_CLOSED,
        description: `העסקה על "${property.title}" נסגרה בהצלחה.`,
        propertyId: property.id,
        agentId: agent.id,
        createdAt: daysAgo(3),
      });
    }
    if (keyStatus === "WITH_AGENT" && keyLastTakenAt) {
      activityRows.push({
        activityType: ActivityType.KEY_CHECKED_OUT,
        description: `${agent.name} לקח/ה את המפתח מהמשרד.`,
        propertyId: property.id,
        agentId: agent.id,
        createdAt: keyLastTakenAt,
      });
    }
    if (owner) {
      activityRows.push({
        activityType: ActivityType.CLIENT_ASSIGNED,
        description: `הנכס "${property.title}" הוקצה ללקוח.`,
        propertyId: property.id,
        agentId: agent.id,
        clientId: owner.id,
        createdAt: daysAgo(Math.max(1, 55 - i * 2)),
      });
    }
  }

  // PropertyUpdate rows, spread across properties
  const updateRows: Prisma.PropertyUpdateCreateManyInput[] = [];
  properties.forEach((property, i) => {
    const count = 1 + (i % 4);
    for (let j = 0; j < count; j++) {
      const createdAt = daysAgo(Math.max(0, 45 - i * 2 - j * 3));
      const isInternal = j % 3 === 0;
      updateRows.push({
        propertyId: property.id,
        message: UPDATE_MESSAGES[(i * 3 + j) % UPDATE_MESSAGES.length],
        isInternal,
        createdById: property.agentId,
        createdAt,
      });
      activityRows.push({
        activityType: ActivityType.TIMELINE_UPDATE_ADDED,
        description: isInternal ? "נוספה הערה פנימית לציר הזמן." : "נוסף עדכון לציר הזמן.",
        propertyId: property.id,
        agentId: property.agentId,
        createdAt,
      });
    }
  });
  await prisma.propertyUpdate.createMany({ data: updateRows });

  // Visit rows
  const visitRows: Prisma.VisitCreateManyInput[] = [];
  properties.forEach((property, i) => {
    const count = 1 + (i % 2);
    for (let j = 0; j < count; j++) {
      const isCancelled = (i + j) % 9 === 0;
      const isPast = j === 0;
      const scheduledAt = isPast ? daysAgo(3 + (i % 10)) : daysFromNow(1 + (i % 14));
      const status = isCancelled ? "CANCELLED" : isPast ? "COMPLETED" : "SCHEDULED";
      visitRows.push({
        propertyId: property.id,
        clientId: property.ownerClientId,
        visitorName: property.ownerClientId ? null : "מתעניין פוטנציאלי",
        visitorPhone: property.ownerClientId ? null : "+972-52-9990000",
        scheduledAt,
        status,
        createdById: property.agentId,
        createdAt: daysAgo(isPast ? 10 + (i % 10) : 3),
      });
      activityRows.push({
        activityType: isCancelled ? ActivityType.VISIT_CANCELLED : isPast ? ActivityType.VISIT_COMPLETED : ActivityType.VISIT_SCHEDULED,
        description: isCancelled ? "הביקור בוטל." : isPast ? "הביקור הושלם." : "נקבע ביקור חדש.",
        propertyId: property.id,
        agentId: property.agentId,
        clientId: property.ownerClientId ?? undefined,
        createdAt: scheduledAt,
      });
    }
  });
  await prisma.visit.createMany({ data: visitRows });

  // Realistic call/meeting activity history per agent, reflecting seniority:
  // Yossi (senior) shows activity almost every week across ~90 days, Noa
  // (mid-level) has moderate, slightly less consistent coverage over ~70
  // days, and David (newer) is concentrated in just the last few weeks —
  // as if he only recently started.
  const CALL_TEMPLATES: ((clientName?: string) => string)[] = [
    (c) => (c ? `שיחת מעקב עם ${c} לגבי התקדמות התהליך.` : "שיחת מעקב עם לקוח בנוגע לתהליך הרכישה."),
    (c) => (c ? `שיחה עם ${c} לתיאום ביקור בנכס.` : "שיחה לתיאום ביקור בנכס."),
    (c) => (c ? `עדכון טלפוני ל${c} לגבי הצעת מחיר שהוגשה.` : "עדכון טלפוני ללקוח לגבי הצעת מחיר שהוגשה."),
    (c) => (c ? `שיחה עם ${c} לבירור צרכים ותקציב.` : "שיחה לבירור צרכים ותקציב."),
    () => "שיחה נכנסת ממתעניין חדש שהשאיר פרטים באתר.",
    (c) => (c ? `סבב טלפונים יזום ל${c} לבדיקת שביעות רצון.` : "סבב טלפונים יזום ללקוחות קיימים."),
    (c) => (c ? `שיחה עם ${c} לגבי לוחות זמנים לחתימת חוזה.` : "שיחה לגבי לוחות זמנים לחתימת חוזה."),
  ];
  const MEETING_TEMPLATES: ((clientName?: string) => string)[] = [
    (c) => (c ? `פגישה במשרד עם ${c} לחתימה על מסמכים.` : "פגישה במשרד לחתימה על מסמכים."),
    (c) => (c ? `פגישת ייעוץ עם ${c} לגבי אפשרויות מימון ומשכנתא.` : "פגישת ייעוץ לגבי אפשרויות מימון ומשכנתא."),
    (c) => (c ? `פגישה בנכס עם ${c} לסיור מודרך.` : "פגישה בנכס לסיור מודרך."),
    (c) => (c ? `פגישת סיכום עם ${c} לקראת סגירת עסקה.` : "פגישת סיכום לקראת סגירת עסקה."),
    () => "פגישת צוות משרדית לסקירת נכסים פעילים.",
    (c) => (c ? `פגישה ראשונית עם ${c} להיכרות וסקירת צרכים.` : "פגישה ראשונית עם לקוח חדש להיכרות וסקירת צרכים."),
  ];

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Returns `count` "days ago" offsets, cycled evenly across the given week
  // indices (week 0 = the most recent 7 days) with a random day within each
  // week — gives weekly coverage rather than pure random clustering.
  function weeklySpread(count: number, activeWeeks: number[]): number[] {
    const offsets: number[] = [];
    for (let k = 0; k < count; k++) {
      const week = activeWeeks[k % activeWeeks.length];
      const dayInWeek = Math.floor(Math.random() * 7);
      offsets.push(week * 7 + dayInWeek);
    }
    return offsets;
  }

  const clientsByAgent = new Map<string, User[]>(agents.map((a) => [a.id, [] as User[]]));
  clients.forEach((c) => {
    if (c.managingAgentId) clientsByAgent.get(c.managingAgentId)?.push(c);
  });

  // Sometimes reference one of the agent's own clients by name; sometimes
  // leave it generic, for natural-looking variety.
  function maybeClient(agentId: string): User | undefined {
    const pool = clientsByAgent.get(agentId) ?? [];
    if (pool.length === 0 || Math.random() < 0.3) return undefined;
    return pick(pool);
  }

  const AGENT_ACTIVITY_PLAN: { agent: User; calls: number; meetings: number; activeWeeks: number[] }[] = [
    { agent: agents[0], calls: 40, meetings: 15, activeWeeks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, // יוסי — senior, active almost every week over ~90 days
    { agent: agents[1], calls: 20, meetings: 8, activeWeeks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, // נועה — mid-level, moderate coverage over ~70 days
    { agent: agents[2], calls: 8, meetings: 3, activeWeeks: [0, 1, 2, 3] }, // דוד — newer, concentrated in the last ~4 weeks
  ];

  AGENT_ACTIVITY_PLAN.forEach(({ agent, calls, meetings, activeWeeks }) => {
    weeklySpread(calls, activeWeeks).forEach((offset) => {
      const client = maybeClient(agent.id);
      activityRows.push({
        activityType: ActivityType.CALL_LOGGED,
        description: pick(CALL_TEMPLATES)(client?.name),
        agentId: agent.id,
        clientId: client?.id,
        createdAt: daysAgo(offset),
      });
    });
    weeklySpread(meetings, activeWeeks).forEach((offset) => {
      const client = maybeClient(agent.id);
      activityRows.push({
        activityType: ActivityType.MEETING_LOGGED,
        description: pick(MEETING_TEMPLATES)(client?.name),
        agentId: agent.id,
        clientId: client?.id,
        createdAt: daysAgo(offset),
      });
    });
  });

  await prisma.activityLog.createMany({ data: activityRows });

  // Favorites — each client favorites 1-2 properties they don't own
  const favoriteRows: Prisma.FavoriteCreateManyInput[] = [];
  clients.forEach((client, i) => {
    const candidates = properties.filter((p) => p.ownerClientId !== client.id);
    favoriteRows.push({ clientId: client.id, propertyId: candidates[i % candidates.length].id });
    favoriteRows.push({ clientId: client.id, propertyId: candidates[(i + 5) % candidates.length].id });
  });
  await prisma.favorite.createMany({ data: favoriteRows, skipDuplicates: true });

  // Notifications for clients with owned properties
  const notificationRows: Prisma.NotificationCreateManyInput[] = [];
  const ownedProps = properties.filter((p) => p.ownerClientId);
  ownedProps.forEach((property, i) => {
    const types: { type: Prisma.NotificationCreateManyInput["type"]; message: string }[] = [
      { type: "STAGE_CHANGE", message: `הנכס ${property.title} עודכן לשלב חדש.` },
      { type: "VISIT_SCHEDULED", message: `נקבע ביקור חדש בנכס ${property.title}.` },
    ];
    const pick = types[i % types.length];
    notificationRows.push({
      userId: property.ownerClientId as string,
      propertyId: property.id,
      type: pick.type,
      message: pick.message,
      isRead: i % 3 === 0,
      createdAt: daysAgo(i),
    });
  });
  await prisma.notification.createMany({ data: notificationRows.slice(0, 20) });

  // Guest inquiries — a few NEW (drives the "client waiting" alert), a couple actioned
  await prisma.contactMessage.createMany({
    data: [
      { name: "פונה אורח", email: "guest1@example.com", phone: "+972-54-1112222", message: "מתעניין בנכס ברעננה, האם ניתן לתאם ביקור?", propertyId: properties[4].id, status: "NEW", createdAt: daysAgo(1) },
      { name: "פונה אורח", email: "guest2@example.com", phone: "+972-54-3334444", message: "מחפש דירת 3 חדרים במודיעין, מה טווח המחירים?", status: "NEW", createdAt: daysAgo(2) },
      { name: "פונה אורח", email: "guest3@example.com", phone: "+972-54-5556666", message: "האם הווילה עדיין זמינה למכירה?", propertyId: properties[3].id, status: "NEW", createdAt: daysAgo(3) },
      { name: "פונה אורח", email: "guest4@example.com", message: "אשמח לקבל מידע נוסף על הנכס המסחרי.", propertyId: properties[5].id, status: "CONTACTED", createdAt: daysAgo(6), assignedAgentId: agents[0].id },
      { name: "פונה אורח", email: "guest5@example.com", message: "תודה על המענה המהיר!", status: "CLOSED", createdAt: daysAgo(10), assignedAgentId: agents[1].id },
    ],
  });

  console.log("הסידור הושלם. סיסמת התחברות לכל המשתמשים:", DEMO_PASSWORD);
  console.log("מנהל:", manager.email);
  console.log("סוכנים:", agents.map((a) => a.email).join(", "));
  console.log("לקוחות:", clients.map((c) => c.email).join(", "));
  console.log(`נוצרו ${properties.length} נכסים, ${updateRows.length} עדכונים, ${visitRows.length} ביקורים, ${activityRows.length} רשומות פעילות.`);

  // Per-agent breakdown, verified against the actual DB state (not just the
  // input constants above) so the uneven distribution can be confirmed.
  console.log("\nפילוח לפי סוכן:");
  for (const agent of agents) {
    const [propertyCount, clientCount, callCount, meetingCount] = await Promise.all([
      prisma.property.count({ where: { agentId: agent.id } }),
      prisma.user.count({ where: { managingAgentId: agent.id, role: Role.CLIENT } }),
      prisma.activityLog.count({ where: { agentId: agent.id, activityType: ActivityType.CALL_LOGGED } }),
      prisma.activityLog.count({ where: { agentId: agent.id, activityType: ActivityType.MEETING_LOGGED } }),
    ]);
    console.log(
      `- ${agent.name}: נכסים=${propertyCount}, לקוחות מנוהלים=${clientCount}, שיחות=${callCount}, פגישות=${meetingCount}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
