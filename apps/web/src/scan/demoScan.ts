import type { PublicScanRecord } from "@vrqc/shared";
import { ACCURACY_NOTICE } from "@vrqc/shared";

export const DEMO_SCAN_ID = "demo-room";

export const demoScanRecord: PublicScanRecord = {
  scanId: DEMO_SCAN_ID,
  mode: "room",
  status: "ready",
  createdAt: "2026-07-05T00:00:00.000Z",
  updatedAt: "2026-07-05T00:00:00.000Z",
  device: {
    platform: "Web",
    model: "内置示例模型",
    osVersion: "Static GLB",
    hasLiDAR: false
  },
  files: {
    glbUrl: "/models/demo-room.glb",
    thumbnailUrl: "/models/demo-room.svg"
  },
  measurements: {
    unit: "m",
    accuracyNotice: ACCURACY_NOTICE,
    room: {
      approxAreaSqm: 12,
      approxPerimeterM: 14,
      approxCeilingHeightM: 2.4,
      widthM: 4,
      depthM: 3,
      heightM: 2.4
    },
    object: null,
    surfaces: [
      { id: "demo_floor", type: "floor", widthM: 4, heightM: 3, areaSqm: 12, confidence: "high" },
      { id: "demo_wall_back", type: "wall", widthM: 4, heightM: 2.4, areaSqm: 9.6, confidence: "medium" },
      { id: "demo_wall_left", type: "wall", widthM: 3, heightM: 2.4, areaSqm: 7.2, confidence: "medium" },
      { id: "demo_wall_right", type: "wall", widthM: 3, heightM: 2.4, areaSqm: 7.2, confidence: "medium" }
    ],
    openings: [
      { id: "demo_door", type: "door", widthM: 0.9, heightM: 2.05, confidence: "medium" },
      { id: "demo_window", type: "window", widthM: 1.1, heightM: 0.85, confidence: "medium" }
    ],
    objects: [
      { id: "demo_table", category: "table", widthM: 0.85, heightM: 0.55, depthM: 0.65, confidence: "medium" },
      { id: "demo_box", category: "storage", widthM: 0.55, heightM: 0.45, depthM: 0.45, confidence: "low" }
    ]
  }
};
