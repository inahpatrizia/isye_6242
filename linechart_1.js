// Set the dimensions office the canvas / graph
var	margin = {top: 50, right: 150, bottom: 50, left: 100},
	width = 1000 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// Parse the date / time
var	parseDate = d3.timeParse("%Y-%0m-%0d");
var formatDate = d3.timeFormat("%b %y");

// Function to convert data from wide to long
function transformData(dataset) {
  var newData = [];

  dataset.forEach(function(d) {
    for (key in d) {
      if (key !== 'date' && newData.indexOf(key) === -1) {
        newData.push({
          name: key,
          value: d[key],
          date: d.date
        });
      }
    }
  });

  return newData;
}


// Define Color Scheme
var color = d3.scaleOrdinal(d3.schemeCategory10);

// Define Ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.count); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg1 = d3.select("#Ratings").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


// Load data
d3.dsv(",", "boardgame_ratings.csv", function (d) {
      return {
            date: parseDate(d.date),
            "Catan=count": +d["Catan=count"],
            "Dominion=count": +d["Dominion=count"],
            "Codenames=count": +d["Codenames=count"],
            "Terraforming Mars=count": +d["Terraforming Mars=count"],
            "Gloomhaven=count": +d["Gloomhaven=count"],
            "Magic: The Gathering=count": +d["Magic: The Gathering=count"],
            "Dixit=count": +d["Dixit=count"],
            "Monopoly=count": +d["Monopoly=count"],
            "Catan=rank": +d["Catan=rank"],
            "Dominion=rank": +d["Dominion=rank"],
            "Codenames=rank": +d["Codenames=rank"],
            "Terraforming Mars=rank": +d["Terraforming Mars=rank"],
            "Gloomhaven=rank": +d["Gloomhaven=rank"],
            "Magic: The Gathering=rank": +d["Magic: The Gathering=rank"],
            "Dixit=rank": +d["Dixit=rank"],
            "Monopoly=rank": +d["Monopoly=rank"]
            }
    }).then(function (data)

    {
        console.log(data); // you should see the data in your browser's developer tools console


// Transform data - convert from wide to long
        new_data = transformData(data);
        console.log(new_data);

        countData = [];
        rankData = [];

// Separate the count and the rank
        new_data.forEach(function(d) {
            game_name = d.name.split("=")[0]
            value = d.name.split("=")[1]

            if (value === 'count') {
                countData.push({
                  name: game_name,
                  count: +d.value,
                  date: +d.date
                });
              }

            if (value === 'rank') {
                rankData.push({
                  name: game_name,
                  rank: +d.value,
                  date: +d.date
                });
              }
        });

// Combine into 1 array
        finalData = [];
        for(var i = 0; i < countData.length; i++){
            game_name = countData[i].name
            date_count = countData[i].date

            filtered = rankData.filter(function(d){ return d.name == game_name & d.date == date_count})

            finalData.push({
                      name: game_name,
                      count: +countData[i].count,
                      rank: +filtered[0].rank,
                      date: date_count
                }); // end push
            } //end for loop
            console.log(finalData)


// Scale the range of the data
      x.domain(d3.extent(finalData, function(d) { return d.date; }));
      y.domain([0, d3.max(finalData, function(d) { return d.count; })]);

// Loop through data to add lines
        var dataNest = d3.nest()
            .key(function(d) {return d.name;})
            .entries(finalData);

        console.log(dataNest)

        dataNest.forEach(function(d) {

            svg1.append("path")
                .attr("class", "line")
                .style("stroke", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .attr("d", valueline(d.values));

            svg1.append("text")
                .attr("text-anchor", "start")
                .style("fill", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .text(d.key)
                .attr("transform", "translate(" + (width+3) + "," + y(d.values[d.values.length-1].count) + ")")

        }); // end dataNest

     // Add the X Axis
    svg1.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(formatDate));

    // Add the X axis label
    svg1.append("text")
      .attr("class", "x label")
      .style("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + margin.bottom)
      .text("Month");

    // Add the Y Axis
    svg1.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y));

    // Add the Y Axis Label
    svg1.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 0 - margin.bottom)
    .attr("x",0 - (height / 2))
    .attr("transform", "rotate(-90)")
    .text("Num of Ratings");

    // Add the Chart Title
     svg1.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Number of Ratings 2016-2020");


    });