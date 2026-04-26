export interface FeatureIconDef {
  id: string;
  label: string;
  innerHTML: string;
}

export const FEATURE_ICONS: FeatureIconDef[] = [
  // ── Structure & Building ──────────────────────────────────────────────────
  { id: 'home',         label: 'Home',          innerHTML: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { id: 'building',     label: 'Building',      innerHTML: '<path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18"/><path d="M6 12H4a2 2 0 00-2 2v8h4"/><path d="M18 9h2a2 2 0 012 2v11h-4"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>' },
  { id: 'layout',       label: 'Floor Plan',    innerHTML: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>' },
  { id: 'grid',         label: 'Modular',       innerHTML: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
  { id: 'maximize',     label: 'Spacious',      innerHTML: '<path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>' },
  { id: 'anchor',       label: 'Foundation',    innerHTML: '<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0020 0h-3"/>' },
  { id: 'layers',       label: 'Structure',     innerHTML: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' },
  { id: 'move',         label: 'Relocatable',   innerHTML: '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>' },
  { id: 'columns',      label: 'Panel System',  innerHTML: '<path d="M12 3h7a2 2 0 012 2v14a2 2 0 01-2 2h-7m0-18H5a2 2 0 00-2 2v14a2 2 0 002 2h7m0-18v18"/>' },
  { id: 'compass',      label: 'Engineering',   innerHTML: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>' },

  // ── Safety & Security ─────────────────────────────────────────────────────
  { id: 'shield',       label: 'Shield',        innerHTML: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { id: 'shield-check', label: 'Certified',     innerHTML: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>' },
  { id: 'lock',         label: 'Security',      innerHTML: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>' },
  { id: 'key',          label: 'Access Ctrl',   innerHTML: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>' },
  { id: 'camera',       label: 'CCTV',          innerHTML: '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>' },
  { id: 'check-circle', label: 'Verified',      innerHTML: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
  { id: 'flame',        label: 'Fire Resist',   innerHTML: '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>' },
  { id: 'alert-octagon',label: 'Safety First',  innerHTML: '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' },

  // ── Utilities & Systems ───────────────────────────────────────────────────
  { id: 'zap',          label: 'Electrical',    innerHTML: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  { id: 'wind',         label: 'Ventilation',   innerHTML: '<path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>' },
  { id: 'wifi',         label: 'Connectivity',  innerHTML: '<path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>' },
  { id: 'battery',      label: 'Power Backup',  innerHTML: '<rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/>' },
  { id: 'cpu',          label: 'Smart Tech',    innerHTML: '<rect x="9" y="9" width="6" height="6"/><rect x="5" y="5" width="14" height="14" rx="1"/><path d="M9 1v2M15 1v2M9 21v2M15 21v2M1 9h2M21 9h2M1 15h2M21 15h2"/>' },
  { id: 'thermometer',  label: 'Temperature',   innerHTML: '<path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>' },
  { id: 'droplets',     label: 'Waterproof',    innerHTML: '<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>' },
  { id: 'sun',          label: 'Solar/Weather', innerHTML: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' },
  { id: 'sunrise',      label: 'Energy Save',   innerHTML: '<path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><polyline points="8 6 12 2 16 6"/>' },

  // ── Logistics & Delivery ──────────────────────────────────────────────────
  { id: 'truck',        label: 'Delivery',      innerHTML: '<rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>' },
  { id: 'package',      label: 'Package',       innerHTML: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>' },
  { id: 'globe',        label: 'Pan-India',     innerHTML: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>' },
  { id: 'send',         label: 'Fast Dispatch', innerHTML: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' },
  { id: 'map-pin',      label: 'Location',      innerHTML: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>' },

  // ── Quality & Business ────────────────────────────────────────────────────
  { id: 'star',         label: 'Quality',       innerHTML: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
  { id: 'award',        label: 'Award',         innerHTML: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>' },
  { id: 'file-text',    label: 'Certificate',   innerHTML: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },
  { id: 'clipboard',    label: 'Project Plan',  innerHTML: '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>' },
  { id: 'dollar-sign',  label: 'Cost Effective',innerHTML: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
  { id: 'bar-chart',    label: 'Performance',   innerHTML: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { id: 'trending-up',  label: 'ROI',           innerHTML: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
  { id: 'refresh-cw',   label: 'Durable',       innerHTML: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>' },
  { id: 'clock',        label: 'Timeline',      innerHTML: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },

  // ── Team & Support ────────────────────────────────────────────────────────
  { id: 'users',        label: 'Team',          innerHTML: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
  { id: 'phone',        label: 'Support',       innerHTML: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>' },
  { id: 'headphones',   label: '24/7 Support',  innerHTML: '<path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>' },
  { id: 'wrench',       label: 'Maintenance',   innerHTML: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>' },
  { id: 'tool',         label: 'Installation',  innerHTML: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/><line x1="2" y1="22" x2="6" y2="18"/>' },

  // ── Environment & Materials ───────────────────────────────────────────────
  { id: 'leaf',         label: 'Eco-Friendly',  innerHTML: '<path d="M6.3 20.3a2.4 2.4 0 003.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 000 3.4z"/><path d="M2 22l5.5-5.5"/><path d="M16.9 3.1C13 7 13 13 13 13s6 0 9.9-3.9a5.66 5.66 0 00-6-6z"/>' },
  { id: 'feather',      label: 'Lightweight',   innerHTML: '<path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>' },
  { id: 'activity',     label: 'Performance',   innerHTML: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },

  // ── Customization ─────────────────────────────────────────────────────────
  { id: 'sliders',      label: 'Customizable',  innerHTML: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="6" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="4" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="8" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="4" x2="15" y2="4"/><line x1="17" y1="16" x2="23" y2="16"/>' },
  { id: 'settings',     label: 'Custom Build',  innerHTML: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>' },
  { id: 'edit-3',       label: 'Made to Order', innerHTML: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>' },
];

export const ICON_MAP = new Map(FEATURE_ICONS.map((i) => [i.id, i]));
