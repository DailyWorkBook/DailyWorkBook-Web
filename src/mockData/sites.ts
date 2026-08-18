export interface Post {
  id: string;
  siteId: string;
  siteName: string;
  clientId: string;
  clientName: string;
  name: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  geofenceRadiusM: number;
  guardCountRequired: number;
  shiftType: 'DAY' | 'NIGHT' | '24_7_ROTATIONAL';
  qrCodeId: string;
  postInstructions: string;
  isActive: boolean;
}

export interface Site {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  geofenceRadiusM: number;
  timezone: string;
  isActive: boolean;
  postsCount: number;
  guardsCount: number;
  posts: Post[];
}

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    clientId: 'client-1',
    clientName: 'HDFC Bank Limited',
    name: 'FC Road Branch & Regional Hub',
    addressLine: '1204/1, FC Road, Shivajinagar',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411004',
    latitude: 18.5204,
    longitude: 73.8567,
    geofenceRadiusM: 100,
    timezone: 'Asia/Kolkata',
    isActive: true,
    postsCount: 4,
    guardsCount: 120,
    posts: [
      {
        id: 'post-1',
        siteId: 'site-1',
        siteName: 'FC Road Branch & Regional Hub',
        clientId: 'client-1',
        clientName: 'HDFC Bank Limited',
        name: 'Main Gate & Visitor Entry',
        addressLine: '1204/1, FC Road Gate A',
        latitude: 18.5205,
        longitude: 73.8568,
        geofenceRadiusM: 80,
        guardCountRequired: 2,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-HDF-1',
        postInstructions: 'Verify visitor badges, log all incoming vehicles in digital register.',
        isActive: true
      },
      {
        id: 'post-2',
        siteId: 'site-1',
        siteName: 'FC Road Branch & Regional Hub',
        clientId: 'client-1',
        clientName: 'HDFC Bank Limited',
        name: '24x7 ATM Kiosk Outer Gate',
        addressLine: '1204/1, FC Road ATM Annex',
        latitude: 18.5202,
        longitude: 73.8566,
        geofenceRadiusM: 50,
        guardCountRequired: 1,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-HDF-2',
        postInstructions: 'Ensure one customer inside ATM room at a time, check helmet compliance.',
        isActive: true
      },
      {
        id: 'post-3',
        siteId: 'site-1',
        siteName: 'FC Road Branch & Regional Hub',
        clientId: 'client-1',
        clientName: 'HDFC Bank Limited',
        name: 'Staff Rear Entrance & Parking',
        addressLine: '1204/1, FC Road Lane 2 Rear',
        latitude: 18.5207,
        longitude: 73.8565,
        geofenceRadiusM: 70,
        guardCountRequired: 1,
        shiftType: 'DAY',
        qrCodeId: 'QR-HDF-3',
        postInstructions: 'Staff RFID card check, monitor parking slot allocation.',
        isActive: true
      },
      {
        id: 'post-4',
        siteId: 'site-1',
        siteName: 'FC Road Branch & Regional Hub',
        clientId: 'client-1',
        clientName: 'HDFC Bank Limited',
        name: 'Cash Vault & Currency Chest',
        addressLine: '1204/1, FC Road B2 Vault Level',
        latitude: 18.5204,
        longitude: 73.8567,
        geofenceRadiusM: 40,
        guardCountRequired: 2,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-HDF-4',
        postInstructions: 'Strict dual-person authorization required. Armed gunman required.',
        isActive: true
      }
    ]
  },
  {
    id: 'site-2',
    clientId: 'client-2',
    clientName: 'Infosys Limited',
    name: 'Hinjawadi Phase 1 IT Campus',
    addressLine: 'Plot No. 1, Rajiv Gandhi Infotech Park',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411057',
    latitude: 18.5912,
    longitude: 73.7389,
    geofenceRadiusM: 150,
    timezone: 'Asia/Kolkata',
    isActive: true,
    postsCount: 4,
    guardsCount: 160,
    posts: [
      {
        id: 'post-5',
        siteId: 'site-2',
        siteName: 'Hinjawadi Phase 1 IT Campus',
        clientId: 'client-2',
        clientName: 'Infosys Limited',
        name: 'North Main Gate (Pedestrian & Vehicles)',
        addressLine: 'Hinjawadi Phase 1 North Gate',
        latitude: 18.5915,
        longitude: 73.7391,
        geofenceRadiusM: 100,
        guardCountRequired: 3,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-INF-1',
        postInstructions: 'Scan employee ID cards, under-chassis mirror search for all commercial cabs.',
        isActive: true
      },
      {
        id: 'post-6',
        siteId: 'site-2',
        siteName: 'Hinjawadi Phase 1 IT Campus',
        clientId: 'client-2',
        clientName: 'Infosys Limited',
        name: 'South Bus Terminal Gate',
        addressLine: 'Hinjawadi Phase 1 South Gate',
        latitude: 18.5908,
        longitude: 73.7385,
        geofenceRadiusM: 90,
        guardCountRequired: 2,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-INF-2',
        postInstructions: 'Manage employee shuttle buses arrival and boarding lanes.',
        isActive: true
      },
      {
        id: 'post-7',
        siteId: 'site-2',
        siteName: 'Hinjawadi Phase 1 IT Campus',
        clientId: 'client-2',
        clientName: 'Infosys Limited',
        name: 'Building 3 Executive Lobby',
        addressLine: 'Building 3 Ground Floor Reception',
        latitude: 18.5913,
        longitude: 73.7390,
        geofenceRadiusM: 60,
        guardCountRequired: 2,
        shiftType: 'DAY',
        qrCodeId: 'QR-INF-3',
        postInstructions: 'VIP guest escort, visitor badge issuance and turnstile management.',
        isActive: true
      },
      {
        id: 'post-8',
        siteId: 'site-2',
        siteName: 'Hinjawadi Phase 1 IT Campus',
        clientId: 'client-2',
        clientName: 'Infosys Limited',
        name: 'Data Center & Server Room',
        addressLine: 'Building 2 Sub-Basement 1',
        latitude: 18.5910,
        longitude: 73.7388,
        geofenceRadiusM: 40,
        guardCountRequired: 1,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-INF-4',
        postInstructions: 'Biometric verification log, no unauthorized electronic media allowed.',
        isActive: true
      }
    ]
  },
  {
    id: 'site-3',
    clientId: 'client-3',
    clientName: 'Ruby Hall Clinic',
    name: 'Central Sassoon Road Campus',
    addressLine: '40 Sassoon Road, Bund Garden',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411001',
    latitude: 18.5314,
    longitude: 73.8745,
    geofenceRadiusM: 120,
    timezone: 'Asia/Kolkata',
    isActive: true,
    postsCount: 3,
    guardsCount: 95,
    posts: [
      {
        id: 'post-9',
        siteId: 'site-3',
        siteName: 'Central Sassoon Road Campus',
        clientId: 'client-3',
        clientName: 'Ruby Hall Clinic',
        name: 'Casualty & Emergency Entry Ramp',
        addressLine: '40 Sassoon Road Emergency Gate',
        latitude: 18.5316,
        longitude: 73.8747,
        geofenceRadiusM: 70,
        guardCountRequired: 2,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-RBH-1',
        postInstructions: 'Clear ambulance passage at all times, manage trauma room traffic.',
        isActive: true
      },
      {
        id: 'post-10',
        siteId: 'site-3',
        siteName: 'Central Sassoon Road Campus',
        clientId: 'client-3',
        clientName: 'Ruby Hall Clinic',
        name: 'OPD Main Reception & Waiting Area',
        addressLine: 'OPD Block Ground Floor',
        latitude: 18.5313,
        longitude: 73.8744,
        geofenceRadiusM: 60,
        guardCountRequired: 1,
        shiftType: 'DAY',
        qrCodeId: 'QR-RBH-2',
        postInstructions: 'Assist senior citizen patients, control OPD queue crowding.',
        isActive: true
      },
      {
        id: 'post-11',
        siteId: 'site-3',
        siteName: 'Central Sassoon Road Campus',
        clientId: 'client-3',
        clientName: 'Ruby Hall Clinic',
        name: 'Multi-Level Car Parking Complex',
        addressLine: 'MLCP Gate 1 & 2',
        latitude: 18.5312,
        longitude: 73.8742,
        geofenceRadiusM: 80,
        guardCountRequired: 2,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-RBH-3',
        postInstructions: 'Issue parking tokens, ensure doctor reserved spots are kept clear.',
        isActive: true
      }
    ]
  },
  {
    id: 'site-4',
    clientId: 'client-4',
    clientName: 'ICICI Bank Limited',
    name: 'BKC Corporate Towers',
    addressLine: 'Plot C-20, G Block, Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400051',
    latitude: 19.0657,
    longitude: 72.8687,
    geofenceRadiusM: 100,
    timezone: 'Asia/Kolkata',
    isActive: true,
    postsCount: 3,
    guardsCount: 77,
    posts: [
      {
        id: 'post-12',
        siteId: 'site-4',
        siteName: 'BKC Corporate Towers',
        clientId: 'client-4',
        clientName: 'ICICI Bank Limited',
        name: 'Tower A Main Promenade Gate',
        addressLine: 'BKC Gate 1 Promenade',
        latitude: 19.0659,
        longitude: 72.8689,
        geofenceRadiusM: 80,
        guardCountRequired: 2,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-ICI-1',
        postInstructions: 'Access card scan for corporate employees, visitor passport/Aadhaar verification.',
        isActive: true
      },
      {
        id: 'post-13',
        siteId: 'site-4',
        siteName: 'BKC Corporate Towers',
        clientId: 'client-4',
        clientName: 'ICICI Bank Limited',
        name: 'Executive & VIP Elevator Bank',
        addressLine: 'Tower A 1st Floor VIP Foyer',
        latitude: 19.0656,
        longitude: 72.8686,
        geofenceRadiusM: 50,
        guardCountRequired: 1,
        shiftType: 'DAY',
        qrCodeId: 'QR-ICI-2',
        postInstructions: 'Board member escort and executive lift clearance.',
        isActive: true
      },
      {
        id: 'post-14',
        siteId: 'site-4',
        siteName: 'BKC Corporate Towers',
        clientId: 'client-4',
        clientName: 'ICICI Bank Limited',
        name: 'Basement Loading Dock & Valet',
        addressLine: 'Basement B1 Service Gate',
        latitude: 19.0655,
        longitude: 72.8685,
        geofenceRadiusM: 70,
        guardCountRequired: 2,
        shiftType: '24_7_ROTATIONAL',
        qrCodeId: 'QR-ICI-3',
        postInstructions: 'Vendor delivery logging, explosive detector scanner check for vans.',
        isActive: true
      }
    ]
  }
];
