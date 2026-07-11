/* ============================================================
   VSEPR Molecular Geometry
   ------------------------------------------------------------
   Electron groups (bonds + lone pairs) around a central atom
   repel and spread out. The student sets how many of each; the
   tool places them in the correct electron-domain geometry,
   names the molecular shape (counting atoms only), and decides
   polarity from the vector sum of the bond directions — so
   symmetric molecules correctly come out nonpolar.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

let bonds = 2, lone = 2;
let yaw = 0.6, pitch = -0.3, autorotate = true;
let canvas, ctx;

/* domain unit vectors, ordered so that lone pairs (taken from the
   FRONT of the list) land in their chemically preferred spots:
   equatorial first in a trigonal bipyramid, trans/axial in an octahedron. */
function domains(total) {
  const s3 = 1/Math.sqrt(3);
  switch (total) {
    case 1: return [[0,0,1]];
    case 2: return [[1,0,0],[-1,0,0]];
    case 3: return [0,1,2].map(k => { const a = k*2*Math.PI/3; return [Math.cos(a), Math.sin(a), 0]; });
    case 4: return [[s3,s3,s3],[s3,-s3,-s3],[-s3,s3,-s3],[-s3,-s3,s3]];
    case 5: { // equatorial (lone-pair preferred) first, then axial
      const eq = [0,1,2].map(k => { const a = k*2*Math.PI/3; return [Math.cos(a), Math.sin(a), 0]; });
      return [...eq, [0,0,1],[0,0,-1]];
    }
    case 6: return [[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]];
    default: return [];
  }
}

/* molecular shape names by (bonding atoms, lone pairs) — the AXE model */
const SHAPES = {
  "1-0":"diatomic",
  "2-0":"linear", "2-1":"bent", "2-2":"bent", "2-3":"linear",
  "3-0":"trigonal planar", "3-1":"trigonal pyramidal", "3-2":"T-shaped",
  "4-0":"tetrahedral", "4-1":"seesaw", "4-2":"square planar",
  "5-0":"trigonal bipyramidal", "5-1":"square pyramidal",
  "6-0":"octahedral",
};
const DOMAIN_GEOM = { 2:"linear", 3:"trigonal planar", 4:"tetrahedral",
                      5:"trigonal bipyramidal", 6:"octahedral" };
const IDEAL_ANGLE = { 2:"180°", 3:"120°", 4:"109.5°", 5:"90° / 120°", 6:"90°" };

function shapeName(b, l) { return SHAPES[`${b}-${l}`] || "—"; }

/* ---------- math ---------- */
function rotate([x,y,z]) {
  // yaw about Y, then pitch about X
  let cx=Math.cos(yaw), sx=Math.sin(yaw);
  let x1 = x*cx + z*sx, z1 = -x*sx + z*cx, y1 = y;
  let cy=Math.cos(pitch), sy=Math.sin(pitch);
  let y2 = y1*cy - z1*sy, z2 = y1*sy + z1*cy;
  return [x1, y2, z2];
}
function project([x,y,z], w, h) {
  const f = 4.2, scale = f/(f - z), px = Math.min(w,h)*0.34;
  return { x: w/2 + x*scale*px, y: h*0.45 - y*scale*px, z, scale };
}

/* ---------- derived state ---------- */
function compute() {
  const total = bonds + lone;
  const verts = domains(total);
  const loneVecs = verts.slice(0, lone);
  const bondVecs = verts.slice(lone);
  // net dipole = sum of bond unit vectors (equal bonds assumed)
  const sum = bondVecs.reduce((a,v)=>[a[0]+v[0],a[1]+v[1],a[2]+v[2]],[0,0,0]);
  const mag = Math.hypot(...sum);
  const polar = bonds > 0 && mag > 1e-6;
  return { total, loneVecs, bondVecs, dipole: sum, mag, polar };
}

/* ---------- draw ---------- */
function size() {
  const r = canvas.getBoundingClientRect(), d = window.devicePixelRatio || 1;
  canvas.width = r.width*d; canvas.height = r.height*d; ctx.setTransform(d,0,0,d,0,0);
}
function draw() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const { loneVecs, bondVecs, dipole, mag, polar } = compute();
  const L = 1.5;

  // gather drawables (bonds, atoms, lone lobes) and z-sort
  const items = [];
  for (const v of bondVecs) {
    const end = rotate([v[0]*L, v[1]*L, v[2]*L]);
    items.push({ type:"bond", end });
    items.push({ type:"atom", pos: end });
  }
  for (const v of loneVecs) {
    const pos = rotate([v[0]*L*0.62, v[1]*L*0.62, v[2]*L*0.62]);
    items.push({ type:"lone", pos });
  }
  // central atom
  const center = rotate([0,0,0]);
  items.push({ type:"center", pos: center });
  // dipole arrow
  if (polar) {
    const d = rotate([dipole[0]/mag*L*0.9, dipole[1]/mag*L*0.9, dipole[2]/mag*L*0.9]);
    items.push({ type:"dipole", end: d });
  }
  items.sort((a,b)=> (a.pos?.z ?? a.end?.z ?? 0) - (b.pos?.z ?? b.end?.z ?? 0));

  const c0 = project(center, w, h);
  for (const it of items) {
    if (it.type === "bond") {
      const p = project(it.end, w, h);
      ctx.beginPath(); ctx.moveTo(c0.x, c0.y); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 3*p.scale*0.6; ctx.stroke();
    } else if (it.type === "atom") {
      const p = project(it.pos, w, h); drawSphere(p, 16, "#5b8cff");
    } else if (it.type === "center") {
      const p = project(it.pos, w, h); drawSphere(p, 22, "#9aa3c7");
    } else if (it.type === "lone") {
      const p = project(it.pos, w, h);
      ctx.globalAlpha = 0.5;
      drawSphere(p, 13, "#ff7a9a"); drawSphere({x:p.x+8*p.scale,y:p.y,scale:p.scale}, 13, "#ff7a9a");
      ctx.globalAlpha = 1;
    } else if (it.type === "dipole") {
      const p = project(it.end, w, h);
      ctx.beginPath(); ctx.moveTo(c0.x, c0.y); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = "#ffd35c"; ctx.lineWidth = 2.5; ctx.stroke();
      const ang = Math.atan2(p.y-c0.y, p.x-c0.x);
      ctx.beginPath(); ctx.moveTo(p.x,p.y);
      ctx.lineTo(p.x-10*Math.cos(ang-0.4), p.y-10*Math.sin(ang-0.4));
      ctx.lineTo(p.x-10*Math.cos(ang+0.4), p.y-10*Math.sin(ang+0.4));
      ctx.closePath(); ctx.fillStyle="#ffd35c"; ctx.fill();
    }
  }
}
function drawSphere(p, r, color) {
  r = r * (p.scale || 1);
  const g = ctx.createRadialGradient(p.x-r*0.3, p.y-r*0.3, r*0.2, p.x, p.y, r);
  g.addColorStop(0, "#fff"); g.addColorStop(0.25, color); g.addColorStop(1, shade(color));
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fillStyle = g; ctx.fill();
}
function shade(hex){ const n=parseInt(hex.slice(1),16); const r=(n>>16&255)*.4|0,g=(n>>8&255)*.4|0,b=(n&255)*.4|0;
  return `rgb(${r},${g},${b})`; }

/* ---------- panel ---------- */
function renderPanel() {
  const { total, polar, mag } = compute();
  const name = shapeName(bonds, lone);
  $("shapeName").textContent = name.charAt(0).toUpperCase() + name.slice(1);
  const pill = $("polarPill");
  pill.textContent = polar ? "Polar molecule" : "Nonpolar molecule";
  pill.className = "pill " + (polar ? "polar" : "nonpolar");
  $("facts").innerHTML = [
    ["Bonding groups (X)", bonds],
    ["Lone pairs (E)", lone],
    ["Electron domains", total],
    ["AXE notation", `AX${bonds}${lone?`E${lone}`:""}`],
    ["Electron-domain geometry", DOMAIN_GEOM[total] || "—"],
    ["Molecular shape", name],
    ["Ideal bond angle", IDEAL_ANGLE[total] || "—"],
    ["Net dipole (|Σ bonds|)", mag.toFixed(2)],
  ].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");

  $("domainNote").innerHTML = total < 2 ? "Add at least two groups." :
    `The ${total} electron groups arrange as a <strong>${DOMAIN_GEOM[total]}</strong> ` +
    `(that's the <em>electron</em> geometry). Hiding the ${lone} lone pair${lone===1?"":"s"} leaves the ` +
    `<strong>${name}</strong> molecular shape. ` +
    (polar ? "The bond dipoles don't cancel, so the molecule is polar."
           : "The bond dipoles cancel by symmetry, so the molecule is nonpolar even if the bonds are polar.");
  $("bVal").textContent = bonds; $("lVal").textContent = lone;
}

/* ---------- loop & input ---------- */
function loop(){ if (autorotate) yaw += 0.006; draw(); requestAnimationFrame(loop); }

function clamp(){ // keep total within 2..6 (the geometries we model)
  bonds = Math.max(0, Math.min(6, bonds));
  lone  = Math.max(0, Math.min(4, lone));
  if (bonds + lone > 6) { if (lone > 0) lone = 6 - bonds; else bonds = 6; }
  if (bonds + lone < 1) bonds = 1;
}
function update(){ clamp(); renderPanel(); }

/* ---------- module hooks (Learn/Quiz shell) ---------- */
window.moduleState = () => ({ bonds, lone, shape: shapeName(bonds, lone), polar: compute().polar });
window.moduleSetState = (s) => { if (!s) return; if (s.bonds != null) bonds = s.bonds|0; if (s.lone != null) lone = s.lone|0; update(); };

window.addEventListener("DOMContentLoaded", () => {
  canvas = $("scene"); ctx = canvas.getContext("2d"); size();
  window.addEventListener("resize", size);

  $("bPlus").onclick  = () => { bonds++; update(); };
  $("bMinus").onclick = () => { bonds--; update(); };
  $("lPlus").onclick  = () => { lone++;  update(); };
  $("lMinus").onclick = () => { lone--;  update(); };
  $("autorotate").onchange = (e) => { autorotate = e.target.checked; };

  for (const btn of document.querySelectorAll(".presets button")) {
    btn.onclick = () => { bonds = +btn.dataset.b; lone = +btn.dataset.l; update(); };
  }

  // drag to rotate
  let dragging = false, lx = 0, ly = 0;
  canvas.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    yaw += (e.clientX - lx) * 0.01; pitch += (e.clientY - ly) * 0.01;
    pitch = Math.max(-1.4, Math.min(1.4, pitch));
    lx = e.clientX; ly = e.clientY;
  });
  canvas.addEventListener("pointerup", () => dragging = false);

  update();
  requestAnimationFrame(loop);
});
