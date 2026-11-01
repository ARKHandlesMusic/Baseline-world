export type AssetBuildStatus = 'BUILT_4K_60FPS' | 'QUEUED_NEXT';

export type AssetCategoryGroup =
  | '01. Ground & Roadway (Section 1)'
  | '02. Hero Shop ("CRACK & SONS")'
  | '03. Street Architecture & Skyline'
  | '04. Foliage & Natural Dressing'
  | '05. Sidewalk Furniture & Roadside Props'
  | '06. Vehicles & Traffic'
  | '07. Storyboard Gag & Narrative Props (Panels 1–13)'
  | '08. Characters & Performers (Panels 1–13)';

export interface MasterAssetRequirement {
  assetCode: string;
  name: string;
  category: AssetCategoryGroup;
  quantitySpec: string;
  exactCountToBuild: number;
  panelsUsed: string;
  purpose: string;
  celShadingAndInkSpec: string;
  status: AssetBuildStatus;
}

export const MASTER_ASSET_REGISTRY: MasterAssetRequirement[] = [
  // ============================================================================
  // 01. GROUND & ROADWAY (SECTION 1 - BUILT NOW)
  // ============================================================================
  {
    assetCode: 'ENV-ROAD-01',
    name: 'Main street road section (Primary ground plane)',
    category: '01. Ground & Roadway (Section 1)',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4, 8, 9, 10, 11, 12',
    purpose: 'Primary 24m × 40m crown-cambered ground plane with halftone burst backdrop',
    celShadingAndInkSpec:
      '3-step quantized toon asphalt (#28293E) with flat tonal wheel-wear bands, dark ink perimeter hull (#0A0812), and radial halftone pop-art burst backdrop',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'ENV-CURB-01',
    name: 'Curbs (Street boundaries)',
    category: '01. Ground & Roadway (Section 1)',
    quantitySpec: '2–4 segments',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 1, 2, 3, 4, 11, 12',
    purpose: '4 distinct street boundary segments (NW, NE, SW, SE) with crosswalk drop-curbs and gutter channels',
    celShadingAndInkSpec:
      'Chamfered granite L-profile blocks with 2.5m expansion seams, inverted-hull dark ink outlines, and painted corner hazard stripes',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'ENV-MARK-01',
    name: 'Street markings (Painted lane lines & curb markings)',
    category: '01. Ground & Roadway (Section 1)',
    quantitySpec: '1 set',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4, 10, 11, 12',
    purpose: 'Double amber centerlines, dashed white lane dividers, stop bars, zebra crosswalks, and yellow curb markings',
    celShadingAndInkSpec:
      'Flat lo-fi ivory-lavender (#E2D9F3) and warm amber (#F59E0B) thermoplastic geometry elevated +0.025m with full dark ink edge outlines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'ENV-MANHOLE-01',
    name: 'Manhole covers (Road surface detail)',
    category: '01. Ground & Roadway (Section 1)',
    quantitySpec: '1–2',
    exactCountToBuild: 2,
    panelsUsed: 'Panels 1, 2, 3, 11, 12',
    purpose: 'Heavy circular cast-iron utility covers embedded in the central roadway lanes',
    celShadingAndInkSpec:
      '4-step cel-shaded dark iron discs with concentric ink rings, cross-hatch waffle tread lines, and recessed pick-hole ink accents',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'ENV-DRAIN-01',
    name: 'Storm drains (Roadside detail)',
    category: '01. Ground & Roadway (Section 1)',
    quantitySpec: '2–4',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 1, 2, 3, 4, 12',
    purpose: '4 roadside gutter storm drain grates with curb-inlet throats positioned along both curbs',
    celShadingAndInkSpec:
      'Recessed black-violet drainage basins with 6-bar iron grates and thick comic ink slot outlines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'ENV-WALK-01',
    name: 'Sidewalk sections (Both sides of the road)',
    category: '01. Ground & Roadway (Section 1)',
    quantitySpec: '2–4',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 1, 2, 3, 4, 9, 11, 12',
    purpose: '4 raised pedestrian promenade sections flanking both sides of the main street road',
    celShadingAndInkSpec:
      'Muted slate-purple slabs (#353752) with hand-drawn ink joint grids and yellow tactile blister warning tiles at crossings',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'MAT-PAVE-01',
    name: 'Pavement materials (Sidewalk and road variants)',
    category: '01. Ground & Roadway (Section 1)',
    quantitySpec: '2–3 variants',
    exactCountToBuild: 3,
    panelsUsed: 'All Street Panels',
    purpose: '1) Crowned Lo-Fi Asphalt, 2) Scored Sidewalk Concrete, 3) Weathered Gutter/Alley Cobble',
    celShadingAndInkSpec:
      'Procedural flat-shaded toon canvas maps with discrete shadow step-gradients and sparse ink hatch strokes',
    status: 'BUILT_4K_60FPS',
  },

  // ============================================================================
  // 02. HERO SHOP ("CRACK & SONS")
  // ============================================================================
  {
    assetCode: 'BLD-HERO-01',
    name: 'Shop exterior building ("CRACK & SONS")',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4, 9, 10, 12',
    purpose: 'Hero ground-floor commercial timber & brick storefront dead-center on the street',
    celShadingAndInkSpec:
      'Cel-shaded vintage masonry & dark wood timber framing with heavy comic ink silhouette outlines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-WIN-01',
    name: 'Shop display window (Nutcracker reveal)',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4, 9',
    purpose: 'Large bay display window framing rows of staring nutcracker dolls in dark interior shadow',
    celShadingAndInkSpec:
      'Deep recessed shadow box with angled diagonal anime glass highlight streaks and bold ink mullions',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-DOOR-01',
    name: 'Shop entrance door (Girl enters; chime gag)',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 3, 4',
    purpose: 'Articulated hinged wooden shop door with glass upper pane and interior nutcracker wind-chime',
    celShadingAndInkSpec:
      'Pivoted at hinge X-edge for deterministic Remotion swing animation, framed with thick ink molding lines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-HANDLE-01',
    name: 'Door handle (Door detail)',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 3, 4',
    purpose: 'Ornate brass nutcracker-jaw lever handle on the shop entrance door',
    celShadingAndInkSpec:
      '4-step cel-shaded warm gold metallic toon finish with crisp black ink contour',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-SIGN-01',
    name: 'Hanging shop sign ("CRACK & SONS, Nutcrackers Since 1887")',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4',
    purpose: 'Wrought-iron bracket sign hanging above the shop entrance with bold typography',
    celShadingAndInkSpec:
      'Beveled wood plaque with comic ink lettering, swinging chain links, and top pigeon perch rail',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-WARN-01',
    name: 'Small warning sign ("Gentlemen: Enter at Your Own Risk")',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4',
    purpose: 'Secondary plaque suspended beneath the main sign triggering the avoidance & escape gags',
    celShadingAndInkSpec:
      'High-contrast ivory/crimson cel-shaded notice board with thick ink border and readable typography',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-TRIM-01',
    name: 'Window frames and trim (Shop architecture)',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1 set',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4, 9',
    purpose: 'Cornices, pilasters, sill ledges, and decorative molding around the hero shopfront',
    celShadingAndInkSpec:
      'Modular extruded architectural profiles with crease-angle ink line segments',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-GLASS-01',
    name: 'Window glass/reflections (Exterior visual polish)',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1 set',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4, 9',
    purpose: 'Stylized anime window panes with diagonal cel-shaded sky reflection bands',
    celShadingAndInkSpec:
      'Semi-transparent toon shader with sharp stepped diagonal white/cyan slash highlights',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-AWNING-01',
    name: 'Shop awning (Storefront detail)',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4',
    purpose: 'Striped fabric canopy over the shop display window with scalloped valance',
    celShadingAndInkSpec:
      'Alternating muted burgundy and cream cel-shaded stripes with dark ink seam lines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-PERCH-01',
    name: 'Pigeon perch / sign top (Panel 2 gag)',
    category: '02. Hero Shop ("CRACK & SONS")',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2',
    purpose: 'Iron scroll finial atop the "CRACK & SONS" sign where the pigeon perches before bolting',
    celShadingAndInkSpec:
      'Extruded iron scroll work with dark ink silhouette',
    status: 'BUILT_4K_60FPS',
  },

  // ============================================================================
  // 03. STREET ARCHITECTURE & SKYLINE
  // ============================================================================
  {
    assetCode: 'BLD-NEIGHBOR-01',
    name: 'Neighboring storefronts (Street depth and background)',
    category: '03. Street Architecture & Skyline',
    quantitySpec: '2–4',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 1, 2, 3, 4, 10, 11, 12',
    purpose: '4 distinct ground-floor storefronts (boutique with mannequin window, café, bookstore, corner grocery)',
    celShadingAndInkSpec:
      'Muted lo-fi pastel & slate facades with individualized signboards, display windows, and ink line work',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-UPPER-01',
    name: 'Upper-floor building facades (Skyline behind the shop)',
    category: '03. Street Architecture & Skyline',
    quantitySpec: '3–6',
    exactCountToBuild: 5,
    panelsUsed: 'Panels 1, 2, 3, 8, 10, 11, 12',
    purpose: '5 varied 2nd-to-4th story apartment facades with windows where men join the Panel 11 celebration',
    celShadingAndInkSpec:
      'Modular window bays, balconies, and recessed brick panels with 3-step toon shading',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-ROOF-01',
    name: 'Roof sections (Building silhouettes)',
    category: '03. Street Architecture & Skyline',
    quantitySpec: '3–6',
    exactCountToBuild: 5,
    panelsUsed: 'Panels 1, 8, 10, 11, 12',
    purpose: '5 distinct rooflines (mansard, parapet cornice, gabled tile, flat roof with water tank/chimneys)',
    celShadingAndInkSpec:
      'Strong silhouette geometry against the halftone sky backdrop with heavy outer ink lines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'MAT-BRICK-01',
    name: 'Brick/stone wall materials (Building surfaces)',
    category: '03. Street Architecture & Skyline',
    quantitySpec: '3–5 variants',
    exactCountToBuild: 4,
    panelsUsed: 'All Exterior Panels',
    purpose: '4 procedural cel-shaded masonry variants (Warm Red Brick, Lo-Fi Indigo Brick, Ashlar Cut Stone, Painted Stucco)',
    celShadingAndInkSpec:
      'Flat base colors with sparse clusters of hand-drawn ink brick courses (anime background style)',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-CURTAIN-01',
    name: 'Window curtains (Neighboring buildings)',
    category: '03. Street Architecture & Skyline',
    quantitySpec: '2–4 sets',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 1, 2, 11',
    purpose: '4 sets of draped interior curtains visible inside upper-floor and neighboring windows',
    celShadingAndInkSpec:
      '2-step cel-shaded fabric pleats with ink fold lines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-LAMP-01',
    name: 'Outdoor lamps (Storefront decoration)',
    category: '03. Street Architecture & Skyline',
    quantitySpec: '2–4',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 1, 2, 3, 4, 9',
    purpose: '4 gooseneck and coach-style wall sconces flanking the hero shop and neighboring doors',
    celShadingAndInkSpec:
      'Dark iron brackets with warm cel-shaded emissive glass globes',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'BLD-CABLE-01',
    name: 'Hanging cables (Street dressing)',
    category: '03. Street Architecture & Skyline',
    quantitySpec: '2–4 runs',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 1, 2, 8, 10, 11',
    purpose: '4 catenary overhead utility/streetcar wire runs spanning across the upper street canyon',
    celShadingAndInkSpec:
      'TubeGeometry catenary curves in pure dark ink (#0A0812) for classic anime street atmosphere',
    status: 'BUILT_4K_60FPS',
  },

  // ============================================================================
  // 04. FOLIAGE & NATURAL DRESSING
  // ============================================================================
  {
    assetCode: 'FOL-TREE-01',
    name: 'Trees (Street dressing) across 3 distinct Tree Variants',
    category: '04. Foliage & Natural Dressing',
    quantitySpec: '6–10 trees (2–3 variants)',
    exactCountToBuild: 8,
    panelsUsed: 'Panels 1, 2, 3, 4, 8, 10, 11, 12',
    purpose: '8 sidewalk trees built from 3 distinct variants (Broad Plane Tree, Columnar Ginkgo, Pruned Urban Maple)',
    celShadingAndInkSpec:
      'Multi-cluster cel-shaded foliage canopies with stepped shadow bands, ink leaf-cluster contours, and iron tree grates',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'FOL-SHRUB-01',
    name: 'Shrubs and planters (Shop entrance and sidewalk)',
    category: '04. Foliage & Natural Dressing',
    quantitySpec: '4–8',
    exactCountToBuild: 6,
    panelsUsed: 'Panels 1, 2, 3, 4, 11',
    purpose: '6 rectangular wood/stone sidewalk planters with sculpted boxwood shrubs',
    celShadingAndInkSpec:
      '3-step toon green/teal foliage blocks inside ink-outlined planter boxes',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'FOL-POT-01',
    name: 'Potted plants (Storefronts and windows)',
    category: '04. Foliage & Natural Dressing',
    quantitySpec: '4–8',
    exactCountToBuild: 6,
    panelsUsed: 'Panels 1, 2, 3, 4',
    purpose: '6 terracotta & ceramic pots with ferns and flowers by shop steps and window ledges',
    celShadingAndInkSpec:
      'LatheGeometry pots with crisp ink rims and stylized flat-shaded leaves',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'FOL-HEDGE-01',
    name: 'Hedge (Intact state before Panel 4 escape)',
    category: '04. Foliage & Natural Dressing',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3, 4 (start)',
    purpose: 'Manicured roadside privacy hedge on the boy’s escape trajectory',
    celShadingAndInkSpec:
      'Dense cel-shaded boxwood hedge with comic ink leaf-tuft accents',
    status: 'QUEUED_NEXT',
  },
  {
    assetCode: 'FOL-HEDGE-HOLE-01',
    name: 'Hedge-hole variant (Boy-shaped-hole gag)',
    category: '04. Foliage & Natural Dressing',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panel 4 (after sprint), Panels 11, 12',
    purpose: 'Swappable hedge mesh featuring a clean cartoon silhouette cutout of the sprinting boy + floating leaves',
    celShadingAndInkSpec:
      'Extruded boolean-style cutout silhouette with thick interior dark ink outline around the boy-shaped hole',
    status: 'QUEUED_NEXT',
  },

  // ============================================================================
  // 05. SIDEWALK FURNITURE & ROADSIDE PROPS
  // ============================================================================
  {
    assetCode: 'PRP-BENCH-01',
    name: 'Benches (Sidewalk furniture)',
    category: '05. Sidewalk Furniture & Roadside Props',
    quantitySpec: '2–3',
    exactCountToBuild: 3,
    panelsUsed: 'Panels 1, 2, 3, 4, 11',
    purpose: '3 cast-iron and timber slat park benches along the outer sidewalks',
    celShadingAndInkSpec:
      '7-part composite group (iron armrests, legs, 6 wood slats) with dark ink outlines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'PRP-LAMP-01',
    name: 'Streetlights (Street framing)',
    category: '05. Sidewalk Furniture & Roadside Props',
    quantitySpec: '4–6',
    exactCountToBuild: 6,
    panelsUsed: 'Panels 1, 2, 3, 4, 8, 10, 11, 12',
    purpose: '6 vintage double-lantern cast-iron streetlamp posts framing both curbs',
    celShadingAndInkSpec:
      'Fluted LatheGeometry pole, cross-bars, and glowing cel-shaded lantern cages with ink outlines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'PRP-TSIGN-01',
    name: 'Traffic signs & Street signposts (Roadside details)',
    category: '05. Sidewalk Furniture & Roadside Props',
    quantitySpec: '2–4 traffic signs + 1–2 street signposts',
    exactCountToBuild: 5,
    panelsUsed: 'Panels 1, 2, 3, 4, 11, 12',
    purpose: '3 regulatory traffic signs (Crosswalk, Stop, No Parking) + 2 intersecting street-name blade posts',
    celShadingAndInkSpec:
      'Graphic flat-shaded sign faces with bold comic ink borders and tubular steel posts',
    status: 'QUEUED_NEXT',
  },
  {
    assetCode: 'PRP-TRASH-01',
    name: 'Trash bins (Sidewalk clutter)',
    category: '05. Sidewalk Furniture & Roadside Props',
    quantitySpec: '2–3',
    exactCountToBuild: 3,
    panelsUsed: 'Panels 1, 2, 4, 11, 12',
    purpose: '3 ribbed cylindrical municipal waste bins with domed lids placed near corners',
    celShadingAndInkSpec:
      '4-step metallic toon shading with vertical ink rib lines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'PRP-LITTER-01',
    name: 'Trash bags / paper litter (Small environmental details)',
    category: '05. Sidewalk Furniture & Roadside Props',
    quantitySpec: '6–12 pieces',
    exactCountToBuild: 10,
    panelsUsed: 'Panels 1, 2, 4, 8, 12',
    purpose: '3 tied black/indigo trash bags by alley curb + 7 crumpled paper/leaf litter pieces that blow in Panel 8 wind',
    celShadingAndInkSpec:
      'Low-polyfaceted forms with crisp ink crease lines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'PRP-HYDRANT-01',
    name: 'Fire hydrant (Street prop)',
    category: '05. Sidewalk Furniture & Roadside Props',
    quantitySpec: '1–2',
    exactCountToBuild: 2,
    panelsUsed: 'Panels 1, 2, 3, 4, 12',
    purpose: '2 classic cast-iron fire hydrants with side nozzle caps and chain detail on the curb apron',
    celShadingAndInkSpec:
      'Crimson cel-shaded body with high-contrast ink outlines around bolts and nozzles',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'PRP-MAIL-01',
    name: 'Mailbox (Background prop)',
    category: '05. Sidewalk Furniture & Roadside Props',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3',
    purpose: 'Arched-top blue municipal postal collection box near the corner crosswalk',
    celShadingAndInkSpec:
      '3-step cobalt toon shading with mail-slot pull handle and heavy ink contour',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'PRP-BIKE-RACK-01',
    name: 'Bicycle rack (Sidewalk detail)',
    category: '05. Sidewalk Furniture & Roadside Props',
    quantitySpec: '1',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2, 3',
    purpose: '3-loop bent steel wave bike rack bolted to the sidewalk promenade',
    celShadingAndInkSpec:
      'TubeGeometry loops with dark ink outline hull',
    status: 'QUEUED_NEXT',
  },

  // ============================================================================
  // 06. VEHICLES & TRAFFIC
  // ============================================================================
  {
    assetCode: 'VEH-PARK-01',
    name: 'Parked cars (Background traffic — including tires, glass & license plates)',
    category: '06. Vehicles & Traffic',
    quantitySpec: '3–5 parked cars (with tires, glass & license plates)',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 1, 2, 3, 4, 10, 11, 12',
    purpose: '4 stylized anime compact/sedan/hatchback cars parked along the curb bays',
    celShadingAndInkSpec:
      '10-part composite vehicles (body hull, cabin greenhouse, 4 wheels/tires, bumpers, headlights, front/rear license plates) in muted lo-fi colors with comic ink outlines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'VEH-MOVE-01',
    name: 'Moving cars (Passing traffic — including tires, glass & license plates)',
    category: '06. Vehicles & Traffic',
    quantitySpec: '1–2 moving cars (4–7 total license plates across fleet)',
    exactCountToBuild: 2,
    panelsUsed: 'Panels 1, 2, 3',
    purpose: '2 animated passing vehicles with rotating wheels and comic speed-line trails',
    celShadingAndInkSpec:
      'Cel-shaded body work with diagonal anime windshield reflection slashes and numbered license plates',
    status: 'BUILT_4K_60FPS',
  },

  // ============================================================================
  // 07. STORYBOARD GAG & NARRATIVE PROPS (PANELS 1–13)
  // ============================================================================
  {
    assetCode: 'GAG-MANNEQUIN-01',
    name: 'Male mannequin & Mannequin facing wall pose (Panel 2 shop-window gag)',
    category: '07. Storyboard Gag & Narrative Props (Panels 1–13)',
    quantitySpec: '1 model + 1 rotated wall-facing pose',
    exactCountToBuild: 1,
    panelsUsed: 'Panels 1, 2',
    purpose: 'Tailored display mannequin in the neighboring boutique window rotated 180° to face the wall in fear',
    celShadingAndInkSpec:
      'Articulated wooden/porcelain mannequin with cel-shaded suit and comic sweat-drop / ink lines',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'GAG-NUTCRACKER-01',
    name: 'Nutcracker dolls (Window army, close-up gulping doll, & charred gift doll with pop-off head)',
    category: '07. Storyboard Gag & Narrative Props (Panels 1–13)',
    quantitySpec: '1 hero rigged model + 12 instanced window soldiers',
    exactCountToBuild: 13,
    panelsUsed: 'Panels 1, 9, 10, 12, 13',
    purpose: 'Staring window army (Panel 1), close-up gulping soldier (Panel 9), raining miniature soldiers (Panel 10), and soot-covered gift doll whose head pops off (Panels 12–13)',
    celShadingAndInkSpec:
      'Painted wooden toy soldier with articulated jaw, eyes, and detachable head pivot in cel-shaded red/gold/black ink',
    status: 'BUILT_4K_60FPS',
  },
  {
    assetCode: 'GAG-PHONE-01',
    name: 'Boy’s Smartphone with "Crack & Sons" Target Lock Map UI & Hacker Snack Bag',
    category: '07. Storyboard Gag & Narrative Props (Panels 1–13)',
    quantitySpec: '1 phone + 1 snack bag',
    exactCountToBuild: 2,
    panelsUsed: 'Panels 5, 6, 11',
    purpose: 'Glowing phone casting dramatic uplight in Panel 5 and displaying the red dot map + "Are you sure? [YES] [YES]" prompt in Panel 6; crinkly chip bag tossed in Panel 11',
    celShadingAndInkSpec:
      'Emissive screen plane with crisp vector comic UI and cel-shaded snack bag',
    status: 'QUEUED_NEXT',
  },
  {
    assetCode: 'GAG-GARAGE-NUKE-01',
    name: 'Garage Set, Cartoon Nuke, Rusty Trolley, Garage Bicycle & Cardboard "NUKE LAUNCH" Sign',
    category: '07. Storyboard Gag & Narrative Props (Panels 1–13)',
    quantitySpec: '1 garage + 1 nuke + 1 trolley + 1 bicycle + 2 signs',
    exactCountToBuild: 6,
    panelsUsed: 'Panels 7, 8',
    purpose: 'Rising garage door revealing the bulbous cartoon nuke on a rusty wheeled trolley next to a bicycle, plus Hype Man’s hand-lettered cardboard "NUKE LAUNCH" sign',
    celShadingAndInkSpec:
      'Bulbous finned cartoon warhead with hazard checker band, heavy ink outlines, and halftone thruster exhaust plumes',
    status: 'QUEUED_NEXT',
  },
  {
    assetCode: 'GAG-BOOM-RUBBLE-01',
    name: 'Walnut/Nutcracker Mushroom Cloud, Confetti Cannons & Smoking Shop Rubble Set',
    category: '07. Storyboard Gag & Narrative Props (Panels 1–13)',
    quantitySpec: '1 morphing cloud + 3 confetti cannons + 1 smoking rubble stage',
    exactCountToBuild: 5,
    panelsUsed: 'Panels 10, 11, 12',
    purpose: 'Cartoon explosion cloud morphing from walnut to soldier silhouette (Panel 10), handheld party cannons (Panel 11), and charred timber/brick rubble pile (Panel 12)',
    celShadingAndInkSpec:
      'Volumetric cel-shaded billow spheres with halftone shadow dots, speed-line shockwaves, and comic soot decals',
    status: 'QUEUED_NEXT',
  },

  // ============================================================================
  // 08. CHARACTERS & PERFORMERS (PANELS 1–13)
  // ============================================================================
  {
    assetCode: 'CHR-COUPLE-01',
    name: 'Lead Boy (with removable sunglasses) & Lead Girl (with headphones & soot variant)',
    category: '08. Characters & Performers (Panels 1–13)',
    quantitySpec: '2 hero rigged characters',
    exactCountToBuild: 2,
    panelsUsed: 'Panels 3, 4, 5, 6, 7, 8, 9, 11, 12, 13',
    purpose: 'Main couple walking hand-in-hand, boy sprinting & leading nuke launch squad, girl browsing with headphones and walking out of rubble',
    celShadingAndInkSpec:
      'Full humanoid skeletal rigs with anime facial expression morphs, cel-shaded clothing, and inverted-hull ink outlines',
    status: 'QUEUED_NEXT',
  },
  {
    assetCode: 'CHR-SQUAD-01',
    name: 'The Squad: Hacker Friend & Hype Man (+ 2 Henchmen Friends)',
    category: '08. Characters & Performers (Panels 1–13)',
    quantitySpec: '3–4 rigged squad characters',
    exactCountToBuild: 4,
    panelsUsed: 'Panels 5, 6, 7, 8, 11, 12',
    purpose: 'Boy’s backup crew posing in dark room, saluting the nuke, waving countdown signs, and performing the synchronized "crack" fist-clench dance in Panel 11',
    celShadingAndInkSpec:
      'Distinct anime silhouettes with sunglasses, hoodies, and crisp dark ink outlines',
    status: 'QUEUED_NEXT',
  },
  {
    assetCode: 'CHR-PASSERS-01',
    name: 'Passersby Men (3 variants), Bolting Male Dog & Startled Pigeon',
    category: '08. Characters & Performers (Panels 1–13)',
    quantitySpec: '3 men + 1 dog + 1 pigeon',
    exactCountToBuild: 5,
    panelsUsed: 'Panels 2, 11',
    purpose: 'Men wincing/crossing legs in Panel 2 and cheering from upper windows in Panel 11, plus the tail-tucking dog and sign-perching pigeon',
    celShadingAndInkSpec:
      'Stylized anime character and animal rigs with comic wince/shock line accents',
    status: 'QUEUED_NEXT',
  },
];
