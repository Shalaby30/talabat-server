chrome.storage.local.get(["user"], (res) => {
  if (!res.user) {
    console.warn("❌ Not logged in — content disabled");
    return;
  }

  console.log("✅ Logged in as:", res.user.username);
  startTalabatHelper();
});

function startTalabatHelper() {
  console.log("🚀 Talabat Helper started");

// --- 0. Toast function ---

let counterEnabled = JSON.parse(localStorage.getItem("orderCounterEnabled") || "true");

function toggleOrderCounter() {
    counterEnabled = !counterEnabled;
    localStorage.setItem("orderCounterEnabled", JSON.stringify(counterEnabled));
    showToast(counterEnabled ? "✅ تم تشغيل عداد الأوردرات" : "⛔ تم إيقاف عداد الأوردرات");
}

document.addEventListener("keydown", (e) => {
    if (e.altKey && e.code === "Digit9") {
        toggleOrderCounter();
        e.preventDefault();
    }
});


function showToast(message, success = true) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "20px";
    toast.style.background = success ? "rgba(0,128,0,0.85)" : "rgba(200,0,0,0.85)";
    toast.style.color = "#fff";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "14px";
    toast.style.zIndex = 9999;
    toast.style.opacity = "1";
    toast.style.transition = "opacity 0.3s ease";
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

// --- Persistent Order Counter Widget ---
function createPersistentOrderCounter() {
    if (document.getElementById("order-counter-widget")) return;

    const counterBox = document.createElement("div");
    counterBox.id = "order-counter-widget";
    counterBox.style.position = "fixed";
    counterBox.style.bottom = "20px";
    counterBox.style.right = "20px";
    counterBox.style.background = "#000";
    counterBox.style.color = "#fff";
    counterBox.style.padding = "10px 15px";
    counterBox.style.borderRadius = "6px";
    counterBox.style.fontSize = "14px";
    counterBox.style.fontWeight = "bold";
    counterBox.style.zIndex = 99999;
    counterBox.style.cursor = "pointer";
    counterBox.style.userSelect = "none";
    counterBox.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    counterBox.textContent = " Orders: 0";

    // counterBox.addEventListener("click", () => {
    //     localStorage.setItem("orderCounter", "0");
    //     updatePersistentCounter();
    //     showToast(" Counter reset to 0");
    // });

    document.body.appendChild(counterBox);
    updatePersistentCounter();
}

function updatePersistentCounter() {
    const count = parseInt(localStorage.getItem("orderCounter") || "0");
    const counterBox = document.getElementById("order-counter-widget");
    if (counterBox) counterBox.textContent = ` Orders: ${count}`;
}

window.addEventListener("storage", (e) => {
    if (e.key === "orderCounter") updatePersistentCounter();
});

createPersistentOrderCounter();

// --- 1. Clipboard functions ---
// document.addEventListener("keydown", (e) => {
//     if (e.altKey && e.code === "Digit0") {
//         const count = parseInt(localStorage.getItem("orderCounter") || "0");
//         showToast("Order Counter: " + count);
//         e.preventDefault();
//     }
// });
document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "1") {
        e.preventDefault();
        function copyOrderNumber() {
            const orderHeader = document.querySelector('.striped-info .title-wrapper wk-ui-title .header');
            if (!orderHeader) return showToast('❌ Order header not found', false);
            const match = orderHeader.textContent.match(/#\d+/);
            if (!match) return showToast('❌ Order number not found', false);

            navigator.clipboard.writeText(match[0])
                .then(() => showToast(`✅ Copied: ${match[0]}`))
                .catch(() => showToast('❌ Clipboard error', false));
        }
        copyOrderNumber();
    }

    if (e.altKey && e.key === "2") {
        e.preventDefault();
        function copyPhoneNumber() {
            const phoneEl = document.querySelector('.striped-info .external-id-wrapper p.medium');
            if (!phoneEl) return showToast('❌ Phone not found', false);
            navigator.clipboard.writeText(" " + phoneEl.textContent)
                .then(() => showToast(`✅ Copied: ${phoneEl.textContent}`))
                .catch(() => showToast('❌ Clipboard error', false));
        }
        copyPhoneNumber();
    }

    if (e.altKey && e.key === "3") {
        e.preventDefault();
        function copyBranchNote() {
            const branchEl = document.querySelector('wk-ui-order-restaurant-name');
            if (!branchEl) {
                console.warn("❌ عنصر الفرع مش موجود");
            } else {
                const rawBranch = branchEl.innerText.trim().toLowerCase();

                const branchMap = {
                    "كرم الشام, زهراء المعادي - الكويتي": "حضورعميل زهراء معادى",
                    "كرم الشام, شبرا - روض الفرج": "حضورعميل شيرا تك واى",
                    "كرم الشام, السادس من اكتوبر - الحي 1": "حضور عميل اكتوبر",
                    "كرم الشام, حلوان": "حضور عميل حلوان",
                    "كرم الشام, مصر الجديدة - المريلاند": "حضورعميل مصر الجديده",
                    "كرم الشام, عين شمس - الف مسكن": "حضورعميل-الف",
                    "كرم الشام, وسط البلد - طلعت حرب": "حضور عميل طلعت حرب",
                    "كرم الشام, فيصل - اول فيصل": "حضور عميل فيصل",
                    "كرم الشام, المهندسين - الكيت كات": "حضور عميل المهندسين",
                    "كرم الشام, ميامي - سنترال ميامي": "حضور عميل ميامي",
                    "كرم الشام, شارع الجمهوريه": "حضور عميل المنصوره",
                    "كرم الشام, العجمي - البيطاش غرب": "حضور عميل فرع العجمى",
                    "كرم الشام, العاشر من رمضان - الحي 11": "حضور عميل العاشر",
                    "كرم الشام, سيدي جابر": "طلبات اسكندرية",
                    "كرم الشام, المندرة": "حضور عميل المنتزة",
                    "كرم الشام, الأزاريطة": "حضور عميل سوتر",


                };
                const key = Object.keys(branchMap).find(k => rawBranch.includes(k));

                if (!key) {
                    console.warn(`❌ Branch note not found for branch: ${rawBranch}`);
                } else {
                    const text = branchMap[key];
                    navigator.clipboard.writeText(text)
                        .then(() => showToast(`✅ Copied: ${text}`))
                        .catch(() => showToast('❌ Clipboard error', false));
                }
            }
        }
        copyBranchNote();
    }

    if (e.altKey && e.key === "4") {
        e.preventDefault();
        function copyPayment() {
            let payment = "";
            document.querySelectorAll("wk-ui-caption .caption").forEach(span => {
                const t = span.textContent.trim();
                if (/CASH/i.test(t)) payment = "كاش";
                else if (t.includes("الدفع عبر")) payment = "فيزا";
            });
            if (!payment) return showToast("❌ Payment not found", false);

            const phoneEl = document.querySelector('.striped-info .external-id-wrapper p.medium');
            if (!phoneEl) return showToast("❌ Phone not found", false);

            let discountText = "";
            const discountHeader = Array.from(document.querySelectorAll("mat-expansion-panel-header"))
                .find(h => {
                    const label = h.querySelector("label")?.textContent.trim().toLowerCase();
                    return label === "discount" || label === "lifecycle";
                });

            if (discountHeader) {
                const p = discountHeader.querySelector("p.medium");
                if (p) discountText = ` + خصم ${p.textContent.replace(/[^\d.]/g, "")} ج`;
            }

            const finalText = payment + discountText + " // " + phoneEl.textContent;

            navigator.clipboard.writeText(finalText)
                .then(() => showToast(`✅ Copied: ${finalText}`))
                .catch(() => showToast("❌ Clipboard error", false));
        }
        copyPayment();
    }
});


// --- 1. Coloring headers (Discount / Lifecycle) ---
function ch_addStyleToHeaders() {
    const headers = document.querySelectorAll("mat-expansion-panel-header");
    headers.forEach(header => {
        const label = header.querySelector("label");
        if (!label) return;
        const text = label.textContent.trim().toLowerCase();
        if (text === "discount" || text === "lifecycle") {
            header.setAttribute("style", "background-color:red; border-radius:6px;");
        }
    });
}
ch_addStyleToHeaders();
const ch_observer = new MutationObserver(ch_addStyleToHeaders);
ch_observer.observe(document.body, { childList: true, subtree: true });


function ot_getItemDiscount() {


    const labelEl = Array.from(
        document.querySelectorAll('mat-expansion-panel-header label')
    ).find(label =>
        /item\s*discounts?/i.test(label.innerText)
    );

    if (!labelEl) {
        return 0;
    }


    const discountEl = labelEl
        .closest('mat-expansion-panel-header')
        ?.querySelector('wk-order-currency p');

    if (!discountEl) {

        return 0;
    }

    const discountText = discountEl.innerText;
    const discountValue = ot_parsePrice(discountText);


    return discountValue;
}


function ot_parsePrice(text) {
    if (!text) return 0;
    let normalized = text.replace(/[^\d.,]/g, "").trim();

    const parts = normalized.split(".");
    if (parts.length > 2) {
        normalized = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
    }


    const commaParts = normalized.split(",");
    if (commaParts.length > 2) {
        normalized = commaParts.slice(0, -1).join("") + "." + commaParts[commaParts.length - 1];
    }


    normalized = normalized.replace(/,/g, "");

    return parseFloat(normalized) || 0;
}

function ot_formatPrice(num) {
    return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).replace(/,/g, ".");
}

function ot_calculateOrderTotal(modal) {


    const itemsContainer = modal.querySelector("#order-items");
    if (!itemsContainer) {

        return;
    }

    const items = itemsContainer.querySelectorAll(".item");
    let total = 0;

    items.forEach((item, index) => {


        // ===== Parent Quantity =====
        let parentQty = 1;
        const qtyEl = item.querySelector(".item-amount .subheader");
        if (qtyEl) {
            const match = qtyEl.textContent.match(/(\d+)/);
            if (match) parentQty = parseInt(match[1]);
        }


        // ===== Parent Price =====
        let parentPrice = 0;
        const priceEl = item.querySelector(".item-price p");
        if (priceEl) {
            parentPrice = ot_parsePrice(priceEl.textContent);
        }


        total += parentPrice;


        // ===== Modifiers =====
        const modifiers = item.querySelectorAll(".item-modifier");
        modifiers.forEach((mod, mIndex) => {
            let modPrice = 0;
            const modPriceEl = mod.querySelector(".modifier-price p");
            if (modPriceEl) {
                modPrice = ot_parsePrice(modPriceEl.textContent);
            }

            let modQty = 1;
            const modQtyEl = mod.querySelector(".modifier-amount p");
            if (modQtyEl) {
                const m = modQtyEl.textContent.match(/(\d+)/);
                if (m) modQty = parseInt(m[1]);
            }

            const modTotal = modPrice * parentQty * modQty;
            total += modTotal;
        });
    });

    // ===== Discount =====
    const discount = ot_getItemDiscount();

    total -= discount;
    if (total < 0) total = 0;


    // ===== UI Render =====
    let totalBox = itemsContainer.querySelector(".my-order-total");
    if (!totalBox) {
        totalBox = document.createElement("div");
        totalBox.className = "my-order-total";
        totalBox.style.cssText = `
            margin: 10px 0;
            padding: 8px;
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            color: black;
            text-align: center;
        `;
    }

    totalBox.textContent = `إجمالي الأوردر : ${ot_formatPrice(total)} ج.م`;

    const feeElement = itemsContainer.querySelector(".fee");
    if (feeElement && feeElement.parentNode) {
        feeElement.parentNode.insertBefore(totalBox, feeElement);
    } else {
        itemsContainer.appendChild(totalBox);
    }
}

const ot_bodyCheck = setInterval(() => {
    const target = document.querySelector(".body");
    if (target) {
        clearInterval(ot_bodyCheck);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches("wk-order-active-modal")) {
                        ot_calculateOrderTotal(node);
                    }
                });
            });
        });

        observer.observe(target, { childList: true, subtree: true });
    }
}, 1000);

// --- 3. Order Timers + Counter ---
(function () {
    const TIMER_KEY = "orderTimers";
    const COUNTER_KEY = "orderCounter";


    function waitForAcceptedOrders() {
        const accepted = document.querySelector("#accepted-orders");
        if (!accepted) return false;
        return true;
    }

    const acceptedOrdersInterval = setInterval(() => {
        if (waitForAcceptedOrders()) {
            clearInterval(acceptedOrdersInterval);
        }
    }, 500);

    function loadTimers() {
        return JSON.parse(localStorage.getItem(TIMER_KEY) || "{}");
    }

    function saveTimers(timers) {
        localStorage.setItem(TIMER_KEY, JSON.stringify(timers));
    }

    function incrementCounter() {
        if (!JSON.parse(localStorage.getItem("orderCounterEnabled") || "true")) return;

        let count = parseInt(localStorage.getItem(COUNTER_KEY) || "0");
        count++;
        localStorage.setItem(COUNTER_KEY, count);
        updatePersistentCounter?.();
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }


    function countRemainingOrders() {
        return [...document.querySelectorAll(".order-timer-btn")]
            .filter(btn => btn.textContent.includes("Start"))
            .length;
    }

    function updateRemainingIndicator() {
        const swimlane = document.querySelector("#accepted-orders  wk-order-swimlanes-title");
        if (!swimlane) return;


        swimlane.style.display = "flex";
        swimlane.style.alignItems = "center";
        swimlane.style.gap = "12px";

        let indicator = swimlane.querySelector(".remaining-orders-indicator");

        if (!indicator) {
            indicator = document.createElement("div");
            indicator.className = "remaining-orders-indicator";
            indicator.style.color = "black";
            indicator.style.fontSize = "22px";
            indicator.style.fontWeight = "400";
            indicator.style.lineHeight = "45px";
            indicator.style.fontStyle = "normal";
            indicator.style.marginInlineStart = "auto";
            indicator.style.whiteSpace = "nowrap";

            swimlane.appendChild(indicator);
        }

        indicator.textContent = `Remaining: ${countRemainingOrders()}`;
    }


    function attachButtons() {
        const timers = loadTimers();

        document.querySelectorAll(".header-medium.bold").forEach(orderEl => {
            const orderId = orderEl.textContent.trim();
            if (orderEl.parentElement.querySelector(".order-timer-btn")) return;

            const wrapper = document.createElement("span");
            wrapper.style.marginLeft = "10px";

            const btn = document.createElement("button");
            btn.textContent = "🔔 Start";
            btn.className = "order-timer-btn";
            btn.style.cursor = "pointer";
            btn.style.border = "none";
            btn.style.background = "transparent";
            btn.style.fontSize = "16px";

            wrapper.appendChild(btn);
            orderEl.appendChild(wrapper);

            if (timers[orderId]) {
                updateCountdown(btn, orderId, timers);
            }

            btn.addEventListener("click", () => {
                if (!timers[orderId]) {
                    timers[orderId] = Math.floor(Date.now() / 1000) + 15 * 60;
                    saveTimers(timers);
                    updateCountdown(btn, orderId, timers);
                    incrementCounter();
                    updateRemainingIndicator();
                }
            });
        });

        updateRemainingIndicator();
    }

    function updateCountdown(btn, orderId, timers) {
        function tick() {
            const now = Math.floor(Date.now() / 1000);
            const remaining = timers[orderId] - now;

            if (remaining > 0) {
                btn.textContent = "⏳ " + formatTime(remaining);
                requestAnimationFrame(tick);
            } else {
                btn.textContent = "⏰ Done!";
                updateRemainingIndicator();
            }
        }
        tick();
    }


    setInterval(attachButtons, 2000);
    setInterval(updateRemainingIndicator, 1000);

})();
}