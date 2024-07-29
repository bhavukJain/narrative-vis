// Parameters
let selectedYear = null;
let selectedPlayer = null;

const dataURL = 'https://raw.githubusercontent.com/bhavukJain/narrative-vis/main/mlb-stats.csv';

fetch(dataURL)
    .then(response => response.text())
    .then(csvData => {
        const data = d3.csvParse(csvData, d => {
            d.AB = +d.AB;
            d.PA = +d.PA;
            d.on_base_percent = d.on_base_percent ? +d.on_base_percent : 0;
            d.bb_percent = d.bb_percent ? +d.bb_percent : 0;
            return d;
        });
        createVisualization(data);
    });

function createVisualization(data) {
    const svgHeightPercentage = 0.6;
    const viewHeight = window.innerHeight;
    const margin = { top: 70, right: 50, bottom: 80, left: 70 };
    const containerWidth = document.getElementById("visualization").offsetWidth;
    const svgWidth = containerWidth - containerWidth * 0.30;
    const svgHeight = viewHeight * svgHeightPercentage;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#visualization").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = Array.from(new Set(data.map(d => d.year)));
    const colorScale = d3.scaleOrdinal()
        .domain(years)
        .range(d3.schemeSet3);

    function showOverviewScene() {
        svg.selectAll("*").remove();

        // Aggregate data for each year
        const yearAverages = years.map(year => {
            const yearData = data.filter(d => d.year === year);
            const avgOBP = d3.mean(yearData, d => d.on_base_percent);
            return { year, avgOBP };
        });

        // Create the X and Y scales
        const yScale = d3.scaleBand()
            .domain(yearAverages.map(d => d.year))
            .range([0, height])
            .padding(0.1);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(yearAverages, d => d.avgOBP)])
            .range([0, width]);

        // Create and display the Y-axis
        const yAxis = d3.axisLeft(yScale);
        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .selectAll("text")
            .attr("font-size", 12);

        // Create and display the X-axis
        const xAxis = d3.axisBottom(xScale).ticks(6);
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("font-size", 12);

        // Create the bars for each year
        const bars = svg.selectAll(".bar")
            .data(yearAverages)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d.year))
            .attr("width", d => xScale(d.avgOBP))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.year))
            .on("click", (event, d) => triggerDrillDown(d.year))
            .on("mouseover", raiseBar)
            .on("mouseout", resetBar);

        // Add OBP values at the end of the bars
        svg.selectAll(".bar-label")
            .data(yearAverages)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.avgOBP) + 5)
            .attr("y", d => yScale(d.year) + yScale.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(d => d.avgOBP.toFixed(3));

        // Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .text("Average 'On-Base Percentage (OBP)' by Year");

        // Add X and Y axis labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom / 2)
            .attr("text-anchor", "middle")
            .text("Average OBP");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .attr("text-anchor", "middle")
            .text("Year");

        function raiseBar(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "orange");
        }

        function resetBar(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", d => colorScale(d.year));
        }
    }

    function triggerDrillDown(year) {
        selectedYear = year;
        showDrillDownScene(year);
    }

    function showDrillDownScene(year) {
        svg.selectAll("*").remove();

        // Filter the data to get the players for the selected year
        const yearPlayers = data.filter(d => d.year === year);

        // Calculate the minimum and maximum values for Swing % and OBP
        const swingPercentExtent = d3.extent(yearPlayers, d => d.swing_percent);
        const obpExtent = d3.extent(yearPlayers, d => d.on_base_percent);

        // Create the X and Y scales for Swing % and OBP
        const xScale = d3.scaleLinear()
            .domain(swingPercentExtent)
            .range([0, width])
            .nice();

        const yScale = d3.scaleLinear()
            .domain(obpExtent)
            .range([height, 0])
            .nice();

        // Create and display the X-axis for Swing %
        const xAxis = d3.axisBottom(xScale).ticks(6);
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("font-size", 12);

        // Create and display the Y-axis for OBP
        const yAxis = d3.axisLeft(yScale).ticks(6);
        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .selectAll("text")
            .attr("font-size", 12);

        const pointGroup = svg.append("g")
            .attr("class", "point-group");

        // Create the scatter plot points for each player
        const points = pointGroup.selectAll(".point")
            .data(yearPlayers)
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("cx", d => xScale(d.swing_percent))
            .attr("cy", d => yScale(d.on_base_percent))
            .attr("r", 5)
            .attr("fill", d => colorScale(year))
            .on("mouseover", showPlayerInfoAndEnlargePoint)
            .on("mouseout", hidePlayerInfoAndResetPoint)
            .on("click", (event, d) => triggerShowPlayer(d));

        function showPlayerInfoAndEnlargePoint(event, d) {
            const xPosition = xScale(d.swing_percent) + 10;
            const yPosition = yScale(d.on_base_percent) - 5;

            // Enlarge the scatterplot point on mouseover
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8);

            const tooltipText = `${d.first_name} ${d.last_name}\nOBP: ${d.on_base_percent}\nSwing %: ${d.swing_percent}\nStrikeouts: ${d.strikeout}\nStrikeout %: ${d.k_percent}\nWalks: ${d.walk}\nWalk %: ${d.bb_percent}\nAVG: ${d.batting_avg}\nSLG: ${d.slg_percent}`;

            const lineHeight = 16;
            const padding = 5;

            const bbox = svg.append("text")
                .attr("class", "player-stats")
                .attr("x", xPosition + padding)
                .attr("y", yPosition + padding)
                .attr("dy", "0.35em")
                .selectAll("tspan")
                .data(tooltipText.split("\n"))
                .enter()
                .append("tspan")
                .attr("x", xPosition + padding)
                .attr("dy", (d, i) => i === 0 ? lineHeight : lineHeight)
                .text(d => d)
                .node()
                .getBBox();

            svg.insert("rect", ".player-stats") // Insert rect behind text
                .attr("class", "player-stats-background")
                .attr("x", bbox.x - padding)
                .attr("y", bbox.y - padding)
                .attr("width", bbox.width + 2 * padding)
                .attr("height", bbox.height + 2 * padding)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", "white");
        }

        function hidePlayerInfoAndResetPoint() {
            svg.selectAll(".annotation-text").remove();
            svg.selectAll(".player-stats").remove();
            svg.selectAll(".player-stats-background").remove();
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 5);
        }

        const titleY = -margin.top / 2;
        const buttonY = titleY;

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", titleY)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .text(`Batting Statistics for ${year}`);

        // X and Y axis labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom / 2)
            .attr("text-anchor", "middle")
            .text("Swing %");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .attr("text-anchor", "middle")
            .text("On-Base Percentage (OBP)");

        // Add Back button to go back to the Overview scene
        const backButton = svg.append("g")
            .attr("class", "back-button")
            .style("cursor", "pointer")
            .on("click", triggerBackToOverview);

        backButton.append("rect")
            .attr("width", 100)
            .attr("height", 30)
            .attr("fill", "lightgray")
            .attr("rx", 8)
            .attr("x", 10)
            .attr("y", buttonY);

        backButton.append("text")
            .attr("x", 60)
            .attr("y", buttonY + 15)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", "14px")
            .text("< OVERVIEW");
    }

    function triggerShowPlayer(player) {
        selectedPlayer = player;
        showIndividualPlayerScene(selectedYear, player);
    }

    function showIndividualPlayerScene(year, player) {
        svg.selectAll("*").remove();

        // Walk percentage data
        const walkData = [
            { type: "Walk %", value: player.bb_percent }
        ];

        const xScale = d3.scaleBand()
            .domain(walkData.map(d => d.type))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Create axes
        const xAxis = d3.axisBottom(xScale);
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .selectAll("text")
            .attr("font-size", 12);

        const yAxis = d3.axisLeft(yScale).ticks(6);
        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .selectAll("text")
            .attr("font-size", 12);

        // Walk percentage chart bars
        const bars = svg.selectAll(".bar")
            .data(walkData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.type))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .attr("fill", "steelblue");

        // Add percentage labels
        svg.selectAll(".bar-label")
            .data(walkData)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.value) - 5)
            .attr("text-anchor", "middle")
            .text(d => `${d.value.toFixed(1)}%`);

        const titleY = -margin.top / 2;
        const buttonY = titleY;

        // Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", titleY)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .text(`${player.first_name} ${player.last_name} Walk Percentage in ${player.year}`);

        // Add X and Y axis labels for walk percentage chart
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom / 2)
            .attr("text-anchor", "middle")
            .text("Type");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 15)
            .attr("text-anchor", "middle")
            .text("Percentage");

        // Add Back button to go back to the drill-down scene
        const backButton = svg.append("g")
            .attr("class", "back-button")
            .style("cursor", "pointer")
            .on("click", triggerBackToDrillDown);

        backButton.append("rect")
            .attr("width", 100)
            .attr("height", 30)
            .attr("fill", "lightgray")
            .attr("rx", 8)
            .attr("x", 10)
            .attr("y", buttonY);

        backButton.append("text")
            .attr("x", 60)
            .attr("y", buttonY + 15)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", "14px")
            .text(`< BACK TO ${player.year}`);
    }

    function triggerBackToDrillDown() {
        showDrillDownScene(selectedYear);
    }

    function triggerBackToOverview() {
        selectedYear = null;
        selectedPlayer = null;
        showOverviewScene();
    }

    showOverviewScene();
}
