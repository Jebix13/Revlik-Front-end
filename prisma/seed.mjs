import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const deals = [
  {
    name: "Acme Corp — Annual renewal",
    account: "Acme Corp",
    contactName: "Jane Smith",
    value: 42000,
    stage: "NEGOTIATION",
    probability: 75,
    expectedCloseDate: daysFromNow(10),
    notes: "Redlines with legal in progress.",
  },
  {
    name: "Northwind — Platform upgrade",
    account: "Northwind Traders",
    contactName: "Raj Patel",
    value: 18500,
    stage: "PROPOSAL",
    probability: 50,
    expectedCloseDate: daysFromNow(21),
    notes: "Sent proposal, awaiting budget approval.",
  },
  {
    name: "Globex — New logo",
    account: "Globex Inc.",
    contactName: "Maria Chen",
    value: 65000,
    stage: "QUALIFIED",
    probability: 25,
    expectedCloseDate: daysFromNow(45),
    notes: "Discovery call scheduled next week.",
  },
  {
    name: "Initech — Add-on seats",
    account: "Initech",
    contactName: "Sam Lee",
    value: 9000,
    stage: "LEAD",
    probability: 10,
    expectedCloseDate: daysFromNow(60),
    notes: null,
  },
  {
    name: "Umbrella — Enterprise deal",
    account: "Umbrella Group",
    contactName: "Alex Johnson",
    value: 120000,
    stage: "LEAD",
    probability: 10,
    expectedCloseDate: daysFromNow(75),
    notes: "Inbound from webinar.",
  },
  {
    name: "Wayne Ent. — Security package",
    account: "Wayne Enterprises",
    contactName: "Lucius Fox",
    value: 31000,
    stage: "CLOSED_WON",
    probability: 100,
    expectedCloseDate: daysFromNow(-5),
    notes: "Signed.",
  },
  {
    name: "Stark Industries — Pilot",
    account: "Stark Industries",
    contactName: "Pepper Potts",
    value: 15000,
    stage: "CLOSED_LOST",
    probability: 0,
    expectedCloseDate: daysFromNow(-12),
    notes: "Went with a competitor.",
  },
];

for (const deal of deals) {
  await prisma.deal.create({ data: deal });
}

console.log(`Seeded ${deals.length} deals.`);
await prisma.$disconnect();
