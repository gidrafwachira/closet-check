/* =====================================================================
   CONFIG — shop details. Edit here if they change.
   whatsappNumber: international format, digits only (no + or spaces).
   ===================================================================== */
const CONFIG = {
  shopName: "Kidsclosetbydee",
  whatsappNumber: "254723024193",
  currency: "KES",
  budgets: ["Under 2,000", "2,000 – 5,000", "5,000 – 10,000", "Above 10,000"]
};

/* =====================================================================
   ITEM LISTS — as on the Kidsclosetbydee poster.
   Edit any list below to add or remove items for boys or girls.
   ===================================================================== */
const CATALOG = {
  boys: {
    "0-12m": ["Onesies", "Rompers", "T-shirts", "Trousers", "Stockings", "Socks", "Mittens", "Hats",
              "Shawls", "Play suits", "Suits", "Shorts", "Shirts", "Sweat pants", "Sweaters",
              "Sweatshirts", "Matchy sets", "Pyjamas"],
    "1-12y": ["Sweaters", "T-shirts", "Shorts", "Shirts", "Jackets", "Half coat", "Denim jacket",
              "Jeans", "Khakis", "Sweatshirts", "Matchy sets", "Knitted sweaters", "Dungarees",
              "Pyjamas", "Boxers", "Bikers", "Socks"]
  },
  girls: {
    "0-12m": ["Onesies", "Rompers", "T-shirts", "Trousers", "Leggings", "Stockings", "Socks", "Mittens", "Hats",
              "Shawls", "Dresses", "Play suits", "Suits", "Shorts", "Sweat pants", "Sweaters",
              "Sweatshirts", "Matchy sets", "Pyjamas"],
    "1-12y": ["Sweaters", "T-shirts", "Tops", "Shorts", "Blouse", "Jackets", "Half coat", "Denim jacket",
              "Skirts", "Leggings", "Jeans", "Khakis", "Sweatshirts", "Dresses", "Matchy sets",
              "Knitted sweaters", "Dungarees", "Pyjamas", "Panties", "Bikers", "Socks"]
  }
};

const AGE_GROUPS = [
  { id: "0-12m", label: "0 – 12 months" },
  { id: "1-12y", label: "1 – 12 years" }
];

/* Same answer options as the Google Form */
const STATUSES = [
  { id: "enough",    label: "Have enough",       short: "Have enough",  icon: "🟢" },
  { id: "notenough", label: "Do not have enough", short: "Not enough",  icon: "🟡" },
  { id: "urgent",    label: "Need urgently",     short: "Need urgently", icon: "🔴" },
  { id: "none",      label: "I do not need them", short: "Don't need",  icon: "⚪" }
];

/* ---------- Page setup ---------- */
const GENDER = document.body.dataset.gender;          // "boys" or "girls"
const GENDER_WORD = GENDER === "girls" ? "Girl" : "Boy";

let uid = 0;
const children = [];
const single = { neededBy: "", delivery: "" };
const newChild = () => ({ id: ++uid, name: "", age: "", size: "", shoe: "", marks: {} });

const $ = (sel, root = document) => root.querySelector(sel);
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  kids.flat().forEach(c => c != null && n.append(c));
  return n;
}
const ageById = id => AGE_GROUPS.find(a => a.id === id);

/* ---------- Child cards ---------- */
function renderChildren() {
  const box = $("#children");
  box.innerHTML = "";
  children.forEach((c, i) => box.append(renderChild(c, i)));
  updateTally();
}

function title(c, i) { return GENDER_WORD + " " + (i + 1) + (c.name ? " · " + c.name : ""); }

function renderChild(c, i) {
  const card = el("div", { class: "child" });
  const h3 = el("h3", { text: title(c, i) });
  const head = el("div", { class: "child-head" }, h3);
  if (children.length > 1) {
    head.append(el("button", {
      type: "button", class: "link-btn", text: "Remove",
      onclick: () => { children.splice(children.indexOf(c), 1); renderChildren(); }
    }));
  }
  card.append(head);

  const nameInput = el("input", { type: "text", placeholder: "First name", value: c.name });
  nameInput.addEventListener("input", e => { c.name = e.target.value.trim(); h3.textContent = title(c, i); });
  card.append(el("label", { class: "field" },
    el("span", {}, "Child's name ", el("span", { class: "opt", text: "(optional)" })), nameInput));

  const ageField = el("div", { class: "field" + (c._ageErr ? " invalid" : "") },
    el("span", {}, "Child's age group ", el("span", { class: "req", text: "*" })));
  const ages = el("div", { class: "ages" });
  AGE_GROUPS.forEach(a => {
    ages.append(el("button", {
      type: "button", class: "chip", "aria-pressed": String(c.age === a.id), text: a.label,
      onclick: () => {
        const keep = new Set(CATALOG[GENDER][a.id]);
        Object.keys(c.marks).forEach(k => { if (!keep.has(k)) delete c.marks[k]; });
        c.age = a.id; c._ageErr = false;
        renderChildren();
      }
    }));
  });
  ageField.append(ages, el("div", { class: "err", text: "Please choose an age group." }));
  card.append(ageField);

  const size = el("input", { type: "text", placeholder: "e.g. 3–4 yrs", value: c.size });
  const sizeField = el("label", { class: "field" + (c._sizeErr ? " invalid" : "") },
    el("span", {}, "Clothing size ", el("span", { class: "req", text: "*" })), size,
    el("div", { class: "err", text: "Please add a clothing size." }));
  size.addEventListener("input", e => {
    c.size = e.target.value.trim();
    if (c.size) { c._sizeErr = false; sizeField.classList.remove("invalid"); }
  });
  const shoe = el("input", { type: "text", placeholder: "e.g. 26", value: c.shoe });
  shoe.addEventListener("input", e => c.shoe = e.target.value.trim());
  card.append(el("div", { class: "row2" },
    sizeField,
    el("label", { class: "field" }, el("span", {}, "Shoe size ", el("span", { class: "opt", text: "(optional)" })), shoe)));

  const items = el("div", { class: "items" });
  if (!c.age) {
    items.append(el("div", { class: "pick-age", text: "Choose an age group above to see the checklist." }));
  } else {
    items.append(el("div", { class: "list-title", text: "Assess your current closet — " + ageById(c.age).label }));
    items.append(el("div", { class: "legend" },
      ...STATUSES.map(s => el("span", {}, el("i", { class: "dot", style: "background:var(--" + s.id + ")" }), s.label))));
    const list = el("div");
    CATALOG[GENDER][c.age].forEach(name => {
      const seg = el("div", { class: "seg", role: "group", "aria-label": name });
      STATUSES.forEach(s => {
        seg.append(el("button", {
          type: "button", "data-s": s.id, "aria-pressed": String(c.marks[name] === s.id), text: s.short,
          onclick: () => {
            if (c.marks[name] === s.id) delete c.marks[name]; else c.marks[name] = s.id;
            [...seg.children].forEach(b => b.setAttribute("aria-pressed", String(c.marks[name] === b.dataset.s)));
            updateTally();
          }
        }));
      });
      list.append(el("div", { class: "item" }, el("div", { class: "item-name", text: name }), seg));
    });
    items.append(list);
  }
  card.append(items);
  return card;
}

/* ---------- Tally ---------- */
function counts() {
  const t = { enough: 0, notenough: 0, urgent: 0, none: 0 };
  children.forEach(c => Object.values(c.marks).forEach(s => t[s]++));
  return t;
}
function updateTally() {
  const t = counts();
  const total = t.enough + t.notenough + t.urgent + t.none;
  $("#tally").innerHTML = total
    ? `<b>${t.urgent}</b> urgent · <b>${t.notenough}</b> not enough · <b>${t.enough}</b> enough`
    : "Tap items to build your list";
}

/* ---------- Single-choice chips ---------- */
document.querySelectorAll("[data-single]").forEach(group => {
  const key = group.dataset.single;
  group.addEventListener("click", e => {
    const b = e.target.closest(".chip");
    if (!b) return;
    single[key] = single[key] === b.dataset.v ? "" : b.dataset.v;
    [...group.children].forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === single[key])));
  });
});

/* ---------- WhatsApp message ---------- */
function buildMessage() {
  const L = [];
  L.push(`Hi ${CONFIG.shopName}! 👋 Here's my Kids Closet Check (${GENDER === "girls" ? "Girls" : "Boys"}).`);
  L.push("");
  L.push(`*Parent/Guardian:* ${$("#parentName").value.trim()}`);
  L.push(`*WhatsApp:* ${$("#parentPhone").value.trim()}`);
  const area = $("#parentArea").value.trim();
  if (area) L.push(`*Area:* ${area}`);

  children.forEach((c, i) => {
    L.push("");
    L.push(`*${GENDER_WORD} ${i + 1}${c.name ? ": " + c.name : ""}* (${ageById(c.age).label})`);
    const sizes = [];
    if (c.size) sizes.push(`Clothes: ${c.size}`);
    if (c.shoe) sizes.push(`Shoes: ${c.shoe}`);
    if (sizes.length) L.push(`Sizes – ${sizes.join(" · ")}`);
    let any = false;
    ["urgent", "notenough", "enough"].forEach(sid => {
      const s = STATUSES.find(x => x.id === sid);
      const names = Object.keys(c.marks).filter(k => c.marks[k] === sid);
      if (names.length) { any = true; L.push(`${s.icon} ${s.label}: ${names.join(", ")}`); }
    });
    if (!any) L.push("(No items marked as needed)");
  });

  L.push("");
  const other = $("#other").value.trim();
  if (other) L.push(`*Other items, brands or sizes:* ${other}`);
  if (single.neededBy) L.push(`*Needed:* ${single.neededBy}`);
  if (single.delivery) L.push(`*Pickup/delivery:* ${single.delivery}`);
  const budget = $("#budget").value;
  if (budget) L.push(`*Budget:* ${budget}`);
  if ($("#consent").checked) L.push("✅ Happy to receive size-up reminders & offers");
  return L.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------- Validate + send ---------- */
function validate() {
  let first = null;
  const mark = (id, ok) => {
    const f = document.getElementById(id);
    f.classList.toggle("invalid", !ok);
    if (!ok && !first) first = f;
  };
  mark("f-name", $("#parentName").value.trim().length > 1);
  mark("f-phone", $("#parentPhone").value.replace(/\D/g, "").length >= 9);

  let childMissing = false;
  children.forEach(c => {
    c._ageErr = !c.age;
    c._sizeErr = !c.size;
    if (c._ageErr || c._sizeErr) childMissing = true;
  });
  if (childMissing) {
    renderChildren();
    if (!first) first = document.querySelector(".child .field.invalid");
  }
  const t = counts();
  if (!first && t.enough + t.notenough + t.urgent + t.none === 0 && !$("#other").value.trim()) {
    alert("Please tap at least one item (or tell us what you need in the last box).");
    first = $("#children");
  }
  if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
  return !first;
}

let lastMessage = "";
$("#sendBtn").addEventListener("click", () => {
  if (!validate()) return;
  lastMessage = buildMessage();
  const url = "https://wa.me/" + CONFIG.whatsappNumber.replace(/\D/g, "") + "?text=" + encodeURIComponent(lastMessage);
  $("#openWa").href = url;
  document.body.classList.add("is-done");
  window.scrollTo({ top: 0 });
  window.open(url, "_blank", "noopener");
});
$("#copyMsg").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(lastMessage); $("#copyMsg").textContent = "Copied! Paste it in WhatsApp"; }
  catch (e) { prompt("Copy your list:", lastMessage); }
});
$("#backEdit").addEventListener("click", () => document.body.classList.remove("is-done"));
["parentName", "parentPhone"].forEach(id =>
  document.getElementById(id).addEventListener("input", e => e.target.closest(".field").classList.remove("invalid")));

$("#addChild").addEventListener("click", () => {
  children.push(newChild());
  renderChildren();
  const cards = document.querySelectorAll(".child");
  cards[cards.length - 1].scrollIntoView({ behavior: "smooth", block: "start" });
});

(function init() {
  const sel = $("#budget");
  sel.append(el("option", { value: "", text: "Choose a range" }));
  CONFIG.budgets.forEach(b => sel.append(el("option", { value: CONFIG.currency + " " + b, text: CONFIG.currency + " " + b })));
  $("#footer").textContent = "© " + new Date().getFullYear() + " " + CONFIG.shopName + " · Quality • Comfort • Style • For Every Stage";
  children.push(newChild());
  renderChildren();
})();
