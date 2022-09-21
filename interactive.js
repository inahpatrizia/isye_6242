// Set graph dimensions
var	margin = {top: 50, right: 150, bottom: 50, left: 100},
	width = 1000 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;

// Define Color Scheme
var color = d3.scaleOrdinal(d3.schemeCategory10);

// Define Ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Define Line
var valueline = d3.line()
    .x(function(d) { return x(d.key); })
    .y(function(d) { return y(d.value); })

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg1 = d3.select("#container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Define Legend
var legend = svg1.append("g")
                .attr("class", "legend")
                .attr("height", 100)
                .attr("width", 100)
                .attr('transform', 'translate(-20,50)');

var tooltipCt = d3.select("body").append("div")
				.attr("class", "tooltipCt")
				.style("opacity", 0);

  d3.dsv(",", "average-rating.csv", function (d) {
      return {
            name: d.name,
            year: d.year,
            average_rating: Math.floor(+d.average_rating),
            users_rated: +d.users_rated
            }
    }).then(function (data)

    {
        console.log(data); // you should see the data in your browser's developer tools console
        new_data = data.filter(function(d){ return d.year >= 2015 & d.year <= 2019 })
        console.log(new_data);

//      Format Data and calculate count
        var nested_data = d3.nest()
                            .key(function(d) { return d.year; })
                            .key(function(d) { return d.average_rating; })
                            .rollup(function(leaves) { return leaves.length; })
                            .sortKeys(d3.ascending)
                            .entries(new_data);
        console.log(nested_data);


        var rating_array = nested_data.map(function(d, i) {
                    return d.values;
                });

//      Add in missing data
        allKeys = ["0","1","2","3","4","5","6","7","8","9"];

        nestedData = d3.values(rating_array).map(function(d) {
                        return {
                            values: allKeys.map(function(k) {
                                    value = d.filter(function(v) { return v.key == k; })[0];
                                    return value || ({key: k, value: 0});
                                })
                        };
                    });

        console.log(nestedData)

        for(var i = 0; i < nested_data.length; i++)
            {
                nested_data[i].values = nestedData[i].values
            }
        console.log(nested_data)

      var rating_array2 = nested_data.map(function(d, i) {
                    return d.values;
                });


//    Getting max value of Y axis range
      var max_y = d3.max(rating_array2, function(d, i) {
                        return d3.max(d, function(e) {
                                return e.value;
                            });
                    });
      var max_x = d3.max(new_data, function(d) {
                                return d.average_rating;
                    });

        // Scale the range of the data
      x.domain([0, max_x]);
      y.domain([0, max_y]);

        nested_data.forEach(function(d,i) {
                var year = d.key;

                svg1.append("path")
                    .attr("class", "line")
                    .style("stroke", function() { // Add the colours dynamically
                        return d.color = color(d.key); })
                    .attr("d", valueline(d.values));

                legend.append('circle')
                    .attr('cx', width - 20)
                    .attr('cy', function(d){ return i *  21;})
                    .attr('r', '5px')
                    .style("stroke", function() { // Add the colours dynamically
                        return d.color = color(d.key); })
                    .style("fill", function() { // Add the colours dynamically
                        return d.color = color(d.key); })

                legend.append('text')
                    .attr('x', width - 8)
                    .attr('y', function(d){ return (i *  21) + 5;})
                    .text(function(){ return d.key; });

                svg1.selectAll(".dot")
                   .data(d.values).enter()
                      .append("circle") // Uses the enter().append() method
                      .attr("class", "dot"+ i) // Assign a class for styling
                      .style("fill", function() { // Add the colours dynamically
                        return d.color = color(d.key); })
                      .attr("cx", function(d) { return x(d.key) })
                      .attr("cy", function(d) { return y(d.value) })
                      .attr("r", 5)
                      .on('mouseover', function(d) {
                                                   d3.select(this).attr("r", 8);

                                                   var avg_rating = d.key;

                                                   // Get Data
                                                   var data_filtered = new_data.filter(function(d){ return d.year == year & d.average_rating == avg_rating })
                                                   var tip_data0 = data_filtered.sort(function(a,b){return d3.descending(+a.users_rated, +b.users_rated);}).slice(0,5);

                                                   var	margin_tt = {top: 50, right: 150, bottom: 50, left: 150},
                                                        width_tt = 700 - margin.left - margin.right,
                                                        height_tt = 300 - margin.top - margin.bottom;

                                                   // Start of ToolTip Graph Function
                                                   var barchart = function(year, avg_rating){
                                                        tooltipCt.html("<h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Top 5 Most Rated Games for "+ year + " with Rating " + avg_rating + "</h3><br><svg class='tooltipChart'></svg>")
                                                                    .style("opacity", 1);

                                                        var svgtt = d3.select(".tooltipChart")
                                                                      .attr("width", width_tt + margin_tt.left + margin_tt.right)
                                                                      .attr("height", height_tt + margin_tt.top + margin_tt.bottom);

                                                        // Format data for tooltip
                                                        tip_data = [{"name":"", "year" : year, "average_rating": +avg_rating, "users_rated":0},
                                                                     {"name":"", "year" : year, "average_rating": +avg_rating, "users_rated":0},
                                                                     {"name":"", "year" : year, "average_rating": +avg_rating, "users_rated":0},
                                                                     {"name":"", "year" : year, "average_rating": +avg_rating, "users_rated":0},
                                                                     {"name":"", "year" : year, "average_rating": +avg_rating, "users_rated":0}]

                                                        for(var i = 0; i < tip_data0.length; i++)
                                                            {
                                                                tip_data[i] = tip_data0[i]
                                                            }

                                                        tip_data = tip_data.sort(function(a,b){return d3.ascending(+a.users_rated, +b.users_rated);})

                                                        var max_x = d3.max(tip_data, function(d) {return d.users_rated;});

                                                        // Define Ranges
                                                        var x = d3.scaleLinear().range([0, width_tt])
                                                                  .domain([0,max_x]);
                                                        var y = d3.scaleBand().range([height_tt, 0])
                                                                  .domain(tip_data.map(function(d){ return d.name}))
                                                                  .padding(0.1);

                                                        svgtt.selectAll(".bar")
                                                             .data(tip_data)
                                                             .enter()
                                                              .append("rect")
                                                              .attr("x", margin_tt.left)
                                                              .attr("y",function(d) {return y(d.name);})
					                                          .attr("height",  y.bandwidth())
                                                              .attr("width", function(d) {return x(d.users_rated);})
                                                              .style("fill", "steelblue");

                                                        // Add X axis
                                                        svgtt.append("g")
                                                           .attr("transform", "translate(" + margin_tt.left + "," + height_tt + ")")
                                                           .call(d3.axisBottom(x));

                                                        // Add Y axis
                                                        svgtt.append("g")
                                                             .attr("transform", "translate("+ margin_tt.left + ",0)")
                                                             .call(d3.axisLeft(y))
                                                             .selectAll('.tick text')
                                                             .style('text-anchor', 'end')

                                                        // Add X axis label
                                                        svgtt.append("text")
                                                             .attr("class", "x label")
                                                             .style("text-anchor", "middle")
                                                             .attr("x", (width_tt+ margin_tt.left+margin_tt.right)/2)
                                                             .attr("y", height_tt + margin_tt.bottom)
                                                             .text("Number of Users");

                                                        // Add the Y Axis Label
                                                        svgtt.append("text")
                                                             .attr("class", "y label")
                                                             .attr("text-anchor", "end")
                                                             .attr("y", margin_tt.bottom)
                                                             .attr("x",0 - (height_tt/ 2))
                                                             .attr("transform", "rotate(-90)")
                                                             .text("Games");




                                                        } //End of ToolTip Graph

                                        if (tip_data0.length > 0)
                                                {
                                                    barchart(year, avg_rating);
                                                }


                       }) //End of Mouseover
                      .on("mouseout",   function() {
                                                    d3.select(this).attr("r",5);
                                                    var barchart_fade = function(d){tooltipCt.style("opacity", 0)};
                                                    barchart_fade();
                                                    });


                }); // Nested Data loop



         // Add the X Axis
        svg1.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add the X axis label
        svg1.append("text")
          .attr("class", "x label")
          .style("text-anchor", "middle")
          .attr("x", width/2)
          .attr("y", height + margin.bottom/1.5)
          .text("Rating");

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
        .text("Count");

        // Add the Chart Title
         svg1.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Board Game Ratings 2015-2019");

         svg1.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 8))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("icanlapan3");



    });

