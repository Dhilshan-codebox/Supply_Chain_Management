# WareTrack: Prompts to Rebuild the Reel UI

Based on a frame-by-frame review of the uploaded video (1 frame/second, UI area cropped).
Hex colors and some small details are estimates from a compressed video.

- **Part A**: one master prompt (use if your tool can handle the whole build at once)
- **Part B**: the same build split into 3 sequential prompts (use if the 3D scene is too much in one go)

---

## PART A: MASTER PROMPT

```
Build "WareTrack": a warehouse & logistics operations dashboard that looks like a
city-builder / strategy game. A full-screen interactive 3D isometric map fills the
whole viewport, and floating white "glass" UI cards sit on top of it. Light theme only.

TECH STACK
React + Vite + TypeScript, Tailwind CSS, React Three Fiber + @react-three/drei
(OrthographicCamera / OrbitControls limited to ~35-55 degree tilt), Zustand for state,
Framer Motion for UI transitions, lucide-react icons. No external 3D assets: build
every model procedurally from boxes/cylinders with soft toy-like materials.

VISUAL STYLE
- Clean, bright, low-poly "toy diorama" look. Ground is very pale lavender-white
  (#EEF1FB). Soft shadows, light ambient + one directional light, subtle fog fading
  distant city blocks into the background.
- Accent: royal blue (#2B59E0). Success green (#22A559), warning amber (#F5A524),
  neutral grey chips. Text: near-black navy (#141B34) and slate grey (#6B7390).
- Cards: white at ~92% opacity, backdrop-blur, 16px radius, 1px #E6E9F5 border, soft
  shadow (0 8px 30px rgba(40,60,140,.10)). Font: Inter. Numbers are bold, labels are
  small and grey. Status chips are pill-shaped with tinted bg + darker text.

3D SCENE (per site)
- Blue corrugated-roof warehouse buildings with grey-white walls, several dock doors
  with blue frames and small numbered signs, a round logo disc on the roof.
- Pallets stacked with cardboard boxes (tan), blue plastic containers, pallet racking
  with boxes, a teal shipping container, white box trucks (blue, teal, orange liveries
  with fictional brand names Bluepeak, Nordline, Cargoviva, WareTrack), yellow
  forklifts with drivers, asphalt road with dashed white lines, yellow outlined
  parking/dock bays, fences, round green trees, faded white/blue city blocks.
- Blue map-pin markers floating (gentle bob) above selectable pallets.
- Trucks drive in along a glowing blue route line to their dock bay, then park;
  forklifts shuttle pallets between truck and dock; idle forklifts cluster at a
  charging area with green glow.
- Hover: show small tooltip over object (e.g. "PAL-1026 - Safety Helmet").
- Select: blue corner brackets around the object + blue pill label above it
  (e.g. "FL-01 Loading truck", "TRK-2481 En route", "In 2 Booked"); camera eases to it.
- Camera: drag to pan, scroll to zoom, smooth fly-to when switching sites.

HUD LAYOUT (all floating over the map, 16px margins)
1. TOP BAR (full width, white, rounded):
   - Left: blue cube logo + "WareTrack".
   - Search input "Search sites, trucks, forklifts, pallets, shipments..." with a "/"
     keyboard hint (pressing "/" focuses it).
   - Site switcher pill: blue badge "WH-01", name "Riverside Hub", subtext
     "78% full - 1/2 docked", chevron dropdown to change site.
   - Green "Live 09:40" pill (clock ticks every few seconds), bell icon with red dot,
     divider, avatar + "Alex Chen / Operations Manager" with dropdown chevron.
2. KPI CARDS (top-left row of 3): icon tile + label + big value + green delta chip:
   - Stock on hand 1,412 (+15) "pallets - WH-01"
   - Trucks on site 1 (+1) "1 inbound - WH-01"
   - On-time delivery 96.6% (+0.4%) "last 30 days - WH-01"
   Values change per selected site and animate (count-up).
3. MAP CONTROLS (vertical pill, right side under top bar): zoom +, zoom -, rotate left,
   rotate right, home/reset view.
4. CONTEXT DETAIL PANEL (top-right, ~300px wide, changes with selection, slide/fade
   transition, has focus-camera, open-external and close buttons):
   a) DEPOT/DC (default): small caps label "DEPOT - WH-01", name "Riverside Hub",
      "12 Riverside Dr, Newark NJ"; green "Operational" chip + "1 docked - 1 arriving -
      3 staged"; 2x2 stat tiles with progress bars: Stock on hand 1,412 / 1,800 (blue),
      Truck bays 2 / 2 busy (green), Outbound today 23 trucks, Put-aways today 15 pallets;
      "Inventory" list with product icon, name, count, status chip (In Stock green /
      Low Stock amber): Cardboard Box (M) 1,906, Plastic Container 297, Safety Helmet 212
      (Low), Packing Tape 4,448; then "Forklift fleet 1/2 working" and a row
      "FL-01 Loading TRK-2051 at Bay 1" with a 75% green progress bar.
   b) FORKLIFT: "FORKLIFT - WH-01", FL-01, "Sam Haddad - Toyota 8FBE18", status chip
      (Loading truck / Charging / Idle), status text, battery bar with %, rows:
      Carrying, Moves today, Speed, Charger, Site.
   c) DOCK BAY: "DOCK BAY - WH-04", "In 2", "Dock door with leveller", amber "Booked"
      chip + "TRK-2481 due in 3 min", rows: Truck, Rear doors, Trucks today, Site.
   d) TRUCK: carrier label (e.g. CARGOVIVA), TRK-2481, driver + plate, blue "En route"
      chip "To WH-04 - ETA 1 min", blue progress bar with "1 m left", rows: Shipment
      (blue link #SHP-78466), Customer, Destination, ETA, Speed, Bay, Cargo
      "0/10 pallets - 0 kg".
   e) PALLET: ID, product, quantity, location, status.
5. SHIPMENT TRACKING (bottom-left wide card): title with truck icon, right-aligned
   "TRK-2051 - WareTrack". 5-step horizontal stepper with circular icon nodes and
   connecting lines: Order Confirmed 06:49 -> Picked 08:10 -> Loading 2/6 (ETA 09:53,
   current step has a ring) -> In Transit 10:01 -> Delivered 10:33. Completed steps are
   solid blue, future steps grey. Right sub-card: truck thumbnail, "#SHP-78442",
   "To: Philadelphia, PA", status chip (Loading / Unloading / En route), "WH-01 - Bay 1
   - 13 min left", chevron. The stepper updates to whichever truck is selected
   (e.g. Unloading 2/6 ETA 09:55, In Transit, Delivered).
6. OPERATIONS TABLE (bottom-right card): small dock icon + segmented tabs
   "Docks 2/2 | Forklifts 1/2 | Trucks 2" (active tab white pill) + site name on the right.
   Rows with label+site code, colored dot, text, status chip, mini progress bar or ETA,
   chevron:
   - Docks: Bay 1 - TRK-2051 WareTrack - Loading 2/6; Bay 2 - No truck assigned -
     Available (grey); Inbound - TRK-2287 Bluepeak - En route 3 min.
   - Forklifts: FL-10 Unloading TRK-2205 at In 1 (84%), FL-11 Loading TRK-2229 at Out 2
     (82%), FL-12 Charging at bay (88%, amber), FL-13 Waiting for work (Idle 100%).
   - Trucks: TRK-2127 Bluepeak - WH-02 Bay 3 - Loading 4/7; TRK-2104 Nordline - Bay 1 -
     Unloading 1/5; TRK-2658 Cargoviva - To WH-02 - Docking; TRK-2526 WareTrack -
     To WH-02 - En route 1 min.
   Clicking any row selects that object, flies the camera to it and opens its panel.

SITES / MOCK DATA (store in one typed data file)
- WH-01 Riverside Hub: 1,412/1,800 pallets (78% full), 2 bays.
- WH-02 Northgate DC, "480 Northgate Blvd, Newark NJ": 3,310/4,200 (79%), 4 bays;
  inventory LED Panel 60x60 (1,787), Office Chair (174), Cardboard Box (M) (993, Low
  Stock), Nitrile Gloves (5,793); 98.2% on-time.
- WH-04 Southfield Cross-Dock: 610 pallets (38% full), 6 docks (In 1-3, Out 1-3),
  96.2% on-time.
Switching site flies the camera to that site's scene and updates the top bar, KPIs,
panels, tracker and table.

SIMULATION & INTERACTIONS
- A small tick loop (every ~1s) advances the clock, truck positions along their path,
  loading/unloading progress, battery levels and shipment steps. KPI deltas
  and counts update live with subtle animation.
- Everything is clickable in 3D and in the lists; selection is shared state, so
  the 3D selection, detail panel, tracker and table always stay in sync.
- Esc or the X button clears selection. Keyboard: "/" focuses search; search results
  dropdown filters sites, trucks, forklifts, pallets and shipments.
- Smooth 300-500ms eased transitions on every panel change and camera move.

RESPONSIVE
Desktop-first (>=1280px). Below that, collapse the detail panel into a bottom sheet and
stack the tracker + table as tabs. Keep the map interactive at all sizes.

DELIVERABLES
Clean folder structure (components/hud, components/scene, store, data, hooks),
reusable Card, Chip, ProgressBar and StatTile components, a README with run
instructions, and it must run with `npm install && npm run dev`.
Start by building the HUD with mock data, then the 3D scene, then wire selection,
simulation and camera fly-to together.
```

---

## PART B: STEP-BY-STEP PROMPTS

Run these in order, in the same project/conversation.

### Step 1: Project setup, design system, data and full HUD

```
Create a React + Vite + TypeScript + Tailwind project called "WareTrack", a warehouse
operations dashboard. Install zustand, framer-motion, lucide-react.

DESIGN SYSTEM
Light theme. Page bg #EEF1FB, accent royal blue #2B59E0, success green #22A559,
warning amber #F5A524, text navy #141B34, muted slate #6B7390. Font Inter.
Cards: white ~92% opacity, backdrop-blur, 16px radius, 1px #E6E9F5 border, shadow
0 8px 30px rgba(40,60,140,.10). Pill status chips with tinted background + darker text.
Build reusable components: Card, Chip (variants: green/amber/blue/grey), ProgressBar,
StatTile, SegmentedTabs, IconTile, Kbd.

DATA (src/data/sites.ts, fully typed)
Sites: WH-01 Riverside Hub (1,412/1,800 pallets, 78% full, 2 bays, 96.6% on-time),
WH-02 Northgate DC (3,310/4,200, 79%, 4 bays, 98.2%), WH-04 Southfield Cross-Dock
(610 pallets, 38%, 6 docks In 1-3/Out 1-3, 96.2%). Each site has address, inventory
items (name, count, status In Stock/Low Stock), docks, forklifts (FL-01.. with driver,
model, battery, moves today, speed, charger, status), trucks (TRK-xxxx, carrier,
driver, plate, shipment id, customer, destination, ETA, speed, bay, cargo, status),
and shipments with 5 tracking steps and timestamps.

STORE (zustand)
activeSiteId, selection {type: depot|forklift|dock|truck|pallet, id} | null,
activeTableTab, searchQuery, clock. Actions: selectSite, select, clearSelection.

HUD (all floating over a placeholder pale-lavender full-screen div that will become
the 3D map; 16px margins):
1. Top bar: cube logo + "WareTrack"; search "Search sites, trucks, forklifts, pallets,
   shipments..." with "/" hint (focus on key press, filtered dropdown results);
   site switcher pill (blue badge WH-01, name, "78% full - 1/2 docked", chevron
   dropdown); green "Live 09:40" pill with ticking clock; bell with red dot; avatar
   "Alex Chen / Operations Manager".
2. Three KPI cards top-left: Stock on hand, Trucks on site, On-time delivery, each
   with icon tile, value, green delta chip, sub-label; count-up animation on change.
3. Vertical map control pill (zoom in/out, rotate left/right, home) on the right.
4. Top-right context detail panel with variants: Depot (status chip, 2x2 stat tiles
   with progress bars, inventory list with chips, forklift fleet row), Forklift
   (status chip, battery bar, rows), Dock bay, Truck (route progress, shipment link,
   customer, destination, ETA, speed, bay, cargo), Pallet. Buttons: focus, open, close.
   Animate panel swaps with framer-motion.
5. Bottom-left Shipment Tracking card: 5-step stepper (Order Confirmed, Picked,
   Loading n/m, In Transit, Delivered) with times, ringed current step, plus a
   sub-card with truck thumbnail, shipment id, destination, status chip, bay + minutes left.
6. Bottom-right operations table with tabs Docks / Forklifts / Trucks (with counts),
   rows with dot, text, status chip, progress or ETA, chevron; clicking a row calls
   select().

Wire everything to the store so changing site or selection updates all panels.
A 1-second tick loop advances the clock and progress values. Desktop-first, with a
bottom-sheet fallback under 1280px. Do NOT build the 3D scene yet.
```

### Step 2: The 3D isometric scene

```
Now add the 3D scene to WareTrack using @react-three/fiber and @react-three/drei,
replacing the placeholder map. It fills the full viewport behind the HUD. No external
assets: build everything procedurally from boxes/cylinders with soft MeshStandard
materials in a clean, bright, low-poly "toy diorama" style.

Scene setup: OrthographicCamera (isometric-feeling, ~45 degree tilt), OrbitControls
(pan with drag, zoom with scroll, polar angle limited to 35-55 degrees), ambient light
+ one soft directional light with shadows, pale lavender ground (#EEF1FB), light fog
so far city blocks fade out.

Build these components (src/components/scene/):
- Warehouse: blue corrugated-roof building (stepped roofs), grey-white walls, N dock
  doors with blue frames, small door number signs, a round logo disc on the roof.
- Pallet: wooden base + stacked tan cardboard boxes; variants: blue plastic containers,
  white wrapped pallets.
- Rack: blue pallet racking holding boxes.
- ShippingContainer (teal), Forklift (yellow, driver, mast that moves), Truck (white
  box trailer, colored cab/livery stripe, brand text: Bluepeak, Nordline, Cargoviva,
  WareTrack), Road (asphalt with dashed white lines), BayOutline (yellow outlined
  parking bays), Fence, Tree (round green), CityBlock (faded white/blue background
  buildings), ChargingStation (white units, soft green glow).
- PinMarker: blue map pin floating above selectable pallets with a gentle bob.

Compose three site scenes (WH-01 single compound with 3 dock doors; WH-02 loading yard
with 4 bays; WH-04 long cross-dock wall with In/Out doors and a charging area), driven
by the typed data in src/data/sites.ts so trucks/forklifts/pallets match the store.

Interactions:
- Hover any object: small floating tooltip (e.g. "PAL-1026 - Safety Helmet").
- Click: write to the zustand selection; draw blue corner brackets around the object
  and a blue pill label above it (e.g. "FL-01 Loading truck", "TRK-2481 En route",
  "In 2 Booked"); smoothly ease the camera toward it.
- Site switch: fly the camera to the new site's origin (400-600ms ease).
- Map-control pill buttons call zoom/rotate/home on the controls ref.
Keep HUD cards pointer-events active only on the cards, so the map stays draggable
everywhere else. Do not wire movement/simulation yet.
```

### Step 3: Simulation, sync and polish

```
Now bring WareTrack to life and polish it.

SIMULATION (1s tick loop in the store, smooth interpolation with useFrame)
- Trucks follow predefined paths: inbound trucks drive in along a glowing blue route
  line (drawn on the ground) to their dock bay, then park; outbound trucks leave
  after loading completes. Truck progress, "n m left" and ETA values update live.
- Forklifts shuttle pallets between truck and dock door, update status
  (Loading / Unloading / Idle / Charging), battery drains while working and charges
  at the charging area (green glow). Moves-today counters increment.
- Dock progress (e.g. 2/6, 4/7) and shipment steps advance; when a stage finishes,
  the Shipment Tracking stepper moves to the next step and chips change color
  (Loading green, En route blue, Charging amber, Idle grey, Available grey).
- Top-bar clock ticks; KPI values (stock on hand, trucks on site) change with
  count-up animation and show green +delta chips.

SYNC
- Selection from 3D, from the operations table rows, from the search dropdown and from
  the Shipment Tracking card all go through one store action and always update:
  the 3D selection brackets + label, the detail panel variant, the tracker, and the
  table highlight.
- Esc or the panel X clears selection. "/" focuses search. Arrow keys + Enter navigate
  search results.

POLISH
- 300-500ms eased transitions for panel swaps, tab changes and camera moves
  (framer-motion on HUD, lerp/damp on camera).
- Skeleton/loader on first render, graceful fallback if WebGL is unavailable.
- Performance: instanced meshes for repeated boxes/trees/fence posts, cap pixel ratio
  at 2, shadow map 1024.
- Responsive: under 1280px collapse detail panel to a bottom sheet and merge tracker +
  table into tabs.
- Write a README (how to run, folder structure, how to add a new site in
  src/data/sites.ts) and ensure `npm install && npm run dev` works with no errors.
```

---

## Tips

- If a generator times out, run Part B one step at a time and review before moving on.
- Add "Use only original, fictional brand names" if your tool tries to add real logos.
- For a 2D fallback of the map, replace the Step 2 scene with an SVG isometric illustration and keep all HUD logic unchanged.
