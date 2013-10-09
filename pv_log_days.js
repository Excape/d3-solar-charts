//Width and height
var margin = {top: 50, right: 10, bottom: 20, left: 50};
var w = 800 - margin.left - margin.right;
var h = 350 - margin.top - margin.bottom;
   var maxValue = 13000;

var dsv = d3.dsv(";", "text/plain");
var dataset = [];

// Get and format today's date
var today = new Date();
var curr_date = today.getDate().toString();
if (curr_date.length == 1) { curr_date = "0" + curr_date;}
var curr_month = today.getMonth() + 1; // Months are 0 based
if (curr_month.length == 1) { curr_month = "0" + curr_month;}
var curr_year = today.getFullYear().toString().substr(2,2); // Format to 2 digits
var strDate = curr_date + "." + curr_month + "." + curr_year;

// Today's csv name
var csvToday = "csv/min" + curr_year + curr_month + curr_date + ".csv";

// Set Date label
d3.select("#nav_label")
  .text(strDate); 

// Import Data
d3.text(csvToday, "text/csv", function(csv) {
    csv = csv.replace("#", "");
    var data = dsv.parse(csv);

    data.forEach(function (data, i) {
        
        dataset.push({
            key: i,
            Date: new Date(data.Datum.replace(/(\d{2})\.(\d{2})\.(\d{2})/,'20$3-$2-$1') + " " + data.Uhrzeit),
            Pac: +data.Pac
        });
    });

	var xScale = d3.time.scale()
					.domain([dataset[0].Date, dataset[dataset.length - 1].Date])
					.rangeRound([w, 0]);

	var yScale = d3.scale.linear()
					//.domain([0, d3.max(dataset, function(d) { return d.Pac; })])
          .domain([0, maxValue])
					.rangeRound([h, 0])
          .nice();
	
	//Define key function, to be used when binding data
	var key = function(d) {
		return d.key;
	};

	// Define X-Axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.ticks(d3.time.minutes, 60)
		.tickFormat(d3.time.format("%H:%M"))
		.orient("bottom");

	// Define y-axis
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left");
	
	//Create SVG element
	var svg = d3.select("body")
				.append("svg")
				.attr("width", w + margin.left + margin.right)
				.attr("height", h + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //Crate horizontal grid
	svg.selectAll("line.Grid").data(yScale.ticks()).enter()
			    .append("line")
			        .attr(
			        {
			            "class":"Grid",
			            "x1" : 0,
			            "x2" : w,
			            "y1" : function(d){ return yScale(d);},
			            "y2" : function(d){ return yScale(d);}
			        });

	//Create bars
	svg.selectAll("rect")
	   .data(dataset, key)		//Bind data with custom key function
	   .enter()
	   .append("rect")
	   .attr("x", function(d, i) {
	   		return xScale(d.Date);
	   })
	   .attr("y", function(d) {
	   		return yScale(d.Pac);
	   })
	   .attr("width", w / dataset.length + 1)
	   .attr("height", function(d) {
	   		return h - yScale(d.Pac);
	   })
	   .attr("fill", function(d) {
			return "rgb(255, " + Math.round(220 - d.Pac/100) + ", 0)";
	   })
         .append("title")
         .text(function(d) { // SVG Tool-tip
            var curr_time = d.Date;
            var curr_hour = curr_time.getHours();
            if (curr_hour.length == 1) { curr_hour = "0" + curr_hour;}
            var curr_min = curr_time.getMinutes();
            if (curr_min.length == 1) { curr_min = "0" + curr_min;}
            strTime = curr_hour + ":" + curr_min;
            return strTime + " Uhr; " + d.Pac + " W";

         });

	   // Create X-Axis
	   svg.append("g")
	   	.attr("class", "x axis")
	   	.attr("transform", "translate(0," + h + ")")
	   	.call(xAxis);

	  // Create Y-Axis
	   svg.append("g")
	   	.attr("class", "y axis")
	   	.call(yAxis);


   // Navigieren
   d3.select("#nav_for")
      .on("click", function() {

         // Set date + 1 day
         var tomorrow = new Date(today);
         tomorrow.setDate(tomorrow.getDate() + 1);
         checkDate(tomorrow);
      });

    d3.select("#nav_back")
      .on("click", function() {
         //Set date - 1 day
         var yesterday = new Date(today);
         yesterday.setDate(yesterday.getDate() - 1);
         checkDate(yesterday);
      });

   function checkDate(newDate) {
      var curr_date = newDate.getDate().toString();
      if (curr_date.length == 1) { curr_date = "0" + curr_date;}
      var curr_month = newDate.getMonth() + 1; // Months are 0 based
      if (curr_month.length == 1) { curr_month = "0" + curr_month;}
      var curr_year = newDate.getFullYear().toString().substr(2,2); // Format to 2 digits
      var strDate = curr_date + "." + curr_month + "." + curr_year;

      // csv filename
      csvToday = "csv/min" + curr_year + curr_month + curr_date + ".csv";

      d3.text(csvToday, "text/csv", function(error, csv) {
         if (error) {
            console.log("file not found");
         } else {
            today = newDate;

            // Update label
            d3.select("#nav_label")
                .text(strDate);

            // Invoke Update
            updateData(csv);
         }
      });
   }


   function updateData(csv) {

      // Clear data
      dataset = [];

      // Import Data
      csv = csv.replace("#", "");
      var data = dsv.parse(csv);

      data.forEach(function (data, i) {
          
          dataset.push({
              key: i,
              Date: new Date(data.Datum.replace(/(\d{2})\.(\d{2})\.(\d{2})/,'20$3-$2-$1') + " " + data.Uhrzeit),
              Pac: +data.Pac
          });
      });

      // Update x-Scale
      xScale.domain([dataset[0].Date, dataset[dataset.length - 1].Date]);

     // Update bars
     var bars = svg.selectAll("rect")
        .data(dataset, key);


     //Enter
     bars.enter()
        .append("rect")
        .attr("x", function(d, i) {
              return xScale(d.Date);
        })
        .attr("width", w / dataset.length + 1)
        .attr("height", 0)
        .attr("y", h)
        .attr("fill", function(d) {
           return "rgb(255, " + Math.round(220 - d.Pac/100) + ", 0)";
        })
        .transition()
        .duration(1000)
        .attr("y", function(d) {
              return yScale(d.Pac);
        })
        .attr("height", function(d) {
              return h - yScale(d.Pac);
        });


     // Update
     bars.transition()
        .duration(1000)
        .attr("x", function(d, i) {
              return xScale(d.Date);
        })
        .attr("y", function(d) {
              return yScale(d.Pac);
        })
        .attr("width", w / dataset.length + 1)
        .attr("height", function(d) {
              return h - yScale(d.Pac);
        })
        .attr("fill", function(d) {
           return "rgb(255, " + Math.round(220 - d.Pac/100) + ", 0)";
        })
        .text(function(d) { // SVG Tool-tip
           var curr_time = d.Date;
           var curr_hour = curr_time.getHours();
           if (curr_hour.length == 1) { curr_hour = "0" + curr_hour;}
           var curr_min = curr_time.getMinutes();
           if (curr_min.length == 1) { curr_min = "0" + curr_min;}
           strTime = curr_hour + ":" + curr_min;
           return strTime + " Uhr; " + d.Pac + " W";

        });

     // Exit
     bars.exit()
        .transition()
        .duration(1000)
        .attr("height", 0)
        .attr("y", h)
        .remove();

      // Update tooltips
     svg.selectAll("rect")
        .append("title")
        .text(function(d) { // SVG Tool-tip
           var curr_time = d.Date;
           var curr_hour = curr_time.getHours();
           if (curr_hour.length == 1) { curr_hour = "0" + curr_hour;}
           var curr_min = curr_time.getMinutes();
           if (curr_min.length == 1) { curr_min = "0" + curr_min;}
           strTime = curr_hour + ":" + curr_min;
           return strTime + " Uhr; " + d.Pac + " W";

        });

     // Update x-axis
     svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);

  }
}); 