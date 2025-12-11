/**
 * 檔案：script.js
 * 版本：2025-12-08 Final (iOS Image Fix + Drag&Drop + Layout)
 */

let PRICE_LIST = {};
let BASE_OFFERING_LOGIC = {};
let ANHS_LOGIC = {};

let pendingMealItems = []; 

// 程式啟動
async function initData() {
    try {
        console.log("正在載入外部資料...");
        
        const [priceRes, logicRes, anhsRes] = await Promise.all([
            fetch('./price_list.json'),
            fetch('./base_offering_logic.json'),
            fetch('./anhs_additional_logic.json')
        ]);

        if (!priceRes.ok) throw new Error("無法讀取 price_list.json");
        if (!logicRes.ok) throw new Error("無法讀取 base_offering_logic.json");
        if (!anhsRes.ok) throw new Error("無法讀取 anhs_additional_logic.json");

        const priceJson = await priceRes.json();
        const logicJson = await logicRes.json();
        const anhsJson = await anhsRes.json();

        PRICE_LIST = priceJson.data;
        BASE_OFFERING_LOGIC = logicJson.data;
        ANHS_LOGIC = anhsJson.data;

        console.log("資料載入成功！開始初始化介面...");

        initDropdownsFromJSON(); 
        initRitualSections(); 
        initRowDragAndDrop(); // 啟用拖曳

    } catch (error) {
        console.error("載入失敗:", error);
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    setPrintDate(); 
    initData();     
    
    const caseNameInput = document.getElementById('caseName');
    if(caseNameInput) {
        caseNameInput.addEventListener('input', (e) => {
            document.getElementById('header-case-name').innerText = e.target.value.trim() || '無名氏';
            validateInput(e.target);
        });
    }

    document.querySelectorAll('.required-input').forEach(el => {
        el.addEventListener('input', () => validateInput(el));
        el.addEventListener('change', () => validateInput(el));
        validateInput(el); 
    });

    document.body.addEventListener('change', function(e) {
        if (e.target.matches('input, select')) {
            if (e.target.classList.contains('row-item')) updateRowUnitPrice(e.target);
            
            if (e.target.classList.contains('date-input-hidden')) {
                const wrapper = e.target.closest('.date-cell-wrapper') || e.target.closest('.date-display-wrapper');
                if(wrapper) {
                     const textSpan = wrapper.querySelector('.date-display-text');
                     if(textSpan) textSpan.innerText = formatDisplayDate(e.target.value);
                }
                if (e.target.classList.contains('fruit-date-input')) {
                     validateFruitDates();
                }
            }
            if (e.target.id === 'funeralDate') validateFruitDates();
            
            calculateAllTotals();
            mergeTableCells(document.getElementById('meals-body')); // 變更時重算合併
        }
    });

    setupDragDrop();
});

// ... [省略不變的 Helper functions: initDropdownsFromJSON, initRitualSections, updateSpecs, validateInput, checkRequiredFields] ...
function initDropdownsFromJSON() {
    const religionSelect = document.getElementById('religion');
    if (!BASE_OFFERING_LOGIC["頭七"]) return;
    const sampleRitual = BASE_OFFERING_LOGIC["頭七"];
    religionSelect.innerHTML = '<option value="">請選擇</option>';
    Object.keys(sampleRitual).forEach(rel => {
        if(!rel.startsWith('_')) {
            const opt = document.createElement('option');
            opt.value = rel;
            opt.innerText = rel;
            religionSelect.appendChild(opt);
        }
    });
}
function initRitualSections() {
    const container = document.getElementById('ritual-sections-container');
    if(!container) return;
    container.innerHTML = ''; 
    ['head7', 'ritual', 'funeral'].forEach(key => {
        createRitualDOM(key);
        addGeneralRow(`${key}-body`);
    });
}
function updateSpecs() {
    const religion = document.getElementById('religion').value;
    const specSelect = document.getElementById('specification');
    specSelect.innerHTML = ''; 
    if (religion && BASE_OFFERING_LOGIC["頭七"] && BASE_OFFERING_LOGIC["頭七"][religion]) {
        const specs = Object.keys(BASE_OFFERING_LOGIC["頭七"][religion]);
        specs.forEach(spec => {
            const opt = document.createElement('option');
            opt.value = spec;
            opt.innerText = spec;
            specSelect.appendChild(opt);
        });
    } else {
        specSelect.innerHTML = '<option value="">請先選擇宗教</option>';
    }
}
function validateInput(el) {
    if (!el.value) el.classList.add('invalid-highlight');
    else el.classList.remove('invalid-highlight');
}
function checkRequiredFields() {
    const requiredIds = ['caseName', 'receiveDate', 'funeralDate'];
    let isValid = true;
    requiredIds.forEach(id => {
        const el = document.getElementById(id);
        if(!el.value) {
            el.classList.add('invalid-highlight');
            isValid = false;
        } else {
            el.classList.remove('invalid-highlight');
        }
    });
    return isValid;
}

// 帶入預設值
function applyDefaults() {
    if(!checkRequiredFields()) {
        alert("請填寫所有紅框閃爍的必填欄位。");
        return;
    }

    const inputs = {
        name: document.getElementById('caseName').value,
        religion: document.getElementById('religion').value,
        spec: document.getElementById('specification').value,
        diet: document.getElementById('dietType').value,
        hasAnShenZhu: document.getElementById('hasAnShenZhu').value === '有',
        location: document.getElementById('location').value,
        receiveDate: document.getElementById('receiveDate').value,
        funeralDate: document.getElementById('funeralDate').value
    };

    if(!inputs.religion || !inputs.spec) {
        alert("請選擇宗教與規格");
        return;
    }

    updateSummaryReport(inputs);
    pendingMealItems = []; 
    
    document.getElementById('fruit-body').innerHTML = '';
    document.getElementById('meals-body').innerHTML = '';
    const container = document.getElementById('ritual-sections-container');
    container.innerHTML = ''; 
    
    ['head7', 'ritual', 'funeral'].forEach(sec => {
        createRitualDOM(sec);
        generateRitualSection(sec, inputs);
    });
    
    generateFruitSection(inputs);
    generateMealsSection(inputs);

    calculateAllTotals();
}

// ... [generateRitualSection 保持不變] ...
function generateRitualSection(sectionKey, inputs) {
    const tbody = document.getElementById(`${sectionKey}-body`);
    tbody.innerHTML = ''; 
    let dateVal = '', pickupDate = '';
    if(sectionKey === 'head7') {
        dateVal = addDays(inputs.receiveDate, 6);
        pickupDate = addDays(dateVal, -1);
    } else if (sectionKey === 'ritual') {
        dateVal = addDays(inputs.funeralDate, -1);
        pickupDate = dateVal; 
    } else if (sectionKey === 'funeral') {
        dateVal = inputs.funeralDate;
        pickupDate = addDays(dateVal, -1);
    }
    const dateInp = document.getElementById(`${sectionKey}-date-input`);
    if(dateInp) { dateInp.value = dateVal; syncDate(sectionKey); }
    const pickInp = document.getElementById(`${sectionKey}-pickup-date`);
    if(pickInp) { pickInp.value = pickupDate; syncPickupDisplay(sectionKey); }
    const ritualNameMap = { 'head7': '頭七', 'ritual': '法事', 'funeral': '出殯' };
    const rName = ritualNameMap[sectionKey];
    let items = {};
    let lookupSpec = inputs.spec;
    if (sectionKey === 'funeral' && inputs.location === '自宅') {
        const homeSpecKey = lookupSpec + "(自宅)";
        if (BASE_OFFERING_LOGIC[rName]?.[inputs.religion]?.[homeSpecKey]) {
            lookupSpec = homeSpecKey; 
        }
    }
    if (BASE_OFFERING_LOGIC[rName]?.[inputs.religion]?.[lookupSpec]?.[inputs.diet]) {
        items = { ...BASE_OFFERING_LOGIC[rName][inputs.religion][lookupSpec][inputs.diet] };
    }
    if (sectionKey === 'funeral' && inputs.hasAnShenZhu) {
        const addOns = ANHS_LOGIC[inputs.diet];
        if(addOns) {
            for (const [key, qty] of Object.entries(addOns)) {
                items[key] = (items[key] || 0) + qty;
            }
        }
    }
    for (const [item, qty] of Object.entries(items)) {
        if (item.includes("五菜一飯")) {
            pendingMealItems.push({ date: pickupDate, ritual: rName, item: item, qty: qty });
        } else {
            addGeneralRow(tbody.id, item, qty);
        }
    }
    if (tbody.children.length === 0) addGeneralRow(tbody.id);
}


function generateMealsSection(inputs) {
    const tbody = document.getElementById('meals-body');
    tbody.innerHTML = ''; 

    const MEAL_SCHEME = 'B'; 

    let mealItemSpec = "";
    if (MEAL_SCHEME === 'A') {
        mealItemSpec = "五菜一飯(素)";
    } else {
        mealItemSpec = inputs.diet === '素' ? "五菜一飯(素)" : "五菜一飯(葷)";
    }
    
    let item1_Qty = 0; 
    let item2_Qty = 0; 

    if(inputs.location === '自宅') {
        if(inputs.diet === '素') { item1_Qty = 0; item2_Qty = 0; } 
        else { item1_Qty = 0; item2_Qty = 0; }
    } else {
        if(inputs.diet === '素') { item1_Qty = 0; item2_Qty = 0; } 
        else { item1_Qty = 0; item2_Qty = 0; }
    }

    addMealRowData(inputs.receiveDate, "豎靈", "白飯、鹹蛋", item1_Qty);
    addMealRowData(inputs.receiveDate, "豎靈", mealItemSpec, item2_Qty);

    pendingMealItems.forEach(p => {
        let currentPickup = p.date;
        const ritualMap = { '頭七': 'head7', '法事': 'ritual', '出殯': 'funeral' };
        if(ritualMap[p.ritual]) {
             const el = document.getElementById(`${ritualMap[p.ritual]}-pickup-date`);
             if(el && el.value) currentPickup = el.value;
        }
        addMealRowData(currentPickup || p.date, p.ritual, p.item, p.qty);
    });

    mergeTableCells(tbody);
}

function generateFruitSection(inputs) {
    const tbody = document.getElementById('fruit-body');
    tbody.innerHTML = ''; 
    const d0 = addDays(inputs.receiveDate, 0); 
    addFruitRow(d0, 0);
    const d1 = addDays(inputs.receiveDate, 2);
    const d2 = addDays(inputs.receiveDate, 5);
    addFruitRow(d1, 1);
    addFruitRow(d2, 1);
    validateFruitDates();
}

function addFruitRow(targetDate = null, defaultQty = 1) {
    const tbody = document.getElementById('fruit-body');
    const item = "綜合果(果品)"; 
    const info = getPriceInfo(item);
    let dateValue = targetDate;
    if (!dateValue) {
        const lastRow = tbody.lastElementChild;
        if (lastRow) {
            const lastDateInput = lastRow.querySelector('.fruit-date-input');
            if (lastDateInput && lastDateInput.value) {
                dateValue = addDays(lastDateInput.value, 4);
            }
        }
        if (!dateValue && tbody.children.length === 0) dateValue = ''; 
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="td-date-cell">
            <div class="date-cell-wrapper">
                <span class="date-display-text">${formatDisplayDate(dateValue)}</span>
                <i class="fa-regular fa-calendar-days date-icon"></i>
                <input type="date" class="date-input-hidden no-print row-date-input fruit-date-input" value="${dateValue}">
            </div>
        </td>
        <td style="font-weight: bold; padding-top: 10px;">
            ${item}
            <input type="hidden" class="row-item" value="${item}">
        </td>
        <td><input type="number" class="row-qty" value="${defaultQty}" min="0"></td>
        <td class="row-unit mobile-hide">${info['單位']}</td>
        <td class="row-price mobile-hide" data-price="${info['單價']}">${info['單價']}</td>
        <td class="row-total mobile-hide">0</td>
        <td class="no-print"><button class="btn-icon" onclick="removeRow(this)">✖︎</button></td>
    `;
    tbody.appendChild(tr);
    calculateAllTotals();
    validateFruitDates();
}

// ... [validateFruitDates, createRitualDOM, mergeTableCells 保持不變] ...
function validateFruitDates() {
    const funeralInput = document.getElementById('funeralDate');
    if(!funeralInput || !funeralInput.value) return;
    const funeralDate = new Date(funeralInput.value);
    const warningThreshold = new Date(funeralDate);
    warningThreshold.setDate(funeralDate.getDate() - 2);
    warningThreshold.setHours(23, 59, 59, 999); 
    document.querySelectorAll('.fruit-date-input').forEach(input => {
        if(!input.value) {
             input.closest('tr').classList.remove('row-warning');
             return;
        }
        const checkDate = new Date(input.value);
        checkDate.setHours(0, 0, 0, 0); 
        const tr = input.closest('tr');
        if(checkDate > warningThreshold) {
            tr.classList.add('row-warning');
            input.title = "";
        } else {
            tr.classList.remove('row-warning');
            input.title = "";
        }
    });
}
function createRitualDOM(key) {
    const container = document.getElementById('ritual-sections-container');
    const titles = { 'head7': '二、頭七', 'ritual': '三、法事', 'funeral': '四、出殯' };
    const title = titles[key] || '自訂儀式';
    const section = document.createElement('section');
    section.className = 'section-container';
    section.id = `section-${key}`;
    section.setAttribute('draggable', 'true');
    section.innerHTML = `
      <div class="section-header-row">
        <div class="header-left">
            <h2>${title}</h2>
            <div class="date-display-wrapper">
                <span class="date-display-text" id="${key}-date-text">--/--</span>
                <i class="fa-regular fa-calendar-days date-icon"></i>
                <input type="date" class="date-input-hidden no-print" id="${key}-date-input" onchange="syncDate('${key}')" />
            </div>
        </div>
        <div class="pickup-info-center-align">
            取貨時間：
            <div class="date-display-wrapper">
                 <span id="${key}-pickup-display" class="date-display-text">--/--</span>
                 <i class="fa-regular fa-calendar-days date-icon"></i>
                 <input type="date" class="date-input-hidden no-print" id="${key}-pickup-date" onchange="syncPickupDisplay('${key}')" />
            </div>
            <input type="time" class="clean-time-input" id="${key}-pickup-time" value="07:00" />
        </div>
        <div class="header-right no-print">
          <button class="btn-icon delete-section" onclick="clearSectionUI('section-${key}', true)" title="刪除整個儀式">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="jp-table">
            <thead>
            <tr>
                <th class="col-item">品項</th>
                <th class="col-qty">數量</th>
                <th class="col-unit mobile-hide">單位</th>
                <th class="col-price mobile-hide">單價</th>
                <th class="col-total mobile-hide">總價</th>
                <th class="col-op no-print">操作</th>
            </tr>
            </thead>
            <tbody id="${key}-body"></tbody>
        </table>
      </div>
      <div class="section-footer">
        <div class="footer-left no-print">
            <button class="btn-add" onclick="addGeneralRow('${key}-body')">✚ 新增品項</button>
        </div>
        <div class="footer-right">
            <span class="total-label">合計：</span>
            <span class="total-value" id="${key}-total">0</span>
        </div>
      </div>
    `;
    container.appendChild(section);
}
function mergeTableCells(tbody) {
    const rows = tbody.querySelectorAll('tr');
    if (rows.length === 0) return;
    let lastDate = null;
    let lastRitual = null;
    let dateRowSpan = 1;
    let ritualRowSpan = 1;
    // 重置所有 rowspan
    for (let i = 0; i < rows.length; i++) {
         rows[i].cells[0].style.display = '';
         rows[i].cells[0].rowSpan = 1;
         rows[i].cells[1].style.display = '';
         rows[i].cells[1].rowSpan = 1;
    }
    // 重新計算
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const dateInput = row.querySelector('.date-input-hidden');
        const ritualInput = row.cells[1].querySelector('input');
        const currentDate = dateInput ? dateInput.value : '';
        const currentRitual = ritualInput ? ritualInput.value : '';
        if (i > 0 && currentDate === lastDate && currentDate !== '') {
            dateRowSpan++;
            row.cells[0].style.display = 'none';
            rows[i - dateRowSpan + 1].cells[0].rowSpan = dateRowSpan;
        } else {
            lastDate = currentDate;
            dateRowSpan = 1;
        }
        if (i > 0 && currentRitual === lastRitual && currentRitual !== '' && currentDate === lastDate) {
            ritualRowSpan++;
            row.cells[1].style.display = 'none';
            rows[i - ritualRowSpan + 1].cells[1].rowSpan = ritualRowSpan;
        } else {
            lastRitual = currentRitual;
            ritualRowSpan = 1;
        }
    }
}

// [核心修正] addMealRowData: 移除數量判斷，即使是 0 也產生 (為了解決拖曳與顯示問題)
function addMealRowData(date, ritual, item, qty) {
    // 移除 if (qty <= 0) return; 
    
    const tbody = document.getElementById('meals-body');
    const info = getPriceInfo(item);
    const tr = document.createElement('tr');
    tr.className = 'draggable-row';
    tr.setAttribute('draggable', 'true');
    
    tr.innerHTML = `
        <td class="td-date-cell">
            <div class="date-cell-wrapper">
                <span class="date-display-text">${formatDisplayDate(date)}</span>
                <i class="fa-regular fa-calendar-days date-icon"></i>
                <input type="date" class="date-input-hidden no-print" value="${date}">
            </div>
        </td>
        <td><input type="text" value="${ritual}" style="width:100%;"></td>
        <td><select class="row-item" onchange="updateRowUnitPrice(this)">${createOptions(item)}</select></td>
        <td class="row-price mobile-hide" data-price="${info['單價']}">${info['單價']}</td>
        <td class="row-total mobile-hide">0</td>
        <td><input type="number" class="row-qty" value="${qty}" min="0"></td>
        <td class="no-print"><button class="btn-icon" onclick="removeRow(this)">✖︎</button></td>
    `;
    tbody.appendChild(tr);
    calculateAllTotals();
}

function addGeneralRow(tbodyId, item='', qty='') {
    const tbody = document.getElementById(tbodyId);
    const info = getPriceInfo(item);
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><select class="row-item" onchange="updateRowUnitPrice(this)">${createOptions(item)}</select></td>
        <td><input type="number" class="row-qty" value="${qty}" min="0"></td>
        <td class="row-unit mobile-hide">${info['單位']}</td>
        <td class="row-price mobile-hide" data-price="${info['單價']}">${info['單價']}</td>
        <td class="row-total mobile-hide">0</td>
        <td class="no-print"><button class="btn-icon" onclick="removeRow(this)">✖︎</button></td>
    `;
    tbody.appendChild(tr);
    calculateAllTotals();
}

// ... [addDays, formatDisplayDate, getPriceInfo, createOptions, syncDate, syncPickupDisplay, updateMealsDates, updateRowUnitPrice, calculateAllTotals, removeRow, clearSectionUI, clearSection, addNewRitualSection, resetForm, addMealRow, updateSummaryReport, setPrintDate, setupDragDrop, getDragAfterElement 保持不變] ...
function addDays(dateStr, days) {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}
function formatDisplayDate(dateStr) {
    if(!dateStr) return '--/--';
    const d = new Date(dateStr);
    return `${d.getMonth()+1}/${d.getDate()}`;
}
function getPriceInfo(name) { return PRICE_LIST[name] || {"單位":"", "單價":0}; }
function createOptions(selected) {
    let html = '<option value="">請選擇</option>';
    for(const k in PRICE_LIST) {
        html += `<option value="${k}" ${k===selected?'selected':''}>${k}</option>`;
    }
    return html;
}
function syncDate(section) {
    const input = document.getElementById(`${section}-date-input`);
    const text = document.getElementById(`${section}-date-text`);
    if(input && text) text.innerText = input.value ? formatDisplayDate(input.value) : '--/--';
}
function syncPickupDisplay(section) {
    const input = document.getElementById(`${section}-pickup-date`);
    const text = document.getElementById(`${section}-pickup-display`);
    if(input && text) text.innerText = input.value ? formatDisplayDate(input.value) : '--/--';
    updateMealsDates();
}
function updateMealsDates() {
    const dateMap = {
        '頭七': document.getElementById('head7-pickup-date')?.value,
        '法事': document.getElementById('ritual-pickup-date')?.value,
        '出殯': document.getElementById('funeral-pickup-date')?.value
    };
    const rows = document.querySelectorAll('#meals-body tr');
    rows.forEach(tr => {
        const ritualInput = tr.querySelector('td:nth-child(2) input'); 
        const dateInput = tr.querySelector('.date-input-hidden'); 
        const dateText = tr.querySelector('.date-display-text');
        
        if(ritualInput && dateInput && dateMap[ritualInput.value]) {
            dateInput.value = dateMap[ritualInput.value];
            if(dateText) dateText.innerText = formatDisplayDate(dateInput.value);
        }
    });
}
function updateRowUnitPrice(el) {
    const tr = el.closest('tr');
    const info = getPriceInfo(el.value);
    const unitEl = tr.querySelector('.row-unit');
    if(unitEl) unitEl.innerText = info['單位'];
    const pEl = tr.querySelector('.row-price');
    if(pEl) {
        pEl.innerText = info['單價'];
        pEl.dataset.price = info['單價'];
    }
    calculateAllTotals();
}
function calculateAllTotals() {
    let grandTotal = 0;
    document.querySelectorAll('tbody').forEach(tbody => {
        if(tbody.id === 'price-list-table') return;
        let sectionTotal = 0;
        tbody.querySelectorAll('tr').forEach(tr => {
            const qtyInput = tr.querySelector('.row-qty');
            const priceCell = tr.querySelector('.row-price');
            const totalCell = tr.querySelector('.row-total');
            const qty = parseInt(qtyInput?.value) || 0;
            const price = parseInt(priceCell?.dataset.price || priceCell?.innerText) || 0;
            const total = qty * price;
            if(totalCell) totalCell.innerText = total.toLocaleString();
            sectionTotal += total;
        });
        const footerTotal = tbody.closest('.section-container')?.querySelector('.total-value');
        if(footerTotal) footerTotal.innerText = sectionTotal.toLocaleString();
        grandTotal += sectionTotal;
    });
    document.getElementById('grand-total').innerText = grandTotal.toLocaleString();
}
function removeRow(btn) { 
    btn.closest('tr').remove(); 
    calculateAllTotals(); 
}
function clearSectionUI(id, isElement=false) {
    if(confirm("確定刪除？")) {
        if(isElement) document.getElementById(id).remove();
        else document.getElementById(id + '-body').innerHTML = '';
        calculateAllTotals();
    }
}
function clearSection(id) {
    if(confirm("確定清空此區塊？")) {
        document.getElementById(id).innerHTML = '';
        calculateAllTotals();
    }
}
function addNewRitualSection() {
    const id = 'custom-' + Date.now();
    createRitualDOM(id);
    addGeneralRow(`${id}-body`);
}
function resetForm() {
    if(confirm("確定要初始化嗎？所有資料將被清空。")) {
        location.reload(); 
    }
}
function addMealRow() {
    const d = document.getElementById('receiveDate').value;
    addMealRowData(d, "自訂", "", 1);
}
function updateSummaryReport(inputs) {
    document.getElementById('case-summary-report').innerText = 
        `案件：${inputs.name} | 宗教：${inputs.religion} | 規格：${inputs.spec} | 葷素：${inputs.diet} | 安神主：${inputs.hasAnShenZhu?'有':'無'} | 地點：${inputs.location}`;
}
function setPrintDate() {
    const now = new Date();
    document.getElementById('print-date').innerText = 
        `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}
function setupDragDrop() {
    const container = document.getElementById('ritual-sections-container');
    container.addEventListener('dragstart', (e) => {
        const draggable = e.target.closest('.section-container');
        if(!draggable) return;
        draggable.classList.add('dragging');
    });
    container.addEventListener('dragend', (e) => {
        const draggable = e.target.closest('.section-container');
        if(!draggable) return;
        draggable.classList.remove('dragging');
    });
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });
}
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.section-container:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 傳真功能
function printFax() {
    document.body.classList.add('fax-mode');
    window.print();
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('fax-mode');
    }, { once: true });
    setTimeout(() => {
        document.body.classList.remove('fax-mode');
    }, 2000);
}

function downloadPDF() { window.print(); }

// [核心修正] iOS 圖片生成優化：自動降解析度 + Modal 顯示
function downloadImage() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const panel = document.getElementById('control-panel-section');
    const area = document.getElementById('capture-area');
    const footer = document.querySelector('.footer-controls'); 
    
    const originalPanelDisplay = panel.style.display;
    const originalFooterDisplay = footer ? footer.style.display : '';
    const originalWidth = area.style.width;
    const originalMargin = area.style.margin;
    const originalMaxWidth = area.style.maxWidth;
    const originalTransform = area.style.transform;
    
    panel.style.display = 'none';
    if(footer) footer.style.display = 'none';
    area.style.width = '1100px';
    area.style.maxWidth = 'none'; 
    area.style.margin = '0'; 
    area.style.transform = 'none'; 
    window.scrollTo(0, 0);

    const scaleValue = isIOS ? 1 : 2; // iOS 改為 1

    const options = {
        scale: scaleValue, 
        useCORS: true, 
        width: 1100, 
        windowWidth: 1280, 
        x: 0, 
        y: 0, 
        scrollX: 0, 
        scrollY: 0,
        backgroundColor: "#ffffff",
        logging: false
    };

    html2canvas(area, options).then(canvas => {
        const name = document.getElementById('caseName').value || '訂購單';
        const fileName = `訂購單_${name}.png`;

        if (isIOS) {
            // iOS 改用 Modal 顯示
            const imgData = canvas.toDataURL("image/png");
            const modal = document.getElementById('imgPreviewModal');
            const container = document.getElementById('imgPreviewContainer');
            
            container.innerHTML = '';
            const img = new Image();
            img.src = imgData;
            container.appendChild(img);
            
            modal.style.display = 'block';
            // alert("圖片已生成！\n請長按圖片並選擇「加入照片」或「分享」。");
        } else {
            const a = document.createElement('a');
            a.download = fileName;
            a.href = canvas.toDataURL("image/png");
            a.click();
        }
        restoreStyles();
    }).catch(err => {
        console.error("截圖失敗:", err);
        alert(`圖片生成失敗：${err.message}`);
        restoreStyles();
    });

    function restoreStyles() {
        panel.style.display = originalPanelDisplay;
        if(footer) footer.style.display = originalFooterDisplay;
        area.style.width = originalWidth;
        area.style.maxWidth = originalMaxWidth;
        area.style.margin = originalMargin;
        area.style.transform = originalTransform;
    }
}

// [核心修正] 分享功能：失敗時回退到 Modal
function shareImage() {
    if (!navigator.canShare) {
        alert("不支援分享，將改為圖片下載。");
        downloadImage();
        return;
    }

    const panel = document.getElementById('control-panel-section');
    const area = document.getElementById('capture-area');
    const footer = document.querySelector('.footer-controls'); 
    
    const originalPanelDisplay = panel.style.display;
    const originalFooterDisplay = footer ? footer.style.display : '';
    const originalWidth = area.style.width;
    const originalMargin = area.style.margin;
    const originalMaxWidth = area.style.maxWidth;
    const originalTransform = area.style.transform;
    
    panel.style.display = 'none';
    if(footer) footer.style.display = 'none';
    area.style.width = '1100px';
    area.style.maxWidth = 'none'; 
    area.style.margin = '0'; 
    area.style.transform = 'none'; 
    window.scrollTo(0, 0);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const scaleValue = isIOS ? 1 : 2; // iOS 改為 1

    const options = {
        scale: scaleValue, 
        useCORS: true, 
        width: 1100, 
        windowWidth: 1280, 
        x: 0, 
        y: 0, 
        scrollX: 0, 
        scrollY: 0,
        backgroundColor: "#ffffff"
    };

    html2canvas(area, options).then(canvas => {
        canvas.toBlob(async (blob) => {
            const name = document.getElementById('caseName').value || '訂購單';
            const fileName = `Order_${name}.png`;
            const file = new File([blob], fileName, { type: "image/png" });
            const shareData = {
                files: [file],
                title: '祭品訂購單',
            };

            try {
                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    downloadImage(); 
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("分享失敗:", err);
                    downloadImage(); // 失敗就開 Modal
                }
            } finally {
                restoreStyles();
            }
        }, 'image/png');
    }).catch(err => {
        console.error("截圖生成失敗:", err);
        restoreStyles();
    });

    function restoreStyles() {
        panel.style.display = originalPanelDisplay;
        if(footer) footer.style.display = originalFooterDisplay;
        area.style.width = originalWidth;
        area.style.maxWidth = originalMaxWidth;
        area.style.margin = originalMargin;
        area.style.transform = originalTransform;
    }
}

// [新增] 飯菜區行拖曳功能
function initRowDragAndDrop() {
    const tbody = document.getElementById('meals-body');
    let draggedRow = null;

    tbody.addEventListener('dragstart', (e) => {
        draggedRow = e.target.closest('tr');
        if(draggedRow) {
            e.dataTransfer.effectAllowed = 'move';
            // 使用 setTimeout 讓視覺效果正確
            setTimeout(() => draggedRow.classList.add('dragging-row'), 0);
        }
    });

    tbody.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetRow = e.target.closest('tr');
        if (targetRow && targetRow !== draggedRow && tbody.contains(targetRow)) {
            const rect = targetRow.getBoundingClientRect();
            // 判斷滑鼠在目標行的上半部還是下半部
            const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
            tbody.insertBefore(draggedRow, next ? targetRow.nextSibling : targetRow);
        }
    });

    tbody.addEventListener('dragend', () => {
        if (draggedRow) {
            draggedRow.classList.remove('dragging-row');
            draggedRow = null;
            // 拖曳結束後，重新計算合併儲存格 (重要！)
            mergeTableCells(tbody);
        }
    });
}

// 關閉圖片 Modal
function closeImgPreview() {
    document.getElementById('imgPreviewModal').style.display = 'none';
}

function showPriceList() { document.getElementById("priceListModal").style.display = "block"; showPriceTable(); }
function closePriceList() { document.getElementById("priceListModal").style.display = "none"; }
function showPriceTable() {
    const tbody = document.querySelector("#price-list-table tbody");
    tbody.innerHTML = "";
    if (Object.keys(PRICE_LIST).length === 0) {
        tbody.innerHTML = "<tr><td colspan='3'>資料尚未載入</td></tr>";
        return;
    }
    for(const [k, v] of Object.entries(PRICE_LIST)) {
        tbody.innerHTML += `<tr><td>${k}</td><td>${v.單位}</td><td>${v.單價}</td></tr>`;
    }
}