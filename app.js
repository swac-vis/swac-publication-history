// SWAC Publications History Visualization - Minimalist Stream Graph
// Multi-dimensional, storytelling-focused visualization

class SWACVisualization {
    constructor(data) {
        this.data = data;
        this.currentDimension = 'series';
        this.isPlaying = false;
        this.currentYear = data.metadata.year_range.min;
        this.selectedStreamKey = null; // Track selected stream by key
        this.selectedCategories = new Set(); // Track selected categories from legend
        this.hoverYear = null; // Track currently hovered year
        
        // Setup
        this.setupSVG();
        this.setupControls();
        this.setupTooltip();
        this.setupNarrative();
        
        // Initial render
        this.updateVisualization();
        this.updateStats();
    }
    
    setupSVG() {
        // Balanced margins and responsive width to fill container
        this.margin = {top: 40, right: 60, bottom: 60, left: 60};
        const container = d3.select('#viz-container').node();
        const containerWidth = container ? container.getBoundingClientRect().width : 1200;
        this.width = Math.max(300, containerWidth - this.margin.left - this.margin.right);
        this.height = 600 - this.margin.top - this.margin.bottom;
        
        // Clear container
        d3.select('#viz-container').selectAll('*').remove();
        
        // Create SVG
        this.svg = d3.select('#viz-container')
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        
        // Main group
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Corner year indicator (top-left)
        this.cornerYear = this.svg.append('text')
            .attr('class', 'corner-year')
            .attr('x', this.margin.left)
            .attr('y', 18)
            .attr('text-anchor', 'start')
            .text('');
        
        // Create clip path for animation (initially full width)
        const defs = this.svg.append('defs');
        this.clipPathGroup = defs.append('clipPath')
            .attr('id', 'year-clip');
        this.clipPathGroup.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        
        // Unified vintage newspaper palette for all dimensions
        const vintageColors = [
            // terracotta reds (slightly muted)
            '#b3574d', '#c56a5a',
            // ochre/mustard (toned down)
            '#d29a4c', '#d8aa59', '#e0be7a',
            // dusty blues (darker)
            '#4f6d88', '#5f87a7', '#6b8fa2',
            // sage/teal greens (muted)
            '#5f8066', '#6f9589', '#86a993',
            // mauve/rose (desaturated)
            '#7a5f7f', '#94707a',
            // beiges/warm neutrals
            '#c7b59d', '#b2987a', '#9a7f63', '#d3c4b4',
            // supportive grays
            '#848683', '#9a9c99'
        ];
        const unifiedScale = d3.scaleOrdinal(vintageColors);
        this.colorScales = {
            series: unifiedScale,
            topics: unifiedScale,
            type: unifiedScale,
            author: unifiedScale
        };
        
        // Setup scales (will be initialized after data is loaded)
        this.xScale = null;
    }
    
    setupControls() {
        // Dimension selector
        d3.select('#dimension-select')
            .on('change', () => {
                this.currentDimension = d3.select('#dimension-select').property('value');
                this.updateVisualization(true); // Clear categories on dimension change
                this.updateStats();
            });
        
        // Play button
        d3.select('#play-btn')
            .on('click', () => this.togglePlayback());
        
        // Story journeys button
        if (!d3.select('#story-btn').node()) {
            d3.select('.controls')
                .append('div')
                .attr('class', 'control-group')
                .append('button')
                .attr('id', 'story-btn')
                .attr('class', 'btn-play')
                .text('Story Journeys')
                .on('click', () => this.showStoryMenu());
        }
        
        // Removed scrollytelling prototype per request
        d3.select('#scrolly-btn').remove();
    }
    
    // Show curated story journeys menu
    showStoryMenu() {
        const stories = [
            {
                title: 'The Rise of Urban Research',
                description: 'Explore how urbanization became a central theme, from early studies to comprehensive Africapolis series.',
                filter: {dimension: 'topics', value: 'Urban', highlight: true}
            },
            {
                title: 'Series Evolution: From ECOLOC to Africapolis',
                description: 'Trace the evolution of major publication series, their lifecycles and thematic shifts.',
                filter: {dimension: 'series', highlight: ['Africapolis', 'ECOLOC', 'Maps and Facts']}
            },
            {
                title: 'Document Types Transformation',
                description: 'Document types over time.',
                filter: {dimension: 'type', highlight: true}
            }
        ];
        
        // Create overlay menu
        const menu = d3.select('body')
            .selectAll('.story-menu-overlay')
            .data([0])
            .join('div')
            .attr('class', 'story-menu-overlay')
            .style('position', 'fixed')
            .style('top', '0')
            .style('left', '0')
            .style('width', '100%')
            .style('height', '100%')
            .style('background', 'rgba(0,0,0,0.5)')
            .style('z-index', '2000')
            .style('display', 'flex')
            .style('justify-content', 'center')
            .style('align-items', 'center')
            .on('click', function() {
                d3.select(this).remove();
            });
        
        const menuContent = menu.append('div')
            .attr('class', 'story-menu-content')
            .style('background', '#fbf7ef')
            .style('padding', '30px')
            .style('border-radius', '12px')
            .style('max-width', '600px')
            .style('border', '1px solid #e3dccb')
            .style('box-shadow', '0 8px 32px rgba(0,0,0,0.15)')
            .on('click', function(event) {
                event.stopPropagation();
            });
        
        menuContent.append('h3')
            .style('margin-bottom', '20px')
            .style('color', '#2b2b2b')
            .text('Choose a Story Journey');
        
        const storyItems = menuContent.selectAll('.story-item')
            .data(stories)
            .enter()
            .append('div')
            .attr('class', 'story-item')
            .style('margin-bottom', '15px')
            .style('padding', '15px')
            .style('border', '1px solid #e3dccb')
            .style('border-radius', '8px')
            .style('cursor', 'pointer')
            .style('transition', 'all 0.2s')
            .on('mouseenter', function() {
                d3.select(this).style('background', '#f1e9d8').style('border-color', '#8c6d5a');
            })
            .on('mouseleave', function() {
                d3.select(this).style('background', 'transparent').style('border-color', '#e3dccb');
            })
            .on('click', (event, d) => {
                this.startStoryJourney(d);
                menu.remove();
            });
        
        storyItems.append('div')
            .attr('class', 'story-title')
            .style('font-weight', '600')
            .style('font-size', '1.1rem')
            .style('color', '#2b2b2b')
            .style('margin-bottom', '8px')
            .text(d => d.title);
        
        storyItems.append('div')
            .attr('class', 'story-description')
            .style('font-size', '0.9rem')
            .style('color', '#6b665e')
            .style('line-height', '1.5')
            .text(d => d.description);
        
        // Close button
        menuContent.append('button')
            .style('position', 'absolute')
            .style('top', '15px')
            .style('right', '15px')
            .style('background', 'none')
            .style('border', 'none')
            .style('font-size', '1.5rem')
            .style('cursor', 'pointer')
            .style('color', '#999')
            .text('×')
            .on('click', () => menu.remove());
    }
    
    // Start a curated story journey
    startStoryJourney(story) {
        const {filter} = story;
        
        // Switch dimension if needed
        if (filter.dimension !== this.currentDimension) {
            d3.select('#dimension-select').property('value', filter.dimension);
            this.currentDimension = filter.dimension;
        }
        
        // Update visualization
        this.updateVisualization(true);
        
        // Show narrative
        this.showNarrative(story.title, story.description);
        
        // Highlight specific streams if specified
        if (filter.highlight && Array.isArray(filter.highlight)) {
            setTimeout(() => {
                filter.highlight.forEach(streamName => {
                    const legendItem = d3.selectAll('.legend-item')
                        .filter((d, i, nodes) => d3.select(nodes[i]).text().includes(streamName));
                    if (!legendItem.empty()) {
                        legendItem.dispatch('click');
                    }
                });
            }, 500);
        } else if (filter.value) {
            setTimeout(() => {
                const legendItem = d3.selectAll('.legend-item')
                    .filter((d, i, nodes) => d3.select(nodes[i]).text().includes(filter.value));
                if (!legendItem.empty()) {
                    legendItem.dispatch('click');
                }
            }, 500);
        }
        
        // Auto-hide narrative after 6 seconds
        setTimeout(() => this.hideNarrative(), 6000);
    }
    
    setupTooltip() {
        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip');
    }
    
    setupNarrative() {
        d3.select('.close-btn')
            .on('click', () => this.hideNarrative());
        d3.select('.close-btn-publications')
            .on('click', () => this.hidePublicationList());
    }
    
    // Prepare data based on selected dimension
    prepareData() {
        const dimension = this.currentDimension;
        // Use metadata year range so the axis and data extend to declared bounds
        const yearRange = this.data.metadata.year_range;
        const years = d3.range(yearRange.min, yearRange.max + 1);
        
        let dimensionValues = [];
        const valuesByYear = {};
        
        // Initialize year data
        years.forEach(year => {
            valuesByYear[year] = {};
        });
        
        // Collect all unique values for this dimension
        this.data.publications.forEach(pub => {
            let value = null;
            
            switch(dimension) {
                case 'series':
                    value = pub.series || 'Uncategorized';
                    break;
                case 'topics':
                    if (pub.topics && pub.topics.length > 0) {
                        pub.topics.forEach(topic => {
                            if (!dimensionValues.includes(topic)) {
                                dimensionValues.push(topic);
                            }
                            if (!valuesByYear[pub.year][topic]) {
                                valuesByYear[pub.year][topic] = 0;
                            }
                            valuesByYear[pub.year][topic]++;
                        });
                    }
                    return; // Handle topics separately
                case 'type':
                    value = pub.type || 'Unknown';
                    break;
                case 'author':
                    if (pub.author) {
                        // Split authors and count each one
                        const authors = pub.author.split(',').map(a => a.trim()).filter(a => a);
                        authors.forEach(author => {
                            if (!dimensionValues.includes(author)) {
                                dimensionValues.push(author);
                            }
                            if (!valuesByYear[pub.year][author]) {
                                valuesByYear[pub.year][author] = 0;
                            }
                            valuesByYear[pub.year][author]++;
                        });
                    }
                    return; // Handle authors separately
            }
            
            if (value && !dimensionValues.includes(value)) {
                dimensionValues.push(value);
            }
            
            if (!valuesByYear[pub.year][value]) {
                valuesByYear[pub.year][value] = 0;
            }
            valuesByYear[pub.year][value]++;
        });
        
        // Sort and filter top values for readability
        const valueCounts = {};
        dimensionValues.forEach(val => {
            let total = 0;
            years.forEach(year => {
                total += valuesByYear[year][val] || 0;
            });
            valueCounts[val] = total;
        });
        
        // Get top 12 values for better visualization
        const allTopValues = dimensionValues
            .sort((a, b) => valueCounts[b] - valueCounts[a])
            .slice(0, 12);
        
        // Filter based on selected categories
        let topValues = allTopValues;
        if (this.selectedCategories.size > 0) {
            topValues = topValues.filter(val => this.selectedCategories.has(val));
        }
        
        // Create stacked data
        const stackedData = years.map(year => {
            const result = {year: year};
            topValues.forEach(val => {
                result[val] = valuesByYear[year][val] || 0;
            });
            return result;
        });
        
        // Create lookup for total counts per value
        const totalsLookup = {};
        allTopValues.forEach(val => {
            totalsLookup[val] = valueCounts[val];
        });
        
        return {stackedData, topValues, allTopValues, totalsLookup};
    }
    
    // Create stream graph
    createStreamGraph() {
        const {stackedData, topValues, allTopValues, totalsLookup} = this.prepareData();
        
        // Recreate xScale using metadata year range (e.g., to 2025)
        this.xScale = d3.scaleLinear()
            .domain([this.data.metadata.year_range.min, this.data.metadata.year_range.max])
            .range([0, this.width]);
        
        // Store totals lookup for tooltips
        this.totalsLookup = totalsLookup;
        this.allTopValues = allTopValues; // Store for legend
        
        // Stack generator
        const stack = d3.stack()
            .keys(topValues)
            .order(d3.stackOrderInsideOut);
        
        // Streamgraph baseline: use 'silhouette' so single或多系列都居中悬浮
        stack.offset(d3.stackOffsetSilhouette);
        
        const series = stack(stackedData);
        
        // Y scale: allow negative minima for centered/streamgraph baselines
        const yMax = d3.max(series, d => d3.max(d, d => d[1]));
        const yMin = d3.min(series, d => d3.min(d, d => d[0]));
        
        this.yScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([this.height, 0]);
        
        // Area generator with smooth curves
        const area = d3.area()
            .x(d => this.xScale(d.data.year))
            .y0(d => this.yScale(d[0]))
            .y1(d => this.yScale(d[1]))
            .curve(d3.curveCatmullRom.alpha(0.5)); // Smooth curves
        
        // Remove old paths
        this.g.selectAll('.stream-area').remove();
        this.g.selectAll('.stream-label').remove();
        this.g.selectAll('.stream-keyword').remove();
        
        // Create paths
        const colorScale = this.colorScales[this.currentDimension];
        
        // Build index map for colors based on allTopValues
        const colorIndexMap = {};
        this.allTopValues.forEach((val, i) => {
            colorIndexMap[val] = i;
        });
        
        const streamAreas = this.g.selectAll('.stream-area')
            .data(series)
            .enter()
            .append('path')
            .attr('class', 'stream-area')
            .attr('fill', d => colorScale(colorIndexMap[d.key]))
            .attr('stroke', '#efe7d7')
            .attr('stroke-width', 0.5)
            .attr('d', area)
            .each(function(d) {
                // Store the data on the path element for keyword placement
                d3.select(this).datum(d);
            });
        
        // Add keyword watermarks on streams
        this.addStreamKeywords(streamAreas, stackedData);
        
        // Add labels
        if (topValues.length <= 8) {
            series.forEach((d, i) => {
                const lastPoint = d[d.length - 1];
                const x = this.xScale(lastPoint.data.year) + 10;
                const y = (this.yScale(lastPoint[0]) + this.yScale(lastPoint[1])) / 2;
                
                this.g.append('text')
                    .attr('class', 'stream-label')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('text-anchor', 'start')
                    .text(() => {
                        let label = topValues[i];
                        return label.length > 20 ? label.substring(0, 20) + '...' : label;
                    });
            });
        }
        
        // Add hover interactions
        streamAreas
            .on('mouseenter', (event, d) => {
                d3.select(event.currentTarget)
                    .transition()
                    .attr('opacity', 1)
                    .attr('stroke-width', 1.5);
                
                // Show hint in tooltip
                this.showTooltipHint(event, 'Double-click to see publications');
            })
            .on('mousemove', (event, d) => {
                // Calculate which point we're hovering over
                const rect = this.g.node().getBoundingClientRect();
                const mouseX = event.clientX - rect.left; // rect is already for the translated <g>
                const invertedYear = Math.round(this.xScale.invert(mouseX));
                
                // Find the closest data point
                let closestPoint = d[0];
                let minDistance = Infinity;
                d.forEach(point => {
                    const distance = Math.abs(point.data.year - invertedYear);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPoint = point;
                    }
                });
                
                // Cache the hover year for double click
                this.hoverYear = closestPoint.data.year;
                
                // Do not update corner indicator on hover (playback only)
                
                this.showTooltip(event, closestPoint, d.key);
            })
            .on('mouseleave', (event) => {
                // Only dim if not selected
                const streamKey = event.currentTarget.__data__.key;
                if (this.selectedStreamKey !== streamKey) {
                    d3.select(event.currentTarget)
                        .transition()
                        .attr('opacity', 0.85)
                        .attr('stroke-width', 0.5);
                }
                
                this.hideTooltip();
            })
            .on('click', (event, d) => {
                event.stopPropagation();
                this.selectStream(event.currentTarget, d);
            })
            .on('dblclick', (event, d) => {
                event.stopPropagation();
                this.showPublicationList(d.key, this.hoverYear);
            })
            .style('cursor', 'pointer');
    }
    
    // Add axes and year markers
    addAxes() {
        // Remove old axes
        this.g.selectAll('.axis').remove();
        
        // X axis
        const xAxis = d3.axisBottom(this.xScale)
            .ticks(12)
            .tickFormat(d3.format('d'));
        
        this.g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${this.height})`)
            .call(xAxis)
            .selectAll('text')
            .style('fill', '#666')
            .style('font-size', '11px');
        
        // Grid lines
        this.g.selectAll('.grid-line').remove();
        
        const gridLines = this.g.selectAll('.grid-line')
            .data(this.xScale.ticks(12))
            .enter()
            .append('g');
        
        gridLines.append('line')
            .attr('class', 'year-marker')
            .attr('x1', d => this.xScale(d))
            .attr('x2', d => this.xScale(d))
            .attr('y1', 0)
            .attr('y2', this.height);
        
        // Add key event markers
        this.addKeyEventMarkers();
    }
    
    // Detect and mark key events (peaks, first appearances, dramatic changes)
    detectKeyEvents() {
        const {stackedData, topValues} = this.prepareData();
        const events = [];
        
        // Calculate total publications per year
        const yearlyTotals = {};
        stackedData.forEach(d => {
            yearlyTotals[d.year] = topValues.reduce((sum, key) => sum + (d[key] || 0), 0);
        });
        
        const years = Object.keys(yearlyTotals).map(Number).sort((a, b) => a - b);
        const values = years.map(y => yearlyTotals[y]);
        
        // Detect peaks (local maxima)
        for (let i = 1; i < values.length - 1; i++) {
            if (values[i] > values[i-1] && values[i] > values[i+1] && values[i] > 20) {
                const totalIncrease = values[i] / Math.max(values[i-1], 1) - 1;
                if (totalIncrease > 0.3) { // 30% increase
                    events.push({
                        year: years[i],
                        type: 'peak',
                        message: `Peak year: ${values[i]} publications (+${Math.round(totalIncrease * 100)}%)`,
                        value: values[i]
                    });
                }
            }
        }
        
        // Detect topic structure shifts (use publications_by_year topic distributions)
        try {
            const topicShiftEvents = this.detectTopicShifts();
            topicShiftEvents.forEach(e => events.push(e));
        } catch (e) {
            // ignore if not available
        }
        
        // Detect first appearances for top streams
        topValues.forEach(streamKey => {
            let firstYear = null;
            for (let d of stackedData) {
                if (d[streamKey] > 0) {
                    firstYear = d.year;
                    break;
                }
            }
            if (firstYear && firstYear <= this.data.metadata.year_range.min + 5) {
                events.push({
                    year: firstYear,
                    type: 'first',
                    message: `First appearance: ${streamKey}`,
                    value: 0,
                    stream: streamKey
                });
            }
        });
        
        // Limit to most significant events
        return events.slice(0, 10).sort((a, b) => a.year - b.year);
    }
    
    // Compute topic distribution shifts and return notable years
    detectTopicShifts() {
        const pby = this.data.publications_by_year || {};
        const years = Object.keys(pby).map(Number).sort((a, b) => a - b);
        const distByYear = {};
        const allTopics = new Set();
        
        years.forEach(y => {
            const pubs = pby[y] || [];
            const counts = {};
            pubs.forEach(pub => {
                if (pub.topics && pub.topics.length) {
                    pub.topics.forEach(t => {
                        counts[t] = (counts[t] || 0) + 1;
                        allTopics.add(t);
                    });
                }
            });
            const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
            distByYear[y] = {counts, total};
        });
        
        const topics = Array.from(allTopics);
        function vectorForYear(y) {
            const {counts, total} = distByYear[y] || {counts: {}, total: 1};
            return topics.map(t => (counts[t] || 0) / total);
        }
        function cosine(a, b) {
            let dot = 0, na = 0, nb = 0;
            for (let i = 0; i < a.length; i++) {
                dot += a[i] * b[i];
                na += a[i] * a[i];
                nb += b[i] * b[i];
            }
            if (na === 0 || nb === 0) return 0;
            return dot / (Math.sqrt(na) * Math.sqrt(nb));
        }
        
        const events = [];
        for (let i = 1; i < years.length; i++) {
            const yPrev = years[i-1];
            const y = years[i];
            const vPrev = vectorForYear(yPrev);
            const v = vectorForYear(y);
            const sim = cosine(vPrev, v);
            const shift = 1 - sim; // 0~1
            if (shift > 0.35) { // notable shift
                // Extract top keywords (titles) for the year for context
                const pubs = (pby[y] || []).slice(0, 50);
                const kw = this.extractKeywordCountsFromTitles(pubs).sorted
                    .slice(0, 3)
                    .map(e => e.word)
                    .join(', ');
                events.push({
                    year: y,
                    type: 'topicShift',
                    message: `Topic focus shift; top keywords: ${kw}`,
                    value: shift
                });
            }
        }
        return events;
    }
    
    // Add visual markers for key events on timeline
    addKeyEventMarkers() {
        // Remove old markers
        this.g.selectAll('.event-marker').remove();
        this.g.selectAll('.event-annotation').remove();
        this.g.selectAll('.event-leader').remove();
        
        const events = this.detectKeyEvents();
        if (events.length === 0) return;
        
        // Top time band baseline (slightly above chart)
        const bandY = -14;
        
        events.forEach((event, i) => {
            const x = this.xScale(event.year);
            
            // Leader line from top of plot to band
            this.g.append('line')
                .attr('class', 'event-leader')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', bandY + 6)
                .attr('stroke', '#cfc6b6')
                .attr('stroke-width', 0.8)
                .attr('stroke-dasharray', '2,2')
                .style('pointer-events', 'none');
            
            // Marker circle in the top band
            const marker = this.g.append('circle')
                .attr('class', 'event-marker')
                .attr('cx', x)
                .attr('cy', bandY)
                .attr('r', 4)
                .attr('fill', event.type === 'peak' ? '#b3574d' : event.type === 'first' ? '#d29a4c' : '#5f87a7')
                .attr('stroke', '#fff')
                .attr('stroke-width', 1)
                .style('cursor', 'default')
                .style('opacity', 0.85)
                .on('mouseenter', () => {
                    // Remove existing callouts
                    this.g.selectAll('.event-callout').remove();
                    
                    // Build inline callout next to the dot
                    const callout = this.g.append('g')
                        .attr('class', 'event-callout');
                    const px = x + 8;
                    const py = bandY - 16;
                    const text = callout.append('text')
                        .attr('x', px + 8)
                        .attr('y', py)
                        .attr('dominant-baseline', 'hanging')
                        .attr('font-size', '10px')
                        .attr('fill', '#2b2b2b')
                        .text(`${event.year} · ${event.message}`);
                    // Background
                    const bbox = text.node().getBBox();
                    callout.insert('rect', 'text')
                        .attr('x', bbox.x - 6)
                        .attr('y', bbox.y - 4)
                        .attr('rx', 4)
                        .attr('ry', 4)
                        .attr('width', bbox.width + 12)
                        .attr('height', bbox.height + 8)
                        .attr('fill', '#fbf7ef')
                        .attr('stroke', '#e3dccb')
                        .attr('stroke-width', 1)
                        .attr('opacity', 0.98);
                })
                .on('mouseleave', () => {
                    this.g.selectAll('.event-callout').remove();
                });
            
            // Year label near marker (sparse)
            if (i % 2 === 0) {
                this.g.append('text')
                    .attr('class', 'event-annotation')
                    .attr('x', x)
                    .attr('y', bandY - 6)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '9px')
                    .attr('fill', '#6b665e')
                    .text(event.year);
            }
        });
    }
    
    // Lightweight side panel to show event details
    showEventDetail(title, content) {
        const panel = d3.select('body')
            .selectAll('.event-detail')
            .data([0])
            .join('div')
            .attr('class', 'event-detail')
            .style('position', 'fixed')
            .style('top', '60px')
            .style('right', '24px')
            .style('width', '320px')
            .style('max-width', '90%')
            .style('background', '#fbf7ef')
            .style('border', '1px solid #e3dccb')
            .style('border-radius', '10px')
            .style('box-shadow', '0 8px 24px rgba(0,0,0,0.12)')
            .style('padding', '14px 16px')
            .style('z-index', '1500');
        
        panel.html('');
        panel.append('div')
            .style('font-weight', '600')
            .style('font-size', '1rem')
            .style('color', '#2b2b2b')
            .style('margin-bottom', '6px')
            .text(title);
        panel.append('div')
            .style('font-size', '0.9rem')
            .style('line-height', '1.5')
            .style('color', '#6b665e')
            .text(content);
        panel.append('button')
            .style('position', 'absolute')
            .style('top', '8px')
            .style('right', '10px')
            .style('background', 'none')
            .style('border', 'none')
            .style('font-size', '1.2rem')
            .style('color', '#999')
            .style('cursor', 'pointer')
            .text('×')
            .on('click', () => d3.select('.event-detail').remove());
    }
    
    showTooltip(event, point, dimensionValue) {
        // Get the actual count for this year from the original data
        const year = point.data.year;
        const count = point.data[dimensionValue] || 0;
        
        this.updateTooltipContent(dimensionValue, year, count);
        this.moveTooltip(event);
    }
    
    updateTooltipContent(dimensionValue, year, count) {
        this.tooltip.html(`
            <div class="tooltip-title">${dimensionValue}</div>
            <div class="tooltip-content">${year}: ${Math.round(count)} publication${count !== 1 ? 's' : ''}</div>
        `)
        .classed('visible', true);
    }
    
    showTooltipHint(event, hint) {
        this.tooltip.html(`
            <div class="tooltip-content">${hint}</div>
        `)
        .classed('visible', true);
        this.moveTooltip(event);
    }
    
    moveTooltip(event) {
        this.tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
    }
    
    hideTooltip() {
        this.tooltip.classed('visible', false);
    }
    
    showNarrative(title, text) {
        d3.select('#narrative-title').text(title);
        d3.select('#narrative-text').text(text);
        d3.select('#narrative').classed('hidden', false);
    }
    
    hideNarrative() {
        d3.select('#narrative').classed('hidden', true);
    }
    
    showPublicationList(dimensionValue, year = null) {
        // Filter publications based on dimension and value
        let filteredPubs = this.data.publications.filter(pub => {
            switch(this.currentDimension) {
                case 'series':
                    return pub.series === dimensionValue;
                case 'topics':
                    return pub.topics && pub.topics.includes(dimensionValue);
                case 'type':
                    return pub.type === dimensionValue;
                case 'author':
                    return pub.author && pub.author.split(',').map(a => a.trim()).includes(dimensionValue);
                default:
                    return false;
            }
        });
        
        // If year is specified, filter by year
        if (year !== null) {
            filteredPubs = filteredPubs.filter(pub => pub.year === year);
        }
        
        // Update title
        const yearText = year ? ` ${year}` : '';
        d3.select('#publication-list-title').text(
            `${dimensionValue}${yearText} Publications (${filteredPubs.length} total)`
        );
        
        // Create list
        const listContainer = d3.select('#publication-list-items');
        listContainer.html('');
        
        if (filteredPubs.length === 0) {
            listContainer.html('<p style="color: #999; padding: 20px; text-align: center;">No publications found</p>');
        } else {
            const listItems = listContainer.selectAll('.pub-item')
                .data(filteredPubs)
                .enter()
                .append('div')
                .attr('class', 'pub-item');
            
            // Only show year if not filtered by specific year
            if (year === null) {
                listItems.append('div')
                    .attr('class', 'pub-year')
                    .text(d => d.year);
            }
            
            listItems.append('div')
                .attr('class', 'pub-title')
                .text(d => d.title);
        }
        
        // Show overlay
        d3.select('#publication-list-overlay').classed('hidden', false);
        d3.select('#narrative').classed('hidden', true); // Hide narrative if open
    }
    
    hidePublicationList() {
        d3.select('#publication-list-overlay').classed('hidden', true);
    }
    
    selectStream(element, data) {
        // Clear previous selection
        if (this.selectedStreamKey !== data.key) {
            this.selectedStreamKey = data.key;
            
            // Hide all others and highlight selected
            const viz = this;
            d3.selectAll('.stream-area')
                .each(function(d) {
                    const node = d3.select(this);
                    if (d.key === viz.selectedStreamKey) {
                        node
                            .classed('selected', true)
                            .attr('stroke', '#8c6d5a')
                            .attr('stroke-width', 2.5)
                            .attr('opacity', 1);
                    } else {
                        node
                            .classed('selected', false)
                            .attr('stroke', 'white')
                            .attr('stroke-width', 0.5)
                            .attr('opacity', 0);
                    }
                });
            
            // Show narrative for selected stream
            const total = this.totalsLookup[data.key] || 0;
            this.showNarrative(
                data.key,
                `Total: ${total} publications across ${data.length} years`
            );
        } else {
            // Deselect if clicking the same stream
            this.selectedStreamKey = null;
            d3.selectAll('.stream-area')
                .classed('selected', false)
                .attr('opacity', 0.85)
                .attr('stroke-width', 0.5)
                .attr('stroke', 'white');
        }
    }
    
    updateVisualization(clearCategories = false) {
        // Clear selection
        this.selectedStreamKey = null;
        
        // Clear categories only when explicitly requested (dimension change)
        if (clearCategories) {
            this.selectedCategories.clear();
        }
        
        // Reset animation Y scales when dimension or selection changes
        this.animationYMax = null;
        this.animationYMin = null;
        
        // Remove clip path to show full visualization
        this.g.attr('clip-path', null);
        
        // Clear corner year when not playing
        if (!this.isPlaying && this.cornerYear) this.cornerYear.text('');
        
        this.createStreamGraph();
        this.addAxes();
        this.updateLegend();
        
        // Re-add key event markers after visualization update
        if (this.xScale) {
            this.addKeyEventMarkers();
        }
        
        // Show appropriate narrative
        const narratives = {
            series: 'Series Evolution',
            topics: 'Thematic Focus',
            type: 'Publication Types',
            author: 'Contributor Network'
        };
        
        const descriptions = {
            series: 'Watch how different publication series emerge, grow, and evolve over time.',
            topics: 'Explore the shifting thematic priorities in SWAC\'s research agenda.',
            type: 'Observe the changing formats of knowledge production and dissemination.',
            author: 'Discover key contributors and their evolving participation over the years.'
        };
        
        // Briefly show narrative on dimension change (removed per request)
        // this.showNarrative(narratives[this.currentDimension], descriptions[this.currentDimension]);
        // setTimeout(() => this.hideNarrative(), 4000);
    }
    
    addStreamKeywords(streamAreas, stackedData) {
        // Place keywords at exact (topic, year) positions and ensure readability
        const publicationsByYear = this.data.publications_by_year;
        const yearRange = this.data.metadata.year_range;
        const currentDimension = this.currentDimension;
        const g = this.g;
        const vis = this;
        const placedBoxes = [];
        const PADDING = 6;
        const VERTICAL_OFFSETS = [0, -12, 12, -24, 24, -36, 36];

        function intersects(a, b, pad) {
            return !(
                a.x + a.width + pad <= b.x ||
                b.x + b.width + pad <= a.x ||
                a.y + a.height + pad <= b.y ||
                b.y + b.height + pad <= a.y
            );
        }

        // Build a quick lookup from seriesData by year for y0/y1
        function pointForYear(seriesData, year) {
            for (let i = 0; i < seriesData.length; i++) {
                if (seriesData[i].data.year === year) {
                    return seriesData[i];
                }
            }
            return null;
        }

        streamAreas.each(function(seriesData) {
            const streamKey = seriesData.key;

            for (let year = yearRange.min; year <= yearRange.max; year++) {
                const yearStr = String(year);
                const yearPubs = publicationsByYear[yearStr] || [];

                // Filter publications to match current stream key and dimension
                const matchedPubs = yearPubs.filter(pub => {
                    switch (currentDimension) {
                        case 'series':
                            return pub.series === streamKey;
                        case 'topics':
                            return pub.topics && pub.topics.includes(streamKey);
                        case 'type':
                            return pub.type === streamKey;
                        case 'author':
                            return pub.author && pub.author.split(',').map(a => a.trim()).includes(streamKey);
                        default:
                            return false;
                    }
                });

                if (matchedPubs.length === 0) continue;

                // Extract keyword counts for this (topic, year)
                const keywordStats = vis.extractKeywordCountsFromTitles(matchedPubs);
                if (keywordStats.sorted.length === 0) continue;
                const topEntry = keywordStats.sorted[0];
                const keyword = topEntry.word;
                const kCount = topEntry.count;

                // Find y0/y1 at this exact year on the series
                const pt = pointForYear(seriesData, year);
                if (!pt) continue;

                const x = vis.xScale(year);
                const yTop = vis.yScale(pt[0]);
                const yBottom = vis.yScale(pt[1]);
                const bandCenterY = (yTop + yBottom) / 2;
                const bandHalf = Math.abs(yBottom - yTop) / 2;

                // Try to place without overlap by nudging vertically within the band
                let placed = false;
                for (const dy of VERTICAL_OFFSETS) {
                    const yCandidate = bandCenterY + dy;
                    if (Math.abs(yCandidate - bandCenterY) > bandHalf * 0.9) continue; // keep inside band

                    // Create invisible text to measure
                    const text = g.append('text')
                        .attr('class', 'stream-keyword')
                        .attr('x', x)
                        .attr('y', yCandidate)
                        .attr('text-anchor', 'middle')
                        .attr('dy', '0.35em')
                        .attr('fill', '#ffffff')
                        .attr('stroke', 'rgba(0,0,0,0.45)')
                        .attr('stroke-width', 1)
                        .attr('paint-order', 'stroke fill')
                        .attr('font-size', () => {
                            const minCount = Math.max(1, keywordStats.min);
                            const maxCount = Math.max(minCount + 1, keywordStats.max);
                            const t = (kCount - minCount) / (maxCount - minCount);
                            const size = 10 + t * 18; // 10px to 28px
                            // Cap by band height to avoid overflow
                            const maxSizeByBand = Math.max(10, Math.min(28, bandHalf * 0.8));
                            return Math.min(size, maxSizeByBand);
                        })
                        .attr('font-weight', '500')
                        .style('opacity', 0)
                        .text(keyword);

                    try {
                        const bbox = text.node().getBBox();
                        const candidate = {x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height};
                        const hasOverlap = placedBoxes.some(box => intersects(box, candidate, PADDING));
                        if (hasOverlap) {
                            text.remove();
                        } else {
                            placedBoxes.push(candidate);
                            text.style('opacity', 1);
                            placed = true;
                            break;
                        }
                    } catch (e) {
                        text.remove();
                    }
                }

                // If cannot place within band without overlap, skip to keep clarity
                if (!placed) {
                    continue;
                }
            }
        });
    }
    
    extractKeywordsFromTitles(publications) {
        // Common stop words to ignore (English and French)
        const stopWords = new Set([
            'the', 'of', 'and', 'in', 'to', 'for', 'a', 'an', 'on', 'with', 'by',
            'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has',
            'le', 'la', 'les', 'de', 'des', 'du', 'et', 'en', 'dans', 'pour',
            'sur', 'par', 'avec', 'sans', 'sous', 'entre', 'à',
            'report', 'summary', 'study', 'note', 'part', 'rapport', 'étude'
        ]);
        
        // Combine all titles
        const allText = publications
            .map(pub => pub.title || '')
            .join(' ')
            .toLowerCase();
        
        // Extract words (alphanumeric + accents)
        const words = allText.match(/[\wàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+/g) || [];
        
        // Count word frequencies
        const wordCounts = {};
        words.forEach(word => {
            if (word.length > 4 && !stopWords.has(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
        
        // Sort by frequency and return top keywords
        return Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
    }

    extractKeywordCountsFromTitles(publications) {
        // Same extraction but return counts and min/max for sizing
        const stopWords = new Set([
            'the', 'of', 'and', 'in', 'to', 'for', 'a', 'an', 'on', 'with', 'by',
            'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has',
            'le', 'la', 'les', 'de', 'des', 'du', 'et', 'en', 'dans', 'pour',
            'sur', 'par', 'avec', 'sans', 'sous', 'entre', 'à',
            'report', 'summary', 'study', 'note', 'part', 'rapport', 'étude'
        ]);
        const allText = publications
            .map(pub => pub.title || '')
            .join(' ')
            .toLowerCase();
        const words = allText.match(/[\wàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+/g) || [];
        const wordCounts = {};
        words.forEach(word => {
            if (word.length > 4 && !stopWords.has(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
        const entries = Object.entries(wordCounts).map(([w, c]) => ({word: w.charAt(0).toUpperCase() + w.slice(1), count: c}));
        entries.sort((a, b) => b.count - a.count);
        const counts = entries.map(e => e.count);
        const min = counts.length ? Math.min(...counts) : 0;
        const max = counts.length ? Math.max(...counts) : 0;
        return {sorted: entries, min, max};
    }
    
    updateLegend() {
        if (!this.allTopValues) return;
        
        const legendContainer = d3.select('#legend');
        legendContainer.html('');
        
        const colorScale = this.colorScales[this.currentDimension];
        
        const legendItems = legendContainer.selectAll('.legend-item')
            .data(this.allTopValues)
            .enter()
            .append('div')
            .attr('class', 'legend-item')
            .style('opacity', d => {
                if (this.selectedCategories.size === 0) return 1;
                return this.selectedCategories.has(d) ? 1 : 0.3;
            })
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                if (this.selectedCategories.has(d)) {
                    this.selectedCategories.delete(d);
                } else {
                    this.selectedCategories.add(d);
                }
                this.updateVisualization();
            });
        
        legendItems.append('div')
            .attr('class', 'legend-color')
            .style('background-color', (d, i) => colorScale(i));
        
        legendItems.append('span')
            .text(d => {
                const label = d;
                return label.length > 30 ? label.substring(0, 30) + '...' : label;
            });
        
        legendItems.append('span')
            .style('margin-left', '8px')
            .style('color', '#999')
            .style('font-size', '0.85em')
            .text(d => `(${this.totalsLookup[d] || 0})`);
    }
    
    updateStats() {
        d3.select('#stat-total').text(data.metadata.total_publications);
        d3.select('#stat-years').text(
            `${data.metadata.year_range.min}-${data.metadata.year_range.max}`
        );
        d3.select('#stat-dimension').text(this.currentDimension.charAt(0).toUpperCase() + this.currentDimension.slice(1));
    }
    
    togglePlayback() {
        if (this.isPlaying) {
            // Stop playback
            this.isPlaying = false;
            if (this.playbackFrame) {
                clearTimeout(this.playbackFrame);
                this.playbackFrame = null;
            }
            d3.select('#play-btn').text('▶ Play Journey');
            // Clear year indicator when stopping
            if (this.cornerYear) this.cornerYear.text('');
        } else {
            // Start playback
            this.isPlaying = true;
            d3.select('#play-btn').text('⏸ Pause');
            
            // Initialize playback from start
            this.currentYear = this.data.metadata.year_range.min;
            this.animationYMax = null; // Reset Y scale
            this.animationYMin = null;
            
            // First, create full graph without clipPath
            this.createStreamGraph();
            this.addAxes();
            
            // Then apply clipPath and start animation
            this.g.attr('clip-path', 'url(#year-clip)');
            // Initialize indicator at start year
            this.updateYearIndicator(this.currentYear);
            this.animateStep();
        }
    }
    
    animateStep() {
        if (!this.isPlaying) return;
        
        // Filter data to current year and before
        const yearRange = this.data.metadata.year_range;
        const years = d3.range(yearRange.min, this.currentYear + 1);
        
        // Create a masked version of the visualization
        this.createAnimatedStreamGraph(years);
        
        // Update corner year indicator during playback
        this.updateYearIndicator(this.currentYear);
        
        // Move to next year
        if (this.currentYear < yearRange.max) {
            this.currentYear++;
            // Use requestAnimationFrame for smoother animation, with delay for speed control
            this.playbackFrame = setTimeout(() => {
                if (this.isPlaying) {
                    requestAnimationFrame(() => this.animateStep());
                }
            }, 50); // 50ms delay = ~20fps
        } else {
            // Finished
            this.isPlaying = false;
            d3.select('#play-btn').text('▶ Play Journey');
            // Reset to full view
            this.updateVisualization();
        }
    }
    
    createAnimatedStreamGraph(yearsToShow) {
        // Simple: just control visibility based on year using clipPath
        const maxYear = Math.max(...yearsToShow);
        
        // Calculate clip width in SVG coordinates
        const clipX = this.margin.left + this.xScale(maxYear);
        
        // Update clip path width with smooth transition
        this.clipPathGroup.select('rect')
            .transition()
            .duration(50)
            .ease(d3.easeLinear)
            .attr('width', clipX);
        
        // Remove playback narrative per request (no popup)
        // this.showNarrative(`Playing: ${this.currentYear}`, `Showing ${yearsToShow.length} years of history`);
    }

    updateYearIndicator(year) {
        if (!this.cornerYear) return;
        const safeYear = year != null ? year : this.data?.metadata?.year_range?.min;
        this.cornerYear.text(`Year: ${safeYear}`);
    }
}

// Initialize visualization when data is loaded
let data;
let viz;

// Load data
d3.json('swac_data.json')
    .then(loadedData => {
        data = loadedData;
        viz = new SWACVisualization(data);
        
        // Add loading indicator removal
        d3.select('#viz-container').select('.loading')?.remove();
    })
    .catch(error => {
        console.error('Error loading data:', error);
        d3.select('#viz-container')
            .html('<div class="loading">Error loading data. Please check if swac_data.json exists.</div>');
    });

