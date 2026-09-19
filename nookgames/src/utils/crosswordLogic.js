// Crossword Logic Engine & Mini/Classic Publication Sets for nookgames

export const DIFFICULTIES = {
  gentle: {
    id: 'gentle',
    name: 'Gentle',
    label: '5×5 Mini',
    subtitle: '5×5 Mini',
    gridSize: { rows: 5, cols: 5 },
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    label: '7×7 Classic',
    subtitle: '7×7 Classic',
    gridSize: { rows: 7, cols: 7 },
  },
  deep: {
    id: 'deep',
    name: 'Deep',
    label: '9×9 Expanded',
    subtitle: '9×9 Expanded',
    gridSize: { rows: 9, cols: 9 },
  },
  // Backward-compatibility aliases
  beginner: {
    id: 'gentle',
    name: 'Gentle',
    label: '5×5 Mini',
    subtitle: '5×5 Mini',
    gridSize: { rows: 5, cols: 5 },
  },
  intermediate: {
    id: 'standard',
    name: 'Standard',
    label: '7×7 Classic',
    subtitle: '7×7 Classic',
    gridSize: { rows: 7, cols: 7 },
  },
  master: {
    id: 'deep',
    name: 'Deep',
    label: '9×9 Expanded',
    subtitle: '9×9 Expanded',
    gridSize: { rows: 9, cols: 9 },
  },
};

export const PUZZLE_BANK = {
  "gentle": [
    {
      "id": "morning-glow",
      "title": "Morning Glow",
      "difficulty": "gentle",
      "gridSize": {
        "rows": 5,
        "cols": 5
      },
      "grid": [
        [
          "#",
          "A",
          "M",
          "P",
          "S"
        ],
        [
          "A",
          "L",
          "E",
          "R",
          "T"
        ],
        [
          "C",
          "O",
          "C",
          "O",
          "A"
        ],
        [
          "I",
          "N",
          "C",
          "U",
          "R"
        ],
        [
          "D",
          "E",
          "A",
          "D",
          "#"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "Sound amplifiers on a cozy music stage",
            "answer": "AMPS"
          },
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Quick to notice details; wide awake and watchful",
            "answer": "ALERT"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 0,
            "col": 0,
            "clue": "Comforting warm chocolate drink on a chilly morning",
            "answer": "COCOA"
          },
          {
            "num": 7,
            "number": 7,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Bring upon oneself, as unexpected costs",
            "answer": "INCUR"
          },
          {
            "num": 8,
            "number": 8,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Completely calm, motionless, or silent",
            "answer": "DEAD"
          }
        ],
        "down": [
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Bright celestial spark glowing in the night sky",
            "answer": "ACID"
          },
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "Tart, tangy citrus quality",
            "answer": "ALONE"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 2,
            "col": 2,
            "clue": "In peaceful solitude; by oneself",
            "answer": "MECCA"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "Historic holy city and pilgrimage hub",
            "answer": "PROUD"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Feeling deep joy and satisfaction in good work",
            "answer": "STAR"
          }
        ]
      }
    },
    {
      "id": "harbor-tide",
      "title": "Harbor Tide",
      "difficulty": "gentle",
      "gridSize": {
        "rows": 5,
        "cols": 5
      },
      "grid": [
        [
          "#",
          "B",
          "R",
          "E",
          "W"
        ],
        [
          "A",
          "L",
          "I",
          "V",
          "E"
        ],
        [
          "L",
          "A",
          "P",
          "E",
          "L"
        ],
        [
          "A",
          "M",
          "E",
          "N",
          "D"
        ],
        [
          "S",
          "E",
          "N",
          "T",
          "#"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "Prepare a fresh pot of fragrant loose-leaf tea",
            "answer": "BREW"
          },
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Full of vitality, energy, and joyous spirit",
            "answer": "ALIVE"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 0,
            "col": 0,
            "clue": "Folded flap on a warm winter coat chest",
            "answer": "LAPEL"
          },
          {
            "num": 7,
            "number": 7,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Gently revise or improve written prose",
            "answer": "AMEND"
          },
          {
            "num": 8,
            "number": 8,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Dispatched a letter with love across the seas",
            "answer": "SENT"
          }
        ],
        "down": [
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Fuse two iron links together with glowing heat",
            "answer": "ALAS"
          },
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "Pensive sigh of mild regret in classic tales",
            "answer": "BLAME"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 2,
            "col": 2,
            "clue": "Assign fault or responsibility for a mishap",
            "answer": "RIPEN"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "Grow sweet and mature, like summer orchard figs",
            "answer": "EVENT"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Special planned celebration or gathering",
            "answer": "WELD"
          }
        ]
      }
    },
    {
      "id": "evening-flight",
      "title": "Evening Flight",
      "difficulty": "gentle",
      "gridSize": {
        "rows": 5,
        "cols": 5
      },
      "grid": [
        [
          "#",
          "F",
          "R",
          "E",
          "T"
        ],
        [
          "A",
          "L",
          "I",
          "V",
          "E"
        ],
        [
          "L",
          "O",
          "V",
          "E",
          "R"
        ],
        [
          "S",
          "W",
          "A",
          "R",
          "M"
        ],
        [
          "O",
          "N",
          "L",
          "Y",
          "#"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "Worry about small things, or a guitar neck ridge",
            "answer": "FRET"
          },
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Wide awake, dynamic, and breathing free",
            "answer": "ALIVE"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 0,
            "col": 0,
            "clue": "Admirer of poetry, nature, and sunset views",
            "answer": "LOVER"
          },
          {
            "num": 7,
            "number": 7,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Lively cluster of honeybees in flight",
            "answer": "SWARM"
          },
          {
            "num": 8,
            "number": 8,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Sole; without another companion",
            "answer": "ONLY"
          }
        ],
        "down": [
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Academic semester or bounded interval of time",
            "answer": "ALSO"
          },
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "In addition; along with that",
            "answer": "FLOWN"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 2,
            "col": 2,
            "clue": "Glided through twilight clouds on feather wings",
            "answer": "RIVAL"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "Friendly opponent across a chess table",
            "answer": "EVERY"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Each single member of a group without exception",
            "answer": "TERM"
          }
        ]
      }
    }
  ],
  "standard": [
    {
      "id": "meadow-breeze",
      "title": "Meadow Breeze",
      "difficulty": "standard",
      "gridSize": {
        "rows": 7,
        "cols": 7
      },
      "grid": [
        [
          "B",
          "R",
          "A",
          "#",
          "P",
          "E",
          "A"
        ],
        [
          "R",
          "A",
          "N",
          "#",
          "R",
          "A",
          "G"
        ],
        [
          "A",
          "N",
          "Y",
          "M",
          "O",
          "R",
          "E"
        ],
        [
          "#",
          "#",
          "M",
          "U",
          "G",
          "#",
          "#"
        ],
        [
          "P",
          "R",
          "O",
          "G",
          "R",
          "A",
          "M"
        ],
        [
          "E",
          "A",
          "R",
          "#",
          "A",
          "C",
          "E"
        ],
        [
          "A",
          "G",
          "E",
          "#",
          "M",
          "E",
          "N"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 0,
            "col": 0,
            "clue": "Supportive garment",
            "answer": "BRA"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Sweet green sphere harvested from garden pods",
            "answer": "PEA"
          },
          {
            "num": 7,
            "number": 7,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Sprinted through open wildflower meadows",
            "answer": "RAN"
          },
          {
            "num": 8,
            "number": 8,
            "r": 1,
            "row": 1,
            "c": 4,
            "col": 4,
            "clue": "Soft cotton scrap for dusting shelves",
            "answer": "RAG"
          },
          {
            "num": 9,
            "number": 9,
            "r": 2,
            "row": 2,
            "c": 0,
            "col": 0,
            "clue": "In any ongoing manner; from now on",
            "answer": "ANYMORE"
          },
          {
            "num": 11,
            "number": 11,
            "r": 3,
            "row": 3,
            "c": 2,
            "col": 2,
            "clue": "Chunky ceramic cup filled with soothing cider",
            "answer": "MUG"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Structured software code or schedule of events",
            "answer": "PROGRAM"
          },
          {
            "num": 16,
            "number": 16,
            "r": 5,
            "row": 5,
            "c": 0,
            "col": 0,
            "clue": "Top-ranking playing card in the deck",
            "answer": "EAR"
          },
          {
            "num": 17,
            "number": 17,
            "r": 5,
            "row": 5,
            "c": 4,
            "col": 4,
            "clue": "Grow wiser with the passing of seasons",
            "answer": "ACE"
          },
          {
            "num": 18,
            "number": 18,
            "r": 6,
            "row": 6,
            "c": 0,
            "col": 0,
            "clue": "Group of adult gentlemen in conversation",
            "answer": "AGE"
          },
          {
            "num": 19,
            "number": 19,
            "r": 6,
            "row": 6,
            "c": 4,
            "col": 4,
            "clue": "Clue for MEN",
            "answer": "MEN"
          }
        ],
        "down": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 0,
            "col": 0,
            "clue": "Sturdy branch or tough woven rope",
            "answer": "BRA"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Small green garden legume",
            "answer": "PEA"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "Warm beam of golden morning sunshine",
            "answer": "RAN"
          },
          {
            "num": 13,
            "number": 13,
            "r": 4,
            "row": 4,
            "c": 1,
            "col": 1,
            "clue": "Fabric remnant used for woodworking polish",
            "answer": "RAG"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 2,
            "col": 2,
            "clue": "Spiritual angel or gentle female name",
            "answer": "ANYMORE"
          },
          {
            "num": 10,
            "number": 10,
            "r": 2,
            "row": 2,
            "c": 3,
            "col": 3,
            "clue": "Deep ceramic vessel for soup or hot tea",
            "answer": "MUG"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Supporter of a noble cause; in favor",
            "answer": "PROGRAM"
          },
          {
            "num": 5,
            "number": 5,
            "r": 0,
            "row": 0,
            "c": 5,
            "col": 5,
            "clue": "Long geological division of time",
            "answer": "EAR"
          },
          {
            "num": 14,
            "number": 14,
            "r": 4,
            "row": 4,
            "c": 5,
            "col": 5,
            "clue": "Mineral-rich rock bearing precious metal",
            "answer": "ACE"
          },
          {
            "num": 6,
            "number": 6,
            "r": 0,
            "row": 0,
            "c": 6,
            "col": 6,
            "clue": "Have being or exist in reality",
            "answer": "AGE"
          },
          {
            "num": 15,
            "number": 15,
            "r": 4,
            "row": 4,
            "c": 6,
            "col": 6,
            "clue": "Clue for MEN",
            "answer": "MEN"
          }
        ]
      }
    },
    {
      "id": "kindred-hearth",
      "title": "Kindred Hearth",
      "difficulty": "standard",
      "gridSize": {
        "rows": 7,
        "cols": 7
      },
      "grid": [
        [
          "A",
          "S",
          "K",
          "#",
          "E",
          "A",
          "R"
        ],
        [
          "S",
          "K",
          "I",
          "#",
          "A",
          "C",
          "E"
        ],
        [
          "K",
          "I",
          "N",
          "D",
          "R",
          "E",
          "D"
        ],
        [
          "#",
          "#",
          "D",
          "O",
          "T",
          "#",
          "#"
        ],
        [
          "E",
          "A",
          "R",
          "T",
          "H",
          "E",
          "N"
        ],
        [
          "A",
          "C",
          "E",
          "#",
          "E",
          "G",
          "O"
        ],
        [
          "R",
          "E",
          "D",
          "#",
          "N",
          "O",
          "D"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 0,
            "col": 0,
            "clue": "Inquire politely for gentle guidance",
            "answer": "ASK"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Organ that listens to ambient forest rain",
            "answer": "EAR"
          },
          {
            "num": 7,
            "number": 7,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Glide gracefully over fresh powdery snow",
            "answer": "SKI"
          },
          {
            "num": 8,
            "number": 8,
            "r": 1,
            "row": 1,
            "c": 4,
            "col": 4,
            "clue": "Single high-value card in a suit",
            "answer": "ACE"
          },
          {
            "num": 9,
            "number": 9,
            "r": 2,
            "row": 2,
            "c": 0,
            "col": 0,
            "clue": "Having a shared soul, spirit, or kinship",
            "answer": "KINDRED"
          },
          {
            "num": 11,
            "number": 11,
            "r": 3,
            "row": 3,
            "c": 2,
            "col": 2,
            "clue": "Tiny circular mark on a parchment map",
            "answer": "DOT"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Crafted from wholesome clay or soil",
            "answer": "EARTHEN"
          },
          {
            "num": 16,
            "number": 16,
            "r": 5,
            "row": 5,
            "c": 0,
            "col": 0,
            "clue": "Vibrant crimson hue of autumn maple leaves",
            "answer": "ACE"
          },
          {
            "num": 17,
            "number": 17,
            "r": 5,
            "row": 5,
            "c": 4,
            "col": 4,
            "clue": "Gentle tilt of the head in quiet agreement",
            "answer": "EGO"
          },
          {
            "num": 18,
            "number": 18,
            "r": 6,
            "row": 6,
            "c": 0,
            "col": 0,
            "clue": "Clue for RED",
            "answer": "RED"
          },
          {
            "num": 19,
            "number": 19,
            "r": 6,
            "row": 6,
            "c": 4,
            "col": 4,
            "clue": "Clue for NOD",
            "answer": "NOD"
          }
        ],
        "down": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 0,
            "col": 0,
            "clue": "Inquire gently about someone's day",
            "answer": "ASK"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Planet Earth or terra cotta pottery material",
            "answer": "EAR"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "Stash away or preserve for rainy days",
            "answer": "SKI"
          },
          {
            "num": 13,
            "number": 13,
            "r": 4,
            "row": 4,
            "c": 1,
            "col": 1,
            "clue": "Solo point scored on a blazing serve",
            "answer": "ACE"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 2,
            "col": 2,
            "clue": "Natural bond of affection and relatedness",
            "answer": "KINDRED"
          },
          {
            "num": 10,
            "number": 10,
            "r": 2,
            "row": 2,
            "c": 3,
            "col": 3,
            "clue": "Single small speck or point on a canvas",
            "answer": "DOT"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Venerable timescale or historic epoch",
            "answer": "EARTHEN"
          },
          {
            "num": 5,
            "number": 5,
            "r": 0,
            "row": 0,
            "c": 5,
            "col": 5,
            "clue": "Highest card in a bridge or poker hand",
            "answer": "ACE"
          },
          {
            "num": 14,
            "number": 14,
            "r": 4,
            "row": 4,
            "c": 5,
            "col": 5,
            "clue": "Sense of self-worth and inner pride",
            "answer": "EGO"
          },
          {
            "num": 6,
            "number": 6,
            "r": 0,
            "row": 0,
            "c": 6,
            "col": 6,
            "clue": "Crimson fruit or berry color",
            "answer": "RED"
          },
          {
            "num": 15,
            "number": 15,
            "r": 4,
            "row": 4,
            "c": 6,
            "col": 6,
            "clue": "Gentle affirmation with a lowered chin",
            "answer": "NOD"
          }
        ]
      }
    },
    {
      "id": "ember-glow",
      "title": "Ember Glow",
      "difficulty": "standard",
      "gridSize": {
        "rows": 7,
        "cols": 7
      },
      "grid": [
        [
          "Z",
          "O",
          "O",
          "#",
          "F",
          "A",
          "R"
        ],
        [
          "O",
          "F",
          "F",
          "#",
          "I",
          "C",
          "E"
        ],
        [
          "O",
          "F",
          "F",
          "E",
          "R",
          "E",
          "D"
        ],
        [
          "#",
          "#",
          "E",
          "V",
          "E",
          "#",
          "#"
        ],
        [
          "F",
          "I",
          "R",
          "E",
          "M",
          "A",
          "N"
        ],
        [
          "A",
          "C",
          "E",
          "#",
          "A",
          "C",
          "E"
        ],
        [
          "R",
          "E",
          "D",
          "#",
          "N",
          "E",
          "T"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 0,
            "col": 0,
            "clue": "Park where wildlife roams in sanctuary grounds",
            "answer": "ZOO"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Distant across distant valleys and hills",
            "answer": "FAR"
          },
          {
            "num": 7,
            "number": 7,
            "r": 1,
            "row": 1,
            "c": 0,
            "col": 0,
            "clue": "Away from duty; relaxing at home",
            "answer": "OFF"
          },
          {
            "num": 8,
            "number": 8,
            "r": 1,
            "row": 1,
            "c": 4,
            "col": 4,
            "clue": "Chilled crystalline water cubes",
            "answer": "ICE"
          },
          {
            "num": 9,
            "number": 9,
            "r": 2,
            "row": 2,
            "c": 0,
            "col": 0,
            "clue": "Presented a heartfelt gift or token",
            "answer": "OFFERED"
          },
          {
            "num": 11,
            "number": 11,
            "r": 3,
            "row": 3,
            "c": 2,
            "col": 2,
            "clue": "Twilight dusk just before a festive holiday",
            "answer": "EVE"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Brave protector who battles towering blazes",
            "answer": "FIREMAN"
          },
          {
            "num": 16,
            "number": 16,
            "r": 5,
            "row": 5,
            "c": 0,
            "col": 0,
            "clue": "Warm scarlet shade of ripe strawberries",
            "answer": "ACE"
          },
          {
            "num": 17,
            "number": 17,
            "r": 5,
            "row": 5,
            "c": 4,
            "col": 4,
            "clue": "Woven mesh for catching drifted leaves",
            "answer": "ACE"
          },
          {
            "num": 18,
            "number": 18,
            "r": 6,
            "row": 6,
            "c": 0,
            "col": 0,
            "clue": "Clue for RED",
            "answer": "RED"
          },
          {
            "num": 19,
            "number": 19,
            "r": 6,
            "row": 6,
            "c": 4,
            "col": 4,
            "clue": "Clue for NET",
            "answer": "NET"
          }
        ],
        "down": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 0,
            "col": 0,
            "clue": "Park dedicated to wildlife preservation",
            "answer": "ZOO"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Heroic first responder in a shiny red truck",
            "answer": "FAR"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 1,
            "col": 1,
            "clue": "Deeply loved or affectionate; tenderly fond",
            "answer": "OFF"
          },
          {
            "num": 13,
            "number": 13,
            "r": 4,
            "row": 4,
            "c": 1,
            "col": 1,
            "clue": "Supreme playing card with a solitary pip",
            "answer": "ICE"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 2,
            "col": 2,
            "clue": "Proffered or handed forward graciously",
            "answer": "OFFERED"
          },
          {
            "num": 10,
            "number": 10,
            "r": 2,
            "row": 2,
            "c": 3,
            "col": 3,
            "clue": "Magical twilight evening before Christmas",
            "answer": "EVE"
          },
          {
            "num": 4,
            "number": 4,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Located at a great physical distance",
            "answer": "FIREMAN"
          },
          {
            "num": 5,
            "number": 5,
            "r": 0,
            "row": 0,
            "c": 5,
            "col": 5,
            "clue": "Frozen water on a winter mountain lake",
            "answer": "ACE"
          },
          {
            "num": 14,
            "number": 14,
            "r": 4,
            "row": 4,
            "c": 5,
            "col": 5,
            "clue": "Vibrant poppy or sunset color",
            "answer": "ACE"
          },
          {
            "num": 6,
            "number": 6,
            "r": 0,
            "row": 0,
            "c": 6,
            "col": 6,
            "clue": "Tangled woven web for tennis or fishing",
            "answer": "RED"
          },
          {
            "num": 15,
            "number": 15,
            "r": 4,
            "row": 4,
            "c": 6,
            "col": 6,
            "clue": "Expert ace on the tennis court",
            "answer": "NET"
          }
        ]
      }
    }
  ],
  "deep": [
    {
      "id": "sanctuary-haven",
      "title": "Sanctuary Haven",
      "difficulty": "deep",
      "gridSize": {
        "rows": 9,
        "cols": 9
      },
      "grid": [
        [
          "#",
          "#",
          "#",
          "A",
          "C",
          "E",
          "#",
          "#",
          "#"
        ],
        [
          "#",
          "#",
          "C",
          "L",
          "O",
          "A",
          "K",
          "#",
          "#"
        ],
        [
          "#",
          "P",
          "I",
          "L",
          "G",
          "R",
          "I",
          "M",
          "#"
        ],
        [
          "B",
          "A",
          "R",
          "#",
          "#",
          "#",
          "N",
          "A",
          "B"
        ],
        [
          "A",
          "R",
          "C",
          "#",
          "#",
          "#",
          "D",
          "Y",
          "E"
        ],
        [
          "G",
          "E",
          "L",
          "#",
          "#",
          "#",
          "R",
          "O",
          "D"
        ],
        [
          "#",
          "R",
          "E",
          "C",
          "O",
          "V",
          "E",
          "R",
          "#"
        ],
        [
          "#",
          "#",
          "S",
          "O",
          "L",
          "I",
          "D",
          "#",
          "#"
        ],
        [
          "#",
          "#",
          "#",
          "O",
          "D",
          "E",
          "#",
          "#",
          "#"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "Premier card in the deck or outstanding artist",
            "answer": "ACE"
          },
          {
            "num": 4,
            "number": 4,
            "r": 1,
            "row": 1,
            "c": 2,
            "col": 2,
            "clue": "Warm hooded mantle or protective woolen cape",
            "answer": "CLOAK"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 1,
            "col": 1,
            "clue": "Traveler journeying to a sacred tranquil haven",
            "answer": "PILGRIM"
          },
          {
            "num": 8,
            "number": 8,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Polished wooden counter or horizontal rail",
            "answer": "BAR"
          },
          {
            "num": 9,
            "number": 9,
            "r": 3,
            "row": 3,
            "c": 6,
            "col": 6,
            "clue": "Catch, apprehend, or seize swiftly",
            "answer": "NAB"
          },
          {
            "num": 11,
            "number": 11,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Graceful curved trajectory in the sky",
            "answer": "ARC"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 6,
            "col": 6,
            "clue": "Vibrant botanical tincture for coloring linen",
            "answer": "DYE"
          },
          {
            "num": 13,
            "number": 13,
            "r": 5,
            "row": 5,
            "c": 0,
            "col": 0,
            "clue": "Soothing translucent salve or aloe spread",
            "answer": "GEL"
          },
          {
            "num": 14,
            "number": 14,
            "r": 5,
            "row": 5,
            "c": 6,
            "col": 6,
            "clue": "Slender wooden wand or measurement staff",
            "answer": "ROD"
          },
          {
            "num": 15,
            "number": 15,
            "r": 6,
            "row": 6,
            "c": 1,
            "col": 1,
            "clue": "Regain vitality, inner peace, and balance",
            "answer": "RECOVER"
          },
          {
            "num": 19,
            "number": 19,
            "r": 7,
            "row": 7,
            "c": 2,
            "col": 2,
            "clue": "Firm, dependable, and soundly crafted",
            "answer": "SOLID"
          },
          {
            "num": 20,
            "number": 20,
            "r": 8,
            "row": 8,
            "c": 3,
            "col": 3,
            "clue": "Poem of elevated praise and admiration",
            "answer": "ODE"
          }
        ],
        "down": [
          {
            "num": 8,
            "number": 8,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Handy canvas sack for market gatherings",
            "answer": "BAG"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 1,
            "col": 1,
            "clue": "Small kitchen knife designed for peeling fruit",
            "answer": "PARER"
          },
          {
            "num": 4,
            "number": 4,
            "r": 1,
            "row": 1,
            "c": 2,
            "col": 2,
            "clue": "Round geometric rings without start or finish",
            "answer": "CIRCLES"
          },
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "Every single part of a harmonious whole",
            "answer": "ALL"
          },
          {
            "num": 16,
            "number": 16,
            "r": 6,
            "row": 6,
            "c": 3,
            "col": 3,
            "clue": "Gentle murmur of a resting dove in the rafters",
            "answer": "COO"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Small tooth on a gear wheel working in unison",
            "answer": "COG"
          },
          {
            "num": 17,
            "number": 17,
            "r": 6,
            "row": 6,
            "c": 4,
            "col": 4,
            "clue": "Venerable with age, wisdom, and rich history",
            "answer": "OLD"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 5,
            "col": 5,
            "clue": "Organ tuned to the whisper of mountain pines",
            "answer": "EAR"
          },
          {
            "num": 18,
            "number": 18,
            "r": 6,
            "row": 6,
            "c": 5,
            "col": 5,
            "clue": "Compete with cheerful enthusiasm in games",
            "answer": "VIE"
          },
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 6,
            "col": 6,
            "clue": "Having kindred spirits, warm bonds, or affection",
            "answer": "KINDRED"
          },
          {
            "num": 7,
            "number": 7,
            "r": 2,
            "row": 2,
            "c": 7,
            "col": 7,
            "clue": "Civic leader guiding a friendly countryside town",
            "answer": "MAYOR"
          },
          {
            "num": 10,
            "number": 10,
            "r": 3,
            "row": 3,
            "c": 8,
            "col": 8,
            "clue": "Cozy haven with soft pillows for deep sleep",
            "answer": "BED"
          }
        ]
      }
    },
    {
      "id": "meadow-crossing",
      "title": "Meadow Crossing",
      "difficulty": "deep",
      "gridSize": {
        "rows": 9,
        "cols": 9
      },
      "grid": [
        [
          "#",
          "#",
          "#",
          "G",
          "Y",
          "M",
          "#",
          "#",
          "#"
        ],
        [
          "#",
          "#",
          "C",
          "L",
          "A",
          "I",
          "M",
          "#",
          "#"
        ],
        [
          "#",
          "C",
          "R",
          "O",
          "W",
          "D",
          "E",
          "D",
          "#"
        ],
        [
          "B",
          "O",
          "A",
          "#",
          "#",
          "#",
          "A",
          "Y",
          "E"
        ],
        [
          "A",
          "R",
          "C",
          "#",
          "#",
          "#",
          "N",
          "I",
          "L"
        ],
        [
          "Y",
          "A",
          "K",
          "#",
          "#",
          "#",
          "I",
          "N",
          "K"
        ],
        [
          "#",
          "L",
          "E",
          "N",
          "D",
          "I",
          "N",
          "G",
          "#"
        ],
        [
          "#",
          "#",
          "D",
          "O",
          "I",
          "N",
          "G",
          "#",
          "#"
        ],
        [
          "#",
          "#",
          "#",
          "D",
          "E",
          "N",
          "#",
          "#",
          "#"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "Hall for training, strength, and athletic arts",
            "answer": "GYM"
          },
          {
            "num": 4,
            "number": 4,
            "r": 1,
            "row": 1,
            "c": 2,
            "col": 2,
            "clue": "Assert one's right to a discovery or parcel",
            "answer": "CLAIM"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 1,
            "col": 1,
            "clue": "Teeming with energetic life and cheerful activity",
            "answer": "CROWDED"
          },
          {
            "num": 8,
            "number": 8,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Feathery scarf or tropical tree serpent",
            "answer": "BOA"
          },
          {
            "num": 9,
            "number": 9,
            "r": 3,
            "row": 3,
            "c": 6,
            "col": 6,
            "clue": "Nautical affirmative response: 'Aye, captain!'",
            "answer": "AYE"
          },
          {
            "num": 11,
            "number": 11,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Curved portion of a circular ring or rainbow",
            "answer": "ARC"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 6,
            "col": 6,
            "clue": "Zero, nothingness, or blank score tally",
            "answer": "NIL"
          },
          {
            "num": 13,
            "number": 13,
            "r": 5,
            "row": 5,
            "c": 0,
            "col": 0,
            "clue": "Long-haired mountain ox of alpine heights",
            "answer": "YAK"
          },
          {
            "num": 14,
            "number": 14,
            "r": 5,
            "row": 5,
            "c": 6,
            "col": 6,
            "clue": "Rich black fluid loved by calligraphers",
            "answer": "INK"
          },
          {
            "num": 15,
            "number": 15,
            "r": 6,
            "row": 6,
            "c": 1,
            "col": 1,
            "clue": "Offering support, funds, or a helping hand",
            "answer": "LENDING"
          },
          {
            "num": 19,
            "number": 19,
            "r": 7,
            "row": 7,
            "c": 2,
            "col": 2,
            "clue": "Actively performing constructive deeds",
            "answer": "DOING"
          },
          {
            "num": 20,
            "number": 20,
            "r": 8,
            "row": 8,
            "c": 3,
            "col": 3,
            "clue": "Cozy retreat for reading by the hearth",
            "answer": "DEN"
          }
        ],
        "down": [
          {
            "num": 8,
            "number": 8,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Calm coastal inlet sheltered from ocean storms",
            "answer": "BAY"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 1,
            "col": 1,
            "clue": "Vibrant living reef formed in sunny seas",
            "answer": "CORAL"
          },
          {
            "num": 4,
            "number": 4,
            "r": 1,
            "row": 1,
            "c": 2,
            "col": 2,
            "clue": "Having fine fissures like ancient pottery glaze",
            "answer": "CRACKED"
          },
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "Soft radiant luminescence or warm ember light",
            "answer": "GLO"
          },
          {
            "num": 16,
            "number": 16,
            "r": 6,
            "row": 6,
            "c": 3,
            "col": 3,
            "clue": "Gentle downward nod of peaceful agreement",
            "answer": "NOD"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Sailboat's gentle side-to-side veer on the waves",
            "answer": "YAW"
          },
          {
            "num": 17,
            "number": 17,
            "r": 6,
            "row": 6,
            "c": 4,
            "col": 4,
            "clue": "Numbered cube rolled on cozy board game nights",
            "answer": "DIE"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 5,
            "col": 5,
            "clue": "Central, middle, or halfway point",
            "answer": "MID"
          },
          {
            "num": 18,
            "number": 18,
            "r": 6,
            "row": 6,
            "c": 5,
            "col": 5,
            "clue": "Welcoming countryside lodge for travelers",
            "answer": "INN"
          },
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 6,
            "col": 6,
            "clue": "Deep inner sense, significance, or purpose",
            "answer": "MEANING"
          },
          {
            "num": 7,
            "number": 7,
            "r": 2,
            "row": 2,
            "c": 7,
            "col": 7,
            "clue": "Fading like twilight colors as night descends",
            "answer": "DYING"
          },
          {
            "num": 10,
            "number": 10,
            "r": 3,
            "row": 3,
            "c": 8,
            "col": 8,
            "clue": "Majestic forest animal with grand velvet antlers",
            "answer": "ELK"
          }
        ]
      }
    },
    {
      "id": "artisan-realm",
      "title": "Artisan Realm",
      "difficulty": "deep",
      "gridSize": {
        "rows": 9,
        "cols": 9
      },
      "grid": [
        [
          "#",
          "#",
          "#",
          "A",
          "C",
          "E",
          "#",
          "#",
          "#"
        ],
        [
          "#",
          "#",
          "C",
          "L",
          "O",
          "A",
          "K",
          "#",
          "#"
        ],
        [
          "#",
          "P",
          "I",
          "L",
          "G",
          "R",
          "I",
          "M",
          "#"
        ],
        [
          "B",
          "A",
          "R",
          "#",
          "#",
          "#",
          "N",
          "A",
          "B"
        ],
        [
          "A",
          "R",
          "C",
          "#",
          "#",
          "#",
          "D",
          "Y",
          "E"
        ],
        [
          "G",
          "E",
          "L",
          "#",
          "#",
          "#",
          "R",
          "O",
          "D"
        ],
        [
          "#",
          "R",
          "E",
          "C",
          "O",
          "V",
          "E",
          "R",
          "#"
        ],
        [
          "#",
          "#",
          "S",
          "O",
          "L",
          "I",
          "D",
          "#",
          "#"
        ],
        [
          "#",
          "#",
          "#",
          "O",
          "D",
          "E",
          "#",
          "#",
          "#"
        ]
      ],
      "clues": {
        "across": [
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "Expert achiever or top playing card",
            "answer": "ACE"
          },
          {
            "num": 4,
            "number": 4,
            "r": 1,
            "row": 1,
            "c": 2,
            "col": 2,
            "clue": "Heavy woolen cape that keeps winter winds away",
            "answer": "CLOAK"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 1,
            "col": 1,
            "clue": "Devoted wanderer on a pilgrimage of discovery",
            "answer": "PILGRIM"
          },
          {
            "num": 8,
            "number": 8,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Rustic cafe counter serving warm beverages",
            "answer": "BAR"
          },
          {
            "num": 9,
            "number": 9,
            "r": 3,
            "row": 3,
            "c": 6,
            "col": 6,
            "clue": "Capture or scoop up deftly",
            "answer": "NAB"
          },
          {
            "num": 11,
            "number": 11,
            "r": 4,
            "row": 4,
            "c": 0,
            "col": 0,
            "clue": "Sweeping curve across a bridge span",
            "answer": "ARC"
          },
          {
            "num": 12,
            "number": 12,
            "r": 4,
            "row": 4,
            "c": 6,
            "col": 6,
            "clue": "Rich pigment extracted from madder or indigo",
            "answer": "DYE"
          },
          {
            "num": 13,
            "number": 13,
            "r": 5,
            "row": 5,
            "c": 0,
            "col": 0,
            "clue": "Smooth jelly-like cosmetic or cooling balm",
            "answer": "GEL"
          },
          {
            "num": 14,
            "number": 14,
            "r": 5,
            "row": 5,
            "c": 6,
            "col": 6,
            "clue": "Straight wooden rod or divining dowel",
            "answer": "ROD"
          },
          {
            "num": 15,
            "number": 15,
            "r": 6,
            "row": 6,
            "c": 1,
            "col": 1,
            "clue": "Reclaim lost energy through restful retreat",
            "answer": "RECOVER"
          },
          {
            "num": 19,
            "number": 19,
            "r": 7,
            "row": 7,
            "c": 2,
            "col": 2,
            "clue": "Sturdy, pure, and unbroken in structure",
            "answer": "SOLID"
          },
          {
            "num": 20,
            "number": 20,
            "r": 8,
            "row": 8,
            "c": 3,
            "col": 3,
            "clue": "Verses composed in tribute to twilight stars",
            "answer": "ODE"
          }
        ],
        "down": [
          {
            "num": 8,
            "number": 8,
            "r": 3,
            "row": 3,
            "c": 0,
            "col": 0,
            "clue": "Stout burlap sack packed for outdoor picnics",
            "answer": "BAG"
          },
          {
            "num": 6,
            "number": 6,
            "r": 2,
            "row": 2,
            "c": 1,
            "col": 1,
            "clue": "Handy blade used for peeling sweet apples",
            "answer": "PARER"
          },
          {
            "num": 4,
            "number": 4,
            "r": 1,
            "row": 1,
            "c": 2,
            "col": 2,
            "clue": "Harmonious closed loops drawn on parchment",
            "answer": "CIRCLES"
          },
          {
            "num": 1,
            "number": 1,
            "r": 0,
            "row": 0,
            "c": 3,
            "col": 3,
            "clue": "The complete sum of everything; entirely",
            "answer": "ALL"
          },
          {
            "num": 16,
            "number": 16,
            "r": 6,
            "row": 6,
            "c": 3,
            "col": 3,
            "clue": "Soft, comforting sound made by gentle pigeons",
            "answer": "COO"
          },
          {
            "num": 2,
            "number": 2,
            "r": 0,
            "row": 0,
            "c": 4,
            "col": 4,
            "clue": "Essential gear tooth turning in silent rhythm",
            "answer": "COG"
          },
          {
            "num": 17,
            "number": 17,
            "r": 6,
            "row": 6,
            "c": 4,
            "col": 4,
            "clue": "Rich with bygone memories and weathered grace",
            "answer": "OLD"
          },
          {
            "num": 3,
            "number": 3,
            "r": 0,
            "row": 0,
            "c": 5,
            "col": 5,
            "clue": "Sense organ delighting in birdsong melodies",
            "answer": "EAR"
          },
          {
            "num": 18,
            "number": 18,
            "r": 6,
            "row": 6,
            "c": 5,
            "col": 5,
            "clue": "Strive amicably in a spirited contest",
            "answer": "VIE"
          },
          {
            "num": 5,
            "number": 5,
            "r": 1,
            "row": 1,
            "c": 6,
            "col": 6,
            "clue": "Warm-hearted folks linked by shared values",
            "answer": "KINDRED"
          },
          {
            "num": 7,
            "number": 7,
            "r": 2,
            "row": 2,
            "c": 7,
            "col": 7,
            "clue": "Respected head of a peaceful village council",
            "answer": "MAYOR"
          },
          {
            "num": 10,
            "number": 10,
            "r": 3,
            "row": 3,
            "c": 8,
            "col": 8,
            "clue": "Soft mattress layered with warm quilts",
            "answer": "BED"
          }
        ]
      }
    }
  ]
};

export const DEFAULT_PUZZLES = {
  gentle: PUZZLE_BANK.gentle[0],
  standard: PUZZLE_BANK.standard[0],
  deep: PUZZLE_BANK.deep[0],
  beginner: PUZZLE_BANK.gentle[0],
  intermediate: PUZZLE_BANK.standard[0],
  master: PUZZLE_BANK.deep[0],
};

/**
 * Gets total puzzle count for a given difficulty tier.
 */
export function getPuzzleCount(difficulty = 'gentle') {
  const bank = PUZZLE_BANK[difficulty] || PUZZLE_BANK.gentle;
  return bank.length;
}

/**
 * Pre-computes cell numbers, word spans, and lookup tables for a puzzle at a given difficulty and level index.
 */
export function getPuzzle(difficulty = 'gentle', levelIndex = 0) {
  const bank = PUZZLE_BANK[difficulty] || PUZZLE_BANK.gentle;
  const safeIndex = Math.max(0, Math.min(levelIndex, bank.length - 1));
  const puzzle = bank[safeIndex] || bank[0];

  // Build cell numbers map (key: "r-c", val: number)
  const cellNumbers = {};
  const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
  allClues.forEach((clue) => {
    const r = clue.r !== undefined ? clue.r : clue.row;
    const c = clue.c !== undefined ? clue.c : clue.col;
    const num = clue.num !== undefined ? clue.num : clue.number;
    cellNumbers[`${r}-${c}`] = num;
  });

  // Map cells to active Across and Down clues
  const cellClues = {};
  puzzle.clues.across.forEach((clue) => {
    const r = clue.r !== undefined ? clue.r : clue.row;
    const c = clue.c !== undefined ? clue.c : clue.col;
    for (let cc = c; cc < c + clue.answer.length; cc++) {
      const key = `${r}-${cc}`;
      if (!cellClues[key]) cellClues[key] = {};
      cellClues[key].across = clue;
    }
  });

  puzzle.clues.down.forEach((clue) => {
    const r = clue.r !== undefined ? clue.r : clue.row;
    const c = clue.c !== undefined ? clue.c : clue.col;
    for (let rr = r; rr < r + clue.answer.length; rr++) {
      const key = `${rr}-${c}`;
      if (!cellClues[key]) cellClues[key] = {};
      cellClues[key].down = clue;
    }
  });

  return {
    ...puzzle,
    cellNumbers,
    cellClues,
  };
}

/**
 * Creates an empty player grid initialized with empty strings for playable cells and '#' for black cells.
 */
export function createPlayerGrid(puzzle) {
  const { rows, cols } = puzzle.gridSize;
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (puzzle.grid[r][c] === '#' ? '#' : ''))
  );
}

/**
 * Checks if the player's grid completely matches the puzzle solution.
 */
export function isSolved(playerGrid, puzzle) {
  const { rows, cols } = puzzle.gridSize;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (puzzle.grid[r][c] === '#') continue;
      const playerChar = (playerGrid[r]?.[c] || '').toUpperCase();
      const solutionChar = (puzzle.grid[r][c] || '').toUpperCase();
      if (playerChar !== solutionChar) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks if a specific clue is fully and correctly answered by the player.
 */
export function isClueSolved(clue, direction, playerGrid) {
  const row = clue.r !== undefined ? clue.r : clue.row;
  const col = clue.c !== undefined ? clue.c : clue.col;
  const answer = clue.answer;
  for (let i = 0; i < answer.length; i++) {
    const r = direction === 'across' ? row : row + i;
    const c = direction === 'across' ? col + i : col;
    const char = (playerGrid[r]?.[c] || '').toUpperCase();
    if (char !== answer[i].toUpperCase()) return false;
  }
  return true;
}

/**
 * Gets cells that belong to a specific clue.
 */
export function getClueCells(clue, direction) {
  const cells = [];
  const row = clue.r !== undefined ? clue.r : clue.row;
  const col = clue.c !== undefined ? clue.c : clue.col;
  const answer = clue.answer;
  for (let i = 0; i < answer.length; i++) {
    const r = direction === 'across' ? row : row + i;
    const c = direction === 'across' ? col + i : col;
    cells.push({ r, c });
  }
  return cells;
}

/**
 * Finds next playable cell in current direction.
 */
export function getNextCell(r, c, direction, puzzle) {
  const clue = puzzle.cellClues[`${r}-${c}`]?.[direction];
  if (!clue) return { r, c };

  const clueCells = getClueCells(clue, direction);
  const currentIndex = clueCells.findIndex((cell) => cell.r === r && cell.c === c);

  if (currentIndex !== -1 && currentIndex < clueCells.length - 1) {
    return clueCells[currentIndex + 1];
  }
  return { r, c };
}

/**
 * Finds previous playable cell in current direction.
 */
export function getPrevCell(r, c, direction, puzzle) {
  const clue = puzzle.cellClues[`${r}-${c}`]?.[direction];
  if (!clue) return { r, c };

  const clueCells = getClueCells(clue, direction);
  const currentIndex = clueCells.findIndex((cell) => cell.r === r && cell.c === c);

  if (currentIndex > 0) {
    return clueCells[currentIndex - 1];
  }
  return { r, c };
}

/**
 * Resolves a hint cell for the crossword.
 * Priority:
 * 1. Currently selected cell if empty or incorrect.
 * 2. First empty or incorrect cell in the active word.
 * 3. First empty or incorrect cell in the entire grid.
 */
export function getHintCell(playerGrid, puzzle, selectedCell, direction = 'across') {
  if (!puzzle || !puzzle.grid || !playerGrid) return null;

  const { rows, cols } = puzzle.gridSize;

  // 1. Check selected cell
  if (selectedCell && selectedCell.r >= 0 && selectedCell.c >= 0) {
    const { r, c } = selectedCell;
    if (puzzle.grid[r]?.[c] && puzzle.grid[r][c] !== '#') {
      const current = (playerGrid[r]?.[c] || '').toUpperCase();
      const target = (puzzle.grid[r][c] || '').toUpperCase();
      if (current !== target) {
        return { r, c, char: target };
      }
    }
  }

  // 2. Check active word
  if (selectedCell && puzzle.cellClues) {
    const key = `${selectedCell.r}-${selectedCell.c}`;
    const clue = puzzle.cellClues[key]?.[direction] || puzzle.cellClues[key]?.across || puzzle.cellClues[key]?.down;
    if (clue) {
      const cells = getClueCells(clue, direction);
      for (const cell of cells) {
        const current = (playerGrid[cell.r]?.[cell.c] || '').toUpperCase();
        const target = (puzzle.grid[cell.r]?.[cell.c] || '').toUpperCase();
        if (current !== target) {
          return { r: cell.r, c: cell.c, char: target };
        }
      }
    }
  }

  // 3. Fallback: Search the entire grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (puzzle.grid[r]?.[c] === '#') continue;
      const current = (playerGrid[r]?.[c] || '').toUpperCase();
      const target = (puzzle.grid[r]?.[c] || '').toUpperCase();
      if (current !== target) {
        return { r, c, char: target };
      }
    }
  }

  return null;
}

/**
 * Returns a fully solved grid for the puzzle.
 */
export function getSolutionGrid(puzzle) {
  if (!puzzle || !puzzle.grid || !puzzle.gridSize) return [];
  const { rows, cols } = puzzle.gridSize;
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (puzzle.grid[r][c] === '#' ? '#' : puzzle.grid[r][c].toUpperCase()))
  );
}
