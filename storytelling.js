// Scrollytelling Implementation
// Loads data, calculates statistics, and creates scroll-driven story

// Use window namespace to avoid conflicts with app.js
window.storytelling = {
    data: null,
    calculator: null,
    viz: null,
    scroller: null
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Wait for container to be ready
        const container = document.getElementById('viz-container');
        if (!container) {
            console.error('Visualization container not found');
            return;
        }

        // Load data (check window.data first, then load if needed)
        if (window.data) {
            window.storytelling.data = window.data;
            console.log('Using existing data from app.js');
        } else {
            window.storytelling.data = await d3.json('swac_data.json');
            // Also set global data for compatibility
            window.data = window.storytelling.data;
            console.log('Data loaded:', window.storytelling.data.metadata);
        }

        // Initialize calculator
        window.storytelling.calculator = new StoryDataCalculator(window.storytelling.data);

        // Clear loading message immediately
        d3.select('#viz-container').html('');
        
        // Initialize visualization (reuse existing if available)
        if (window.viz && window.viz.data) {
            window.storytelling.viz = window.viz;
            console.log('Using existing visualization from app.js');
            // Make sure it updates for storytelling
            if (window.storytelling.viz.filterYearRange === undefined) {
                window.storytelling.viz.filterYearRange = null;
            }
            // Clear and reinitialize if needed
            if (window.storytelling.viz.svg) {
                window.storytelling.viz.setupSVG();
                window.storytelling.viz.updateVisualization();
            }
        } else {
            // Wait a bit to ensure container has proper dimensions
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Double-check container is cleared
            const container = document.getElementById('viz-container');
            if (container && container.innerHTML.includes('Loading')) {
                container.innerHTML = '';
            }
            
            // Initialize visualization
            try {
                window.storytelling.viz = new SWACVisualization(window.storytelling.data);
                // Also set global viz for compatibility
                window.viz = window.storytelling.viz;
                console.log('Visualization initialized successfully');
            } catch (error) {
                console.error('Error initializing visualization:', error);
                d3.select('#viz-container').html('<div class="loading">Error: ' + error.message + '</div>');
                throw error;
            }
        }
        
        // Generate story steps
        generateStorySteps();
        
        // Initialize scrollama after a short delay to ensure DOM is ready
        setTimeout(() => {
            initializeScrollytelling();
            
            // Trigger initial visualization update for first step
            const firstStep = document.querySelector('.step');
            if (firstStep) {
                const firstStepIndex = parseInt(firstStep.getAttribute('data-step')) || 0;
                const stepConfig = storytellingConfig.steps[firstStepIndex];
                if (stepConfig) {
                    const calc = getCalculator();
                    if (calc) {
                        const stepData = calc.calculateStepData(stepConfig);
                        updateVisualization(stepData);
                        updateYearIndicator(stepData);
                    }
                }
            }
        }, 200);
        
    } catch (error) {
        console.error('Error initializing:', error);
        d3.select('#viz-container').html('<div class="loading">Error loading data. Please check console.</div>');
    }
    
    // Setup chart type toggle for storytelling
    const chartTypeToggle = d3.select('#chart-type-toggle');
    const chartTypeMenu = d3.select('#chart-type-menu');
    const chartTypeItems = chartTypeMenu.selectAll('.chart-type-menu-item');
    
    if (!chartTypeToggle.empty() && !chartTypeMenu.empty()) {
        // Toggle menu visibility
        chartTypeToggle.on('click', (event) => {
            event.stopPropagation();
            const isVisible = chartTypeMenu.classed('visible');
            chartTypeMenu.classed('visible', !isVisible);
        });
        
        // Close menu when clicking outside
        d3.select('body').on('click', () => {
            chartTypeMenu.classed('visible', false);
        });
        
        // Prevent menu from closing when clicking inside
        chartTypeMenu.on('click', (event) => {
            event.stopPropagation();
        });
        
        // Handle menu item clicks
        chartTypeItems.on('click', function(event) {
            event.stopPropagation();
            const item = d3.select(this);
            const chartType = item.attr('data-type');
            
            // Update active state
            chartTypeItems.classed('active', false);
            item.classed('active', true);
            
            // Update visualization
            const currentViz = getViz();
            if (currentViz) {
                currentViz.chartType = chartType;
                currentViz.updateVisualization();
            }
            
            // Close menu after a short delay for better UX
            setTimeout(() => {
                chartTypeMenu.classed('visible', false);
            }, 100);
        });
        
        // Update menu active state when chart type changes programmatically
        const updateMenuState = () => {
            const currentViz = getViz();
            if (currentViz && currentViz.chartType) {
                chartTypeItems.classed('active', function() {
                    return d3.select(this).attr('data-type') === currentViz.chartType;
                });
            }
        };
        
        // Update menu state periodically (in case chart type changes elsewhere)
        setInterval(updateMenuState, 500);
        updateMenuState(); // Initial update
    }
});

// Helper function to get current data
function getData() {
    return window.storytelling.data || window.data || null;
}

// Helper function to get current calculator
function getCalculator() {
    return window.storytelling.calculator;
}

// Helper function to get current visualization
function getViz() {
    return window.storytelling.viz || window.viz || null;
}

// Generate HTML for story steps
function generateStorySteps() {
    const scrollSections = d3.select('#scroll-sections');
    scrollSections.html(''); // Clear existing

    const calc = getCalculator();
    if (!calc) {
        console.error('Calculator not initialized');
        return;
    }

    storytellingConfig.steps.forEach((stepConfig, index) => {
        // Calculate data for this step
        const stepData = calc.calculateStepData(stepConfig);
        
        // Create step element
        const step = scrollSections.append('section')
            .attr('class', 'step')
            .attr('data-step', index)
            .attr('data-year-range', stepData.visualization.yearRange 
                ? `${stepData.visualization.yearRange[0]}-${stepData.visualization.yearRange[1]}`
                : 'all');

        // Step content
        const content = step.append('div').attr('class', 'step-content');
        
        // Title
        content.append('h2')
            .attr('class', 'step-title')
            .text(stepData.title);

        // Narrative (generated from data)
        const narrative = generateNarrative(stepData);
        content.append('p')
            .attr('class', 'step-narrative')
            .text(narrative);

        // Data points
        const dataPoints = content.append('div').attr('class', 'data-points');
        displayDataPoints(dataPoints, stepData.calculatedData, stepConfig.dataPoints);
    });
}

// Generate narrative text from calculated data
function generateNarrative(stepData) {
    const data = stepData.calculatedData;
    const section = stepData.section;
    let narrative = '';

    switch (section) {
        case 'overview':
            narrative = `${data.total.toLocaleString()} publications over ${data.years} years. `;
            narrative += `Average ${data.average} publications per year. `;
            narrative += `Median ${data.median} publications per year.`;
            break;

        case 'temporal':
            if (data.period) {
                narrative = `${data.period}: ${data.total} publications. `;
            }
            if (data.average) {
                narrative += `Average ${data.average} publications per year. `;
            }
            if (data.peakYear && data.peakCount) {
                narrative += `Peak in ${data.peakYear} with ${data.peakCount} publications.`;
                if (data.significantIncrease) {
                    narrative += ` (+${data.significantIncrease.changePct}% increase from previous year).`;
                }
            }
            break;

        case 'topics':
            if (data.period) {
                narrative = `${data.period}: `;
            }
            if (data.dominantTopic && data.dominantPercentage) {
                narrative += `${data.dominantTopic} accounts for ${data.dominantPercentage}% of publications. `;
            }
            if (data.topTopics && data.topTopics.length > 0) {
                const top3 = data.topTopics.slice(0, 3);
                narrative += top3.map(t => `${t.topic} ${t.percentage}%`).join(', ') + '.';
            }
            if (data.transition) {
                narrative += ` Transition in ${data.transition.year}: ${data.transition.from} → ${data.transition.to}.`;
            }
            break;

        case 'series':
            if (data.series) {
                narrative = `${data.series}: Launched ${data.launchYear}`;
                if (data.endYear) {
                    narrative += `, ended ${data.endYear}. `;
                }
                narrative += `${data.total} publications over ${data.yearsActive} years. `;
                narrative += `Average ${data.averagePerYear} publications per year.`;
                if (data.total > 150) {
                    narrative += ` (largest series).`;
                }
            }
            break;

        case 'types':
            if (data.period) {
                narrative = `${data.period}: `;
            }
            if (data.dominantType) {
                narrative += `${data.dominantType} dominates.`;
            }
            break;

        case 'summary':
            narrative = `Summary: ${data.total.toLocaleString()} publications over ${data.years} years. `;
            if (data.peakYear && data.peakCount) {
                narrative += `Peak year ${data.peakYear} (${data.peakCount} publications). `;
            }
            narrative += `${data.seriesCount} series, ${data.topicsCount} topics, ${data.typesCount} document types. `;
            narrative += `Average ${data.average}, median ${data.median} publications per year.`;
            break;
    }

    return narrative || 'Data analysis for this period.';
}

// Display data points
function displayDataPoints(container, calculatedData, dataPointKeys) {
    dataPointKeys.forEach(key => {
        const value = calculatedData[key];
        if (value === null || value === undefined) return;

        const dataPoint = container.append('div').attr('class', 'data-point');
        
        // Label
        const label = formatLabel(key);
        dataPoint.append('span').attr('class', 'data-point-label').text(label + ':');
        
        // Value
        const formattedValue = formatValue(key, value);
        dataPoint.append('span').attr('class', 'data-point-value').text(formattedValue);
    });
}

// Format label
function formatLabel(key) {
    const labels = {
        'total': 'Total',
        'years': 'Years',
        'average': 'Average',
        'median': 'Median',
        'period': 'Period',
        'peakYear': 'Peak Year',
        'peakCount': 'Peak Count',
        'dominantTopic': 'Dominant Topic',
        'dominantPercentage': 'Dominant %',
        'series': 'Series',
        'launchYear': 'Launch Year',
        'endYear': 'End Year',
        'yearsActive': 'Years Active',
        'averagePerYear': 'Avg/Year',
        'seriesCount': 'Series Count',
        'topicsCount': 'Topics Count',
        'typesCount': 'Types Count',
        'transition': 'Transition',
        'significantIncrease': 'Significant Increase',
        'topTopics': 'Top Topics',
        'dominantType': 'Dominant Type',
        'typeDistribution': 'Type Distribution',
        'typeDistributionByDecade': 'Type Distribution by Decade'
    };
    return labels[key] || key;
}

// Format value
function formatValue(key, value) {
    if (value === null || value === undefined) return 'N/A';
    
    // Handle significantIncrease object
    if (key === 'significantIncrease' && typeof value === 'object' && value !== null) {
        if (value.change !== undefined && value.changePct !== undefined) {
            const changeStr = value.change > 0 ? `+${value.change}` : `${value.change}`;
            return `${changeStr} publications (+${value.changePct}%)`;
        }
        return JSON.stringify(value); // Fallback if structure is unexpected
    }
    
    // Handle transition object
    if (key === 'transition' && typeof value === 'object' && value !== null) {
        if (value.year !== undefined && value.from !== undefined && value.to !== undefined) {
            return `${value.year}: ${value.from} → ${value.to}`;
        }
        return JSON.stringify(value); // Fallback if structure is unexpected
    }
    
    if (key === 'dominantPercentage' && typeof value === 'string') {
        return value + '%';
    }
    if (key === 'average' || key === 'median' || key === 'averagePerYear') {
        return parseFloat(value).toFixed(1);
    }
    if (key === 'total' || key === 'peakCount' || key === 'yearsActive') {
        return value.toLocaleString();
    }
    if (key === 'topTopics' && Array.isArray(value)) {
        return value.map(t => `${t.topic} (${t.percentage}%)`).join(', ');
    }
    if (key === 'topSeries' && Array.isArray(value)) {
        return value.map(s => `${s.series} (${s.count})`).join(', ');
    }
    if (key === 'decades' && typeof value === 'object') {
        return Object.entries(value).map(([decade, data]) => 
            `${decade}: ${data.topic} (${data.percentage}%)`
        ).join('; ');
    }
    
    // Handle typeDistribution object (e.g., { "Report": 10, "Note": 5 })
    if (key === 'typeDistribution' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const entries = Object.entries(value);
        if (entries.length === 0) return 'N/A';
        // Sort by count descending and format
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        return sorted.map(([type, count]) => `${type}: ${count}`).join(', ');
    }
    
    // Handle typeDistributionByDecade object (e.g., { "1970s": { type: "Report", count: 10 } })
    if (key === 'typeDistributionByDecade' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const entries = Object.entries(value);
        if (entries.length === 0) return 'N/A';
        // Format each decade's dominant type
        return entries.map(([decade, data]) => {
            if (data && typeof data === 'object' && data.type && data.count !== undefined) {
                return `${decade}: ${data.type} (${data.count})`;
            }
            return `${decade}: ${JSON.stringify(data)}`;
        }).join('; ');
    }
    
    return value;
}

// Initialize scrollama
function initializeScrollytelling() {
    window.storytelling.scroller = scrollama();
    const scroller = window.storytelling.scroller;

    scroller
        .setup({
            step: '.step',
            offset: 0.5,
            progress: true,
            debug: false
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit)
        .onStepProgress(handleStepProgress);

    // Handle window resize
    window.addEventListener('resize', scroller.resize);
}

// Handle step enter
function handleStepEnter(response) {
    const stepIndex = response.index;
    const stepElement = response.element;
    
    // Update active state
    d3.selectAll('.step').classed('active', false);
    d3.select(stepElement).classed('active', true);
    
    // Get step configuration
    const stepConfig = storytellingConfig.steps[stepIndex];
    const calc = getCalculator();
    if (!calc) return;
    
    const stepData = calc.calculateStepData(stepConfig);
    
    // Update visualization
    updateVisualization(stepData);
    
    // Update year indicator
    updateYearIndicator(stepData);
}

// Handle step exit
function handleStepExit(response) {
    // Optional: handle step exit
}

// Handle step progress
function handleStepProgress(response) {
    // Optional: handle progress for smooth transitions
    const progress = response.progress;
    // Can use progress for smooth animations
}

// Update visualization based on step data
function updateVisualization(stepData) {
    const currentViz = getViz();
    if (!currentViz) {
        console.warn('Visualization not available');
        return;
    }

    const vizConfig = stepData.visualization;
    
    // Update dimension - map 'yearly' to 'topics' for visualization
    let dimensionToUse = vizConfig.dimension;
    if (dimensionToUse === 'yearly') {
        dimensionToUse = 'topics'; // Use topics dimension for yearly view
    }
    
    if (dimensionToUse && dimensionToUse !== currentViz.currentDimension) {
        currentViz.currentDimension = dimensionToUse;
    }
    
    // Update year range if specified
    if (vizConfig.yearRange) {
        // Set filterYearRange to limit the visualization to this range
        currentViz.filterYearRange = vizConfig.yearRange;
        console.log('Setting filterYearRange:', vizConfig.yearRange);
    } else {
        // Clear filter to show all years
        currentViz.filterYearRange = null;
    }
    
    // Update visualization (this will use filterYearRange to filter data and set xScale domain)
    currentViz.updateVisualization();
    
    // Highlight specific elements
    if (vizConfig.highlights && vizConfig.highlights.length > 0) {
        // Highlight logic would go here
        // This depends on how the visualization class handles highlights
    }
}

// Update year indicator
function updateYearIndicator(stepData) {
    const indicator = d3.select('#year-indicator');
    const yearRange = stepData.visualization.yearRange;
    
    if (yearRange && Array.isArray(yearRange) && yearRange.length === 2) {
        // Show current step's year range
        indicator.text(`Years: ${yearRange[0]}-${yearRange[1]}`);
    } else {
        // No year range specified for this step, hide the indicator
        indicator.text('');
    }
}

