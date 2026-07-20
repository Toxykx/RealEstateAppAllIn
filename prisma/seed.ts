import { PrismaClient, Role, PropertyType, ListingStatus, DealStage } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Passw0rd!";

function slugify(title: string, city: string) {
  return `${title}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const manager = await prisma.user.upsert({
    where: { email: "manager@horizonrealty.demo" },
    update: {},
    create: {
      name: "Dana Manager",
      email: "manager@horizonrealty.demo",
      passwordHash,
      role: Role.MANAGER,
      phone: "+972-50-1000001",
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: "agent1@horizonrealty.demo" },
    update: {},
    create: {
      name: "Yossi Agent",
      email: "agent1@horizonrealty.demo",
      passwordHash,
      role: Role.AGENT,
      phone: "+972-50-1000002",
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "agent2@horizonrealty.demo" },
    update: {},
    create: {
      name: "Noa Agent",
      email: "agent2@horizonrealty.demo",
      passwordHash,
      role: Role.AGENT,
      phone: "+972-50-1000003",
    },
  });

  const client1 = await prisma.user.upsert({
    where: { email: "client1@example.com" },
    update: {},
    create: {
      name: "Avi Cohen",
      email: "client1@example.com",
      passwordHash,
      role: Role.CLIENT,
      phone: "+972-50-2000001",
      managingAgentId: agent1.id,
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: "client2@example.com" },
    update: {},
    create: {
      name: "Michal Levi",
      email: "client2@example.com",
      passwordHash,
      role: Role.CLIENT,
      phone: "+972-50-2000002",
      managingAgentId: agent1.id,
    },
  });

  const client3 = await prisma.user.upsert({
    where: { email: "client3@example.com" },
    update: {},
    create: {
      name: "Tomer Bar",
      email: "client3@example.com",
      passwordHash,
      role: Role.CLIENT,
      phone: "+972-50-2000003",
      managingAgentId: agent2.id,
    },
  });

  const propertySeeds = [
    {
      title: "Herzl 15",
      city: "Modi'in",
      addressLine: "Herzl St 15",
      description: "Bright 4-room apartment with a renovated kitchen and a large balcony overlooking the park.",
      price: 2450000,
      propertyType: PropertyType.APARTMENT,
      bedrooms: 4,
      bathrooms: 2,
      areaSqm: 110,
      listingStatus: ListingStatus.AVAILABLE,
      dealStage: DealStage.VISITS,
      agent: agent1,
      owner: client1,
      cover: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200",
    },
    {
      title: "Rothschild 42",
      city: "Tel Aviv",
      addressLine: "Rothschild Blvd 42",
      description: "Boutique building 2-room unit, walking distance to the beach and Sarona Market.",
      price: 3200000,
      propertyType: PropertyType.APARTMENT,
      bedrooms: 2,
      bathrooms: 1,
      areaSqm: 62,
      listingStatus: ListingStatus.IN_PROGRESS,
      dealStage: DealStage.NEGOTIATION,
      agent: agent1,
      owner: client2,
      cover: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
    },
    {
      title: "HaGefen 8",
      city: "Zichron Ya'akov",
      addressLine: "HaGefen St 8",
      description: "Detached family house with a private garden and wine-country views.",
      price: 4100000,
      propertyType: PropertyType.HOUSE,
      bedrooms: 5,
      bathrooms: 3,
      areaSqm: 180,
      listingStatus: ListingStatus.AVAILABLE,
      dealStage: DealStage.PUBLISHED,
      agent: agent2,
      owner: client3,
      cover: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
    },
    {
      title: "Ben Gurion 100",
      city: "Haifa",
      addressLine: "Ben Gurion Ave 100",
      description: "Sea-view penthouse, fully furnished, ready for immediate occupancy.",
      price: 2800000,
      propertyType: PropertyType.APARTMENT,
      bedrooms: 3,
      bathrooms: 2,
      areaSqm: 95,
      listingStatus: ListingStatus.SOLD,
      dealStage: DealStage.SOLD,
      agent: agent2,
      owner: null,
      cover: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    },
    {
      title: "HaNassi 3",
      city: "Ra'anana",
      addressLine: "HaNassi St 3",
      description: "New-build villa with a pool, smart-home wiring, and a two-car garage.",
      price: 6500000,
      propertyType: PropertyType.VILLA,
      bedrooms: 6,
      bathrooms: 4,
      areaSqm: 260,
      listingStatus: ListingStatus.DRAFT,
      dealStage: DealStage.CONTRACT_SIGNED,
      agent: agent1,
      owner: null,
      cover: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
    },
    {
      title: "Even Gvirol 55",
      city: "Tel Aviv",
      addressLine: "Even Gvirol St 55",
      description: "Ground-floor commercial space suitable for a boutique retail storefront.",
      price: 5200000,
      propertyType: PropertyType.COMMERCIAL,
      bedrooms: null,
      bathrooms: 1,
      areaSqm: 140,
      listingStatus: ListingStatus.AVAILABLE,
      dealStage: DealStage.PUBLISHED,
      agent: agent2,
      owner: null,
      cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
    },
  ];

  const properties = [];
  for (const seed of propertySeeds) {
    const property = await prisma.property.upsert({
      where: { slug: slugify(seed.title, seed.city) },
      update: {},
      create: {
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
        slug: slugify(seed.title, seed.city),
        agentId: seed.agent.id,
        ownerClientId: seed.owner?.id ?? null,
        images: {
          create: [{ url: seed.cover, storageKey: `seed/${slugify(seed.title, seed.city)}-cover.jpg`, isCover: true, sortOrder: 0 }],
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
        message: "Contract signed with the seller. Kicking off photography this week.",
        stageChangedTo: DealStage.CONTRACT_SIGNED,
        createdById: agent1.id,
        isInternal: false,
      },
      {
        propertyId: herzl.property.id,
        message: "Photos are done and look great — moving to publish the listing.",
        stageChangedTo: DealStage.PHOTOS_COMPLETED,
        createdById: agent1.id,
        isInternal: false,
      },
      {
        propertyId: herzl.property.id,
        message: "Listing is live on the catalog. First inquiries coming in already.",
        stageChangedTo: DealStage.PUBLISHED,
        createdById: agent1.id,
        isInternal: false,
      },
      {
        propertyId: herzl.property.id,
        message: "Scheduled the first round of visits for this weekend.",
        stageChangedTo: DealStage.VISITS,
        createdById: agent1.id,
        isInternal: false,
      },
      {
        propertyId: herzl.property.id,
        message: "Seller pushing back on the buyer's opening offer — will negotiate.",
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
        name: "Signed Sale Contract.pdf",
        fileUrl: "https://example-storage.local/seed/contract.pdf",
        storageKey: `seed/${herzl.property.id}/contract.pdf`,
        docType: "CONTRACT",
        visibleToClient: true,
        uploadedById: agent1.id,
      },
      {
        propertyId: herzl.property.id,
        name: "Seller ID Copy.pdf",
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
        visitorName: "Prospective buyer (walk-in)",
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
        message: "Herzl 15 moved to the Visits stage.",
      },
      {
        userId: client1.id,
        propertyId: herzl.property.id,
        type: "VISIT_SCHEDULED",
        message: "A new visit was scheduled for Herzl 15.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.contactMessage.create({
    data: {
      name: "Guest Inquirer",
      email: "guest@example.com",
      phone: "+972-54-1112222",
      message: "Hi, I'm interested in the villa on HaNassi St — is it still on the market?",
      propertyId: properties[4].property.id,
    },
  });

  console.log("Seed complete. Demo login password for all users:", DEMO_PASSWORD);
  console.log("Manager:", manager.email);
  console.log("Agents:", agent1.email, agent2.email);
  console.log("Clients:", client1.email, client2.email, client3.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
