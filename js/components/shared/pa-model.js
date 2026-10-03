/**
 * How PA works — definitions from PA's own system documents
 * ("How PA actually works" and "PA Community Impact Tracking System – Structure Document").
 * Home shows these once as an overview; country and community pages only show local evidence.
 */

import { PA_PROGRAMMES } from "./pa-programmes.js";

export const PA_FLOW = [
  { id: "country", label: "Country", text: "PA enters a country and sets up its catchment areas." },
  { id: "catchment", label: "Catchment Area", text: "A cluster of neighbouring communities." },
  { id: "community", label: "Community", text: "Pastors, church and community leaders form a fellowship — the first active, reporting unit." },
  { id: "fellowship", label: "Pastors Fellowship", text: "Pastors learn, network and grow as leaders together." },
  { id: "shalom", label: "Shalom Groups", text: "Pastors mobilise households into groups — each household is represented by its head of family." },
  { id: "households", label: "Households", text: "Heads of households train and practise with their families and start small projects at home — that is how implementation extends." },
];

export const ACTIVITY_TYPES = [
  { id: "learning", label: "Learning" },
  { id: "working", label: "Working" },
  { id: "serving", label: "Serving" },
  { id: "resourcing", label: "Resourcing" },
  { id: "reporting", label: "Reporting" },
];

/** Worked examples from PA's documents, filed under PA's official PPPs: Program → PPP → Activity type → Activity. */
export const PPP_EXAMPLES = [
  { programme: "Transformational Leadership", ppp: "Ongoing leader training and conferences", type: "Learning", activity: "Leadership training" },
  { programme: "Economic Productivity", ppp: "Income generating activities", type: "Working", activity: "Started a poultry project" },
];

export const CHIP_EXAMPLES = ["Water project", "Community farm", "School support", "Medical camp"];

/** PA's official PPPs — three per program. CHIPs are a PPP of Economic Productivity. */
export const PA_PPPS = {
  leadership: [
    { id: "groups-formed", name: "Groups formed – CIFAs and Shalom", test: /shalom|cifa|groups? (formed|forming)|form(ed|ing)? (new )?groups/i },
    { id: "leaders-trained", name: "Leaders raised and trained", test: /raised|recruit|select|new (pastors|leaders)|leaders? (trained|equipped)|equip|cohort/i },
    { id: "leader-training", name: "Ongoing leader training and conferences", test: /training|conference|seminar|workshop|summit|retreat/i },
  ],
  discipleship: [
    { id: "bible-prayer-fellowship", name: "Bible study, prayers and fellowship", test: /bible|prayer|fellowship|small groups|devotion|word of god|worship/i },
    { id: "evangelism-salvation", name: "Evangelism and recorded salvation", test: /evangel|salvation|saved|crusade|door-to-door|outreach|preach|gospel/i },
    { id: "church-plants", name: "Church plants", test: /church plant|planting (new )?churches|new churches|church growth|growing (his|the|a) church/i },
  ],
  economic: [
    { id: "savings-loaning", name: "Savings and loaning", detail: "Table banking, merry-go-round, welfare and more", test: /saving|loan|lending|table banking|merry-go-round|welfare|sacco|money/i },
    { id: "iga", name: "Income generating activities", test: /\biga|income|business|enterprise|poultry|scone|shop|trade|farm|crop|agri|livestock|goat|harvest|cooperative|livelihood/i },
    { id: "chips", name: "Community high impact projects – CHIPs", test: /\bchips?\b|community high impact|water|\bdams?\b|borehole|\bwells?\b|irrigation|community farm|medical|clinic|health camp|bridge|\broads?\b/i },
  ],
  youth: [
    { id: "parenting", name: "Parenting capacity building", test: /parent/i },
    { id: "sunday-school", name: "Children Sunday school", test: /sunday school|children'?s church|kids church/i },
    { id: "children-projects", name: "Community children projects & events", detail: "e.g. school, VBS, sports", test: /school|\bvbs\b|sport|camp|child|youth|teen|young|mentor/i },
  ],
  citizenship: [
    { id: "advocacy-civic", name: "Community advocacy and civic education", test: /advoca|civic|rights|government|policy|peace|conflict|reconcil/i },
    { id: "service-projects", name: "Community service projects", test: /serv(e|ice)|feeding|visitation|clean|hygiene|sanitation|infrastructure|citizen/i },
    { id: "leadership-engagement", name: "Community leadership engagement", test: /community leader|chiefs|elders|local leaders|leadership engagement/i },
  ],
};

/** The PPP an activity most likely belongs to, within its program (or null). */
export function pppFor(text = "", programmeId = programmeIdFor(text)) {
  const list = PA_PPPS[programmeId] || [];
  const s = String(text);
  return list.find((p) => p.test.test(s)) || null;
}

/** Order matters: the first match wins. Program names come first so official story tags map exactly. */
const PROGRAMME_TESTS = [
  { id: "citizenship", test: /responsible citizenship/i },
  { id: "leadership", test: /transformational leadership/i },
  { id: "discipleship", test: /spiritual discipleship/i },
  { id: "economic", test: /economic productivity/i },
  { id: "youth", test: /next generation/i },
  { id: "youth", test: /youth|young|mentor|child|teen|school|parent|sunday school|\bvbs\b|sport/i },
  { id: "discipleship", test: /disciple|spiritual|faith|bible|prayer|word of god|preach|evangel|salvation|church plant|planting churches|small groups|devotion/i },
  {
    id: "economic",
    test: /econom|productiv|livelihood|income|\biga|saving|loan|welfare|sacco|table banking|merry-go-round|enterprise|business|cooperative|livestock|poultry|crop|farm|agri|scone|money|\bchips?\b|water|\bdams?\b|borehole|irrigation|medical|clinic|health/i,
  },
  { id: "citizenship", test: /citizen|advoca|civic|community leader|chiefs|elders|service project|feeding|visitation|hygiene|sanitation|infrastructure|peace/i },
  { id: "leadership", test: /leader|cohort|training|conference|equip|pastor|shalom|cifa/i },
];

/** Maps any activity, story tag or initiative to one of the five official programs (or null). */
export function programmeIdFor(text = "") {
  const s = String(text);
  return PROGRAMME_TESTS.find((t) => t.test.test(s))?.id || null;
}

export function programmeById(id) {
  return PA_PROGRAMMES.find((p) => p.id === id) || null;
}

/** CHIPs are community-owned projects (water, community farm, school support, medical camp) — a PPP of Economic Productivity. */
export function isChip(title = "") {
  return /water|\bdams?\b|borehole|\bwells?\b|community farm|school|medical|clinic|health camp|bridge|\broads?\b|\bchips?\b/i.test(
    String(title)
  );
}

export const HOW_PA_WORKS_HREF = "#/#how-pa-works";
