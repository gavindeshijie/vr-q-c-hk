import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outFile = path.join(repoRoot, "apps/web/public/models/demo-room.glb");

const materials = [
  { name: "floor", baseColorFactor: [0.96, 0.98, 1, 1], metallicFactor: 0, roughnessFactor: 0.86 },
  { name: "tealGlassWall", baseColorFactor: [0.24, 0.74, 0.69, 0.38], metallicFactor: 0, roughnessFactor: 0.35, alphaMode: "BLEND" },
  { name: "backWall", baseColorFactor: [0.87, 0.92, 0.98, 0.9], metallicFactor: 0, roughnessFactor: 0.72, alphaMode: "BLEND" },
  { name: "table", baseColorFactor: [0.86, 0.55, 0.18, 1], metallicFactor: 0, roughnessFactor: 0.62 },
  { name: "storageBox", baseColorFactor: [0.48, 0.57, 0.68, 1], metallicFactor: 0, roughnessFactor: 0.7 },
  { name: "window", baseColorFactor: [0.28, 0.64, 0.95, 0.55], metallicFactor: 0, roughnessFactor: 0.2, alphaMode: "BLEND" }
];

const boxes = [
  { center: [0, -0.025, 0], size: [4, 0.05, 3], material: 0 },
  { center: [0, 1.2, -1.5], size: [4, 2.4, 0.07], material: 2 },
  { center: [-2, 1.2, 0], size: [0.07, 2.4, 3], material: 1 },
  { center: [2, 1.2, 0], size: [0.07, 2.4, 3], material: 1 },
  { center: [-1.15, 0.78, -1.545], size: [0.85, 1.55, 0.08], material: 1 },
  { center: [0.9, 1.45, -1.545], size: [1.1, 0.85, 0.08], material: 5 },
  { center: [0.2, 0.42, 0.2], size: [0.85, 0.18, 0.65], material: 3 },
  { center: [0.2, 0.19, 0.2], size: [0.7, 0.38, 0.5], material: 3 },
  { center: [1.2, 0.225, 0.95], size: [0.55, 0.45, 0.45], material: 4 }
];

const accessors = [];
const bufferViews = [];
const chunks = [];

function align4(value) {
  return (value + 3) & ~3;
}

function pushBuffer(buffer, target) {
  const offset = chunks.reduce((sum, item) => sum + item.length, 0);
  const alignedOffset = align4(offset);
  if (alignedOffset > offset) chunks.push(Buffer.alloc(alignedOffset - offset));
  chunks.push(buffer);
  const viewIndex = bufferViews.length;
  bufferViews.push({ buffer: 0, byteOffset: alignedOffset, byteLength: buffer.length, target });
  return viewIndex;
}

function addAccessor(buffer, componentType, type, count, target, min, max) {
  const bufferView = pushBuffer(buffer, target);
  const accessor = { bufferView, componentType, count, type };
  if (min) accessor.min = min;
  if (max) accessor.max = max;
  const index = accessors.length;
  accessors.push(accessor);
  return index;
}

function boxGeometry(center, size) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size.map((value) => value / 2);
  const corners = {
    lbf: [cx - sx, cy - sy, cz + sz],
    rbf: [cx + sx, cy - sy, cz + sz],
    rtf: [cx + sx, cy + sy, cz + sz],
    ltf: [cx - sx, cy + sy, cz + sz],
    lbb: [cx - sx, cy - sy, cz - sz],
    rbb: [cx + sx, cy - sy, cz - sz],
    rtb: [cx + sx, cy + sy, cz - sz],
    ltb: [cx - sx, cy + sy, cz - sz]
  };
  const faces = [
    { normal: [0, 0, 1], verts: [corners.lbf, corners.rbf, corners.rtf, corners.ltf] },
    { normal: [0, 0, -1], verts: [corners.rbb, corners.lbb, corners.ltb, corners.rtb] },
    { normal: [-1, 0, 0], verts: [corners.lbb, corners.lbf, corners.ltf, corners.ltb] },
    { normal: [1, 0, 0], verts: [corners.rbf, corners.rbb, corners.rtb, corners.rtf] },
    { normal: [0, 1, 0], verts: [corners.ltf, corners.rtf, corners.rtb, corners.ltb] },
    { normal: [0, -1, 0], verts: [corners.lbb, corners.rbb, corners.rbf, corners.lbf] }
  ];

  const positions = [];
  const normals = [];
  const indices = [];
  for (const face of faces) {
    const start = positions.length / 3;
    for (const vertex of face.verts) {
      positions.push(...vertex);
      normals.push(...face.normal);
    }
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }

  return { positions, normals, indices };
}

function floatBuffer(values) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => buffer.writeFloatLE(value, index * 4));
  return buffer;
}

function ushortBuffer(values) {
  const buffer = Buffer.alloc(values.length * 2);
  values.forEach((value, index) => buffer.writeUInt16LE(value, index * 2));
  return buffer;
}

function minMax(positions) {
  const min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  for (let index = 0; index < positions.length; index += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], positions[index + axis]);
      max[axis] = Math.max(max[axis], positions[index + axis]);
    }
  }
  return { min, max };
}

const primitives = boxes.map((box) => {
  const geometry = boxGeometry(box.center, box.size);
  const { min, max } = minMax(geometry.positions);
  return {
    attributes: {
      POSITION: addAccessor(floatBuffer(geometry.positions), 5126, "VEC3", geometry.positions.length / 3, 34962, min, max),
      NORMAL: addAccessor(floatBuffer(geometry.normals), 5126, "VEC3", geometry.normals.length / 3, 34962)
    },
    indices: addAccessor(ushortBuffer(geometry.indices), 5123, "SCALAR", geometry.indices.length, 34963),
    material: box.material
  };
});

const binChunk = Buffer.concat(chunks);
const gltf = {
  asset: { version: "2.0", generator: "VR.q-c.hk demo room generator" },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0, name: "VRQC demo room" }],
  meshes: [{ name: "demo-room", primitives }],
  materials: materials.map(({ name, alphaMode, ...pbrMetallicRoughness }) => ({
    name,
    ...(alphaMode ? { alphaMode, doubleSided: true } : {}),
    pbrMetallicRoughness
  })),
  accessors,
  bufferViews,
  buffers: [{ byteLength: binChunk.length }]
};

const jsonBuffer = Buffer.from(JSON.stringify(gltf));
const paddedJson = Buffer.concat([jsonBuffer, Buffer.alloc(align4(jsonBuffer.length) - jsonBuffer.length, 0x20)]);
const paddedBin = Buffer.concat([binChunk, Buffer.alloc(align4(binChunk.length) - binChunk.length)]);
const totalLength = 12 + 8 + paddedJson.length + 8 + paddedBin.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(totalLength, 8);

const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(paddedJson.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);

const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(paddedBin.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, Buffer.concat([header, jsonHeader, paddedJson, binHeader, paddedBin]));
console.log(`Wrote ${path.relative(repoRoot, outFile)} (${totalLength} bytes)`);
