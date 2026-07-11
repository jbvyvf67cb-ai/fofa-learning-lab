/* ============================================================
   Chemical Bonding (covalent focus)
   ------------------------------------------------------------
   Pick two atoms; the tool classifies the bond from the metal/
   non-metal character and the electronegativity gap, then draws
   it as a Lewis structure — sharing electrons (covalent) or
   transferring them (ionic). Bond order is adjustable so the
   student can watch octets be satisfied or broken.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

/* main-group atoms offered in the picker */
const PICK_Z = [1,3,4,5,6,7,8,9,11,12,13,14,15,16,17,19,20,35,53];
const METAL_CATS = new Set(["alkali-metal","alkaline-earth-metal","transition-metal","post-transition-metal"]);

const isMetal = (e) => METAL_CATS.has(e.category);
const target  = (e) => (e.number <= 2 ? 2 : 8);          // duet for H/He, octet otherwise
const needed  = (e) => Math.max(0, target(e) - e.valence);

let A = ELEMENT_BY_SYMBOL.H, B = ELEMENT_BY_SYMBOL.Cl;
let bondOrder = 1, userOrder = null;
let canvas, ctx, anim = 0;

/* ---------- classification ---------- */
function classify(a, b) {
  const dEN = (a.electronegativity != null && b.electronegativity != null)
    ? Math.abs(a.electronegativity - b.electronegativity) : null;
  if (isMetal(a) && isMetal(b)) return { type: "metallic", dEN };
  if (isMetal(a) !== isMetal(b)) return { type: "ionic", dEN };   // metal + nonmetal
  // both nonmetals -> covalent
  if (dEN != null && dEN < 0.4) return { type: "nonpolar", dEN };
  return { type: "polar", dEN };
}

/* auto bond order for a covalent pair */
function autoOrder(a, b) {
  if (a.symbol === b.symbol) return Math.min(3, Math.max(1, needed(a)));
  return Math.min(3, Math.max(1, Math.min(needed(a), needed(b)) || 1));
}

/* ---------- canvas sizing ---------- */
function size() {
  const r = canvas.getBoundingClientRect(), d = window.devicePixelRatio || 1;
  canvas.width = r.width * d; canvas.height = r.height * d; ctx.setTransform(d,0,0,d,0,0);
}

/* ---------- generic Lewis drawing ---------- */
/* atoms: [{el, x, y, charge, dots, bracket}]  bonds: [{a,b,order}] */
function drawLewisInto(c, atoms, bonds, R) {
  // bonds (lines)
  for (const bd of bonds) {
    const p = atoms[bd.a], q = atoms[bd.b];
    const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy);
    const ux = dx/len, uy = dy/len, px = -uy, py = ux;          // perpendicular
    const gap = 4;
    const x1 = p.x + ux*R, y1 = p.y + uy*R, x2 = q.x - ux*R, y2 = q.y - uy*R;
    for (let i = 0; i < bd.order; i++) {
      const off = (i - (bd.order-1)/2) * gap;
      c.beginPath();
      c.moveTo(x1 + px*off, y1 + py*off);
      c.lineTo(x2 + px*off, y2 + py*off);
      c.strokeStyle = "#ffd35c"; c.lineWidth = 2; c.stroke();
    }
  }
  // atoms
  for (const at of atoms) {
    const bondSum = bonds.filter(b => atoms[b.a]===at || atoms[b.b]===at)
                         .reduce((s,b)=>s+b.order,0);
    const nonbond = (at.dots != null ? at.dots : at.el.valence) - bondSum;
    drawAtomGlyph(c, at, R, bonds, atoms, nonbond);
  }
}

function drawAtomGlyph(c, at, R, bonds, atoms, nonbond) {
  // disk
  c.beginPath(); c.arc(at.x, at.y, R, 0, 7);
  c.fillStyle = ELEMENT_CATEGORIES[at.el.category].color; c.globalAlpha = .22; c.fill(); c.globalAlpha = 1;
  c.lineWidth = 1.5; c.strokeStyle = "rgba(255,255,255,.25)"; c.stroke();
  // symbol
  c.fillStyle = "#e8ecff"; c.font = `700 ${Math.round(R*0.9)}px system-ui`;
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(at.el.symbol, at.x, at.y);

  // lone-pair / radical dots, avoiding bonded directions
  const blocked = [];
  for (const b of bonds) {
    let other = null;
    if (atoms[b.a]===at) other = atoms[b.b];
    if (atoms[b.b]===at) other = atoms[b.a];
    if (other) blocked.push(Math.atan2(other.y-at.y, other.x-at.x));
  }
  const slots = [-Math.PI/2, Math.PI/2, Math.PI, 0, -Math.PI/4, Math.PI/4, 3*Math.PI/4, -3*Math.PI/4];
  const free = slots.filter(s => !blocked.some(b => Math.abs(angDiff(s,b)) < 0.5));
  let pairs = Math.floor(nonbond/2), rad = nonbond % 2, si = 0;
  const rr = R + 9;
  const drawDot = (x,y)=>{ c.beginPath(); c.arc(x,y,2.6,0,7); c.fillStyle="#4ad6ff"; c.fill(); };
  while (pairs-- > 0 && si < free.length) {
    const a = free[si++], cxp = at.x+Math.cos(a)*rr, cyp = at.y+Math.sin(a)*rr;
    const pxp = -Math.sin(a)*4, pyp = Math.cos(a)*4;
    drawDot(cxp+pxp, cyp+pyp); drawDot(cxp-pxp, cyp-pyp);
  }
  if (rad && si < free.length) {
    const a = free[si++]; drawDot(at.x+Math.cos(a)*rr, at.y+Math.sin(a)*rr);
  }

  // ion bracket + charge
  if (at.bracket) {
    c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1.5;
    const bx = R + 18, by = R + 14;
    c.beginPath(); // [ ]
    c.moveTo(at.x-bx+5, at.y-by); c.lineTo(at.x-bx, at.y-by); c.lineTo(at.x-bx, at.y+by); c.lineTo(at.x-bx+5, at.y+by);
    c.moveTo(at.x+bx-5, at.y-by); c.lineTo(at.x+bx, at.y-by); c.lineTo(at.x+bx, at.y+by); c.lineTo(at.x+bx-5, at.y+by);
    c.stroke();
  }
  if (at.charge) {
    c.fillStyle = at.charge > 0 ? "#ff8f9a" : "#5fe6d8";
    c.font = "700 15px system-ui"; c.textAlign = "left";
    const sign = at.charge > 0 ? "+" : "−", mag = Math.abs(at.charge) > 1 ? Math.abs(at.charge) : "";
    c.fillText(mag + sign, at.x + R + (at.bracket?22:6), at.y - R + 2);
  }
}
function angDiff(a,b){ let d=a-b; while(d>Math.PI)d-=2*Math.PI; while(d<-Math.PI)d+=2*Math.PI; return d; }

/* ---------- module hooks (Learn/Quiz shell) ---------- */
window.moduleState = () => { const c = classify(A, B); return { a: A.symbol, b: B.symbol, bondType: c.type, bondOrder }; };
window.moduleSetState = (s) => {
  if (!s) return;
  if (s.a && ELEMENT_BY_SYMBOL[s.a]) A = ELEMENT_BY_SYMBOL[s.a];
  if (s.b && ELEMENT_BY_SYMBOL[s.b]) B = ELEMENT_BY_SYMBOL[s.b];
  userOrder = (s.order != null) ? s.order : null;
  if ($("atomA")) $("atomA").value = A.number;
  if ($("atomB")) $("atomB").value = B.number;
  if (typeof polyShown !== "undefined") polyShown = null;
  anim = 0; render();
};

/* ---------- main render of the two-atom bond ---------- */
function render() {
  const cls = classify(A, B);
  // bond order
  if (cls.type === "polar" || cls.type === "nonpolar") {
    bondOrder = userOrder != null ? userOrder : autoOrder(A, B);
    $("bondOrderRow").style.display = "flex";
    for (const btn of $("bondOrderSeg").children) btn.classList.toggle("on", +btn.dataset.o === bondOrder);
  } else {
    $("bondOrderRow").style.display = "none";
  }

  // verdict pill + why
  const labels = { ionic:"Ionic bond", polar:"Polar covalent", nonpolar:"Nonpolar covalent", metallic:"Metallic bond" };
  const pill = $("bondPill");
  pill.textContent = labels[cls.type];
  pill.className = "pill " + cls.type;
  $("bondWhy").innerHTML = whyText(A, B, cls);

  // facts table
  renderFacts(A, B, cls);

  drawScene(); // uses requestAnimationFrame loop; this just resets anim for ionic
}

function whyText(a, b, cls) {
  const dEN = cls.dEN == null ? "—" : cls.dEN.toFixed(2);
  if (cls.type === "metallic")
    return `Two metals (${a.symbol}, ${b.symbol}) pool their valence electrons into a shared “sea,” ` +
           `leaving positive cores. That sea is why metals conduct and bend.`;
  if (cls.type === "ionic") {
    const metal = isMetal(a) ? a : b, nm = isMetal(a) ? b : a;
    return `Metal + nonmetal, ΔEN = ${dEN}. The nonmetal (${nm.symbol}) pulls electron(s) clean off ` +
           `the metal (${metal.symbol}). Opposite charges then attract — an ionic bond.`;
  }
  const rule = cls.dEN != null && cls.dEN >= 1.7
    ? ` (ΔEN ≥ 1.7, so the simple rule would even call it ionic — but two nonmetals share rather than transfer)`
    : "";
  return `Two nonmetals, ΔEN = ${dEN}. They <strong>share</strong> electrons. ` +
    (cls.type === "polar"
      ? `The gap (${dEN}) pulls the shared pair toward ${ (a.electronegativity>b.electronegativity?a:b).symbol }, so it's polar${rule}.`
      : `The gap is tiny, so electrons sit evenly — nonpolar.`);
}

function renderFacts(a, b, cls) {
  const rows = [
    ["Atom A", `${a.name} — EN ${a.electronegativity ?? "—"}, ${a.valence} valence`],
    ["Atom B", `${b.name} — EN ${b.electronegativity ?? "—"}, ${b.valence} valence`],
    ["ΔEN", cls.dEN == null ? "—" : cls.dEN.toFixed(2)],
  ];
  const explain = $("explain");
  if (cls.type === "ionic") {
    const metal = isMetal(a) ? a : b, nm = isMetal(a) ? b : a;
    const lose = metal.valence, gain = needed(nm);
    const g = gcd(lose, gain), nM = gain/g, nN = lose/g;
    const formula = formulaStr(metal.symbol, nM) + formulaStr(nm.symbol, nN);
    rows.push(["Ions formed", `${metal.symbol}${supCharge(lose,'+')}  ${nm.symbol}${supCharge(gain,'-')}`]);
    rows.push(["Formula ratio", formula]);
    explain.innerHTML = `${metal.symbol} loses ${lose} electron${lose>1?"s":""} to empty its outer shell; ` +
      `${nm.symbol} gains ${gain} to complete its octet. Charges must balance, giving <strong>${formula}</strong>.`;
  } else if (cls.type === "metallic") {
    explain.innerHTML = "Delocalized electrons (the “sea”) move freely between cations — the model for conductivity, " +
      "malleability, and metallic lustre. (This is the gateway to the solid-state / band-theory path.)";
  } else {
    const arA = a.valence + bondOrder, arB = b.valence + bondOrder;
    rows.push(["Bond order", bondOrder + (bondOrder===1?" (single)":bondOrder===2?" (double)":" (triple)")]);
    rows.push([`${a.symbol} octet`, `${arA}/${target(a)} ${arA===target(a)?"✓":"✗"}`]);
    rows.push([`${b.symbol} octet`, `${arB}/${target(b)} ${arB===target(b)?"✓":"✗"}`]);
    const okA = arA===target(a), okB = arB===target(b);
    explain.innerHTML = (okA && okB)
      ? `With ${bondOrder} shared pair${bondOrder>1?"s":""}, <strong>both</strong> atoms reach a full outer shell — ` +
        `each shared pair counts for both. That's a stable covalent bond.`
      : `At this bond order the octet isn't satisfied for ` +
        `${[!okA?a.symbol:null,!okB?b.symbol:null].filter(Boolean).join(" and ")}. ` +
        `Try another bond order — the stable molecule is the one that completes both shells.`;
  }
  $("facts").innerHTML = rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");
}

/* ---------- scene drawing (animation loop) ---------- */
function drawScene() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const cls = classify(A, B);
  const cy = h*0.42, R = 30;
  const xA = w*0.34, xB = w*0.66;

  if (cls.type === "metallic") { drawMetallic(w,h); return; }

  if (cls.type === "ionic") {
    const metalA = isMetal(A);
    const metal = metalA ? A : B, nm = metalA ? B : A;
    const lose = metal.valence, gain = needed(nm);
    const mx = metalA ? xA : xB, nx = metalA ? xB : xA;
    drawLewisInto(ctx, [
      { el: metal, x: mx, y: cy, dots: 0, charge: lose, bracket: true },
      { el: nm,    x: nx, y: cy, dots: target(nm), charge: -gain, bracket: true },
    ], [], R);
    // transfer animation: electrons flying metal -> nonmetal
    const prog = Math.min(1, anim/60);
    for (let i = 0; i < lose; i++) {
      const t = Math.max(0, Math.min(1, prog*1.3 - i*0.15));
      const ex = mx + (nx - mx) * t, ey = cy - 30 + i*10;
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, 7);
      ctx.fillStyle = "#4ad6ff"; ctx.shadowColor="#4ad6ff"; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
    }
    return;
  }

  // covalent: shared pairs animate slightly; polar shifts them toward the EN winner
  const wobble = Math.sin(anim*0.06)*3;
  drawLewisInto(ctx, [
    { el: A, x: xA, y: cy }, { el: B, x: xB, y: cy },
  ], [{ a:0, b:1, order: bondOrder }], R);

  // polarity: δ+/δ- and dipole arrow
  if (cls.type === "polar") {
    const winner = (A.electronegativity > B.electronegativity) ? "B-ish" : null;
    const negIsB = B.electronegativity > A.electronegativity;
    ctx.fillStyle = "#9bb6ff"; ctx.font = "13px system-ui"; ctx.textAlign="center";
    ctx.fillText("δ+", (negIsB?xA:xB), cy - R - 14);
    ctx.fillText("δ−", (negIsB?xB:xA), cy - R - 14);
    // dipole arrow under the bond, pointing to the negative atom
    const ay = cy + R + 22, fromX = negIsB?xA:xB, toX = negIsB?xB:xA;
    ctx.strokeStyle="#ff8f9a"; ctx.lineWidth=2; ctx.beginPath();
    ctx.moveTo(fromX, ay); ctx.lineTo(toX, ay); ctx.stroke();
    const dir = Math.sign(toX-fromX);
    ctx.beginPath(); ctx.moveTo(toX,ay); ctx.lineTo(toX-dir*8, ay-4); ctx.lineTo(toX-dir*8, ay+4); ctx.closePath();
    ctx.fillStyle="#ff8f9a"; ctx.fill();
    // cross tail at positive end
    ctx.beginPath(); ctx.moveTo(fromX-3, ay-3); ctx.lineTo(fromX+3, ay+3); ctx.moveTo(fromX-3,ay+3); ctx.lineTo(fromX+3,ay-3); ctx.stroke();
    ctx.fillStyle="#6f78a3"; ctx.font="11px system-ui";
    ctx.fillText("dipole → points to more electronegative atom", w/2, ay+18);
  }
}
function drawMetallic(w,h){
  const cores = 9, R=16;
  for (let i=0;i<cores;i++){
    const cx = w*0.22 + (i%3)*w*0.18, cy = h*0.25 + Math.floor(i/3)*h*0.22;
    ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.fillStyle="rgba(255,211,92,.22)"; ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.2)"; ctx.stroke();
    ctx.fillStyle="#ffdf8a"; ctx.font="700 13px system-ui"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText((isMetal(A)?A:B).symbol+"+", cx, cy);
  }
  // free electrons drifting
  for (let i=0;i<24;i++){
    const t = anim*0.02 + i;
    const x = w*0.15 + (Math.sin(t*0.7+i)*0.5+0.5)*w*0.7;
    const y = h*0.12 + (Math.cos(t*0.5+i*1.3)*0.5+0.5)*h*0.7;
    ctx.beginPath(); ctx.arc(x,y,3,0,7); ctx.fillStyle="#4ad6ff"; ctx.globalAlpha=.8; ctx.fill(); ctx.globalAlpha=1;
  }
}

/* ---------- helpers ---------- */
function gcd(a,b){ return b? gcd(b,a%b): a; }
function formulaStr(sym,n){ const SUB={1:"",2:"₂",3:"₃",4:"₄",5:"₅",6:"₆"}; return sym + (SUB[n] ?? n); }
function supCharge(n,sign){ const S={1:"",2:"²",3:"³"}; return (S[n]??n) + (sign==='+'?"⁺":"⁻"); }

/* ---------- molecule gallery ---------- */
const MOLS = [
  { f:"H₂",  atoms:[["H",-1,0],["H",1,0]], bonds:[[0,1,1]], diatomic:["H","H"] },
  { f:"O₂",  atoms:[["O",-1,0],["O",1,0]], bonds:[[0,1,2]], diatomic:["O","O"] },
  { f:"N₂",  atoms:[["N",-1,0],["N",1,0]], bonds:[[0,1,3]], diatomic:["N","N"] },
  { f:"F₂",  atoms:[["F",-1,0],["F",1,0]], bonds:[[0,1,1]], diatomic:["F","F"] },
  { f:"HCl", atoms:[["H",-1,0],["Cl",1,0]], bonds:[[0,1,1]], diatomic:["H","Cl"] },
  { f:"H₂O", atoms:[["O",0,0.2],["H",-1,-0.6],["H",1,-0.6]], bonds:[[0,1,1],[0,2,1]] },
  { f:"NH₃", atoms:[["N",0,0.2],["H",-1,-0.5],["H",1,-0.5],["H",0,1]], bonds:[[0,1,1],[0,2,1],[0,3,1]] },
  { f:"CH₄", atoms:[["C",0,0],["H",-1,-0.8],["H",1,-0.8],["H",-1,0.8],["H",1,0.8]], bonds:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]] },
  { f:"CO₂", atoms:[["O",-1.2,0],["C",0,0],["O",1.2,0]], bonds:[[0,1,2],[1,2,2]] },
];
function buildGallery() {
  const g = $("gallery");
  for (const m of MOLS) {
    const card = document.createElement("div");
    card.className = "mol";
    card.innerHTML = `<canvas></canvas><div class="name">${m.f}</div>`;
    const cv = card.querySelector("canvas");
    const d = window.devicePixelRatio||1; cv.width=120*d; cv.height=90*d;
    const cc = cv.getContext("2d"); cc.setTransform(d,0,0,d,0,0);
    drawMolMini(cc, m, 120, 90);
    card.addEventListener("click", () => {
      if (m.diatomic) {
        A = ELEMENT_BY_SYMBOL[m.diatomic[0]]; B = ELEMENT_BY_SYMBOL[m.diatomic[1]];
        userOrder = m.bonds[0][2];
        $("atomA").value = A.number; $("atomB").value = B.number;
        anim = 0; render();
        canvas.scrollIntoView({behavior:"smooth", block:"center"});
      } else {
        // polyatomic: just (re)draw it big in the main canvas as a static Lewis structure
        drawPolyBig(m);
        $("bondPill").textContent = "Covalent molecule";
        $("bondPill").className = "pill nonpolar";
        $("bondWhy").innerHTML = `<strong>${m.f}</strong> — every shared pair (line) and lone pair completes an octet (or duet for H). ` +
          `Click a diatomic to edit bond order, or use the pickers above.`;
        $("bondOrderRow").style.display = "none";
      }
    });
    g.appendChild(card);
  }
}
function molToAtoms(m, cx, cy, scale) {
  return m.atoms.map(([sym,x,y]) => ({ el: ELEMENT_BY_SYMBOL[sym], x: cx + x*scale, y: cy + y*scale }));
}
function drawMolMini(cc, m, w, h) {
  cc.clearRect(0,0,w,h);
  const atoms = molToAtoms(m, w/2, h/2, 26);
  const bonds = m.bonds.map(([a,b,o])=>({a,b,order:o}));
  drawLewisInto(cc, atoms, bonds, 12);
}
function drawPolyBig(m) {
  const stop = true; // freeze animation contribution by drawing here each frame? simpler: draw once
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const atoms = molToAtoms(m, w/2, h*0.45, Math.min(w,h)*0.16);
  const bonds = m.bonds.map(([a,b,o])=>({a,b,order:o}));
  drawLewisInto(ctx, atoms, bonds, 28);
  polyShown = m;        // keep showing it in the loop
}
let polyShown = null;

/* ---------- loop & wiring ---------- */
function loop(){ anim++; if (polyShown) { /* keep static poly */ } else drawScene(); requestAnimationFrame(loop); }

function fillPickers() {
  for (const sel of [$("atomA"), $("atomB")]) {
    for (const z of PICK_Z) {
      const e = ELEMENT_BY_Z[z];
      const o = document.createElement("option"); o.value=z; o.textContent=`${e.name} (${e.symbol})`;
      sel.appendChild(o);
    }
  }
  $("atomA").value = A.number; $("atomB").value = B.number;
}

window.addEventListener("DOMContentLoaded", () => {
  canvas = $("bondCanvas"); ctx = canvas.getContext("2d"); size();
  window.addEventListener("resize", () => { size(); if(polyShown) drawPolyBig(polyShown); });
  fillPickers();
  $("atomA").addEventListener("change", e => { A = ELEMENT_BY_Z[+e.target.value]; userOrder=null; polyShown=null; anim=0; render(); });
  $("atomB").addEventListener("change", e => { B = ELEMENT_BY_Z[+e.target.value]; userOrder=null; polyShown=null; anim=0; render(); });
  for (const btn of $("bondOrderSeg").children)
    btn.addEventListener("click", () => { userOrder = +btn.dataset.o; render(); });
  buildGallery();
  render();
  requestAnimationFrame(loop);
});
