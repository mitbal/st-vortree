import * as d3 from 'd3';
import { voronoiTreemap } from 'd3-voronoi-treemap';

export function renderVoronoiTreemap(data, container, colorScheme = 'tableau10', showValues = false, showPctOnly = false, labelScale = 1.0, borderColor = '#ffffff', borderWidth = 1, showLegend = true, colorScaleType = 'green', showColorValue = false) {
    if (!container) return;

    // Clear previous
    container.innerHTML = '';

    const width = container.clientWidth;
    const height = container.clientHeight;

    // ... rest of the setup
    let estimatedLegendWidth = 0;
    let legendGap = 0;
    if (showLegend) {
        estimatedLegendWidth = 240;
        legendGap = 30;
    }

    const availablePlotWidth = width - legendGap - estimatedLegendWidth;
    let radius = Math.min(availablePlotWidth / 2, height / 2) - 10;
    radius = Math.max(10, radius); // Ensure positive radius

    const leftPadding = 10;
    const cx = leftPadding + radius;
    const cy = height / 2;
    const nPoints = 100;

    const clipPolygon = d3.range(nPoints).map(i => {
        const theta = (i / nPoints) * 2 * Math.PI;
        return [
            cx + radius * Math.cos(theta),
            cy + radius * Math.sin(theta)
        ];
    });

    // Process data: transform flat array to hierarchy
    let rootData;
    const hasGroups = data.some(d => d.group);

    if (hasGroups) {
        // Group by 'group' field
        const grouped = d3.group(data, d => d.group);
        rootData = {
            name: "root",
            children: Array.from(grouped, ([key, values]) => ({
                name: key,
                children: values
            }))
        };
    } else {
        // Flat conversion
        rootData = {
            name: "root",
            children: data
        };
    }

    const hierarchy = d3.hierarchy(rootData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    // Calculate total value for percentage
    const totalValue = hierarchy.value;

    // Voronoi Treemap computation
    const _voronoiTreemap = voronoiTreemap()
        .clip(clipPolygon);

    _voronoiTreemap(hierarchy);

    const allNodes = hierarchy.descendants();
    const leaves = allNodes.filter(d => d.height === 0);
    const groups = allNodes.filter(d => d.depth === 1 && d.height > 0);

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Determine if data has a numeric color field
    const hasColorField = data.some(d => d.color !== undefined && d.color !== null);
    let sequentialColorScale = null;
    if (hasColorField) {
        const colorValues = data.map(d => +d.color).filter(v => !isNaN(v));
        const minVal = d3.min(colorValues);
        const maxVal = d3.max(colorValues);

        if (colorScaleType === 'red_green') {
            // Anchor at zero: negatives → red gradient, positives → green gradient.
            // Domain [0, minVal] maps 0→white end, minVal→deep red (since minVal < 0, t goes 0→1).
            // Domain [0, maxVal] maps 0→white end, maxVal→deep green.
            const redInterp   = d3.interpolateRgb('#FFEBEE', '#8B0000');
            const greenInterp = d3.interpolateRgb('#EEFBF1', '#1B5E20');
            const negScale = d3.scaleSequential(redInterp).domain([0, minVal]);
            const posScale = d3.scaleSequential(greenInterp).domain([0, maxVal]);
            sequentialColorScale = v => (+v < 0 ? negScale(+v) : posScale(+v));
        } else {
            const interpolator = getColorScaleInterpolator(colorScaleType);
            sequentialColorScale = d3.scaleSequential(interpolator).domain([minVal, maxVal]);
        }
    }

    // Create categorical color scale (used as fallback)
    const colorScale = getColorScale(colorScheme);

    // Draw leaf cells
    const cellGroups = svg.selectAll("g.cell")
        .data(leaves)
        .enter()
        .append("g")
        .attr("class", "cell");

    cellGroups.append("path")
        .attr("d", d => "M" + d.polygon.join("L") + "Z")
        .attr("class", "voronoi-cell")
        .style("fill", (d) => {
            if (sequentialColorScale && d.data.color !== undefined && d.data.color !== null) {
                return sequentialColorScale(+d.data.color);
            }
            const key = (hasGroups && d.parent && d.parent.depth > 0) ? d.parent.data.name : d.data.name;
            return colorScale(key);
        })
        .style("stroke", borderColor)
        .style("stroke-width", (borderWidth * 0.5) + "px");

    // Draw group boundaries
    if (hasGroups) {
        svg.selectAll("path.group")
            .data(groups)
            .enter()
            .append("path")
            .attr("d", d => "M" + d.polygon.join("L") + "Z")
            .style("fill", "none")
            .style("stroke", borderColor)
            .style("stroke-width", (borderWidth * 3) + "px")
            .style("pointer-events", "none");
    }

    // Helper: get fill color for a leaf node
    function getCellFill(d) {
        if (sequentialColorScale && d.data.color !== undefined && d.data.color !== null) {
            return sequentialColorScale(+d.data.color);
        }
        const key = (hasGroups && d.parent && d.parent.depth > 0) ? d.parent.data.name : d.data.name;
        return colorScale(key);
    }

    // Helper: compute perceived luminance (0=dark, 1=bright) of a CSS color string
    function getLuminance(colorStr) {
        const c = d3.color(colorStr);
        if (!c) return 0;
        const r = c.r / 255, g = c.g / 255, b = c.b / 255;
        const toLinear = v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    }

    // Labels
    const labels = cellGroups.append("text")
        .attr("x", d => d3.polygonCentroid(d.polygon)[0])
        .attr("y", d => d3.polygonCentroid(d.polygon)[1])
        .attr("class", "voronoi-label")
        .style("pointer-events", "none")
        .style("text-anchor", "middle")
        .style("fill", d => getLuminance(getCellFill(d)) > 0.35 ? "#1a1a1a" : "#ffffff")
        .style("text-shadow", d => getLuminance(getCellFill(d)) > 0.35 ? "none" : "0px 1px 2px rgba(0,0,0,0.4)")
        .style("font-size", d => {
            const area = Math.abs(d3.polygonArea(d.polygon));
            const size = Math.sqrt(area) * 0.12;
            return (size * labelScale) + "px";
        });

    // Determine how many sub-lines each cell will have (for vertical centering)
    const hasColorValueLine = showColorValue && hasColorField;
    const hasSecondLine = showPctOnly || showValues;
    const totalLines = 1 + (hasSecondLine ? 1 : 0) + (hasColorValueLine ? 1 : 0);
    // dy of first tspan: shift up so the block is centred
    const firstDy = totalLines === 3 ? "-1.2em" : totalLines === 2 ? "-0.6em" : "0.3em";

    if (showPctOnly) {
        // Name
        labels.append("tspan")
            .attr("x", d => d3.polygonCentroid(d.polygon)[0])
            .attr("dy", firstDy)
            .text(d => d.data.name);

        // Share of total
        labels.append("tspan")
            .attr("x", d => d3.polygonCentroid(d.polygon)[0])
            .attr("dy", "1.2em")
            .style("font-size", "0.8em")
            .style("opacity", 0.8)
            .text(d => {
                const percent = (d.value / totalValue * 100).toFixed(1);
                return `${percent}%`;
            });
    } else {
        // Name
        labels.append("tspan")
            .attr("x", d => d3.polygonCentroid(d.polygon)[0])
            .attr("dy", showValues ? firstDy : (hasColorValueLine ? "-0.6em" : "0.3em"))
            .text(d => d.data.name);

        // Value and share of total
        if (showValues) {
            labels.append("tspan")
                .attr("x", d => d3.polygonCentroid(d.polygon)[0])
                .attr("dy", "1.2em")
                .style("font-size", "0.8em")
                .style("opacity", 0.8)
                .text(d => {
                    const percent = (d.value / totalValue * 100).toFixed(1);
                    return `${d.value} (${percent}%)`;
                });
        }
    }

    // Color value line (e.g. % change)
    if (hasColorValueLine) {
        labels.append("tspan")
            .attr("x", d => d3.polygonCentroid(d.polygon)[0])
            .attr("dy", "1.2em")
            .style("font-size", "0.85em")
            .style("font-weight", "600")
            .text(d => {
                if (d.data.color === undefined || d.data.color === null) return "";
                const v = +d.data.color;
                const sign = v >= 0 ? "+" : "";
                return `${sign}${v.toFixed(2)}%`;
            });
    }

    // Tooltip
    cellGroups.append("title")
        .text(d => {
            const group = hasGroups && d.parent ? `(${d.parent.data.name}) ` : "";
            return `${d.data.name} ${group}: ${d.value} (${(d.value / totalValue * 100).toFixed(2)}%)`;
        });

    // Legend
    if (showLegend && (hasGroups || leaves.length > 0)) {
        const legendData = hasGroups ? groups : leaves;

        const legendX = cx + radius + legendGap;
        const legendY = Math.max(20, cy - (legendData.length * 35) / 2);

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${legendX}, ${legendY})`);

        const legendItems = legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 35})`); // Increased spacing

        legendItems.append("rect")
            .attr("width", 24) // Increased from 18
            .attr("height", 24) // Increased from 18
            .attr("rx", 6)
            .style("fill", d => colorScale(d.data.name));

        legendItems.append("text")
            .attr("x", 36) // 24 (rect size) + 12 (padding)
            .attr("y", 18) // vertically centered with rect
            .style("font-size", "18px") // Increased from 14px
            .style("fill", borderColor === '#ffffff' ? '#ffffff' : '#333')
            .style("font-weight", "500")
            .text(d => {
                const percent = (d.value / totalValue * 100).toFixed(1);
                return `${d.data.name} (${percent}%)`;
            });

        // Ensure white text if dark background, etc. 
        // Better: use CSS for legend text.
    }
}


function getColorScale(scheme) {
    const tableau20 = [
        '#4e79a7', '#a0cbe8', '#f28e2c', '#ffbe7d', '#59a14f', '#8cd17d', '#b6992d', '#f1ce63', '#499894', '#86bcb6',
        '#e15759', '#ff9d9a', '#79706e', '#bab0ac', '#d37295', '#fabfd2', '#b07aa1', '#d4a5c9', '#9c755f', '#d7b5a2'
    ];

    const category20 = [
        '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5',
        '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
    ];

    switch (scheme) {
        case 'category10':
            return d3.scaleOrdinal(category20);
        case 'pastel1':
            return d3.scaleOrdinal(d3.schemePastel1);
        case 'dark':
            const darkColors = ['#1f2937', '#374151', '#4b5563', '#6b7280', '#111827', '#030712', '#1f2937', '#4b5563', '#312e81', '#1e1b4b', '#1e3a8a', '#172554', '#14532d', '#052e16', '#713f12', '#451a03', '#7f1d1d', '#450a0a', '#701a75', '#4a044e'];
            return d3.scaleOrdinal(darkColors);
        case 'cool':
            return d3.scaleOrdinal(d3.quantize(d3.interpolateCool, 20));
        case 'warm':
            return d3.scaleOrdinal(d3.quantize(d3.interpolateWarm, 20));
        case 'tableau10':
        default:
            return d3.scaleOrdinal(tableau20);
    }
}

function getColorScaleInterpolator(scaleType) {
    switch (scaleType) {
        case 'red':
            // near-white → deep brick red
            return d3.interpolateRgb('#FFEBEE', '#8B0000');
        case 'red_green':
            // handled separately with split zero-anchor; this fallback won't normally be used
            return d3.interpolateRgb('#FFEBEE', '#8B0000');
        case 'green':
        default:
            // near-white → deep forest green
            return d3.interpolateRgb('#EEFBF1', '#1B5E20');
    }
}
