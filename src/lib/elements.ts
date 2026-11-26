/**
 * Periodic Table of Elements — 118 elements.
 * Each element serves as a physical resource and tradable cargo.
 * Properties: atomic number, symbol, name, rarity tier,
 * extraction duration (seconds), baseline value (Credits, integer).
 */
export type ElementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface PeriodicElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  rarity: ElementRarity;
  extractionDuration: number; // seconds
  baselineValue: number; // Credits (integer)
}

// ── 118 elements ──────────────────────────────────────────────────────────
const H: PeriodicElement = {
  atomicNumber: 1,
  symbol: 'H',
  name: 'Hydrogen',
  rarity: 'common',
  extractionDuration: 1,
  baselineValue: 10,
};
const He: PeriodicElement = {
  atomicNumber: 2,
  symbol: 'He',
  name: 'Helium',
  rarity: 'common',
  extractionDuration: 1,
  baselineValue: 15,
};
const Li: PeriodicElement = {
  atomicNumber: 3,
  symbol: 'Li',
  name: 'Lithium',
  rarity: 'uncommon',
  extractionDuration: 2,
  baselineValue: 45,
};
const Be: PeriodicElement = {
  atomicNumber: 4,
  symbol: 'Be',
  name: 'Beryllium',
  rarity: 'uncommon',
  extractionDuration: 2,
  baselineValue: 55,
};
const B: PeriodicElement = {
  atomicNumber: 5,
  symbol: 'B',
  name: 'Boron',
  rarity: 'uncommon',
  extractionDuration: 3,
  baselineValue: 70,
};
const C: PeriodicElement = {
  atomicNumber: 6,
  symbol: 'C',
  name: 'Carbon',
  rarity: 'common',
  extractionDuration: 1,
  baselineValue: 30,
};
const N: PeriodicElement = {
  atomicNumber: 7,
  symbol: 'N',
  name: 'Nitrogen',
  rarity: 'common',
  extractionDuration: 1,
  baselineValue: 25,
};
const O: PeriodicElement = {
  atomicNumber: 8,
  symbol: 'O',
  name: 'Oxygen',
  rarity: 'common',
  extractionDuration: 1,
  baselineValue: 35,
};
const F: PeriodicElement = {
  atomicNumber: 9,
  symbol: 'F',
  name: 'Fluorine',
  rarity: 'uncommon',
  extractionDuration: 3,
  baselineValue: 80,
};
const Ne: PeriodicElement = {
  atomicNumber: 10,
  symbol: 'Ne',
  name: 'Neon',
  rarity: 'uncommon',
  extractionDuration: 3,
  baselineValue: 90,
};
const Na: PeriodicElement = {
  atomicNumber: 11,
  symbol: 'Na',
  name: 'Sodium',
  rarity: 'uncommon',
  extractionDuration: 2,
  baselineValue: 40,
};
const Mg: PeriodicElement = {
  atomicNumber: 12,
  symbol: 'Mg',
  name: 'Magnesium',
  rarity: 'common',
  extractionDuration: 2,
  baselineValue: 50,
};
const Al: PeriodicElement = {
  atomicNumber: 13,
  symbol: 'Al',
  name: 'Aluminium',
  rarity: 'common',
  extractionDuration: 3,
  baselineValue: 65,
};
const Si: PeriodicElement = {
  atomicNumber: 14,
  symbol: 'Si',
  name: 'Silicon',
  rarity: 'common',
  extractionDuration: 2,
  baselineValue: 40,
};
const P: PeriodicElement = {
  atomicNumber: 15,
  symbol: 'P',
  name: 'Phosphorus',
  rarity: 'uncommon',
  extractionDuration: 4,
  baselineValue: 85,
};
const S: PeriodicElement = {
  atomicNumber: 16,
  symbol: 'S',
  name: 'Sulfur',
  rarity: 'uncommon',
  extractionDuration: 3,
  baselineValue: 55,
};
const Cl: PeriodicElement = {
  atomicNumber: 17,
  symbol: 'Cl',
  name: 'Chlorine',
  rarity: 'uncommon',
  extractionDuration: 3,
  baselineValue: 85,
};
const Ar: PeriodicElement = {
  atomicNumber: 18,
  symbol: 'Ar',
  name: 'Argon',
  rarity: 'uncommon',
  extractionDuration: 2,
  baselineValue: 70,
};
const K: PeriodicElement = {
  atomicNumber: 19,
  symbol: 'K',
  name: 'Potassium',
  rarity: 'uncommon',
  extractionDuration: 3,
  baselineValue: 50,
};
const Ca: PeriodicElement = {
  atomicNumber: 20,
  symbol: 'Ca',
  name: 'Calcium',
  rarity: 'common',
  extractionDuration: 2,
  baselineValue: 45,
};
const Sc: PeriodicElement = {
  atomicNumber: 21,
  symbol: 'Sc',
  name: 'Scandium',
  rarity: 'rare',
  extractionDuration: 5,
  baselineValue: 180,
};
const Ti: PeriodicElement = {
  atomicNumber: 22,
  symbol: 'Ti',
  name: 'Titanium',
  rarity: 'rare',
  extractionDuration: 5,
  baselineValue: 200,
};
const V: PeriodicElement = {
  atomicNumber: 23,
  symbol: 'V',
  name: 'Vanadium',
  rarity: 'rare',
  extractionDuration: 6,
  baselineValue: 220,
};
const Cr: PeriodicElement = {
  atomicNumber: 24,
  symbol: 'Cr',
  name: 'Chromium',
  rarity: 'rare',
  extractionDuration: 5,
  baselineValue: 190,
};
const Mn: PeriodicElement = {
  atomicNumber: 25,
  symbol: 'Mn',
  name: 'Manganese',
  rarity: 'rare',
  extractionDuration: 6,
  baselineValue: 175,
};
const Fe: PeriodicElement = {
  atomicNumber: 26,
  symbol: 'Fe',
  name: 'Iron',
  rarity: 'common',
  extractionDuration: 3,
  baselineValue: 55,
};
const Co: PeriodicElement = {
  atomicNumber: 27,
  symbol: 'Co',
  name: 'Cobalt',
  rarity: 'rare',
  extractionDuration: 6,
  baselineValue: 250,
};
const Ni: PeriodicElement = {
  atomicNumber: 28,
  symbol: 'Ni',
  name: 'Nickel',
  rarity: 'rare',
  extractionDuration: 5,
  baselineValue: 210,
};
const Cu: PeriodicElement = {
  atomicNumber: 29,
  symbol: 'Cu',
  name: 'Copper',
  rarity: 'uncommon',
  extractionDuration: 4,
  baselineValue: 90,
};
const Zn: PeriodicElement = {
  atomicNumber: 30,
  symbol: 'Zn',
  name: 'Zinc',
  rarity: 'uncommon',
  extractionDuration: 4,
  baselineValue: 75,
};
const Ga: PeriodicElement = {
  atomicNumber: 31,
  symbol: 'Ga',
  name: 'Gallium',
  rarity: 'rare',
  extractionDuration: 6,
  baselineValue: 230,
};
const Ge: PeriodicElement = {
  atomicNumber: 32,
  symbol: 'Ge',
  name: 'Germanium',
  rarity: 'rare',
  extractionDuration: 5,
  baselineValue: 215,
};
const As: PeriodicElement = {
  atomicNumber: 33,
  symbol: 'As',
  name: 'Arsenic',
  rarity: 'rare',
  extractionDuration: 6,
  baselineValue: 160,
};
const Se: PeriodicElement = {
  atomicNumber: 34,
  symbol: 'Se',
  name: 'Selenium',
  rarity: 'uncommon',
  extractionDuration: 4,
  baselineValue: 95,
};
const Br: PeriodicElement = {
  atomicNumber: 35,
  symbol: 'Br',
  name: 'Bromine',
  rarity: 'uncommon',
  extractionDuration: 4,
  baselineValue: 88,
};
const Kr: PeriodicElement = {
  atomicNumber: 36,
  symbol: 'Kr',
  name: 'Krypton',
  rarity: 'uncommon',
  extractionDuration: 3,
  baselineValue: 100,
};
const Rb: PeriodicElement = {
  atomicNumber: 37,
  symbol: 'Rb',
  name: 'Rubidium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 260,
};
const Sr: PeriodicElement = {
  atomicNumber: 38,
  symbol: 'Sr',
  name: 'Strontium',
  rarity: 'rare',
  extractionDuration: 6,
  baselineValue: 240,
};
const Y: PeriodicElement = {
  atomicNumber: 39,
  symbol: 'Y',
  name: 'Yttrium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 270,
};
const Zr: PeriodicElement = {
  atomicNumber: 40,
  symbol: 'Zr',
  name: 'Zirconium',
  rarity: 'rare',
  extractionDuration: 6,
  baselineValue: 250,
};
const Nb: PeriodicElement = {
  atomicNumber: 41,
  symbol: 'Nb',
  name: 'Niobium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 280,
};
const Mo: PeriodicElement = {
  atomicNumber: 42,
  symbol: 'Mo',
  name: 'Molybdenum',
  rarity: 'rare',
  extractionDuration: 6,
  baselineValue: 230,
};
const Tc: PeriodicElement = {
  atomicNumber: 43,
  symbol: 'Tc',
  name: 'Technetium',
  rarity: 'rare',
  extractionDuration: 8,
  baselineValue: 300,
};
const Ru: PeriodicElement = {
  atomicNumber: 44,
  symbol: 'Ru',
  name: 'Ruthenium',
  rarity: 'epic',
  extractionDuration: 8,
  baselineValue: 350,
};
const Rh: PeriodicElement = {
  atomicNumber: 45,
  symbol: 'Rh',
  name: 'Rhodium',
  rarity: 'epic',
  extractionDuration: 8,
  baselineValue: 400,
};
const Pd: PeriodicElement = {
  atomicNumber: 46,
  symbol: 'Pd',
  name: 'Palladium',
  rarity: 'epic',
  extractionDuration: 7,
  baselineValue: 360,
};
const Ag: PeriodicElement = {
  atomicNumber: 47,
  symbol: 'Ag',
  name: 'Silver',
  rarity: 'uncommon',
  extractionDuration: 5,
  baselineValue: 120,
};
const Cd: PeriodicElement = {
  atomicNumber: 48,
  symbol: 'Cd',
  name: 'Cadmium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 200,
};
const In: PeriodicElement = {
  atomicNumber: 49,
  symbol: 'In',
  name: 'Indium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 220,
};
const Sn: PeriodicElement = {
  atomicNumber: 50,
  symbol: 'Sn',
  name: 'Tin',
  rarity: 'uncommon',
  extractionDuration: 5,
  baselineValue: 80,
};
const Sb: PeriodicElement = {
  atomicNumber: 51,
  symbol: 'Sb',
  name: 'Antimony',
  rarity: 'rare',
  extractionDuration: 8,
  baselineValue: 250,
};
const Te: PeriodicElement = {
  atomicNumber: 52,
  symbol: 'Te',
  name: 'Tellurium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 210,
};
const I: PeriodicElement = {
  atomicNumber: 53,
  symbol: 'I',
  name: 'Iodine',
  rarity: 'uncommon',
  extractionDuration: 5,
  baselineValue: 100,
};
const Xe: PeriodicElement = {
  atomicNumber: 54,
  symbol: 'Xe',
  name: 'Xenon',
  rarity: 'uncommon',
  extractionDuration: 4,
  baselineValue: 110,
};
const Cs: PeriodicElement = {
  atomicNumber: 55,
  symbol: 'Cs',
  name: 'Cesium',
  rarity: 'rare',
  extractionDuration: 8,
  baselineValue: 290,
};
const Ba: PeriodicElement = {
  atomicNumber: 56,
  symbol: 'Ba',
  name: 'Barium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 240,
};
const La: PeriodicElement = {
  atomicNumber: 57,
  symbol: 'La',
  name: 'Lanthanum',
  rarity: 'rare',
  extractionDuration: 8,
  baselineValue: 295,
};
const Ce: PeriodicElement = {
  atomicNumber: 58,
  symbol: 'Ce',
  name: 'Cerium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 260,
};
const Pr: PeriodicElement = {
  atomicNumber: 59,
  symbol: 'Pr',
  name: 'Praseodymium',
  rarity: 'rare',
  extractionDuration: 8,
  baselineValue: 285,
};
const Nd: PeriodicElement = {
  atomicNumber: 60,
  symbol: 'Nd',
  name: 'Neodymium',
  rarity: 'rare',
  extractionDuration: 7,
  baselineValue: 270,
};
const Pm: PeriodicElement = {
  atomicNumber: 61,
  symbol: 'Pm',
  name: 'Promethium',
  rarity: 'rare',
  extractionDuration: 9,
  baselineValue: 320,
};
const Sm: PeriodicElement = {
  atomicNumber: 62,
  symbol: 'Sm',
  name: 'Samarium',
  rarity: 'rare',
  extractionDuration: 8,
  baselineValue: 280,
};
const Eu: PeriodicElement = {
  atomicNumber: 63,
  symbol: 'Eu',
  name: 'Europium',
  rarity: 'rare',
  extractionDuration: 8,
  baselineValue: 290,
};
const Gd: PeriodicElement = {
  atomicNumber: 64,
  symbol: 'Gd',
  name: 'Gadolinium',
  rarity: 'epic',
  extractionDuration: 9,
  baselineValue: 380,
};
const Tb: PeriodicElement = {
  atomicNumber: 65,
  symbol: 'Tb',
  name: 'Terbium',
  rarity: 'epic',
  extractionDuration: 9,
  baselineValue: 420,
};
const Dy: PeriodicElement = {
  atomicNumber: 66,
  symbol: 'Dy',
  name: 'Dysprosium',
  rarity: 'epic',
  extractionDuration: 9,
  baselineValue: 410,
};
const Ho: PeriodicElement = {
  atomicNumber: 67,
  symbol: 'Ho',
  name: 'Holmium',
  rarity: 'epic',
  extractionDuration: 9,
  baselineValue: 430,
};
const Er: PeriodicElement = {
  atomicNumber: 68,
  symbol: 'Er',
  name: 'Erbium',
  rarity: 'epic',
  extractionDuration: 8,
  baselineValue: 370,
};
const Tm: PeriodicElement = {
  atomicNumber: 69,
  symbol: 'Tm',
  name: 'Thulium',
  rarity: 'epic',
  extractionDuration: 9,
  baselineValue: 440,
};
const Yb: PeriodicElement = {
  atomicNumber: 70,
  symbol: 'Yb',
  name: 'Ytterbium',
  rarity: 'epic',
  extractionDuration: 8,
  baselineValue: 360,
};
const Lu: PeriodicElement = {
  atomicNumber: 71,
  symbol: 'Lu',
  name: 'Lutetium',
  rarity: 'rare',
  extractionDuration: 9,
  baselineValue: 310,
};
const Hf: PeriodicElement = {
  atomicNumber: 72,
  symbol: 'Hf',
  name: 'Hafnium',
  rarity: 'epic',
  extractionDuration: 9,
  baselineValue: 400,
};
const Ta: PeriodicElement = {
  atomicNumber: 73,
  symbol: 'Ta',
  name: 'Tantalum',
  rarity: 'epic',
  extractionDuration: 10,
  baselineValue: 450,
};
const W: PeriodicElement = {
  atomicNumber: 74,
  symbol: 'W',
  name: 'Tungsten',
  rarity: 'epic',
  extractionDuration: 9,
  baselineValue: 420,
};
const Re: PeriodicElement = {
  atomicNumber: 75,
  symbol: 'Re',
  name: 'Rhenium',
  rarity: 'epic',
  extractionDuration: 10,
  baselineValue: 480,
};
const Os: PeriodicElement = {
  atomicNumber: 76,
  symbol: 'Os',
  name: 'Osmium',
  rarity: 'legendary',
  extractionDuration: 12,
  baselineValue: 600,
};
const Ir: PeriodicElement = {
  atomicNumber: 77,
  symbol: 'Ir',
  name: 'Iridium',
  rarity: 'legendary',
  extractionDuration: 12,
  baselineValue: 620,
};
const Pt: PeriodicElement = {
  atomicNumber: 78,
  symbol: 'Pt',
  name: 'Platinum',
  rarity: 'legendary',
  extractionDuration: 11,
  baselineValue: 580,
};
const Au: PeriodicElement = {
  atomicNumber: 79,
  symbol: 'Au',
  name: 'Gold',
  rarity: 'legendary',
  extractionDuration: 10,
  baselineValue: 550,
};
const Hg: PeriodicElement = {
  atomicNumber: 80,
  symbol: 'Hg',
  name: 'Mercury',
  rarity: 'legendary',
  extractionDuration: 11,
  baselineValue: 560,
};
const Tl: PeriodicElement = {
  atomicNumber: 81,
  symbol: 'Tl',
  name: 'Thallium',
  rarity: 'legendary',
  extractionDuration: 10,
  baselineValue: 520,
};
const Pb: PeriodicElement = {
  atomicNumber: 82,
  symbol: 'Pb',
  name: 'Lead',
  rarity: 'legendary',
  extractionDuration: 9,
  baselineValue: 480,
};
const Bi: PeriodicElement = {
  atomicNumber: 83,
  symbol: 'Bi',
  name: 'Bismuth',
  rarity: 'legendary',
  extractionDuration: 10,
  baselineValue: 510,
};
const Po: PeriodicElement = {
  atomicNumber: 84,
  symbol: 'Po',
  name: 'Polonium',
  rarity: 'legendary',
  extractionDuration: 11,
  baselineValue: 570,
};
const At: PeriodicElement = {
  atomicNumber: 85,
  symbol: 'At',
  name: 'Astatine',
  rarity: 'legendary',
  extractionDuration: 12,
  baselineValue: 530,
};
const Rn: PeriodicElement = {
  atomicNumber: 86,
  symbol: 'Rn',
  name: 'Radon',
  rarity: 'legendary',
  extractionDuration: 10,
  baselineValue: 500,
};
const Fr: PeriodicElement = {
  atomicNumber: 87,
  symbol: 'Fr',
  name: 'Francium',
  rarity: 'legendary',
  extractionDuration: 13,
  baselineValue: 650,
};
const Ra: PeriodicElement = {
  atomicNumber: 88,
  symbol: 'Ra',
  name: 'Radium',
  rarity: 'legendary',
  extractionDuration: 12,
  baselineValue: 610,
};
const Ac: PeriodicElement = {
  atomicNumber: 89,
  symbol: 'Ac',
  name: 'Actinium',
  rarity: 'legendary',
  extractionDuration: 13,
  baselineValue: 660,
};
const Th: PeriodicElement = {
  atomicNumber: 90,
  symbol: 'Th',
  name: 'Thorium',
  rarity: 'legendary',
  extractionDuration: 11,
  baselineValue: 590,
};
const Pa: PeriodicElement = {
  atomicNumber: 91,
  symbol: 'Pa',
  name: 'Protactinium',
  rarity: 'legendary',
  extractionDuration: 12,
  baselineValue: 630,
};
const U: PeriodicElement = {
  atomicNumber: 92,
  symbol: 'U',
  name: 'Uranium',
  rarity: 'legendary',
  extractionDuration: 11,
  baselineValue: 570,
};
const Np: PeriodicElement = {
  atomicNumber: 93,
  symbol: 'Np',
  name: 'Neptunium',
  rarity: 'legendary',
  extractionDuration: 13,
  baselineValue: 680,
};
const Pu: PeriodicElement = {
  atomicNumber: 94,
  symbol: 'Pu',
  name: 'Plutonium',
  rarity: 'legendary',
  extractionDuration: 12,
  baselineValue: 640,
};
const Am: PeriodicElement = {
  atomicNumber: 95,
  symbol: 'Am',
  name: 'Americium',
  rarity: 'legendary',
  extractionDuration: 13,
  baselineValue: 670,
};
const Cm: PeriodicElement = {
  atomicNumber: 96,
  symbol: 'Cm',
  name: 'Curium',
  rarity: 'legendary',
  extractionDuration: 14,
  baselineValue: 700,
};
const Bk: PeriodicElement = {
  atomicNumber: 97,
  symbol: 'Bk',
  name: 'Berkelium',
  rarity: 'legendary',
  extractionDuration: 13,
  baselineValue: 660,
};
const Cf: PeriodicElement = {
  atomicNumber: 98,
  symbol: 'Cf',
  name: 'Californium',
  rarity: 'legendary',
  extractionDuration: 14,
  baselineValue: 720,
};
const Es: PeriodicElement = {
  atomicNumber: 99,
  symbol: 'Es',
  name: 'Einsteinium',
  rarity: 'legendary',
  extractionDuration: 15,
  baselineValue: 750,
};
const Fm: PeriodicElement = {
  atomicNumber: 100,
  symbol: 'Fm',
  name: 'Fermium',
  rarity: 'legendary',
  extractionDuration: 14,
  baselineValue: 710,
};
const Md: PeriodicElement = {
  atomicNumber: 101,
  symbol: 'Md',
  name: 'Mendelevium',
  rarity: 'legendary',
  extractionDuration: 15,
  baselineValue: 760,
};
const No: PeriodicElement = {
  atomicNumber: 102,
  symbol: 'No',
  name: 'Nobelium',
  rarity: 'legendary',
  extractionDuration: 14,
  baselineValue: 700,
};
const Lr: PeriodicElement = {
  atomicNumber: 103,
  symbol: 'Lr',
  name: 'Lawrencium',
  rarity: 'legendary',
  extractionDuration: 15,
  baselineValue: 730,
};
const Rf: PeriodicElement = {
  atomicNumber: 104,
  symbol: 'Rf',
  name: 'Rutherfordium',
  rarity: 'legendary',
  extractionDuration: 16,
  baselineValue: 780,
};
const Db: PeriodicElement = {
  atomicNumber: 105,
  symbol: 'Db',
  name: 'Dubnium',
  rarity: 'legendary',
  extractionDuration: 15,
  baselineValue: 750,
};
const Sg: PeriodicElement = {
  atomicNumber: 106,
  symbol: 'Sg',
  name: 'Seaborgium',
  rarity: 'legendary',
  extractionDuration: 16,
  baselineValue: 790,
};
const Bh: PeriodicElement = {
  atomicNumber: 107,
  symbol: 'Bh',
  name: 'Bohrium',
  rarity: 'legendary',
  extractionDuration: 17,
  baselineValue: 800,
};
const Hs: PeriodicElement = {
  atomicNumber: 108,
  symbol: 'Hs',
  name: 'Hassium',
  rarity: 'legendary',
  extractionDuration: 16,
  baselineValue: 770,
};
const Mt: PeriodicElement = {
  atomicNumber: 109,
  symbol: 'Mt',
  name: 'Meitnerium',
  rarity: 'legendary',
  extractionDuration: 17,
  baselineValue: 820,
};
const Ds: PeriodicElement = {
  atomicNumber: 110,
  symbol: 'Ds',
  name: 'Darmstadtium',
  rarity: 'legendary',
  extractionDuration: 17,
  baselineValue: 810,
};
const Rg: PeriodicElement = {
  atomicNumber: 111,
  symbol: 'Rg',
  name: 'Roentgenium',
  rarity: 'legendary',
  extractionDuration: 18,
  baselineValue: 850,
};
const Cn: PeriodicElement = {
  atomicNumber: 112,
  symbol: 'Cn',
  name: 'Copernicium',
  rarity: 'legendary',
  extractionDuration: 18,
  baselineValue: 840,
};
const Nh: PeriodicElement = {
  atomicNumber: 113,
  symbol: 'Nh',
  name: 'Nihonium',
  rarity: 'legendary',
  extractionDuration: 19,
  baselineValue: 880,
};
const Fl: PeriodicElement = {
  atomicNumber: 114,
  symbol: 'Fl',
  name: 'Flerovium',
  rarity: 'legendary',
  extractionDuration: 18,
  baselineValue: 830,
};
const Mc: PeriodicElement = {
  atomicNumber: 115,
  symbol: 'Mc',
  name: 'Moscovium',
  rarity: 'legendary',
  extractionDuration: 19,
  baselineValue: 870,
};
const Lv: PeriodicElement = {
  atomicNumber: 116,
  symbol: 'Lv',
  name: 'Livermorium',
  rarity: 'legendary',
  extractionDuration: 19,
  baselineValue: 860,
};
const Ts: PeriodicElement = {
  atomicNumber: 117,
  symbol: 'Ts',
  name: 'Tennessine',
  rarity: 'legendary',
  extractionDuration: 20,
  baselineValue: 900,
};
const Og: PeriodicElement = {
  atomicNumber: 118,
  symbol: 'Og',
  name: 'Oganesson',
  rarity: 'legendary',
  extractionDuration: 20,
  baselineValue: 890,
};

export const ELEMENTS: PeriodicElement[] = [
  H,
  He,
  Li,
  Be,
  B,
  C,
  N,
  O,
  F,
  Ne,
  Na,
  Mg,
  Al,
  Si,
  P,
  S,
  Cl,
  Ar,
  K,
  Ca,
  Sc,
  Ti,
  V,
  Cr,
  Mn,
  Fe,
  Co,
  Ni,
  Cu,
  Zn,
  Ga,
  Ge,
  As,
  Se,
  Br,
  Kr,
  Rb,
  Sr,
  Y,
  Zr,
  Nb,
  Mo,
  Tc,
  Ru,
  Rh,
  Pd,
  Ag,
  Cd,
  In,
  Sn,
  Sb,
  Te,
  I,
  Xe,
  Cs,
  Ba,
  La,
  Ce,
  Pr,
  Nd,
  Pm,
  Sm,
  Eu,
  Gd,
  Tb,
  Dy,
  Ho,
  Er,
  Tm,
  Yb,
  Lu,
  Hf,
  Ta,
  W,
  Re,
  Os,
  Ir,
  Pt,
  Au,
  Hg,
  Tl,
  Pb,
  Bi,
  Po,
  At,
  Rn,
  Fr,
  Ra,
  Ac,
  Th,
  Pa,
  U,
  Np,
  Pu,
  Am,
  Cm,
  Bk,
  Cf,
  Es,
  Fm,
  Md,
  No,
  Lr,
  Rf,
  Db,
  Sg,
  Bh,
  Hs,
  Mt,
  Ds,
  Rg,
  Cn,
  Nh,
  Fl,
  Mc,
  Lv,
  Ts,
  Og,
];
