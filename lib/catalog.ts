export const categories = [
  {
    slug: "table",
    name: "Table lights",
    description: "A pool of light, right where you need it.",
  },
  {
    slug: "floor",
    name: "Floor lights",
    description: "Give a quiet corner a new purpose.",
  },
  {
    slug: "pendant",
    name: "Pendant lights",
    description: "Simple forms that bring a room together.",
  },
  {
    slug: "wall",
    name: "Wall lights",
    description: "Thoughtful lighting with a smaller footprint.",
  },
];
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  finish: string;
  description: string;
  dimensions: string;
  images: string[];
  added: number;
};
const seed = [
  [
    "dome-table",
    "Dome",
    "table",
    18900,
    12,
    "Brushed aluminum",
    "A generous metal dome casts a soft circle of light. A tactile switch sits at the base.",
    "32 × 32 × 38 cm",
  ],
  [
    "arc-table",
    "Arc",
    "table",
    14900,
    8,
    "Opal glass / black",
    "An opal globe suspended in a fine metal arch. Diffused light for a bedside or reading nook.",
    "24 × 20 × 42 cm",
  ],
  [
    "pleat-table",
    "Pleat",
    "table",
    16800,
    7,
    "Linen / charcoal",
    "A pleated linen shade softens the light above a weighty ceramic base.",
    "28 × 28 × 45 cm",
  ],
  [
    "column-table",
    "Column",
    "table",
    21500,
    5,
    "White alabaster",
    "Natural stone veining makes each column distinct. A small light with a reassuring weight.",
    "14 × 14 × 30 cm",
  ],
  [
    "reach-floor",
    "Reach",
    "floor",
    28900,
    9,
    "Black / aluminum",
    "An adjustable arm brings focused light over a favorite chair.",
    "45 × 30 × 148 cm",
  ],
  [
    "halo-floor",
    "Halo",
    "floor",
    34500,
    4,
    "Brushed aluminum",
    "A broad illuminated ring brings even ambient light to larger rooms.",
    "48 × 48 × 165 cm",
  ],
  [
    "stem-floor",
    "Stem",
    "floor",
    24900,
    10,
    "Opal glass / charcoal",
    "A single globe on a slender stem. Simple, diffuse light from every angle.",
    "28 × 28 × 152 cm",
  ],
  [
    "fold-floor",
    "Fold",
    "floor",
    31500,
    0,
    "White metal",
    "Folded sheet metal directs a wash of light toward the wall.",
    "32 × 28 × 156 cm",
  ],
  [
    "disc-pendant",
    "Disc",
    "pendant",
    17900,
    11,
    "Brushed aluminum",
    "A low profile disc with a generous downlight for dining and working.",
    "42 × 42 × 12 cm",
  ],
  [
    "globe-pendant",
    "Globe",
    "pendant",
    13900,
    14,
    "Opal glass",
    "A familiar sphere with a beautiful, even glow. Hang alone or in a pair.",
    "30 × 30 × 30 cm",
  ],
  [
    "cone-pendant",
    "Cone",
    "pendant",
    12900,
    16,
    "Charcoal",
    "A precise cone shade keeps light focused on the surface below.",
    "26 × 26 × 28 cm",
  ],
  [
    "ripple-pendant",
    "Ripple",
    "pendant",
    19800,
    6,
    "White paper",
    "Pleated paper gives this generous shade its lightness and subtle texture.",
    "48 × 48 × 32 cm",
  ],
  [
    "pivot-wall",
    "Pivot",
    "wall",
    9900,
    18,
    "Matte black",
    "An adjustable shade for bedside reading and compact workspaces.",
    "18 × 22 × 24 cm",
  ],
  [
    "orbit-wall",
    "Orbit",
    "wall",
    14500,
    9,
    "Aluminum / opal",
    "A luminous globe sits against a circular aluminum backplate.",
    "22 × 18 × 22 cm",
  ],
  [
    "line-wall",
    "Line",
    "wall",
    11900,
    13,
    "Brushed aluminum",
    "A slim vertical bar washes the wall with soft, indirect light.",
    "6 × 8 × 50 cm",
  ],
  [
    "shell-wall",
    "Shell",
    "wall",
    15800,
    8,
    "White ceramic",
    "A curved ceramic shade with a soft internal glow.",
    "24 × 14 × 26 cm",
  ],
] satisfies [string, string, string, number, number, string, string, string][];
export const products: Product[] = seed.map(
  ([id, name, category, price, stock, finish, description, dimensions], i) => ({
    id,
    name,
    category,
    price,
    stock,
    finish,
    description,
    dimensions,
    added: i,
    images: [
      `/images/${id}.webp`,
      ...(i < 4
        ? [
            `/images/${name.toLowerCase()}-detail.webp`,
            `/images/${name.toLowerCase()}-room.webp`,
          ]
        : []),
    ],
  }),
);
export const productById = (id: string) => products.find((p) => p.id === id);
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
