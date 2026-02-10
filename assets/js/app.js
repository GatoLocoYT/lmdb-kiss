// ===== LMDB CONFIG =====
const LMDB = {
    brand: "La Mona de Baviera (LMDB)",
    waNumber: "5493813197174",
    instagramUrl: "https://instagram.com/redlmdb",
    groupUrl: "https://chat.whatsapp.com/E2Vg3B2jo5dHuAzvW5xl1P?mode=gi_t",
    refSignature: "Vendedor: RAMIRO", // <- tu comisión/atribución
    defaultMsgHeader: "Hola LMDB! Quiero hacer un pedido:",
    productsUrl: "data/products.json",
    hideOutOfStock: true // si true: desaparecen; si false: quedan con badge "Sin stock"
};

const CART_KEY = "lmdb_cart_v1";

function waLink(text) {
    return `https://wa.me/${LMDB.waNumber}?text=${encodeURIComponent(text)}`;
}

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? {}; }
    catch { return {}; }
}

function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(sku, qty = 1) {
    const cart = getCart();
    cart[sku] = (cart[sku] ?? 0) + qty;
    if (cart[sku] <= 0) delete cart[sku];
    setCart(cart);
}

function removeFromCart(sku) {
    const cart = getCart();
    delete cart[sku];
    setCart(cart);
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    renderCartPanel(window.__LMDB_PRODUCTS__ ?? []);
}

function cartCount() {
    const cart = getCart();
    return Object.values(cart).reduce((a, b) => a + b, 0);
}

function updateCartBadge() {
    const el = document.querySelector("[data-cart-count]");
    if (!el) return;
    const n = cartCount();
    el.textContent = n > 99 ? "99+" : String(n);
    el.style.display = n ? "inline-flex" : "none";
}

function byId(id) { return document.getElementById(id); }

async function loadProducts() {
    const res = await fetch(LMDB.productsUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar products.json");
    const data = await res.json();
    return data.products ?? [];
}

function productCard(p) {
    const isStock = p.type === "stock";
    const out = isStock && p.inStock === false;
    if (out && LMDB.hideOutOfStock) return "";

    const img = p.img
        ? `<img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy">`
        : `<div class="ph" aria-label="Imagen"></div>`;

    const badge = out ? "Sin stock" : (p.badge ?? (p.type === "seleccionado" ? "Encargo" : "Disponible"));
    const badgeClass = out ? "badge danger" : "badge";

    const price = p.priceLabel
        ? `<span class="price">${escapeHtml(p.priceLabel)}</span>`
        : `<span class="price">Consultar</span>`;

    const buyLabel = p.type === "seleccionado" ? "Consultar" : "Comprar";

    return `
    <article class="card product" data-sku="${escapeAttr(p.sku)}">
      <div class="media">${img}</div>
      <div class="content">
        <div class="row">
          <span class="${badgeClass}">${escapeHtml(badge)}</span>
          <span class="sku">${escapeHtml(p.sku)}</span>
        </div>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="muted">${escapeHtml(p.desc ?? "")}</p>
        <div class="row bottom">
          ${price}
          <div class="actions">
            <button class="btn" data-add="${escapeAttr(p.sku)}" ${out ? "disabled" : ""}>Agregar</button>
            <a class="btn primary" data-buy="${escapeAttr(p.sku)}" href="#" ${out ? 'aria-disabled="true"' : ""}>
              ${buyLabel}
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}


function renderProducts(products, type, category = "all") {
    const wrap = document.querySelector("[data-products]");
    const empty = document.querySelector("[data-empty]");
    if (!wrap) return;

    const filtered = products
        .filter(p => p.type === type)
        .filter(p => category === "all" ? true : p.category === category);

    const html = filtered.map(productCard).filter(Boolean).join("");
    wrap.innerHTML = html || "";

    if (!html) {
        if (empty) empty.style.display = "block";
        wrap.style.display = "none";
    } else {
        if (empty) empty.style.display = "none";
        wrap.style.display = "grid";
    }

    // hook actions
    wrap.querySelectorAll("[data-add]").forEach(btn => {
        btn.addEventListener("click", () => {
            addToCart(btn.getAttribute("data-add"), 1);
            toast("Agregado al carrito ✅");
            renderCartPanel(products);
        });
    });

    wrap.querySelectorAll("[data-buy]").forEach(a => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            const sku = a.getAttribute("data-buy");
            const p = products.find(x => x.sku === sku);
            if (!p) return;
            const msg = buildWhatsAppMessage([{ product: p, qty: 1 }]);
            window.open(waLink(msg), "_blank", "noopener");
        });
    });
}

function formatMoney(value, currency = "ARS") {
    // Formato simple ARS; si querés USD después, lo adaptamos.
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    return `${currency} $${value.toLocaleString("es-AR")}`;
}

function buildWhatsAppMessage(lines, notes = "") {
    let msg = `${LMDB.defaultMsgHeader}\n\n`;

    let totalKnown = 0;
    let hasUnknown = false;

    lines.forEach(({ product, qty }) => {
        const isStock = product.type === "stock";
        const currency = product.currency || "ARS";

        let priceText = "A acordar";
        let subtotalText = "";

        if (isStock) {
            if (typeof product.price === "number") {
                const priceFmt = formatMoney(product.price, currency);
                const subtotal = product.price * qty;
                const subtotalFmt = formatMoney(subtotal, currency);
                priceText = priceFmt ?? "Consultar";
                subtotalText = subtotalFmt ? `\nSubtotal: ${subtotalFmt}` : "";
                totalKnown += subtotal;
            } else {
                priceText = "Consultar";
                hasUnknown = true;
            }
        } else {
            // seleccionados/encargo
            priceText = product.priceLabel || "A acordar";
            hasUnknown = true;
        }

        msg += `Producto: ${product.name}\n`;
        msg += `Cantidad: ${qty}\n`;
        msg += `Precio unitario: ${priceText}${subtotalText}\n\n`;
    });

    // Total (solo lo conocido)
    if (totalKnown > 0) {
        msg += `Total (estimado): ${formatMoney(totalKnown, "ARS")}\n`;
        if (hasUnknown) msg += `*Hay ítems a acordar/consultar.\n`;
        msg += `\n`;
    }

    msg += `Notas:\n${notes || "-"}\n\n`;
    msg += `${LMDB.refSignature}`;
    return msg;
}



function renderCartPanel(products) {
    const panel = document.querySelector("[data-cart-panel]");
    const list = document.querySelector("[data-cart-list]");
    const empty = document.querySelector("[data-cart-empty]");
    if (!panel || !list) return;

    const cart = getCart();
    const entries = Object.entries(cart);
    if (!entries.length) {
        if (empty) empty.style.display = "block";
        list.innerHTML = "";
        return;
    }
    if (empty) empty.style.display = "none";

    const lines = entries.map(([sku, qty]) => {
        const p = products.find(x => x.sku === sku);
        if (!p) return null;
        return { product: p, qty };
    }).filter(Boolean);

    list.innerHTML = lines.map(({ product, qty }) => `
    <div class="cart-item">
      <div>
        <div class="cart-title">${escapeHtml(product.name)}</div>
        <div class="muted">${escapeHtml(product.sku)} · ${product.type === "seleccionado" ? "Encargo" : "Stock"}</div>
      </div>
      <div class="cart-qty">
        <button class="icon" data-dec="${escapeAttr(product.sku)}">−</button>
        <span>${qty}</span>
        <button class="icon" data-inc="${escapeAttr(product.sku)}">+</button>
        <button class="icon danger" title="Quitar" data-del="${escapeAttr(product.sku)}">✕</button>
      </div>
    </div>
  `).join("");

    list.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => { addToCart(b.dataset.inc, 1); renderCartPanel(products); }));
    list.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => { addToCart(b.dataset.dec, -1); renderCartPanel(products); }));
    list.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { removeFromCart(b.dataset.del); renderCartPanel(products); }));

    // send button
    const sendBtn = document.querySelector("[data-cart-send]");
    const notesEl = document.querySelector("[data-cart-notes]");
    if (sendBtn) {
        sendBtn.onclick = () => {
            const notes = notesEl ? notesEl.value.trim() : "";
            const msg = buildWhatsAppMessage(lines, notes);
            window.open(waLink(msg), "_blank", "noopener");
        };
    }
}

function initCommonUI() {
    // footer year
    const y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();

    // social buttons
    document.querySelectorAll("[data-ig]").forEach(a => a.href = LMDB.instagramUrl);
    document.querySelectorAll("[data-group]").forEach(a => a.href = LMDB.groupUrl);
    document.querySelectorAll("[data-wa]").forEach(a => a.href = waLink("Hola LMDB! Quiero consultar sobre los productos que tienen a la venta 🙂\n\n" + LMDB.refSignature));

    // cart open/close
    const open = document.querySelector("[data-cart-open]");
    const close = document.querySelector("[data-cart-close]");
    const panel = document.querySelector("[data-cart-panel]");
    if (open && panel) open.addEventListener("click", () => panel.classList.add("open"));
    if (close && panel) close.addEventListener("click", () => panel.classList.remove("open"));

    // clear cart
    const clr = document.querySelector("[data-cart-clear]");
    if (clr) clr.addEventListener("click", clearCart);

    updateCartBadge();
}

// simple toast
let toastTimer = null;
function toast(text) {
    const el = document.querySelector("[data-toast]");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1600);
}

// category filter
function initCategoryFilter(onChange) {
    const sel = document.querySelector("[data-category]");
    if (!sel) return;
    sel.addEventListener("change", () => onChange(sel.value));
}

// helpers
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function escapeAttr(str) { return escapeHtml(str).replace(/"/g, "&quot;"); }

// ===== PAGE BOOT =====
(async function boot() {
    initCommonUI();

    let products = [];
    try {
        products = await loadProducts();
    } catch (e) {
        console.warn(e);
        products = [];
    }
    window.__LMDB_PRODUCTS__ = products;

    // Render product pages if present
    const pageType = document.body.getAttribute("data-page");
    if (pageType === "stock" || pageType === "seleccionado") {
        const type = pageType === "stock" ? "stock" : "seleccionado";
        renderProducts(products, type, "all");
        initCategoryFilter((cat) => renderProducts(products, type, cat));
    }

    // Cart panel available on all pages
    renderCartPanel(products);

    // Pedido especial (solo seleccionados)
    const specialBtn = document.querySelector("[data-special-send]");
    const specialInput = document.querySelector("[data-special-input]");
    if (specialBtn && specialInput) {
        specialBtn.addEventListener("click", () => {
            const wanted = specialInput.value.trim();
            const msg = `Hola LMDB! Quiero pedir un producto por ENCARGO. \n\nPrecio (a acordar):\n- ${wanted || "(sin especificar)"}\n\n${LMDB.refSignature}`;
            window.open(waLink(msg), "_blank", "noopener");
        });
    }
})();
