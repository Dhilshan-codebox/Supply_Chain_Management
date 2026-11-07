# WareTrack — 3D Smart Warehouse & Logistics Operations Dashboard

**WareTrack** is a real-time, interactive 3D isometric warehouse operations command center designed with a clean, low-poly "toy diorama" aesthetic. The full-screen 3D scene renders warehouse buildings, loading docks, delivery trucks, forklifts, pallets, and city blocks procedurally using Three.js and React Three Fiber, overlaid with frosted glass HUD controls, live simulation telemetry, and KPI analytics.

---

## 🌟 Key Features

1. **3D Isometric Diorama Scene**:
   - Built entirely with procedural meshes in React Three Fiber (no heavy external 3D asset downloads).
   - **Warehouse Complex**: Corrugated-style pitched roofs, grey-white walls, numbered dock doors, and roof logo disc.
   - **Vehicles & Assets**: Delivery trucks with company liveries (WareTrack, Bluepeak, Cargoviva, Nordline), yellow forklifts with driver operators and moving mast carriages, pallet racking, teal shipping containers, round trees, security fences, and glowing charging stations.
   - **Route Trajectories**: Glowing neon blue dashed ground paths showing inbound trucks heading toward their assigned dock bays.
   - **Hover & Selection**: 3D hover tooltips, blue corner brackets with floating pill badges, and smooth camera easing.

2. **Heads-Up Display (HUD) with Realistic Glassmorphism**:
   - **Multi-Layered Glass Design System**: Authentic frosted glass styling utilizing `backdrop-filter: blur(28px-44px)`, specular light highlights (`.glass-shine`), SVG micro-texture noise overlays for tactile depth, multi-tier box shadows, and ambient radial glow accents.
   - **Top Navigation Bar**: Brand identity with 3D PRO badge, global search with `/` keyboard shortcut and glass dropdown results, site switcher dropdown, live ticking clock with animated green pulsing aura (`Live HH:MM`), notification alert indicator, and user profile.
   - **KPI Cards**: Gentle floating animation (`.animate-float`), real-time count-up animated metrics for *Stock on hand*, *Trucks on site*, and *On-time delivery* with live green delta chips and specular hover lifts.
   - **Map Controls Pill**: Vertical frosted glass pill for zoom in/out (`+`/`-`), rotation (`↺`/`↻`), and home/reset view with tactile click micro-animations.
   - **Context Detail Panel**: Dynamic context-sensitive panel with 5 variants:
     - **Depot / DC**: Facility address, operational status, 2x2 progress stat tiles, category inventory list, and active forklift fleet status.
     - **Forklift**: Operator driver, forklift model, battery gauge bar, speed, moves today, carrying asset, and charger assignment.
     - **Dock Bay**: Dock type, status chip, ETA notes, assigned truck, door seals, and throughput metrics.
     - **Truck**: Carrier brand, driver, license plate, route progress bar, destination ETA, speed, bay assignment, and cargo payload.
     - **Pallet**: Pallet ID, product name, unit quantity, location, and packaging variant.
   - **Shipment Tracking Card**: 5-step horizontal stepper (Order Confirmed → Picked → Loading → In Transit → Delivered) linked to truck telemetry, glowing animated active trajectory bar, paired with an interactive truck thumbnail sub-card.
   - **Operations Table**: Multi-tab switcher (**Docks**, **Forklifts**, **Trucks**) with live progress bars, status chips, and click-to-fly camera focusing.

3. **Live 1-Second Simulation Loop**:
   - Trucks advance along arrival paths, transition from *En route* to *Docked* and *Loading*.
   - Forklifts shuttle pallets between staging bays and dock doors, incrementing *moves today* counters and managing battery drain/charging.
   - Shipment steps advance dynamically with time updates.

4. **Responsive Layout**:
   - Desktop-first (≥ 1280px) with expansive 3D viewport.
   - Under 1280px, automatically transitions the detail panel into an animated spring bottom sheet while keeping the 3D scene fully interactive.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** or **yarn**

### Installation & Run

1. Clone or open the repository:
   ```bash
   cd Supply_Chain_Management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## 📁 Project Architecture & Folder Structure

```
Supply_Chain_Management/
├── src/
│   ├── components/
│   │   ├── hud/                    # Floating 2D HUD UI Cards
│   │   │   ├── ContextDetailPanel.tsx # Reactive 5-variant detail panel
│   │   │   ├── KpiCards.tsx        # Animated top-left KPI cards
│   │   │   ├── MapControls.tsx     # Vertical zoom/rotate pill
│   │   │   ├── MobileDetailSheet.tsx # Responsive bottom sheet (<1280px)
│   │   │   ├── OperationsTable.tsx # Tabbed docks, forklifts & trucks table
│   │   │   ├── ShipmentTracker.tsx # 5-step horizontal stepper card
│   │   │   └── TopBar.tsx          # Top search, site switcher, live clock
│   │   ├── scene/                  # Procedural 3D Three.js Models & R3F Scene
│   │   │   ├── BayOutline.tsx      # Yellow parking stall ground markings
│   │   │   ├── CameraController.tsx # Camera fly-to, easing & rotation
│   │   │   ├── ChargingStation.tsx # Green emissive charging towers
│   │   │   ├── CityBlock.tsx       # Faded background urban structures
│   │   │   ├── Fence.tsx           # Perimeter wire security fences
│   │   │   ├── Forklift.tsx        # Animated forklift with driver & mast
│   │   │   ├── Materials.ts        # Scene colors & standard material definitions
│   │   │   ├── Pallet.tsx          # Wooden pallets with cargo load variants
│   │   │   ├── PinMarker.tsx       # Floating bobbing blue map pins
│   │   │   ├── Rack.tsx            # Orange & blue industrial pallet racking
│   │   │   ├── Road.tsx            # Asphalt roadways with dashed lane lines
│   │   │   ├── RouteLine.tsx       # Neon glowing blue arrival route path
│   │   │   ├── SceneManager.tsx    # R3F Canvas, OrthographicCamera, lights, fog
│   │   │   ├── SelectionHighlight.tsx # 3D corner brackets & floating pill badge
│   │   │   ├── ShippingContainer.tsx # Teal corrugated shipping container
│   │   │   ├── SiteScene.tsx       # Multi-site environment layout composition
│   │   │   ├── Tree.tsx            # Low-poly diorama lollipop trees
│   │   │   └── Warehouse.tsx       # Blue corrugated building with dock doors
│   │   └── ui/                     # Reusable design system primitives
│   │       ├── Card.tsx            # Frosted glass card with 92% opacity & blur
│   │       ├── Chip.tsx            # Pill status chips (green, amber, blue, grey)
│   │       ├── IconTile.tsx        # Tinted icon container badges
│   │       ├── Kbd.tsx             # Keyboard hint badges
│   │       ├── ProgressBar.tsx     # Animated progress bars
│   │       ├── SegmentedTabs.tsx   # Spring animated pill tab selector
│   │       └── StatTile.tsx        # 2x2 metric tiles with mini progress bars
│   ├── data/
│   │   └── sites.ts                # Strongly typed site & logistics mock datasets
│   ├── store/
│   │   └── useStore.ts             # Zustand store with selection & tick simulation
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces for all assets
│   ├── App.tsx                     # Main layout coordinating 3D scene & HUD
│   ├── index.css                   # Tailwind styles, Inter font, custom scrollbars
│   └── main.tsx                    # React 19 root entry
├── index.html                      # Entry HTML with Inter fonts
├── package.json                    # Project scripts & dependencies
├── tailwind.config.js              # Theme colors (royal blue, pale lavender ground)
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build & dev server config
```

---

## 🛠️ How to Add a New Warehouse Site

To add a new site, open `src/data/sites.ts` and add an entry to the `INITIAL_SITES` record adhering to the `SiteData` type:

```typescript
import { SiteData } from '../types';

export const INITIAL_SITES: Record<string, SiteData> = {
  // ... existing sites (WH-01, WH-02, WH-04) ...

  'WH-05': {
    id: 'WH-05',
    name: 'Metro East Distribution',
    address: '100 Logistics Blvd, Jersey City NJ',
    fullnessPercent: 82,
    stockOnHand: 2450,
    totalCapacity: 3000,
    stockDelta: 24,
    trucksOnSite: 2,
    trucksDelta: 1,
    trucksInbound: 1,
    onTimeRate: 97.4,
    onTimeDelta: 0.5,
    baysCount: 4,
    busyBaysCount: 3,
    outboundToday: 35,
    putawaysToday: 40,
    operationalStatus: 'Operational',
    statusSummary: '3 docked - 1 en route - high throughput',
    cameraPosition: [30, 26, 30],
    cameraTarget: [0, 0, 0],
    inventory: [
      { id: 'INV-30', name: 'Smart Sensors', count: 1200, status: 'In Stock', category: 'IoT' },
      { id: 'INV-31', name: 'Packaging Film', count: 180, status: 'Low Stock', category: 'Supplies' }
    ],
    docks: [
      {
        id: 'Bay 1',
        name: 'Dock Bay 1',
        siteId: 'WH-05',
        type: 'Leveler Dock',
        status: 'Occupied',
        currentTruckId: 'TRK-3001',
        carrier: 'WareTrack',
        trucksToday: 12,
        position: [-6, 0, 8]
      }
    ],
    forklifts: [
      {
        id: 'FL-30',
        siteId: 'WH-05',
        driver: 'Jordan Lee',
        model: 'Toyota 8FBE18',
        status: 'Loading',
        statusText: 'Loading TRK-3001 at Bay 1',
        carrying: 'Smart Sensors',
        battery: 92,
        movesToday: 25,
        speed: '8.0 km/h',
        charger: 'Station E-1',
        progress: 60,
        position: [-4, 0, 4]
      }
    ],
    trucks: [
      {
        id: 'TRK-3001',
        siteId: 'WH-05',
        carrier: 'WareTrack',
        driver: 'Alex Ward',
        licensePlate: 'NJ-552-GH',
        shipmentId: '#SHP-90012',
        customer: 'Prime Logistics',
        destination: 'New York, NY',
        eta: '10 min',
        distanceLeft: 'At Bay 1',
        speed: '0.0 km/h',
        bayId: 'Bay 1',
        cargo: '8/10 pallets',
        status: 'Loading',
        progress: 45,
        pathProgress: 1.0,
        position: [-6, 0, 8],
        targetDockPosition: [-6, 0, 8],
        color: '#2B59E0'
      }
    ],
    pallets: [
      { id: 'PAL-4001', siteId: 'WH-05', product: 'Smart Sensors', quantity: 32, location: 'Staging 1', status: 'Staged', variant: 'boxes', position: [-4, 0, 5] }
    ],
    shipments: [
      {
        id: '#SHP-90012',
        truckId: 'TRK-3001',
        siteId: 'WH-05',
        destination: 'New York, NY',
        eta: '11:00',
        bay: 'Bay 1',
        minutesLeft: 10,
        status: 'Loading',
        currentStepIndex: 2,
        steps: [
          { id: 1, name: 'Order Confirmed', timestamp: '08:00', completed: true, active: false },
          { id: 2, name: 'Picked', timestamp: '09:15', completed: true, active: false },
          { id: 3, name: 'Loading', timestamp: 'ETA 09:55', completed: false, active: true },
          { id: 4, name: 'In Transit', timestamp: '10:20', completed: false, active: false },
          { id: 5, name: 'Delivered', timestamp: '11:00', completed: false, active: false }
        ]
      }
    ]
  }
};
```

The site will automatically appear in the Top Bar site dropdown with smooth camera transitions and real-time synchronization across all widgets!

---

## ⌨️ Keyboard Shortcuts

- `/` : Focus global search input
- `Esc` : Clear selection / close dropdowns
- `Mouse Drag` : Orbit and pan camera
- `Mouse Scroll` : Zoom in / out