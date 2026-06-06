// Static 100-level sequence generated dynamically from Datamuse.
// Base words are popular 5-letter English words (recognizable to the general public).
// Goals are common sub-words that can be formed from the base letters.
const LEVELS = [
  {
    "base": "ABOUT",
    "goals": [
      "ABOUT",
      "AUTO",
      "OUT",
      "TAB",
      "TUB"
    ]
  },
  {
    "base": "AFTER",
    "goals": [
      "AFTER",
      "ARE",
      "ART",
      "ATE",
      "EAR",
      "EAT"
    ]
  },
  {
    "base": "PLACE",
    "goals": [
      "PLACE",
      "PACE",
      "PALE",
      "PLEA",
      "ACE",
      "CAL"
    ]
  },
  {
    "base": "POWER",
    "goals": [
      "POWER",
      "PORE",
      "ORE",
      "PER",
      "POR",
      "PRE"
    ]
  },
  {
    "base": "POINT",
    "goals": [
      "POINT",
      "NOT",
      "PIN",
      "PIT",
      "POT",
      "TIN"
    ]
  },
  {
    "base": "PRESS",
    "goals": [
      "PRESS",
      "PRES",
      "ESP",
      "PER",
      "PRE",
      "SER"
    ]
  },
  {
    "base": "ASKED",
    "goals": [
      "ASKED",
      "SAKE",
      "ASK",
      "DAS",
      "DES",
      "EDS"
    ]
  },
  {
    "base": "PARTY",
    "goals": [
      "PARTY",
      "PART",
      "PRAY",
      "APT",
      "ART",
      "PAR"
    ]
  },
  {
    "base": "SINCE",
    "goals": [
      "SINCE",
      "SINE",
      "SEC",
      "SEN",
      "SIC",
      "SIE"
    ]
  },
  {
    "base": "PAPER",
    "goals": [
      "PAPER",
      "APP",
      "ARE",
      "EAR",
      "EPA",
      "ERA"
    ]
  },
  {
    "base": "PRICE",
    "goals": [
      "PRICE",
      "PIER",
      "PER",
      "PIE",
      "PRE"
    ]
  },
  {
    "base": "SOUND",
    "goals": [
      "SOUND",
      "DON",
      "DOS",
      "NOD",
      "SON",
      "SUN"
    ]
  },
  {
    "base": "SCALE",
    "goals": [
      "SCALE",
      "SALE",
      "SEAL",
      "ACE",
      "ALS",
      "CAL"
    ]
  },
  {
    "base": "PHASE",
    "goals": [
      "PHASE",
      "ASH",
      "EPA",
      "ESP",
      "PAS",
      "SEA"
    ]
  },
  {
    "base": "PEACE",
    "goals": [
      "PEACE",
      "PACE",
      "ACE",
      "CAP",
      "EPA"
    ]
  },
  {
    "base": "SHARE",
    "goals": [
      "SHARE",
      "SERA",
      "ARE",
      "ASH",
      "EAR",
      "ERA"
    ]
  },
  {
    "base": "PLANT",
    "goals": [
      "PLANT",
      "PLAN",
      "ANT",
      "APT",
      "NAT",
      "PAN"
    ]
  },
  {
    "base": "SHAPE",
    "goals": [
      "SHAPE",
      "ASH",
      "EPA",
      "ESP",
      "PAS",
      "SEA"
    ]
  },
  {
    "base": "PLANS",
    "goals": [
      "PLANS",
      "ALPS",
      "PLAN",
      "SNAP",
      "SPAN",
      "ALS"
    ]
  },
  {
    "base": "SCENE",
    "goals": [
      "SCENE",
      "SEEN",
      "SEC",
      "SEE",
      "SEN"
    ]
  },
  {
    "base": "AWARE",
    "goals": [
      "AWARE",
      "AREA",
      "ARE",
      "AWE",
      "EAR",
      "ERA"
    ]
  },
  {
    "base": "PETER",
    "goals": [
      "PETER",
      "PEER",
      "PETE",
      "PER",
      "PET",
      "PRE"
    ]
  },
  {
    "base": "SALES",
    "goals": [
      "SALES",
      "SALE",
      "SEAL",
      "ALS",
      "ASS",
      "SEA"
    ]
  },
  {
    "base": "SITES",
    "goals": [
      "SITES",
      "SETS",
      "SITE",
      "SITS",
      "EST",
      "SET"
    ]
  },
  {
    "base": "PLATE",
    "goals": [
      "PLATE",
      "PALE",
      "PEAT",
      "PLEA",
      "APT",
      "ATE"
    ]
  },
  {
    "base": "AGENT",
    "goals": [
      "AGENT",
      "ANTE",
      "AGE",
      "ANT",
      "ATE",
      "EAT"
    ]
  },
  {
    "base": "SOLID",
    "goals": [
      "SOLID",
      "SLID",
      "SOIL",
      "SOLD",
      "DIS",
      "DOS"
    ]
  },
  {
    "base": "APART",
    "goals": [
      "APART",
      "PARA",
      "PART",
      "APT",
      "ART",
      "PAR"
    ]
  },
  {
    "base": "SIDES",
    "goals": [
      "SIDES",
      "SIDE",
      "DEI",
      "DES",
      "DIE",
      "DIS"
    ]
  },
  {
    "base": "PLANE",
    "goals": [
      "PLANE",
      "PALE",
      "PANE",
      "PLAN",
      "PLEA",
      "EPA"
    ]
  },
  {
    "base": "SIGHT",
    "goals": [
      "SIGHT",
      "SHIT",
      "SIGH",
      "SIT",
      "TIS"
    ]
  },
  {
    "base": "ACUTE",
    "goals": [
      "ACUTE",
      "ACE",
      "ACT",
      "ATE",
      "CAT",
      "CUE"
    ]
  },
  {
    "base": "SHIFT",
    "goals": [
      "SHIFT",
      "SHIT",
      "FIT",
      "SIT",
      "TIS"
    ]
  },
  {
    "base": "AGREE",
    "goals": [
      "AGREE",
      "AGE",
      "ARE",
      "EAR",
      "ERA"
    ]
  },
  {
    "base": "PROVE",
    "goals": [
      "PROVE",
      "PORE",
      "ORE",
      "PER",
      "POR",
      "PRE"
    ]
  },
  {
    "base": "ANGLE",
    "goals": [
      "ANGLE",
      "AGE",
      "ENG",
      "GAL",
      "GEL",
      "GEN"
    ]
  },
  {
    "base": "PRIME",
    "goals": [
      "PRIME",
      "PIER",
      "PER",
      "PIE",
      "PRE",
      "RIM"
    ]
  },
  {
    "base": "PLAIN",
    "goals": [
      "PLAIN",
      "PAIN",
      "PLAN",
      "ALI",
      "PAN",
      "PIN"
    ]
  },
  {
    "base": "PROOF",
    "goals": [
      "PROOF",
      "POOR",
      "FOR",
      "POR",
      "PRO"
    ]
  },
  {
    "base": "SCOPE",
    "goals": [
      "SCOPE",
      "POSE",
      "COP",
      "ESP",
      "SEC",
      "SOC"
    ]
  },
  {
    "base": "ALIVE",
    "goals": [
      "ALIVE",
      "ALI",
      "AVE",
      "EVA",
      "VIA",
      "VIE"
    ]
  },
  {
    "base": "ARMED",
    "goals": [
      "ARMED",
      "AMER",
      "ARE",
      "ARM",
      "DAM",
      "EAR"
    ]
  },
  {
    "base": "ANGER",
    "goals": [
      "ANGER",
      "AGE",
      "ARE",
      "EAR",
      "ENG",
      "ERA"
    ]
  },
  {
    "base": "SHEET",
    "goals": [
      "SHEET",
      "SETH",
      "EST",
      "SEE",
      "SET",
      "SHE"
    ]
  },
  {
    "base": "PRINT",
    "goals": [
      "PRINT",
      "PIN",
      "PIT",
      "TIN",
      "TIP"
    ]
  },
  {
    "base": "ARISE",
    "goals": [
      "ARISE",
      "SERA",
      "AIR",
      "ARE",
      "EAR",
      "ERA"
    ]
  },
  {
    "base": "ASIDE",
    "goals": [
      "ASIDE",
      "AIDE",
      "AIDS",
      "SAID",
      "SIDE",
      "AID"
    ]
  },
  {
    "base": "ASIAN",
    "goals": [
      "ASIAN",
      "ASIA",
      "ANA",
      "SAN",
      "SIN"
    ]
  },
  {
    "base": "SCORE",
    "goals": [
      "SCORE",
      "SORE",
      "COR",
      "ORE",
      "SEC",
      "SER"
    ]
  },
  {
    "base": "ANGRY",
    "goals": [
      "ANGRY",
      "ANY",
      "GAY",
      "NAY",
      "RAN",
      "RAY"
    ]
  },
  {
    "base": "ARGUE",
    "goals": [
      "ARGUE",
      "AGE",
      "ARE",
      "EAR",
      "ERA",
      "RUE"
    ]
  },
  {
    "base": "PRIDE",
    "goals": [
      "PRIDE",
      "PIER",
      "DEI",
      "DIE",
      "DIP",
      "PER"
    ]
  },
  {
    "base": "SAINT",
    "goals": [
      "SAINT",
      "ANTI",
      "STAN",
      "ANT",
      "NAT",
      "SAN"
    ]
  },
  {
    "base": "ADMIT",
    "goals": [
      "ADMIT",
      "AMID",
      "AID",
      "AIM",
      "DAM",
      "DIM"
    ]
  },
  {
    "base": "PANEL",
    "goals": [
      "PANEL",
      "PALE",
      "PANE",
      "PLAN",
      "PLEA",
      "EPA"
    ]
  },
  {
    "base": "SHORE",
    "goals": [
      "SHORE",
      "SHOE",
      "SORE",
      "ORE",
      "SER",
      "SHE"
    ]
  },
  {
    "base": "PROUD",
    "goals": [
      "PROUD",
      "POUR",
      "POR",
      "PRO",
      "ROD"
    ]
  },
  {
    "base": "PAINT",
    "goals": [
      "PAINT",
      "ANTI",
      "PAIN",
      "ANT",
      "APT",
      "NAT"
    ]
  },
  {
    "base": "SANTA",
    "goals": [
      "SANTA",
      "STAN",
      "ANA",
      "ANT",
      "NAT",
      "SAN"
    ]
  },
  {
    "base": "SOLAR",
    "goals": [
      "SOLAR",
      "ALSO",
      "ALS",
      "SAO",
      "SOL"
    ]
  },
  {
    "base": "PILOT",
    "goals": [
      "PILOT",
      "PLOT",
      "OIL",
      "PIT",
      "POT",
      "TIP"
    ]
  },
  {
    "base": "ACRES",
    "goals": [
      "ACRES",
      "ACRE",
      "SCAR",
      "SERA",
      "ACE",
      "ARC"
    ]
  },
  {
    "base": "ALTER",
    "goals": [
      "ALTER",
      "ARE",
      "ART",
      "ATE",
      "EAR",
      "EAT"
    ]
  },
  {
    "base": "ADOPT",
    "goals": [
      "ADOPT",
      "ATOP",
      "APT",
      "DOT",
      "PAD",
      "PAT"
    ]
  },
  {
    "base": "AROSE",
    "goals": [
      "AROSE",
      "SERA",
      "SORE",
      "ARE",
      "EAR",
      "ERA"
    ]
  },
  {
    "base": "SHIRT",
    "goals": [
      "SHIRT",
      "SHIT",
      "SHRI",
      "STIR",
      "SIR",
      "SIT"
    ]
  },
  {
    "base": "SHAME",
    "goals": [
      "SHAME",
      "SAME",
      "SEAM",
      "ASH",
      "SAM",
      "SEA"
    ]
  },
  {
    "base": "ACTOR",
    "goals": [
      "ACTOR",
      "ACT",
      "ARC",
      "ART",
      "CAR",
      "CAT"
    ]
  },
  {
    "base": "PRIZE",
    "goals": [
      "PRIZE",
      "PIER",
      "PER",
      "PIE",
      "PRE"
    ]
  },
  {
    "base": "ANGEL",
    "goals": [
      "ANGEL",
      "AGE",
      "ENG",
      "GAL",
      "GEL",
      "GEN"
    ]
  },
  {
    "base": "PROSE",
    "goals": [
      "PROSE",
      "PORE",
      "POSE",
      "PRES",
      "SORE",
      "ESP"
    ]
  },
  {
    "base": "ALICE",
    "goals": [
      "ALICE",
      "ACE",
      "ALI",
      "CAL",
      "CIA"
    ]
  },
  {
    "base": "SHEAR",
    "goals": [
      "SHEAR",
      "SERA",
      "ARE",
      "ASH",
      "EAR",
      "ERA"
    ]
  },
  {
    "base": "ASSET",
    "goals": [
      "ASSET",
      "SEAT",
      "SETS",
      "ASS",
      "ATE",
      "EAT"
    ]
  },
  {
    "base": "PAUSE",
    "goals": [
      "PAUSE",
      "EPA",
      "ESP",
      "PAS",
      "SEA",
      "SUE"
    ]
  },
  {
    "base": "APPLE",
    "goals": [
      "APPLE",
      "APPL",
      "PALE",
      "PLEA",
      "APP",
      "EPA"
    ]
  },
  {
    "base": "PANIC",
    "goals": [
      "PANIC",
      "PAIN",
      "CAN",
      "CAP",
      "CIA",
      "PAN"
    ]
  },
  {
    "base": "SHADE",
    "goals": [
      "SHADE",
      "SHED",
      "ASH",
      "DAS",
      "DES",
      "EDS"
    ]
  },
  {
    "base": "ALERT",
    "goals": [
      "ALERT",
      "ARE",
      "ART",
      "ATE",
      "EAR",
      "EAT"
    ]
  },
  {
    "base": "SHAKE",
    "goals": [
      "SHAKE",
      "SAKE",
      "ASH",
      "ASK",
      "SEA",
      "SHE"
    ]
  },
  {
    "base": "PROBE",
    "goals": [
      "PROBE",
      "PORE",
      "ORE",
      "PER",
      "POR",
      "PRE"
    ]
  },
  {
    "base": "PEERS",
    "goals": [
      "PEERS",
      "PEER",
      "PRES",
      "ESP",
      "PER",
      "PRE"
    ]
  },
  {
    "base": "SUPER",
    "goals": [
      "SUPER",
      "PRES",
      "PURE",
      "SPUR",
      "SURE",
      "ESP"
    ]
  },
  {
    "base": "PLATO",
    "goals": [
      "PLATO",
      "ALTO",
      "ATOP",
      "PLOT",
      "APT",
      "PAT"
    ]
  },
  {
    "base": "SNAKE",
    "goals": [
      "SNAKE",
      "SAKE",
      "SANE",
      "SANK",
      "SEAN",
      "ASK"
    ]
  },
  {
    "base": "POSED",
    "goals": [
      "POSED",
      "POSE",
      "DES",
      "DOS",
      "EDS",
      "ESP"
    ]
  },
  {
    "base": "PATCH",
    "goals": [
      "PATCH",
      "PACT",
      "PATH",
      "ACT",
      "APT",
      "CAP"
    ]
  },
  {
    "base": "PEARL",
    "goals": [
      "PEARL",
      "PALE",
      "PLEA",
      "ARE",
      "EAR",
      "EPA"
    ]
  },
  {
    "base": "ADAPT",
    "goals": [
      "ADAPT",
      "ADA",
      "APT",
      "PAD",
      "PAT",
      "TAP"
    ]
  },
  {
    "base": "ARENA",
    "goals": [
      "ARENA",
      "AREA",
      "ANA",
      "ARE",
      "EAR",
      "ERA"
    ]
  },
  {
    "base": "PRONE",
    "goals": [
      "PRONE",
      "PORE",
      "NEO",
      "NOR",
      "ONE",
      "ORE"
    ]
  },
  {
    "base": "PORCH",
    "goals": [
      "PORCH",
      "PROC",
      "COP",
      "COR",
      "POR",
      "PRO"
    ]
  },
  {
    "base": "AMPLE",
    "goals": [
      "AMPLE",
      "PALE",
      "PALM",
      "PLEA",
      "AMP",
      "EPA"
    ]
  },
  {
    "base": "SUITE",
    "goals": [
      "SUITE",
      "SITE",
      "SITU",
      "SUIT",
      "EST",
      "SET"
    ]
  },
  {
    "base": "AIDED",
    "goals": [
      "AIDED",
      "AIDE",
      "ADD",
      "AID",
      "DAD",
      "DEI"
    ]
  },
  {
    "base": "SALLY",
    "goals": [
      "SALLY",
      "ALLY",
      "ALL",
      "ALS",
      "SAY"
    ]
  },
  {
    "base": "SAUCE",
    "goals": [
      "SAUCE",
      "ACE",
      "CUE",
      "SAC",
      "SEA",
      "SEC"
    ]
  },
  {
    "base": "PANTS",
    "goals": [
      "PANTS",
      "PAST",
      "SNAP",
      "SPAN",
      "STAN",
      "ANT"
    ]
  },
  {
    "base": "SATAN",
    "goals": [
      "SATAN",
      "STAN",
      "ANA",
      "ANT",
      "NAT",
      "SAN"
    ]
  },
  {
    "base": "PASTE",
    "goals": [
      "PASTE",
      "PAST",
      "PEAT",
      "PEST",
      "SEAT",
      "SEPT"
    ]
  }
];
