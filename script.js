/**
 * 檔案：script.js
 * 版本：2025-12-08 Final Logic: Meal Scheme Toggle (A/B)
 */

// ==========================================
// 1. JSON Configuration Store (Data Source)
// ==========================================

const PRICE_LIST_SOURCE = {
  "metadata": { "title": "品項單位及單價預設值", "data_type": "PRICE_LIST", "version": "1.0.0" },
  "data": {
    "綜合果(果品)": { "單位": "盤", "單價": 300 },
    "小單果(果品)": { "單位": "盤", "單價": 100 },
    "大單果(果品)": { "單位": "盤", "單價": 200 },
    "三小盤(果品)": { "單位": "組", "單價": 300 },
    "三大盤(果品)": { "單位": "組", "單價": 600 },
    "獻果用蘋果(果品)": { "單位": "盤", "單價": 100 },
    "白飯、鹹蛋": { "單位": "組", "單價": 35 },
    "紅圓、發糕": { "單位": "盒", "單價": 100 },
    "蛋糕": { "單位": "個", "單價": 90 },
    "五菜一飯(素)": { "單位": "組", "單價": 180 },
    "六菜一飯(素)": { "單位": "組", "單價": 200 },
    "五菜一飯(葷)": { "單位": "組", "單價": 180 },
    "六菜一飯(葷)": { "單位": "組", "單價": 200 },
    "葷三牲": { "單位": "組", "單價": 770 },
    "葷五牲": { "單位": "付", "單價": 2000 },
    "小素三牲": { "單位": "付", "單價": 280 },
    "大素三牲": { "單位": "付", "單價": 625 }
  }
};

const BASE_OFFERING_SOURCE = {
  "metadata": { "title": "基本祭品數量邏輯", "data_type": "BASE_OFFERING_LOGIC", "version": "1.2.0" },
  "data": {
    "頭七": {
      "佛教": {
        "簡易": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } },
        "半日": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } },
        "全日": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } }
      },
      "道教": {
        "簡易": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } },
        "拜經": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } },
        "冥路": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } },
        "午夜": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } }
      }
    },
    "法事": {
      "佛教": {
        "簡易": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } },
        "半日": { "葷": { "三小盤(果品)": 1, "三大盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1, "五菜一飯(素)": 1 }, "素": { "三小盤(果品)": 1, "三大盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 2 } },
        "全日": { "葷": { "三小盤(果品)": 1, "三大盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1, "五菜一飯(素)": 1 }, "素": { "三小盤(果品)": 1, "三大盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 2 } }
      },
      "道教": {
        "簡易": { "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 }, "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 } },
        "拜經": { "葷": { "綜合果(果品)": 4, "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 2 }, "素": { "綜合果(果品)": 4, "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 2 } },
        "冥路": { "葷": { "綜合果(果品)": 5, "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 2, "五菜一飯(葷)": 2 }, "素": { "綜合果(果品)": 5, "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 2, "五菜一飯(素)": 2 } },
        "午夜": { "葷": { "綜合果(果品)": 7, "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 3, "五菜一飯(葷)": 2 }, "素": { "綜合果(果品)": 7, "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 3, "五菜一飯(素)": 2 } }
      }
    },
    "出殯": {
      "佛教": {
        "簡易": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 2, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "葷三牲": 1, "五菜一飯(葷)": 3 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 2, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "小素三牲": 1, "五菜一飯(素)": 3 } },
        "簡易(自宅)": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 2, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "葷三牲": 1, "五菜一飯(葷)": 3, "蛋糕": 1 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 2, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "小素三牲": 1, "五菜一飯(素)": 3, "蛋糕": 1 } },
        "半日": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3 } },
        "半日(自宅)": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3, "蛋糕": 1 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3, "蛋糕": 1 } },
        "全日": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3 } },
        "全日(自宅)": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3, "蛋糕": 1 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3, "蛋糕": 1 } }
      },
      "道教": {
        "簡易": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 2, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "葷三牲": 1, "五菜一飯(葷)": 3 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 2, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "小素三牲": 1, "五菜一飯(素)": 3 } },
        "簡易(自宅)": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 2, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "葷三牲": 1, "五菜一飯(葷)": 3, "蛋糕": 1 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 2, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "小素三牲": 1, "五菜一飯(素)": 3, "蛋糕": 1 } },
        "拜經": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3 } },
        "拜經(自宅)": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3, "蛋糕": 1 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3, "蛋糕": 1 } },
        "冥路": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3 } },
        "冥路(自宅)": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3, "蛋糕": 1 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3, "蛋糕": 1 } },
        "午夜": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3 } },
        "午夜(自宅)": { "葷": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "五菜一飯(葷)": 3, "蛋糕": 1 }, "素": { "綜合果(果品)": 1, "三小盤(果品)": 1, "三大盤(果品)": 1, "獻果用蘋果(果品)": 1, "紅圓、發糕": 2, "大素三牲": 1, "五菜一飯(素)": 3, "蛋糕": 1 } }
      }
    }
  }
};

const ANHS_ADDITIONAL_SOURCE = {
  "metadata": { "title": "安神主祭品", "trigger_condition": "HasAnShenZhu_True" },
  "data": {
    "葷": { "三小盤(果品)": 1, "紅圓、發糕": 1, "葷三牲": 1, "五菜一飯(葷)": 1 },
    "素": { "三小盤(果品)": 1, "紅圓、發糕": 1, "小素三牲": 1, "五菜一飯(素)": 1 }
  }
};

// 提取實際數據
const PRICE_LIST = PRICE_LIST_SOURCE.data;
const BASE_OFFERING_LOGIC = BASE_OFFERING_SOURCE.data;
const ANHS_LOGIC = ANHS_ADDITIONAL_SOURCE.data;

let pendingMealItems = []; 

// ==========================================
// 2. Initialization & Listeners
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    initDropdownsFromJSON(); 
    initRitualSections(); 
    setPrintDate(); 
    
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
                // 確保文字更新
                const wrapper = e.target.closest('.date-cell-wrapper') || e.target.closest('.date-display-wrapper');
                if(wrapper) {
                     const textSpan = wrapper.querySelector('.date-display-text');
                     if(textSpan) textSpan.innerText = formatDisplayDate(e.target.value);
                }
                
                // 換果驗證
                if (e.target.classList.contains('fruit-date-input')) {
                     validateFruitDates();
                }
            }
            
            if (e.target.id === 'funeralDate') validateFruitDates();
            
            calculateAllTotals();
        }
    });

    setupDragDrop();
});

function initDropdownsFromJSON() {
    const religionSelect = document.getElementById('religion');
    const sampleRitual = BASE_OFFERING_LOGIC["頭七"];
    if (sampleRitual) {
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
    const sampleLogic = BASE_OFFERING_LOGIC["頭七"];
    if (religion && sampleLogic && sampleLogic[religion]) {
        const specs = Object.keys(sampleLogic[religion]);
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

// ==========================================
// 3. Core Logic
// ==========================================

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

function applyDefaults() {
    if(!checkRequiredFields()) {
        alert("請填寫所有紅框閃爍的必填欄位（案件名、接案日、出殯日）。");
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

    // ==========================================
    // [設定區域] 豎靈餐點邏輯切換方案
    // 填入 'A' : 方案1 - 固定為「五菜一飯(素)」，不隨上方葷素欄位改變
    // 填入 'B' : 方案2 - 連動上方「葷/素」欄位 (素->素, 葷->葷)
    // ==========================================
    const MEAL_SCHEME = 'B'; // <--- 請在這裡修改 'A' 或 'B'

    let mealItemSpec = "";
    if (MEAL_SCHEME === 'A') {
        mealItemSpec = "五菜一飯(素)";
    } else {
        // 預設為 B 方案 (連動)
        mealItemSpec = inputs.diet === '素' ? "五菜一飯(素)" : "五菜一飯(葷)";
    }
    
    // [設定區域] 針對不同地點與葷素設定「豎靈」的預設數量
    let item1_Qty = 0; // 白飯、鹹蛋
    let item2_Qty = 0; // 五菜一飯

    if(inputs.location === '自宅') {
        // 自宅設定
        if(inputs.diet === '素') {
            item1_Qty = 0;
            item2_Qty = 0;
        } else {
            item1_Qty = 0;
            item2_Qty = 0;
        }
    } else {
        // 其他地點 (暫存、市殯、會館)
        if(inputs.diet === '素') {
            item1_Qty = 0;
            item2_Qty = 0;
        } else {
            item1_Qty = 0;
            item2_Qty = 0;
        }
    }

    // 產生「豎靈」資料列 (日期統一為接案日)
    addMealRowData(inputs.receiveDate, "豎靈", "白飯、鹹蛋", item1_Qty);
    addMealRowData(inputs.receiveDate, "豎靈", mealItemSpec, item2_Qty);

    // 產生後續其他儀式的飯菜資料 (頭七、法事、出殯等)
    pendingMealItems.forEach(p => {
        let currentPickup = p.date;
        const ritualMap = { '頭七': 'head7', '法事': 'ritual', '出殯': 'funeral' };
        if(ritualMap[p.ritual]) {
             const el = document.getElementById(`${ritualMap[p.ritual]}-pickup-date`);
             if(el && el.value) currentPickup = el.value;
        }
        addMealRowData(currentPickup || p.date, p.ritual, p.item, p.qty);
    });

    // 合併相同日期與儀式名稱的儲存格
    mergeTableCells(tbody);
}

function generateFruitSection(inputs) {
    const tbody = document.getElementById('fruit-body');
    tbody.innerHTML = ''; 

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

    let qtyValue = defaultQty;

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
        <td><input type="number" class="row-qty" value="${qtyValue}" min="0"></td>
        <td class="row-unit mobile-hide">${info['單位']}</td>
        <td class="row-price mobile-hide" data-price="${info['單價']}">${info['單價']}</td>
        <td class="row-total mobile-hide">0</td>
        <td class="no-print"><button class="btn-icon" onclick="removeRow(this)">✖︎</button></td>
    `;
    tbody.appendChild(tr);
    calculateAllTotals();
    validateFruitDates();
}

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
            input.title = "注意：距離出殯日不足 2 日或已超過出殯日";
        } else {
            tr.classList.remove('row-warning');
            input.title = "";
        }
    });
}

// ==========================================
// 4. Utilities
// ==========================================

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

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // 抓取隱藏的 input 值
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

function addMealRowData(date, ritual, item, qty) {
    const tbody = document.getElementById('meals-body');
    const info = getPriceInfo(item);
    const tr = document.createElement('tr');
    
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

function downloadPDF() { window.print(); }

function downloadImage() {
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
    const options = {
        scale: 2, 
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
        const a = document.createElement('a');
        const name = document.getElementById('caseName').value || '訂購單';
        const now = new Date();
        const timeStr = `${now.getMonth()+1}${now.getDate()}_${now.getHours()}${now.getMinutes()}`;
        a.download = `訂購單_${name}_${timeStr}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        restoreStyles();
    }).catch(err => {
        console.error("截圖失敗:", err);
        alert("圖片生成失敗，請稍後再試。");
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

function showPriceList() { document.getElementById("priceListModal").style.display = "block"; showPriceTable(); }
function closePriceList() { document.getElementById("priceListModal").style.display = "none"; }
function showPriceTable() {
    const tbody = document.querySelector("#price-list-table tbody");
    tbody.innerHTML = "";
    for(const [k, v] of Object.entries(PRICE_LIST)) {
        tbody.innerHTML += `<tr><td>${k}</td><td>${v.單位}</td><td>${v.單價}</td></tr>`;
    }
}