
        // Data Storage
        const habits = [
            { id: 1, name: "Use public transit or bike", category: "Transport", impact: "1.5 kg CO₂ saved" },
            { id: 2, name: "Eat plant-based meals", category: "Diet", impact: "2 kg CO₂ saved" },
            { id: 3, name: "Turn off lights & electronics", category: "Energy", impact: "0.5 kg CO₂ saved" },
            { id: 4, name: "Take shorter showers", category: "Water", impact: "0.3 kg CO₂ saved" },
            { id: 5, name: "Recycle properly", category: "Waste", impact: "0.8 kg CO₂ saved" },
            { id: 6, name: "Buy secondhand items", category: "Shopping", impact: "3 kg CO₂ saved" },
            { id: 7, name: "Use reusable bags & bottles", category: "Waste", impact: "0.6 kg CO₂ saved" },
            { id: 8, name: "Compost food waste", category: "Waste", impact: "1.2 kg CO₂ saved" },
            { id: 9, name: "Reduce water heating temp", category: "Energy", impact: "0.4 kg CO₂ saved" },
            { id: 10, name: "Avoid single-use plastics", category: "Waste", impact: "0.7 kg CO₂ saved" }
        ];

        let completedHabits = JSON.parse(localStorage.getItem('completedHabits')) || {};
        let footprintData = JSON.parse(localStorage.getItem('footprintData')) || {};

        // Tab Switching
        function switchTab(tabName) {
            document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            window.scrollTo(0, 0);
        }

        // Carbon Footprint Calculation
        function calculateFootprint() {
            const electricity = parseFloat(document.getElementById('electricity').value) || 0;
            const gas = parseFloat(document.getElementById('gas').value) || 0;
            const carMiles = parseFloat(document.getElementById('carMiles').value) || 0;
            const publicTransit = parseFloat(document.getElementById('publicTransit').value) || 0;
            const flights = parseFloat(document.getElementById('flights').value) || 0;
            const diet = document.getElementById('diet').value;
            const wasteFood = parseFloat(document.getElementById('wasteFood').value) || 0;
            const wasteGenerated = parseFloat(document.getElementById('wasteGenerated').value) || 0;
            const recyclingRate = parseFloat(document.getElementById('recyclingRate').value) || 0;
            const waterUsage = parseFloat(document.getElementById('waterUsage').value) || 0;
            const shopping = parseFloat(document.getElementById('shopping').value) || 0;

            // Emission factors (kg CO₂)
            const energyEmissions = (electricity * 0.233 + gas * 1.94) * 12; // Annual
            const transportEmissions = (carMiles * 0.27 + publicTransit * 0.05) * 12 + (flights * 1000 * 0.29); // Annual
            
            const dietEmissions = (() => {
                const dietFactors = {
                    'meat-heavy': 2.5,
                    'mixed': 1.8,
                    'vegetarian': 1.2,
                    'vegan': 0.8
                };
                return (dietFactors[diet] || 1.8) * 12;
            })();

            const foodWasteEmissions = (dietEmissions / 12) * (wasteFood / 100) * 12;
            const wasteEmissions = (wasteGenerated * 0.61 * 52) * (1 - recyclingRate / 100);
            const waterEmissions = waterUsage * 0.25 * 12;
            const shoppingEmissions = shopping * 0.000082 * 12;

            const totalEmissions = energyEmissions + transportEmissions + dietEmissions + foodWasteEmissions + wasteEmissions + waterEmissions + shoppingEmissions;

            footprintData = {
                energy: energyEmissions,
                transport: transportEmissions,
                diet: dietEmissions,
                foodWaste: foodWasteEmissions,
                waste: wasteEmissions,
                water: waterEmissions,
                shopping: shoppingEmissions,
                total: totalEmissions
            };

            localStorage.setItem('footprintData', JSON.stringify(footprintData));

            displayCalculatorResults(totalEmissions);
            updateImpactSummary();
        }

        function displayCalculatorResults(total) {
            const html = `
                <div class="result-box">
                    <div class="result-label">Your Annual Carbon Footprint</div>
                    <div class="result-value">${total.toFixed(0)} kg CO₂</div>
                    <div style="margin-top: var(--space-16); color: var(--color-text);">
                        <p><strong>Global Average:</strong> ~4,800 kg CO₂/year</p>
                        <p><strong>Your Status:</strong> ${total > 6000 ? '⚠️ Above average - time to take action!' : total > 4800 ? '📊 Close to average - keep improving!' : '✅ Below average - great job!'}</p>
                        <div class="progress-bar" style="margin-top: var(--space-12);">
                            <div class="progress-fill" style="width: ${Math.min((total / 8000) * 100, 100)}%"></div>
                        </div>
                    </div>
                </div>

                <div class="grid" style="margin-top: var(--space-24);">
                    <div class="card">
                        <h3>🔥 Top Emission Sources</h3>
                        <ol style="margin-left: var(--space-20); color: var(--color-text-light);">
                            ${Object.entries(footprintData)
                                .filter(([k]) => k !== 'total')
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([category, value]) => `<li style="margin-bottom: var(--space-8);"><strong style="color: var(--color-text);">${capitalize(category)}:</strong> ${value.toFixed(0)} kg CO₂</li>`)
                                .join('')}
                        </ol>
                    </div>

                    <div class="card">
                        <h3>🎯 Reduction Opportunities</h3>
                        <ul style="margin-left: var(--space-20); color: var(--color-text-light);">
                            <li style="margin-bottom: var(--space-8);">💡 Switch to renewable energy: Save <strong style="color: var(--color-success);">~900 kg CO₂/year</strong></li>
                            <li style="margin-bottom: var(--space-8);">🚗 Use public transit 3x/week: Save <strong style="color: var(--color-success);">~400 kg CO₂/year</strong></li>
                            <li style="margin-bottom: var(--space-8);">🥗 Go plant-based 2 days/week: Save <strong style="color: var(--color-success);">~300 kg CO₂/year</strong></li>
                        </ul>
                    </div>

                    <div class="card">
                        <h3>🌳 Offset Equivalent</h3>
                        <p style="margin-bottom: var(--space-12); color: var(--color-text-light);">You'd need to plant <strong style="color: var(--color-primary); font-size: 24px;">${Math.ceil(total / 20)}</strong> trees to offset one year of emissions.</p>
                        <p style="color: var(--color-text-light); font-size: 14px;">Trees absorb ~20 kg CO₂ over 20 years</p>
                    </div>
                </div>

                <div style="text-align: center; margin: var(--space-32) 0; padding: var(--space-20); background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border-radius: 8px; border: 2px solid var(--color-border);">
                    <p style="color: var(--color-text); margin-bottom: var(--space-16); font-weight: 600;">📊 Next Steps to Reduce Your Footprint</p>
                    <button class="btn btn-primary" onclick="switchTab('habits'); window.scrollTo(0, 0);" style="margin: 0 var(--space-8);">✅ Build Eco Habits</button>
                    <button class="btn btn-secondary" onclick="switchTab('impact'); setTimeout(() => { drawEmissionChart(); }, 100); window.scrollTo(0, 0);">📈 View Full Impact</button>
                    <button class="btn btn-secondary" onclick="switchTab('tips'); window.scrollTo(0, 0);" style="margin-left: var(--space-8);">💡 Get Green Tips</button>
                </div>
            `;
            document.getElementById('calculatorResults').innerHTML = html;
            updateImpactSummary();
            setTimeout(() => {
                document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
                document.getElementById('impact').classList.add('active');
                window.scrollTo(0, 0);
                drawEmissionChart();
            }, 50);
        }

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');
        }

        // Habits Tracking
        function renderHabits() {
            let html = '';
            habits.forEach(habit => {
                const isCompleted = completedHabits[habit.id];
                html += `
                    <div class="habit-item ${isCompleted ? 'completed' : ''}">
                        <div class="habit-content">
                            <div class="habit-name">${habit.name}</div>
                            <div class="habit-impact">${habit.category} • <strong>${habit.impact}</strong></div>
                        </div>
                        <input type="checkbox" class="habit-checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleHabit(${habit.id})">
                    </div>
                `;
            });
            document.getElementById('habitsList').innerHTML = html;
        }

        function toggleHabit(habitId) {
            completedHabits[habitId] = !completedHabits[habitId];
            localStorage.setItem('completedHabits', JSON.stringify(completedHabits));
            renderHabits();
        }

        function resetHabits() {
            if (confirm('Reset all today\'s habits?')) {
                completedHabits = {};
                localStorage.setItem('completedHabits', JSON.stringify(completedHabits));
                renderHabits();
            }
        }

        function viewHabitStats() {
            const completed = Object.values(completedHabits).filter(Boolean).length;
            const totalSaved = habits.reduce((sum, h) => {
                if (completedHabits[h.id]) {
                    const match = h.impact.match(/[\d.]+/);
                    return sum + (match ? parseFloat(match[0]) : 0);
                }
                return sum;
            }, 0);

            const html = `
                <div class="alert alert-success" style="margin-top: var(--space-20);">
                    <h3 style="color: var(--color-success); margin-bottom: var(--space-8);">Today's Habit Progress ✨</h3>
                    <p><strong style="font-size: 20px; color: var(--color-success);">${completed}/${habits.length}</strong> habits completed</p>
                    <p style="margin-top: var(--space-8);">💚 <strong>${totalSaved.toFixed(1)} kg CO₂ saved today</strong> by maintaining eco-friendly habits!</p>
                    <p style="margin-top: var(--space-8); color: var(--color-text-light); font-size: 14px;">If you maintain this level daily, you could save <strong style="color: var(--color-success);">${(totalSaved * 365).toFixed(0)} kg CO₂ per year</strong>!</p>
                </div>
            `;
            document.getElementById('habitStats').innerHTML = html;
        }

        // Impact Summary
        function updateImpactSummary() {
            if (!footprintData.total) {
                document.getElementById('yearlyFootprint').textContent = '0 kg CO₂';
                document.getElementById('comparison').innerHTML = '<p>Calculate your footprint first</p>';
                return;
            }

            document.getElementById('yearlyFootprint').textContent = `${footprintData.total.toFixed(0)} kg CO₂`;

            const avgGlobal = 4800;
            const difference = footprintData.total - avgGlobal;
            const percentDiff = ((difference / avgGlobal) * 100).toFixed(1);

            document.getElementById('comparison').innerHTML = `
                <p><strong>Global Average:</strong> 4,800 kg CO₂/year</p>
                <p><strong>Your Footprint:</strong> ${footprintData.total.toFixed(0)} kg CO₂/year</p>
                <p style="margin-top: var(--space-8); ${difference > 0 ? 'color: var(--color-error)' : 'color: var(--color-success)'};">
                    ${difference > 0 ? `⚠️ ${percentDiff}% above` : `✅ ${Math.abs(percentDiff)}% below`} global average
                </p>
            `;

            const potential = footprintData.total * 0.3; // 30% reduction potential
            document.getElementById('reductionPotential').innerHTML = `
                <p><strong>By adopting 3-5 green habits, you could reduce your footprint by:</strong></p>
                <div style="font-size: 28px; color: var(--color-success); font-weight: 800; margin: var(--space-12) 0;">
                    ${potential.toFixed(0)} kg CO₂/year
                </div>
                <p style="color: var(--color-text-light); font-size: 14px;">That's equivalent to planting ${Math.ceil(potential / 20)} trees!</p>
            `;

            // Update emission chart
            drawEmissionChart();
        }

        function drawEmissionChart() {
            const canvas = document.getElementById('emissionChart');
            const chartViz = document.getElementById('chartVisualization');
            const noDataChart = document.getElementById('noDataChart');
            
            if (!footprintData.total || footprintData.total === 0) {
                if (chartViz) chartViz.style.display = 'none';
                if (noDataChart) noDataChart.style.display = 'block';
                document.getElementById('emissionTable').innerHTML = '';
                document.getElementById('offsetData').innerHTML = '';
                return;
            }

            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const data = {
                energy: footprintData.energy || 0,
                transport: footprintData.transport || 0,
                diet: (footprintData.diet || 0) + (footprintData.foodWaste || 0),
                waste: footprintData.waste || 0,
                water: footprintData.water || 0,
                shopping: footprintData.shopping || 0
            };

            const colors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];
            const total = Object.values(data).reduce((a, b) => a + b, 0);

            if (total === 0) {
                if (chartViz) chartViz.style.display = 'none';
                if (noDataChart) noDataChart.style.display = 'block';
                return;
            }

            // Show chart, hide no-data message
            if (chartViz) chartViz.style.display = 'block';
            if (noDataChart) noDataChart.style.display = 'none';

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Simple horizontal bar chart
            const barHeight = 50;
            const padding = 20;
            let y = padding;

            Object.entries(data).forEach(([category, value], index) => {
                if (value === 0) return;

                const percentage = (value / total) * 100;
                const barWidth = (percentage / 100) * (canvas.width - 250);

                // Category label
                ctx.fillStyle = '#1f2937';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText(capitalize(category), 15, y + 30);

                // Bar background
                ctx.fillStyle = '#e5e7eb';
                ctx.fillRect(200, y + 10, canvas.width - 250, barHeight);

                // Bar fill
                ctx.fillStyle = colors[index];
                ctx.fillRect(200, y + 10, barWidth, barHeight);

                // Percentage text
                ctx.fillStyle = '#1f2937';
                ctx.font = 'bold 13px sans-serif';
                ctx.fillText(`${percentage.toFixed(1)}%`, barWidth + 210, y + 40);

                y += barHeight + 15;
            });

            // Emission table
            let tableHtml = '';
            Object.entries(data).forEach(([category, value]) => {
                if (value > 0) {
                    const percentage = ((value / total) * 100).toFixed(1);
                    tableHtml += `
                        <tr>
                            <td><strong>${capitalize(category)}</strong></td>
                            <td>${value.toFixed(0)}</td>
                            <td>${percentage}%</td>
                        </tr>
                    `;
                }
            });
            document.getElementById('emissionTable').innerHTML = tableHtml;

            // Offset data
            document.getElementById('offsetData').innerHTML = `
                <ul style="margin-left: var(--space-20); color: var(--color-text-light);">
                    <li style="margin-bottom: var(--space-12);">🌳 <strong>${Math.ceil(total / 20)} trees</strong> needed to offset (20 years growth)</li>
                    <li style="margin-bottom: var(--space-12);">🏃 <strong>${Math.ceil(total / 0.27).toFixed(0)} km</strong> by public transit instead of driving</li>
                    <li style="margin-bottom: var(--space-12);">🥦 <strong>${Math.ceil(total / 2)} plant-based meals</strong> instead of meat-based</li>
                    <li style="margin-bottom: var(--space-12);">☀️ Switch to <strong>renewable energy</strong> to eliminate ~${Math.ceil((total * 0.4) / 50) * 50} kg CO₂</li>
                </ul>
            `;
        }

        // Cross-page data sync
        function syncDataAcrossPages() {
            // Load data on any page switch
            const stored = localStorage.getItem('footprintData');
            if (stored) {
                footprintData = JSON.parse(stored);
                updateImpactSummary();
            }
        }

        // Initialize on page load
        window.addEventListener('load', () => {
            renderHabits();
            syncDataAcrossPages();
            updateImpactSummary();
        });

        // Enhanced switchTab with proper data sync and chart rendering
        window.switchTab = function(tabName) {
            document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            window.scrollTo(0, 0);
            
            // Load latest data from storage
            const stored = localStorage.getItem('footprintData');
            if (stored) {
                footprintData = JSON.parse(stored);
            }
            
            // Update impact page data and chart
            if (tabName === 'impact') {
                updateImpactSummary();
                setTimeout(() => {
                    drawEmissionChart();
                }, 200);
            }
        };
