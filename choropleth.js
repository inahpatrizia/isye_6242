// enter code to define margin and dimensions for svg
var	margin = {top: 50, right: 150, bottom: 50, left: 100},
	width = 1200 - margin.left - margin.right,
	height = 700 - margin.top - margin.bottom;

// enter code to create svg
var svg = d3.select("#choropleth").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// enter code to create color scale
var color = d3.scaleQuantile().domain([0,99]).range(["steelblue","#aaa","lightgreen"])

// enter code to define projection and path required for Choropleth
var projection = d3.geoMercator().translate([width/2, height/2]).scale(100).center([0,40]);
var path = d3.geoPath().projection(projection);

        Promise.all([
            // enter code to read files
            d3.json('world_countries.json'),
            d3.csv('ratings-by-country.csv'),


        ]).then(
            // enter code to call ready() with required arguments
            (data) => { ready(null, data[0], data[1])  }
        );

		// this function should be called once the data from files have been read
		// world: topojson from world_countries.json
		// gameData: data from ratings-by-country.csv

        function ready(error, world, gameData) {
            // enter code to extract all unique games from gameData
            unique_games = [...new Set(gameData.map(d => d.Game))];
            unique_games = Array.from(unique_games).sort()
            console.log(unique_games)

            // enter code to append the game options to the dropdown
            var selection = d3.select("#selection_menu").on("change", () => {createMapAndLegend(world, gameData, document.getElementById('selection_menu').value)})
            var game_list = selection.selectAll('option').data(unique_games);
            game_list.enter().append("option").text(function(d) { return d })

            // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
            game_selected = unique_games[0]
            // create Choropleth with default option. Call createMapAndLegend() with required arguments.
            createMapAndLegend(world, gameData, game_selected)

        } // end of ready()

		// this function should create a Choropleth and legend using the world and gameData arguments for a selectedGame
		// also use this function to update Choropleth and legend when a different game is selected from the dropdown
        function createMapAndLegend(world, gameData, game_selected){
                svg.selectAll("*").remove();
                data = world.features;

                console.log(game_selected)
                console.log(data)


                tooltip = d3.tip().attr('class', 'd3-tip').offset([-3, 0]).html(function(d) {
                        country = d[0].name
                        console.log(country)
                        data_for_game = gameData.filter(function(d){ return d.Game == selectedGame && d.Country == country})
//                        console.log(country)
//                        console.log(gameData)
                }); // end of tooltip


// tip = d3.tip().attr('class', 'd3-tip').offset([-3, 0]).html(function(d) {
//
//    // return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
//
//                current_country = d.properties.name
//                        gd = gameData.filter((game) => game.Game == selectedGame && game.Country == current_country)
//                        if(gd.length)
////                           {
//                return "<p><strong> Country: </strong>" +d.properties.name+ "<br>"+
//                     "<strong> Game: </strong>"+ selectedGame +"<br>"+
//                     "<strong> Average Rating: </strong>"+ gd[0]['Average Rating']+"<br>"+
//                     "<strong> Number of Users: </strong>"+ gd[0]['Number of Users']
//                    +"</p>"
//            }
//                else
//                return     "<p><strong> Country: </strong>" +d.properties.name+ "<br>"+
//                     "<strong> Game: </strong>"+ selectedGame +"<br>"+
//                     "<strong> Average Rating: </strong>"+ "N/A"+"<br>"+
//                     "<strong> Number of Users: </strong>"+ "N/A"
//                    +"</p>"
//                        });

                // Get average rating array for country colour
                var avg_rating = [];

                gameData.forEach(function(d){
                    for (game in d) {
                        if (d.Game == game_selected) {
                            avg_rating.push(d['Average Rating'])
                            }
                    }
                })
                console.log(avg_rating)

                quantile = d3.scaleQuantile()
                .domain(avg_rating.sort())
                .range(["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"])


                // Create legend
                var colors_for_legend = d3.legendColor()
                                            .labelFormat(d3.format(",.2f"))
                                            .scale(quantile)
                                            .shapePadding(3)
                                            .shapeWidth(20)
                                            .shapeHeight(20)
                                            .labelOffset(12)
                                            .labelOffset(12)

                legend = svg.append("g")
                            .attr('transform', 'translate(-20,50)')
                            .call(colors_for_legend);

                svg.call(tooltip);

                var countries = []
                // Append map
                svg.append("g")
                    .attr("class", "countries")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")



                // Add tooltip
                svg.on('mouseover', tooltip.show)
                    .on('mouseout', tooltip.hide)
//                    .attr("fill",
//                     function (d,i){
//                            current_country = d.properties
//                            data_for_game = gameData.filter(function(d){ return d.Game == selectedGame && d.Country == country})
//                        if(data_for_game.length)
//                               {
//                                console.log(quantile(data_for_game[0]['Average Rating']) + " " + data_for_game[0]['Average Rating'])
//                                return quantile(parseFloat(data_for_game[0]['Average Rating']))
//                                }
//                            else
//                                return "grey"
//
//                    })
                    .attr("d", path)










        } // end of createMapAndLegend