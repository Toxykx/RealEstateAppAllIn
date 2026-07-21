import { PrismaClient, Role, PropertyType, ListingStatus, DealStage, DealType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Passw0rd!";

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

async function main() {
  await resetDemoData();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const manager = await prisma.user.create({
    data: {
      name: "דנה כהן",
      email: "manager@horizonrealty.demo",
      passwordHash,
      role: Role.MANAGER,
      phone: "+972-50-1000001",
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      name: "יוסי לוי",
      email: "agent1@horizonrealty.demo",
      passwordHash,
      role: Role.AGENT,
      phone: "+972-50-1000002",
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: "נועה מזרחי",
      email: "agent2@horizonrealty.demo",
      passwordHash,
      role: Role.AGENT,
      phone: "+972-50-1000003",
    },
  });

  const client1 = await prisma.user.create({
    data: {
      name: "אבי כהן",
      email: "client1@example.com",
      passwordHash,
      role: Role.CLIENT,
      phone: "+972-50-2000001",
      managingAgentId: agent1.id,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: "מיכל לוי",
      email: "client2@example.com",
      passwordHash,
      role: Role.CLIENT,
      phone: "+972-50-2000002",
      managingAgentId: agent1.id,
    },
  });

  const client3 = await prisma.user.create({
    data: {
      name: "תומר בר",
      email: "client3@example.com",
      passwordHash,
      role: Role.CLIENT,
      phone: "+972-50-2000003",
      managingAgentId: agent2.id,
    },
  });

  const propertySeeds = [
    {
      slug: "herzl-15-modiin",
      title: "הרצל 15",
      city: "מודיעין",
      addressLine: "רחוב הרצל 15",
      description: "דירת 4 חדרים מוארת עם מטבח משופץ ומרפסת גדולה הצופה לפארק.",
      price: 2450000,
      propertyType: PropertyType.APARTMENT,
      bedrooms: 4,
      bathrooms: 2,
      areaSqm: 110,
      listingStatus: ListingStatus.AVAILABLE,
      dealStage: DealStage.VISITS,
      dealType: DealType.SALE,
      agent: agent1,
      owner: client1,
      cover: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200",
    },
    {
      slug: "rothschild-42-tel-aviv",
      title: "רוטשילד 42",
      city: "תל אביב",
      addressLine: "שדרות רוטשילד 42",
      description: "יחידת 2 חדרים בבניין בוטיק, במרחק הליכה מהים ומשוק שרונה.",
      price: 3200000,
      propertyType: PropertyType.APARTMENT,
      bedrooms: 2,
      bathrooms: 1,
      areaSqm: 62,
      listingStatus: ListingStatus.IN_PROGRESS,
      dealStage: DealStage.NEGOTIATION,
      dealType: DealType.RENT,
      agent: agent1,
      owner: client2,
      cover: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
    },
    {
      slug: "hagefen-8-zichron-yaakov",
      title: "הגפן 8",
      city: "זכרון יעקב",
      addressLine: "רחוב הגפן 8",
      description: "בית משפחתי צמוד קרקע עם גינה פרטית ונוף לכרמי היין.",
      price: 4100000,
      propertyType: PropertyType.HOUSE,
      bedrooms: 5,
      bathrooms: 3,
      areaSqm: 180,
      listingStatus: ListingStatus.AVAILABLE,
      dealStage: DealStage.PUBLISHED,
      dealType: DealType.SALE,
      agent: agent2,
      owner: client3,
      cover: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
    },
    {
      slug: "ben-gurion-100-haifa",
      title: "בן גוריון 100",
      city: "חיפה",
      addressLine: "שדרות בן גוריון 100",
      description: "פנטהאוז עם נוף לים, מרוהט לחלוטין ומוכן לכניסה מיידית.",
      price: 2800000,
      propertyType: PropertyType.APARTMENT,
      bedrooms: 3,
      bathrooms: 2,
      areaSqm: 95,
      listingStatus: ListingStatus.SOLD,
      dealStage: DealStage.SOLD,
      dealType: DealType.SALE,
      agent: agent2,
      owner: null,
      cover: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    },
    {
      slug: "hanassi-3-raanana",
      title: "הנשיא 3",
      city: "רעננה",
      addressLine: "רחוב הנשיא 3",
      description: "וילה חדשה עם בריכה, חיווט בית חכם וחניה לשני רכבים.",
      price: 6500000,
      propertyType: PropertyType.VILLA,
      bedrooms: 6,
      bathrooms: 4,
      areaSqm: 260,
      listingStatus: ListingStatus.DRAFT,
      dealStage: DealStage.CONTRACT_SIGNED,
      dealType: DealType.SALE,
      agent: agent1,
      owner: null,
      cover: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
    },
    {
      slug: "even-gvirol-55-tel-aviv",
      title: "אבן גבירול 55",
      city: "תל אביב",
      addressLine: "רחוב אבן גבירול 55",
      description: "שטח מסחרי בקומת קרקע, מתאים לחזית חנות בוטיק.",
      price: 5200000,
      propertyType: PropertyType.COMMERCIAL,
      bedrooms: null,
      bathrooms: 1,
      areaSqm: 140,
      listingStatus: ListingStatus.AVAILABLE,
      dealStage: DealStage.PUBLISHED,
      dealType: DealType.RENT,
      agent: agent2,
      owner: null,
      cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
    },
  ];

  const properties = [];
  for (const seed of propertySeeds) {
    const property = await prisma.property.create({
      data: {
        title: seed.title,
        city: seed.city,
        addressLine: seed.addressLine,
        description: seed.description,
        price: seed.price,
        propertyType: seed.propertyType,
        bedrooms: seed.bedrooms,
        bathrooms: seed.bathrooms,
        areaSqm: seed.areaSqm,
        listingStatus: seed.listingStatus,
        dealStage: seed.dealStage,
        dealType: seed.dealType,
        slug: seed.slug,
        agentId: seed.agent.id,
        ownerClientId: seed.owner?.id ?? null,
        images: {
          create: [{ url: seed.cover, storageKey: `seed/${seed.slug}-cover.jpg`, isCover: true, sortOrder: 0 }],
        },
      },
    });
    properties.push({ property, agent: seed.agent, owner: seed.owner });
  }

  const herzl = properties[0];

  await prisma.propertyUpdate.createMany({
    data: [
      {
        propertyId: herzl.property.id,
        message: "החוזה נחתם מול המוכר. יוצאים לצילומים השבוע.",
        stageChangedTo: DealStage.CONTRACT_SIGNED,
        createdById: agent1.id,
        isInternal: false,
      },
      {
        propertyId: herzl.property.id,
        message: "הצילומים הושלמו ויצאו מצוין — עוברים לפרסום המודעה.",
        stageChangedTo: DealStage.PHOTOS_COMPLETED,
        createdById: agent1.id,
        isInternal: false,
      },
      {
        propertyId: herzl.property.id,
        message: "המודעה פורסמה בקטלוג. כבר מתקבלות פניות ראשונות.",
        stageChangedTo: DealStage.PUBLISHED,
        createdById: agent1.id,
        isInternal: false,
      },
      {
        propertyId: herzl.property.id,
        message: "נקבע סבב ביקורים ראשון לסוף השבוע.",
        stageChangedTo: DealStage.VISITS,
        createdById: agent1.id,
        isInternal: false,
      },
      {
        propertyId: herzl.property.id,
        message: "המוכר דוחה את ההצעה הראשונית של הקונה — נמשיך במשא ומתן.",
        createdById: agent1.id,
        isInternal: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.propertyDocument.createMany({
    data: [
      {
        propertyId: herzl.property.id,
        name: "חוזה מכר חתום.pdf",
        fileUrl: "https://example-storage.local/seed/contract.pdf",
        storageKey: `seed/${herzl.property.id}/contract.pdf`,
        docType: "CONTRACT",
        visibleToClient: true,
        uploadedById: agent1.id,
      },
      {
        propertyId: herzl.property.id,
        name: "צילום תעודה מזהה של המוכר.pdf",
        fileUrl: "https://example-storage.local/seed/seller-id.pdf",
        storageKey: `seed/${herzl.property.id}/seller-id.pdf`,
        docType: "ID",
        visibleToClient: false,
        uploadedById: agent1.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.visit.createMany({
    data: [
      {
        propertyId: herzl.property.id,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: "SCHEDULED",
        visitorName: "קונה פוטנציאלי (ביקור ספונטני)",
        visitorPhone: "+972-52-9990000",
        createdById: agent1.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.favorite.createMany({
    data: [
      { clientId: client1.id, propertyId: properties[2].property.id },
      { clientId: client1.id, propertyId: properties[4].property.id },
      { clientId: client2.id, propertyId: properties[5].property.id },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: client1.id,
        propertyId: herzl.property.id,
        type: "STAGE_CHANGE",
        message: "הנכס הרצל 15 עודכן לשלב ביקורים.",
      },
      {
        userId: client1.id,
        propertyId: herzl.property.id,
        type: "VISIT_SCHEDULED",
        message: "נקבע ביקור חדש בנכס הרצל 15.",
      },
    ],
    skipDuplicates: true,
  });

  const rothschild = properties[1];
  const hagefen = properties[2];
  const benGurion = properties[3];
  const hanassi = properties[4];
  const evenGvirol = properties[5];

  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  // Demo key-management scenario: rothschild's key has been with agent1 for 4 days (triggers the "key not returned" alert).
  await prisma.property.update({
    where: { id: rothschild.property.id },
    data: {
      keyStatus: "WITH_AGENT",
      keyHolderId: agent1.id,
      keyLastTakenAt: daysAgo(4),
    },
  });

  await prisma.activityLog.createMany({
    data: [
      // הרצל 15 — full lifecycle history
      { activityType: "PROPERTY_CREATED", description: "הנכס נוצר במערכת.", propertyId: herzl.property.id, agentId: agent1.id, createdAt: daysAgo(30) },
      { activityType: "PROPERTY_PUBLISHED", description: "הנכס פורסם בקטלוג.", propertyId: herzl.property.id, agentId: agent1.id, createdAt: daysAgo(25) },
      { activityType: "VISIT_SCHEDULED", description: "נקבע ביקור בנכס.", propertyId: herzl.property.id, agentId: agent1.id, clientId: client1.id, createdAt: daysAgo(6) },
      { activityType: "MEETING_LOGGED", description: "פגישה עם הלקוח אבי כהן במשרד.", propertyId: herzl.property.id, agentId: agent1.id, clientId: client1.id, createdAt: daysAgo(3) },
      { activityType: "CALL_LOGGED", description: "שיחת טלפון עדכון סטטוס עם הלקוח.", propertyId: herzl.property.id, agentId: agent1.id, clientId: client1.id, createdAt: daysAgo(1) },

      // רוטשילד 42 — key checked out + price change
      { activityType: "PROPERTY_CREATED", description: "הנכס נוצר במערכת.", propertyId: rothschild.property.id, agentId: agent1.id, createdAt: daysAgo(20) },
      { activityType: "PRICE_CHANGED", description: "המחיר עודכן מ-3,400,000 ₪ ל-3,200,000 ₪.", propertyId: rothschild.property.id, agentId: agent1.id, createdAt: daysAgo(10) },
      { activityType: "KEY_CHECKED_OUT", description: "יוסי לוי לקח את המפתח מהמשרד.", propertyId: rothschild.property.id, agentId: agent1.id, createdAt: daysAgo(4) },

      // הגפן 8 — published, visit completed, a cancelled visit
      { activityType: "PROPERTY_CREATED", description: "הנכס נוצר במערכת.", propertyId: hagefen.property.id, agentId: agent2.id, createdAt: daysAgo(18) },
      { activityType: "PROPERTY_PUBLISHED", description: "הנכס פורסם בקטלוג.", propertyId: hagefen.property.id, agentId: agent2.id, createdAt: daysAgo(15) },
      { activityType: "VISIT_COMPLETED", description: "ביקור עם קונה פוטנציאלי הושלם.", propertyId: hagefen.property.id, agentId: agent2.id, clientId: client3.id, createdAt: daysAgo(5) },
      { activityType: "VISIT_CANCELLED", description: "ביקור בוטל על ידי הלקוח.", propertyId: hagefen.property.id, agentId: agent2.id, clientId: client3.id, createdAt: daysAgo(2) },
      { activityType: "CALL_LOGGED", description: "שיחת טלפון עם לקוח מתעניין.", agentId: agent2.id, clientId: client3.id, createdAt: daysAgo(1) },

      // בן גוריון 100 — deal fully closed
      { activityType: "PROPERTY_CREATED", description: "הנכס נוצר במערכת.", propertyId: benGurion.property.id, agentId: agent2.id, createdAt: daysAgo(60) },
      { activityType: "STAGE_CHANGED", description: "השלב עודכן ל-\"נמכר\".", propertyId: benGurion.property.id, agentId: agent2.id, createdAt: daysAgo(2) },
      { activityType: "DEAL_CLOSED", description: "העסקה נסגרה בהצלחה.", propertyId: benGurion.property.id, agentId: agent2.id, createdAt: daysAgo(2) },

      // הנשיא 3 — stale draft, no recent activity (triggers the "not updated" alert)
      { activityType: "PROPERTY_CREATED", description: "הנכס נוצר במערכת.", propertyId: hanassi.property.id, agentId: agent1.id, createdAt: daysAgo(20) },

      // אבן גבירול 55 — published, no assigned client (triggers the "no assigned client" alert)
      { activityType: "PROPERTY_CREATED", description: "הנכס נוצר במערכת.", propertyId: evenGvirol.property.id, agentId: agent2.id, createdAt: daysAgo(9) },
      { activityType: "PROPERTY_PUBLISHED", description: "הנכס פורסם בקטלוג.", propertyId: evenGvirol.property.id, agentId: agent2.id, createdAt: daysAgo(8) },
    ],
  });

  await prisma.contactMessage.create({
    data: {
      name: "פונה אורח",
      email: "guest@example.com",
      phone: "+972-54-1112222",
      message: "שלום, אני מתעניין בווילה ברחוב הנשיא — האם היא עדיין למכירה?",
      propertyId: properties[4].property.id,
    },
  });

  console.log("הסידור הושלם. סיסמת התחברות לכל המשתמשים:", DEMO_PASSWORD);
  console.log("מנהל:", manager.email);
  console.log("סוכנים:", agent1.email, agent2.email);
  console.log("לקוחות:", client1.email, client2.email, client3.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
