import fs from "fs";

const path = new URL("../data/stories.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(path, "utf8"));

const custom = {
  "story-tanzania": {
    intro:
      "Every new Tanzanian ministry site begins the same way: recruit a rural pastor, equip them for holistic ministry, and watch the church become a growth centre for its village.",
    challenge:
      "As PA's newest footprint in East Africa, Tanzania starts with few trained pastor leaders and limited savings or project experience in most villages.",
    solution:
      "Pastors are equipped through spiritual discipleship, economic productivity, and responsible citizenship — replicating the model proven in Kenya and Ethiopia, one CIFA group at a time.",
    impact:
      "The ripple effect is only beginning, with early groups already forming savings circles and Bible study cells in their communities.",
  },
  "story-rwanda": {
    intro:
      "Rwandan pastors in CIFA groups are recording growth of churches and improved living standards inspired by the truth of the whole Gospel.",
    challenge:
      "Many congregations had strong faith traditions but little practice linking discipleship to household income, health, and local initiative.",
    solution:
      "Since joining the PA network, pastor leaders integrate spiritual discipleship with practical economic activities, following the holistic model used in Kenya, Ethiopia, Malawi, and Zambia.",
    impact:
      "Early fruit is visible as congregations grow and families report improved living standards.",
  },
  "story-burundi": {
    intro:
      "In each new Burundian community, PA begins by training rural pastors so the local church can lead its village into lasting transformation.",
    challenge:
      "Burundi's rural churches often lack structured Shalom groups, savings habits, and a shared plan for community needs.",
    solution:
      "Pastor leaders newly recruited into the CIFA model undergo the first stages of PA's holistic journey — spiritual discipleship, community needs assessment, and Shalom groups for economic empowerment.",
    impact:
      "A new chapter of the PA ripple effect is beginning to take root in Burundi's rural churches.",
  },
};

function joinParts(parts) {
  return parts.filter(Boolean).join(" ").trim();
}

data.stories = data.stories.map((s) => {
  if (custom[s.id]) {
    return { ...s, narrative: custom[s.id] };
  }

  const b = (s.body || []).filter(Boolean);
  let narrative;

  if (b.length >= 5) {
    narrative = {
      intro: b[0],
      challenge: b[1],
      solution: joinParts(b.slice(2, -1)),
      impact: b[b.length - 1],
    };
  } else if (b.length === 4) {
    narrative = {
      intro: b[0],
      challenge: b[1],
      solution: b[2],
      impact: b[3],
    };
  } else if (b.length === 3) {
    narrative = {
      intro: b[0],
      challenge: b[1],
      solution: b[1],
      impact: b[2],
    };
  } else if (b.length === 2) {
    narrative = {
      intro: b[0],
      challenge: b[0],
      solution: b[1],
      impact: b[1],
    };
  } else {
    const single = b[0] || s.excerpt || "";
    narrative = {
      intro: single,
      challenge: single,
      solution: single,
      impact: single,
    };
  }

  return { ...s, narrative };
});

fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log(`Updated ${data.stories.length} stories with narrative`);
