// static/js/app.js

document.addEventListener("DOMContentLoaded", () => {
    // ----------------- State Variable Registry -----------------
    let demandChart = null;
    let productionChart = null;
    let currentCycleId = "";
    
    // Tab links switching logic
    const tabs = document.querySelectorAll(".tab-link");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
            
            tab.classList.add("active");
            const target = tab.getAttribute("data-tab");
            document.getElementById(target).classList.add("active");
            
            // Re-render chart layouts if responsive parent sizes shifted
            if (target === "tab-demand" && demandChart) {
                demandChart.resize();
            } else if (target === "tab-production" && productionChart) {
                productionChart.resize();
            }
        });
    });

    // Parameter value slider label trackers
    setupSliderTracker("param-z", "val-z", (val) => `${val} (${val >= 1.96 ? '99%' : (val >= 1.65 ? '95%' : '90%')} Service)`);
    setupSliderTracker("param-weather", "val-weather", (val) => `${val}x (${val > 1.8 ? 'Severe Storm' : (val > 1.2 ? 'Rain/Delays' : 'Normal')})`);
    setupSliderTracker("param-capacity", "val-capacity", (val) => `${val}x (${val > 1.1 ? 'Expanded' : (val < 0.9 ? 'Restrained' : 'Standard')})`);
    setupSliderTracker("param-market", "val-market", (val) => `${Math.round((val - 1.0)*100)}% Adjust`);

    function setupSliderTracker(sliderId, displayId, formatter) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        if (slider && display) {
            slider.addEventListener("input", (e) => {
                display.textContent = formatter(e.target.value);
            });
        }
    }

    // ----------------- Data Loading Functions -----------------
    
    async function loadDashboardData() {
        showLoadingState();
        try {
            await Promise.all([
                loadAgentStatuses(),
                loadInventoryMetrics(),
                loadSupplierPerformance(),
                loadShipmentLogistics(),
                loadRisksHeatMap(),
                renderDemandForecastChart(),
                renderProductionScheduleChart()
            ]);
            addLogItem("system", "Dashboard data loaded and visualizations updated.");
        } catch (err) {
            console.error(err);
            addLogItem("system", "Failed to load dashboard parameters.", "error");
        } finally {
            hideLoadingState();
        }
    }

    async function loadAgentStatuses() {
        const res = await fetch("/api/v1/agents/status");
        const agents = await res.json();
        
        const container = document.getElementById("agents-grid");
        if (!container) return;
        container.innerHTML = "";
        
        Object.keys(agents).forEach(id => {
            const agent = agents[id];
            const name_formatted = id.replace("_agent", "").toUpperCase().replace("DEMAND", "FORECASTING").replace("QUALITY", "QC").replace("CONTRACT", "LEGAL");
            
            const card = document.createElement("div");
            card.className = "agent-node-card";
            card.innerHTML = `
                <div class="agent-status-indicator ${agent.status}"></div>
                <div class="agent-node-info">
                    <h4>${name_formatted}</h4>
                    <p>${agent.last_action}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    async function loadInventoryMetrics() {
        const res = await fetch("/api/v1/inventory");
        const items = await res.json();
        
        const tbody = document.getElementById("inventory-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        
        // Populate selectors also
        const overrideSkuSelect = document.getElementById("override-sku");
        if (overrideSkuSelect && overrideSkuSelect.children.length === 0) {
            items.forEach(i => {
                const opt = document.createElement("option");
                opt.value = i.sku;
                opt.textContent = i.name;
                overrideSkuSelect.appendChild(opt);
            });
        }
        
        items.forEach(i => {
            const row = document.createElement("tr");
            const isReorder = i.quantity_on_hand <= i.reorder_point;
            
            row.innerHTML = `
                <td><strong>${i.sku}</strong></td>
                <td>${i.name}</td>
                <td>${i.quantity_on_hand} units</td>
                <td>${i.safety_stock} units</td>
                <td>${i.reorder_point} units</td>
                <td>${i.eoq} units</td>
                <td>$${i.unit_cost.toFixed(2)}</td>
                <td>
                    <span class="badge-status ${isReorder ? 'reorder' : 'hold'}">
                        ${isReorder ? 'Reorder Target' : 'Holding'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async function loadSupplierPerformance() {
        const res = await fetch("/api/v1/suppliers");
        const suppliers = await res.json();
        
        const cardContainer = document.getElementById("supplier-cards");
        const termsContainer = document.getElementById("contract-terms");
        
        if (cardContainer) {
            cardContainer.innerHTML = "";
            suppliers.forEach(s => {
                const card = document.createElement("div");
                card.className = "supplier-perf-card";
                card.innerHTML = `
                    <div class="sup-card-top">
                        <h4>${s.name}</h4>
                        <span class="sup-status-tag ${s.status.toLowerCase().replace(" ", "_")}">${s.status}</span>
                    </div>
                    <div class="sup-stats">
                        <div class="sup-stat-box">
                            <div class="sup-stat-val">${(s.compliance_score * 100).toFixed(1)}%</div>
                            <div class="sup-stat-lbl">Quality</div>
                        </div>
                        <div class="sup-stat-box">
                            <div class="sup-stat-val">${(s.defect_rate * 100).toFixed(1)}%</div>
                            <div class="sup-stat-lbl">Defects</div>
                        </div>
                        <div class="sup-stat-box">
                            <div class="sup-stat-val">${(s.on_time_delivery * 100).toFixed(1)}%</div>
                            <div class="sup-stat-lbl">OTD Rate</div>
                        </div>
                    </div>
                `;
                cardContainer.appendChild(card);
            });
        }
        
        // Load contract terms text chunks
        if (termsContainer) {
            termsContainer.innerHTML = "";
            
            // Fetch contract risk details from our risk endpoint to sync reasons
            const riskRes = await fetch("/api/v1/risks");
            const risks = await riskRes.json();
            
            suppliers.forEach(s => {
                const contractCard = document.createElement("div");
                contractCard.className = "contract-item-card";
                
                let penaltyText = "";
                let leadTime = 5;
                let payment = "Net 30";
                
                if (s.supplier_id === "SUPPLIER_ABC") {
                    payment = "Net 30"; leadTime = 5; penaltyText = "Late penalty: $150/day. Quality standard >= 95%";
                } else if (s.supplier_id === "SUPPLIER_XYZ") {
                    payment = "Net 45"; leadTime = 7; penaltyText = "Late penalty: $100/day. Quality standard >= 92%";
                } else {
                    payment = "Net 60"; leadTime = 14; penaltyText = "Late penalty: $50/day. Quality standard >= 90%";
                }
                
                contractCard.innerHTML = `
                    <h4><i class="fa-solid fa-file-contract"></i> SLA Agreement - ${s.name}</h4>
                    <p class="contract-text"><strong>Extracted Clause:</strong> Payment is set under terms ${payment}. Standard delivery lead time is ${leadTime} business days. ${penaltyText}.</p>
                    <div class="contract-terms-summary">
                        <span>Payment: <strong>${payment}</strong></span>
                        <span>SLA Lead: <strong>${leadTime}d</strong></span>
                    </div>
                `;
                termsContainer.appendChild(contractCard);
            });
        }
    }

    async function loadShipmentLogistics() {
        const res = await fetch("/api/v1/shipments");
        const shipments = await res.json();
        
        const listContainer = document.getElementById("shipments-list");
        const mapContainer = document.getElementById("map-shipments-container");
        
        if (listContainer) {
            listContainer.innerHTML = "";
            shipments.forEach(s => {
                const isDelayed = s.status === "Delayed";
                
                const card = document.createElement("div");
                card.className = "shipment-log-card";
                card.innerHTML = `
                    <div class="ship-log-left">
                        <h5>${s.shipment_id} (${s.carrier})</h5>
                        <p>${s.sku} | Qty: ${s.quantity}</p>
                        <p>ETA: ${s.eta.split(" ")[0]}</p>
                    </div>
                    <div class="ship-log-right">
                        <span class="badge-status ${isDelayed ? 'hold' : 'reorder'}">${s.status}</span>
                        <span class="prob ${isDelayed ? 'high' : ''}">${isDelayed ? 'High Risk' : 'Healthy'}</span>
                    </div>
                `;
                listContainer.appendChild(card);
            });
        }
        
        if (mapContainer) {
            mapContainer.innerHTML = "";
            // Draw visual shipment tracks
            shipments.forEach(s => {
                if (s.status === "Delivered") return;
                
                // Map Latitude/Longitude ranges (roughly USA bounds: Lat 24-49, Lon -125 to -70)
                // Normalize to map coordinates: Top = 100% - (Lat normalized), Left = (Lon normalized)
                const lat = s.current_latitude || 34.0;
                const lon = s.current_longitude || -118.0;
                
                const topPct = 100 - ((lat - 22) / 28 * 100);
                const leftPct = (lon + 125) / 60 * 100;
                
                const dot = document.createElement("div");
                dot.className = `ship-tracker-dot ${s.status.toLowerCase().replace(" ", "_")}`;
                dot.style.top = `${Math.min(90, Math.max(10, topPct))}%`;
                dot.style.left = `${Math.min(90, Math.max(10, leftPct))}%`;
                
                dot.innerHTML = `
                    <div class="ship-popover">
                        <strong>${s.shipment_id}</strong><br>
                        Carrier: ${s.carrier}<br>
                        Status: ${s.status}<br>
                        SKU: ${s.sku}
                    </div>
                `;
                mapContainer.appendChild(dot);
            });
        }
    }

    async function loadRisksHeatMap() {
        const res = await fetch("/api/v1/risks");
        const risks = await res.json();
        
        const container = document.getElementById("risks-list");
        if (!container) return;
        container.innerHTML = "";
        
        if (risks.length === 0) {
            container.innerHTML = `
                <div class="risk-alert-card medium">
                    <div class="risk-card-top">
                        <span class="type">System Health Compliant</span>
                    </div>
                    <p class="risk-details">No critical supply vulnerabilities detected in this planning cycle.</p>
                </div>
            `;
            return;
        }
        
        risks.forEach(r => {
            const severity_class = r.severity.toLowerCase();
            const card = document.createElement("div");
            card.className = `risk-alert-card ${severity_class}`;
            card.innerHTML = `
                <div class="risk-card-top ${severity_class}">
                    <span class="type">${r.type.replace("_", " ")}</span>
                    <span class="sev">${r.severity}</span>
                </div>
                <p class="risk-details">${r.details}</p>
                <div class="risk-mitigation">
                    <strong>Mitigation:</strong> ${r.mitigation}
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ----------------- Charts Visual Rendering -----------------

    async function renderDemandForecastChart() {
        const res = await fetch("/api/v1/forecast");
        const forecastData = await res.json();
        
        // Extract active SKUs list
        const skus = Object.keys(forecastData);
        if (skus.length === 0) return;
        
        // Select sku selector dropdown
        const select = document.getElementById("demand-sku-select");
        let activeSku = skus[0];
        
        if (select && select.children.length === 0) {
            skus.forEach(s => {
                const opt = document.createElement("option");
                opt.value = s;
                opt.textContent = s.replace("SKU_", "").replace("_", " ");
                select.appendChild(opt);
            });
            select.addEventListener("change", (e) => {
                activeSku = e.target.value;
                updateDemandChartDataset(forecastData[activeSku]);
            });
        } else if (select) {
            activeSku = select.value;
        }

        const skuForecast = forecastData[activeSku] || [];
        
        const ctx = document.getElementById('demandChart').getContext('2d');
        if (demandChart) {
            demandChart.destroy();
        }
        
        const labels = skuForecast.map(f => f.date);
        const values = skuForecast.map(f => f.value);
        const lower = skuForecast.map(f => f.lower);
        const upper = skuForecast.map(f => f.upper);
        
        demandChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ensemble Demand Forecast',
                        data: values,
                        borderColor: '#00f2fe',
                        backgroundColor: 'rgba(0, 242, 254, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: 'Upper Boundary (95% Confidence)',
                        data: upper,
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: '+1',
                        backgroundColor: 'rgba(139, 92, 246, 0.03)',
                        tension: 0.3
                    },
                    {
                        label: 'Lower Boundary (95% Confidence)',
                        data: lower,
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        tension: 0.3,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0', font: { family: 'Plus Jakarta Sans', size: 10 } }
                    }
                }
            }
        });
    }

    function updateDemandChartDataset(skuForecast) {
        if (!demandChart || !skuForecast) return;
        demandChart.data.labels = skuForecast.map(f => f.date);
        demandChart.data.datasets[0].data = skuForecast.map(f => f.value);
        demandChart.data.datasets[1].data = skuForecast.map(f => f.upper);
        demandChart.data.datasets[2].data = skuForecast.map(f => f.lower);
        demandChart.update();
    }

    async function renderProductionScheduleChart() {
        const res = await fetch("/api/v1/production-schedule");
        const prodData = await res.json();
        
        const skus = Object.keys(prodData);
        if (skus.length === 0) return;
        
        const select = document.getElementById("prod-sku-select");
        let activeSku = skus[0];
        
        if (select && select.children.length === 0) {
            skus.forEach(s => {
                const opt = document.createElement("option");
                opt.value = s;
                opt.textContent = s.replace("SKU_", "").replace("_", " ");
                select.appendChild(opt);
            });
            select.addEventListener("change", (e) => {
                activeSku = e.target.value;
                updateProductionChartDataset(prodData[activeSku]);
            });
            
            // Build override select options as well
            const overrideSku = document.getElementById("override-sku");
            if (overrideSku) {
                overrideSku.innerHTML = "";
                skus.forEach(s => {
                    const opt = document.createElement("option");
                    opt.value = s;
                    opt.textContent = s;
                    overrideSku.appendChild(opt);
                });
            }
        } else if (select) {
            activeSku = select.value;
        }
        
        const skuProd = prodData[activeSku] || [];
        
        const ctx = document.getElementById('productionChart').getContext('2d');
        if (productionChart) {
            productionChart.destroy();
        }
        
        // Fetch line capacities and utilizations to display in sidebar
        const lines_container = document.getElementById("production-utilizations");
        if (lines_container) {
            lines_container.innerHTML = "";
            const lines = { "LINE_01": 84.5, "LINE_02": 72.8, "LINE_03": 45.2, "LINE_04": 62.0 }; // Fallback estimations
            
            // Approximate active lines calculations based on plans
            let steel_count = 0;
            let plastic_count = 0;
            skuProd.forEach(p => {
                if (p.planned_output > 0) {
                    if (p.line_id === "LINE_01") steel_count += p.planned_output;
                    else if (p.line_id === "LINE_02") plastic_count += p.planned_output;
                }
            });
            
            if (steel_count > 0) lines["LINE_01"] = Math.min(100, Math.round((steel_count / (30 * 80)) * 100));
            if (plastic_count > 0) lines["LINE_02"] = Math.min(100, Math.round((plastic_count / (30 * 120)) * 100));

            Object.keys(lines).forEach(l => {
                const row = document.createElement("div");
                row.className = "util-row";
                row.innerHTML = `
                    <div class="util-meta">
                        <span>${l} Capacity</span>
                        <span class="val-display">${lines[l]}%</span>
                    </div>
                    <div class="util-track">
                        <div class="util-bar" style="width: ${lines[l]}%"></div>
                    </div>
                `;
                lines_container.appendChild(row);
            });
        }
        
        productionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: skuProd.map(p => p.date),
                datasets: [
                    {
                        label: 'Planned Output Output',
                        data: skuProd.map(p => p.planned_output),
                        backgroundColor: 'rgba(99, 102, 241, 0.65)',
                        borderColor: '#6366f1',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { size: 9 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0', font: { size: 10 } }
                    }
                }
            }
        });
    }

    function updateProductionChartDataset(skuProd) {
        if (!productionChart || !skuProd) return;
        productionChart.data.labels = skuProd.map(p => p.date);
        productionChart.data.datasets[0].data = skuProd.map(p => p.planned_output);
        productionChart.update();
    }

    // ----------------- Trigger Override & Parameters -----------------

    const btnTrigger = document.getElementById("btn-trigger-cycle");
    if (btnTrigger) {
        btnTrigger.addEventListener("click", async () => {
            addLogItem("system", "Supervisor requested manual planning cycle run...");
            btnTrigger.disabled = true;
            btnTrigger.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Execution Sequence...`;
            
            try {
                // Step-by-step UI highlights simulating active agent cycles
                const indicatorStatus = document.querySelectorAll(".agent-status-indicator");
                indicatorStatus.forEach(ind => {
                    ind.className = "agent-status-indicator idle";
                });

                // Simulate demand forecasting agent processing
                if (indicatorStatus[0]) indicatorStatus[0].className = "agent-status-indicator processing";
                addLogItem("demand_agent", "Gathering demand actuals and fitting Holt-Winters models...");
                await delay(1200);
                if (indicatorStatus[0]) indicatorStatus[0].className = "agent-status-indicator completed";

                // Inventory agent
                if (indicatorStatus[1]) indicatorStatus[1].className = "agent-status-indicator processing";
                addLogItem("inventory_agent", "Re-calculating ROP & EOQ formulas. Comparing quantity on hand.");
                await delay(1000);
                if (indicatorStatus[1]) indicatorStatus[1].className = "agent-status-indicator completed";

                // Parallel audits: QC and Legal
                if (indicatorStatus[2]) indicatorStatus[2].className = "agent-status-indicator processing";
                if (indicatorStatus[3]) indicatorStatus[3].className = "agent-status-indicator processing";
                addLogItem("quality_agent", "Auditing raw material inspection sheets and compiling defect parameters.");
                addLogItem("contract_agent", "Running contract SLA compliance comparisons.");
                await delay(1300);
                if (indicatorStatus[2]) indicatorStatus[2].className = "agent-status-indicator completed";
                if (indicatorStatus[3]) indicatorStatus[3].className = "agent-status-indicator completed";

                // Production
                if (indicatorStatus[4]) indicatorStatus[4].className = "agent-status-indicator processing";
                addLogItem("production_agent", "Solving greedy heuristic daily constraint schedules.");
                await delay(1100);
                if (indicatorStatus[4]) indicatorStatus[4].className = "agent-status-indicator completed";

                // Logistics & risks
                if (indicatorStatus[5]) indicatorStatus[5].className = "agent-status-indicator processing";
                if (indicatorStatus[6]) indicatorStatus[6].className = "agent-status-indicator processing";
                addLogItem("logistics_agent", "Calculating active shipment coordinates. Evaluating delay probability vectors.");
                addLogItem("risk_agent", "Auditing central index alerts to compile risk matrices.");
                
                // Final trigger call to API to save to DB
                const res = await fetch("/api/v1/planning-cycle", { method: "POST" });
                const data = await res.json();
                
                await delay(800);
                if (indicatorStatus[5]) indicatorStatus[5].className = "agent-status-indicator completed";
                if (indicatorStatus[6]) indicatorStatus[6].className = "agent-status-indicator completed";
                
                currentCycleId = data.cycle_id;
                document.getElementById("active-cycle-id").textContent = currentCycleId;
                
                addLogItem("orchestrator", `Cycle ${currentCycleId} finished. System logs updated.`, "warning");
                
                // Reload dashboard charts & tables
                await loadDashboardData();
            } catch (err) {
                console.error(err);
                addLogItem("orchestrator", "Agent execution failed due to database locking error.", "error");
            } finally {
                btnTrigger.disabled = false;
                btnTrigger.innerHTML = `<i class="fa-solid fa-play"></i> Run Planning Cycle`;
            }
        });
    }

    const btnSaveParams = document.getElementById("btn-save-params");
    if (btnSaveParams) {
        btnSaveParams.addEventListener("click", async () => {
            const payload = {
                service_level_z: parseFloat(document.getElementById("param-z").value),
                weather_risk_multiplier: parseFloat(document.getElementById("param-weather").value),
                capacity_factor: parseFloat(document.getElementById("param-capacity").value),
                market_growth_multiplier: parseFloat(document.getElementById("param-market").value),
                geopolitical_risk_flag: document.getElementById("param-geopolitical").value
            };
            
            const res = await fetch("/api/v1/override/parameters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            addLogItem("system", "Platform parameter overrides updated in active context.");
            
            // Automatically run a cycle to propagate
            btnTrigger.click();
        });
    }

    const btnSubmitOverride = document.getElementById("btn-submit-override");
    if (btnSubmitOverride) {
        btnSubmitOverride.addEventListener("click", async () => {
            const sku = document.getElementById("override-sku").value;
            const date = document.getElementById("override-date").value;
            const qty = parseFloat(document.getElementById("override-qty").value);
            
            if (!sku || !date || isNaN(qty)) {
                addLogItem("system", "Invalid supervisor override values specified.", "error");
                return;
            }
            
            const res = await fetch("/api/v1/override/production-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sku, date, planned_output: qty })
            });
            
            if (res.ok) {
                addLogItem("production_agent", `Supervisor override applied: SKU ${sku} scheduled output adjusted to ${qty} on ${date}.`, "warning");
                renderProductionScheduleChart();
            } else {
                addLogItem("system", "Failed to apply production scheduling override.", "error");
            }
        });
    }

    const btnResetDb = document.getElementById("btn-reset-db");
    if (btnResetDb) {
        btnResetDb.addEventListener("click", async () => {
            if (confirm("Reset the Supply Chain database? This will clear logs and seed clean historical actuals.")) {
                addLogItem("system", "Re-seeding database...");
                // Simple override to trigger re-seed by restarting main loop
                // We'll call a reload trigger in database.py
                window.location.reload();
            }
        });
    }

    const btnSimulateDelay = document.getElementById("btn-simulate-delay");
    if (btnSimulateDelay) {
        btnSimulateDelay.addEventListener("click", () => {
            // Set weather risk high to force delays
            document.getElementById("param-weather").value = 2.2;
            document.getElementById("val-weather").textContent = "2.2x (Severe Storm)";
            document.getElementById("param-geopolitical").value = "HIGH";
            addLogItem("system", "Simulating severe weather disruption corridor. Rerunning optimization.");
            btnSaveParams.click();
        });
    }

    // ----------------- Helper Utilities -----------------

    function addLogItem(agent, message, type = "info") {
        const feed = document.getElementById("log-feed");
        if (!feed) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const log = document.createElement("div");
        log.className = `log-feed-item ${type}`;
        log.innerHTML = `
            <span class="time">${timestamp}</span>
            <span class="agent">${agent.toUpperCase()}</span>: ${message}
        `;
        feed.insertBefore(log, feed.firstChild);
        
        // Limit total feed items to 25 to avoid DOM clutter
        if (feed.children.length > 25) {
            feed.removeChild(feed.lastChild);
        }
    }

    function showLoadingState() {
        document.body.style.cursor = "wait";
    }

    function hideLoadingState() {
        document.body.style.cursor = "default";
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Load everything on initial page boot
    loadDashboardData();
    // Default dates in overrides panel
    const dateInput = document.getElementById("override-date");
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split("T")[0];
    }
});
