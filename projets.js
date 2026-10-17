/* =====================================================================
   PROJETS — UBUNTU ARCHITECTURE
   C'est le SEUL fichier à modifier pour ajouter, retirer ou réordonner
   un projet. L'ordre ici = l'ordre sur le site.

   Pour ajouter un projet :
   1. Mettre les images dans site/img/ sous la forme  monprojet-1.webp,
      monprojet-2.webp ... (+ une version légère monprojet-1-s.webp ...)
      → le script  outils/ajouter-projet.sh  le fait automatiquement.
   2. Copier un bloc { ... } ci-dessous et remplir :
      id     : identifiant court, sans espace ni accent (ex. 'villa-k')
      name   : nom affiché
      type   : catégorie / lieu (ex. 'Villa — Lomé, Togo')
      cover  : image de couverture (sans .webp)
      images : range('monprojet', NOMBRE_D_IMAGES)
      illus  : illustrations éventuelles, sinon []
      desc   : le texte du projet
   ===================================================================== */
const range = (slug, n) => Array.from({ length: n }, (_, i) => `img/${slug}-${i + 1}`);

const PROJECTS = [
  {
    id: 'villal', name: 'Villa L', type: 'Villa — Kpalimé, Togo',
    cover: 'img/villal-11', images: range('villal', 16), illus: ['img/illus-3'],
    desc: "L'histoire de la Villa L commence par un ancrage profond dans son environnement. Posée sur une pente verdoyante à Kpalimé, la maison affirme sa présence par des volumes géométriques bas où s'entremêlent murs en pisé, vastes baies vitrées et une imposante colonne en pierre. Ce dialogue entre nature et modernité se poursuit à l'intérieur, pensé comme un véritable voyage sensoriel."
  },
  {
    id: 'terracotta', name: 'Chambre Terracotta', type: 'Architecture intérieure',
    cover: 'img/terracotta-1', images: range('terracotta', 9), illus: ['img/illus-2'],
    desc: "Un sanctuaire né de la terre, pensé comme un refuge d'ancrage et de sérénité. Murs et sol fusionnent dans une teinte ocre ; un lit aux lignes épurées semble creusé à même le sol. La lumière naturelle, filtrée par un vaste claustra géométrique, crée une frontière poreuse avec l'extérieur, tandis que des masques traditionnels blancs veillent silencieusement. Une ode poétique où le minimalisme contemporain dialogue avec l'artisanat."
  },
  {
    id: 'ubuntu', name: 'Ubuntu House', type: 'Villa — Résidentiel',
    cover: 'img/ubuntu-1', images: range('ubuntu', 11), illus: ['img/illus-5'],
    desc: "Sous le soleil radieux, la Villa Ubuntu se dresse comme une célébration de la terre. Sa longue façade aux tons terracotta, couronnée d'un délicat moucharabieh protecteur, s'ouvre majestueusement sur un bassin paisible. À l'intérieur, la lumière caresse des murs chaleureux ; de grandes toiles racontent l'histoire et l'architecture africaines, en écho à l'esprit de partage de la villa. Un refuge où le design contemporain embrasse ses racines."
  },
  {
    id: 'restaurant', name: 'Restaurant Africain', type: 'Commerce — Restauration',
    cover: 'img/restaurant-1', images: range('restaurant', 14), illus: [],
    desc: "Au cœur de la ville se dresse un sanctuaire culinaire. Sa façade chaleureuse en terre cuite, percée d'élégantes arches vitrées, invite les passants à découvrir l'essence du Restaurant Africain. À l'intérieur, niches végétales voûtées, assises sculpturales et comptoir en terre composent une expérience où l'on vient autant pour le lieu que pour la table."
  },
  {
    id: 'duplex', name: 'Duplex Bioclimatique', type: 'Logement — Bioclimatique',
    cover: 'img/duplex-2', images: range('duplex', 11), illus: ['img/illus-6', 'img/illus-1'],
    desc: "Un duplex abrité sous une large toiture en porte-à-faux qui protège du soleil et laisse l'air circuler. Murs de pierre, brise-soleil verticaux et grandes baies ouvrent la maison sur le jardin et le bassin. À l'intérieur, l'art contemporain africain et les murs en gabion de pierre sèche donnent à chaque pièce une présence brute et chaleureuse."
  }
];
const S2R = [
  { render: 'img/duplex-6', illus: 'img/illus-1' },
  { render: 'img/ubuntu-11', illus: 'img/illus-5' },
  { render: 'img/duplex-1', illus: 'img/illus-6' }
];

/* Projets « À venir » : modifier directement la section id="avenir"
   dans index.html. */

/* =====================================================================
   CO-FONDATEURS — section « Les fondateurs » en bas du site.
   Pour ajouter quelqu'un : mettre sa photo dans site/img/ (format portrait,
   ex. team-kevin.webp) et copier un bloc ci-dessous.
   ===================================================================== */
const FONDATEURS = [
  {
    nom: 'Kebe Koulouhar Stéphane',
    role: 'Co-fondateur — Architecte',
    photo: 'img/team-kebe.webp',
    citation: "Un lieu juste naît de l'écoute : de ceux qui l'habitent, de la terre qui le porte et de la culture qui le raconte.",
    bio: "Une architecture durable et ancrée, nourrie des traditions locales et du design africain, attentive aux besoins de ceux qui l’habitent et au contexte culturel et environnemental de chaque lieu."
  },
  {
    nom: "Kouawo Kevin",
    role: "Co-fondateur — Architecte",
    photo: "img/team-kevin.webp",
    citation: "Construire, c'est relier : la terre à la lumière, la mémoire au présent, et chaque personne à celles qui l'entourent.",
    bio: "Une architecture qui raconte une histoire : la terre, la brique, le claustra et les motifs réinterprétés dans des espaces contemporains, chaleureux et incarnés."
  },
  {
    nom: "Latey Kodjo Christ Hénoc",
    role: "Co-fondateur — Architecte",
    photo: "img/team-enock.webp",
    citation: "Avant de dessiner, il faut lire le site : sa pente, son soleil, ses usages. Le projet juste est celui qui lui répond.",
    bio: "Une architecture minimaliste et durable : des volumes épurés, des matériaux sobres et une conception bioclimatique pour bâtir moins, mais mieux, en accord avec son environnement."
  }
];
