import natural from "natural";
import DBI from "./db/db.js";
import { SurvivorPerk, KillerPerk, PerkSynergy } from "./db/models/perk.js";

DBI.initConnection();

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const survivorKeywords = {
  healing: ["heal", "healing", "recovery"],
  speed: ["speed", "haste", "sprint", "run"],
  stealth: ["stealth", "invisible", "hide", "silent", "detection", "crouch", "sound"],
  info: ["reveal", "aura", "see", "detect", "location", "track", "sound", "noise"],
  gen: ["generator", "repair", "fix", "test", "skillcheck", "skill check", "skill-check"],
  chase: ["chase", "escape", "sprint", "vault", "pallet", "attack", "stun", "run", "celerity"],
  protection: ["shield", "safe", "rescue", "bodyblock", "protect", "safety", "endurance"],
  debuff: ["exhaust", "penalty", "stun", "slow", "oblivious", "blindness", "broken", "hemorrhage", "mangled", "status effect", "deep wound", "hindered"],
  hex: ["hex", "totem", "curse", "purification", "purificate", "purificating", "blessing", "bless"],
  altruism: ["help", "assist", "support", "team", "saving"],
  lategame: ["exit gate", "exit gates", "gate", "gates", "after all generators are done"],
  antituneling: ["tunnel", "target", "focus", "priority", "resistence"],
  mobility: ["climb", "jump", "vault", "window", "pallet", "drop"],
  mindgame: ["trick", "fake", "decoy", "mislead"],
  item: ["item", "tool", "flashlight", "medkit", "key"],
};

const killerKeywords = {
  slowdown: ["slow", "regress", "penalty", "block"],
  gen: ["generator", "repair", "fix", "regress", "sabotage", "skillcheck", "skill check", "skill-check"],
  info: ["aura", "see", "reveal", "detect", "track", "sound", "noise", "location"],
  tracking: ["track", "scratch", "noise", "footstep", "scream"],
  chase: ["vault", "pallet", "stun", "hit", "attack", "slow", "celerity", "lunge attack", "hindered"],
  control: ["block", "trap", "snare", "restrict", "zone", "area", "control"],
  hex: ["hex", "totem", "curse", "purification", "purificate", "purificating"],
  debuff: ["exhaust", "blindness", "broken", "hemorrhage", "mangled", "debuff", "status effect", "oblivious", "deep wound", "hindered"],
  lategame: ["exit gate", "exit gates", "gate", "gates", "after all generators are done"],
  mobility: ["speed", "haste", "sprint", "run", "jump", "window", "fast", "celerity"],
  tuneling: ["tunnel", "target", "focus", "priority", "obsession"]
};

// Cria vetor quantitativo para cada perk
function analyzePerkVector(perk, keywords) {
  const tokens = tokenizer.tokenize(perk.contentText.toLowerCase());
  const stems = tokens.map((t) => stemmer.stem(t));

  const categories = [];
  const vector = {};

  for (const [category, words] of Object.entries(keywords)) {
    const score = words.reduce((acc, w) => {
      const s = stemmer.stem(w);
      return acc + stems.filter((t) => t === s).length;
    }, 0);

    vector[category] = score;
    if (score > 0) categories.push(category);
  }

  if (categories.length === 0) categories.push("other");

  return {
    _id: perk._id,
    categories,
    vector,
  };
}

// Calcula a similaridade entre vetores usando cosseno
function cosineSimilarity(vecA, vecB) {
  const keys = Array.from(new Set([...Object.keys(vecA), ...Object.keys(vecB)]));
  let dot = 0,
    magA = 0,
    magB = 0;

  keys.forEach((k) => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Analisa perks e atualiza categorias/vetores
async function analyzeAndUpdatePerks(PerkModel, keywords) {
  const perks = await PerkModel.find({});
  const analyzed = perks.map((perk) => {
    let vectorData = analyzePerkVector(perk, keywords);
    return {
      ...vectorData,
      contentText: perk.contentText,
    };
  });

  const bulkOps = analyzed.map((perk) => ({
    updateOne: {
      filter: { _id: perk._id },
      update: { $set: { categories: perk.categories, vector: perk.vector } },
    },
  }));

  if (bulkOps.length > 0) await PerkModel.bulkWrite(bulkOps);

  console.log(`Updated ${PerkModel.modelName} perks with categories and vector.`);
  return analyzed;
}

// Calcula e salva sinergias
async function calculateAndSaveSynergies(analyzedPerks, type) {
  const bulkOps = [];

  for (let i = 0; i < analyzedPerks.length; i++) {
    for (let j = i + 1; j < analyzedPerks.length; j++) {
      let similarity = cosineSimilarity(analyzedPerks[i].vector, analyzedPerks[j].vector);
      const causesExhaustion = (perk) =>
        {
          return perk.categories.includes('debuff') && perk.vector['debuff'] > 0 && perk?.contentText?.toLowerCase()?.includes('exhaust');
        }
      if (causesExhaustion(analyzedPerks[i]) && causesExhaustion(analyzedPerks[j])) {
        similarity = 0;
      }

      if (similarity > 0) {
        bulkOps.push({
          updateOne: {
            filter: { perk: analyzedPerks[i]._id, targetPerk: analyzedPerks[j]._id },
            update: { $set: { similarity, type } },
            upsert: true,
          },
        });
        bulkOps.push({
          updateOne: {
            filter: { perk: analyzedPerks[j]._id, targetPerk: analyzedPerks[i]._id },
            update: { $set: { similarity, type } },
            upsert: true,
          },
        });
      }
    }
  }

  if (bulkOps.length > 0) {
    await PerkSynergy.bulkWrite(bulkOps);
  }
  console.log(`Saved ${type} perk synergies (${bulkOps.length / 2} unique pairs).`);
}

async function run() {
  try {
    const analyzedSurvivors = await analyzeAndUpdatePerks(SurvivorPerk, survivorKeywords);
    await calculateAndSaveSynergies(analyzedSurvivors, "Survivor");

    const analyzedKillers = await analyzeAndUpdatePerks(KillerPerk, killerKeywords);
    await calculateAndSaveSynergies(analyzedKillers, "Killer");
  } catch (err) {
    console.error("Erro durante análise:", err);
  } finally {
    DBI.getConnection().close();
  }
}

run();
