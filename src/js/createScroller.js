import * as graphScroll from 'graph-scroll'
import * as d3 from 'd3'
import detectIE from './detectIE'

export function createScroller(networkData,donorData) {

var version = detectIE();	
var features,svg,simulation;
var activateFunctions = [];
var pageWidth = document.documentElement.clientWidth;
var pageHeight = document.documentElement.clientHeight;
var width,height;
var firstRun = true;
var twoColumns = false;

if (twoColumns) {
	var width = document.querySelector("#graphic").getBoundingClientRect().width,
	height = width*0.6;
}

else {
	var width = document.querySelector("#container1").getBoundingClientRect().width,
	height = pageHeight*0.66;
}

var margin = {top: 0, right: 0, bottom: 0, left:0};
var scaleFactor = width/1300;


d3.selectAll('#sections > div').style("height", pageHeight*0.33 + "px")

d3.select(d3.selectAll('#sections > div').nodes().pop()).style("height", pageHeight + "px")

var gs = graphScroll.graphScroll()
	.container(d3.select('#container1'))
	.graph(d3.selectAll('.graphicContainer'))
	.sections(d3.selectAll('#sections > div'))
	.on('active', function(i){
		activateFunctions[i]();
	});

var tempRadiusData = [];
var tempLinkData = [];
var nodeCounts = [];

d3.values(networkData).forEach(function(d) {
	nodeCounts.push(d.nodes.length);
	d.nodes.forEach(function (nodeData) {
		tempRadiusData.push(nodeData.totalDonationsMade);
		tempRadiusData.push(nodeData.totalReceivedDonations);
	})
	d.links.forEach(function (linkData) {
		tempLinkData.push(linkData.value);
	})
});


var selector = d3.select("#partySelector");
var allEntities = d3.keys(networkData);



allEntities.sort(function(x, y){
   return d3.ascending(x, y);
})

allEntities.forEach(function (key) {
	selector.append("option")
		.attr("value",key)
		.text(key)
})

selector.on("change", function() {
	makeChart(d3.select(this).property('value'));
	entityID = document.getElementById('partySelector').selectedIndex;
	console.log(entityID);
});


var numFormat = d3.format(",.0f");


svg = d3.select("#graphic").append("svg")
				.attr("width", width - margin.left - margin.right)
				.attr("height", height - margin.top - margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");

features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var outline = d3.scaleOrdinal()
				.domain(['Other Receipt','Donation','Mixed','Unknown'])
				.range(['#005689','#b82266','#767676','#767676'])	

var nodeColors = d3.scaleOrdinal()
					.domain(['alp','greens','liberal','nationals','minor','AssociatedEntity','Donor'])
					.range(['#b51800','#298422','#005689','#aad8f1','#767676','#fc8d62','#66c2a5'])				

var linkColors = d3.scaleOrdinal()
					.domain(['Other Receipt','Donation','Mixed','Subscription','Unknown'])
					.range(['#005689','#b82266','#767676','#767676'])							

var radiusVal = 3;				

var topRadius = 50 * scaleFactor;
var bottomRadius = 4 * scaleFactor;

var radius = d3.scaleSqrt()
				.range([bottomRadius,topRadius])    
				.domain(d3.extent(tempRadiusData))				

var defs = svg.append("svg:defs");

function arrow(color) {				
	defs.append("svg:marker")    
	    .attr("id", color.replace("#", ""))
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 0)
	    .attr("refY", 0)
	    .attr("markerWidth", 4)
	    .attr("markerHeight", 4)
	    .attr("orient", "auto")
	    .style("fill", color)
	    .style("opacity",0.8)
	  .append("svg:path")
	    .attr("d", "M0,-5L10,0L0,5");

	return "url(" + color + ")";    				
}    

function makeChart(partyName) {

	console.log("makeChart")

	simulation.stop();

	console.log(donorData);

	features.selectAll(".links")
		.transition()
		.style("opacity",0)
		.remove();

	features.selectAll(".nodes circle")
		.transition()
		.attr("r",0)
		.remove();

	features.selectAll(".nodes")
		.transition()
		.remove();	

	features.selectAll(".nodes text")
		.transition()
		.style("opacity",0)
		.remove();
	
	var totalNodes = networkData[partyName].nodes.length;

	simulation = d3.forceSimulation()
		    .force("link", d3.forceLink().id(function(d) { return d.name; }).distance(distance))
		    .force("collide", d3.forceCollide().radius(function(d) { 
		    	if (d.totalDonationsMade > d.totalReceivedDonations ) {
	      		return radius(d.totalDonationsMade) + radiusVal; 
	      	}

	      	else {
	      		return radius(d.totalReceivedDonations) + radiusVal; 
	      	}
		    }).iterations(2))
		    .force("charge", d3.forceManyBody().strength(charge))
		    .force("center", d3.forceCenter(width / 2, height / 2));	

	var forceStrength = 150;	

	function charge(d) {
		if (d.totalDonationsMade > d.totalReceivedDonations ) {
				return -4 * (radius(d.totalDonationsMade) + radiusVal);
			}	
      	else {
      		return -4 * (radius(d.totalReceivedDonations) + radiusVal); 
      	}

	}

	function distance(d) {
		var tempLinkLength = []
		tempLinkLength.push(d.source.totalDonationsMade);
		tempLinkLength.push(d.target.totalDonationsMade);
		tempLinkLength.push(d.source.totalReceivedDonations);
		tempLinkLength.push(d.target.totalReceivedDonations);
		return 3 * (radius(d3.max(tempLinkLength)) + radiusVal);
	}  

		

  	var link = features.append("g")
			    .attr("class", "links")
			    .selectAll("line")
				    .data(networkData[partyName].links)
				    .enter().append("line")
				    .attr("stroke-width", function(d) { return 2 })
				    .attr("stroke", function(d) { 
				    	return linkColors(d.type);
				    })
				    .each(function(d) {
				    	if (version === false) {
				    		d3.select(this).attr("marker-end", arrow(linkColors(d.type)));
						}
			        });


	var node = features.append("g")
	      .attr("class", "nodes")
	    .selectAll("circle")
	    .data(networkData[partyName].nodes)
	    .enter().append("circle")
	      .attr("r", function(d) { 
	      	if (d.totalDonationsMade > d.totalReceivedDonations ) {
	      		return radius(d.totalDonationsMade) + radiusVal; 
	      	}

	      	else {
	      		return radius(d.totalReceivedDonations) + radiusVal; 
	      	}
	      	
	      })
	      .attr("fill", function(d) { return nodeColors(d.type); })
	      .attr("stroke", function(d) {
	      		return outline(d.nodeType);
	      })
	      .call(d3.drag()
	          .on("start", dragstarted)
	          .on("drag", dragged)
	          .on("end", dragended));

		  simulation
		      .nodes(networkData[partyName].nodes)
		      .on("tick", ticked);

		  simulation.force("link")
		      .links(networkData[partyName].links);



	  function ticked() {

	  	node.attr("cx", function(d) {
	  		var r = radius(d3.max([d.totalDonationsMade, d.totalReceivedDonations]))
	  			return d.x = Math.max(r + 4, Math.min(width - (r + 4), d.x)); 
	  		})
        	.attr("cy", function(d) {
        	var r = radius(d3.max([d.totalDonationsMade, d.totalReceivedDonations]))	
        		return d.y = Math.max(r + 4, Math.min(height - (r + 4), d.y)); 
        	});

	    link
	        .attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { 
	        	// var r = radius(d3.max([d.target.totalDonationsMade, d.target.totalReceivedDonations]))
	        	// console.log(d.target);
	        	// return d.target.x; 
	        	return getTargetNodeCircumferencePoint(d)[0];
	        })
	        .attr("y2", function(d) { 
	        	// var r = radius(d3.max([d.target.totalDonationsMade, d.target.totalReceivedDonations]))
	        	// return d.target.y; 
	        	return getTargetNodeCircumferencePoint(d)[1];
	        });

	    
	    function getTargetNodeCircumferencePoint(d){
	    	
	    	var nodeBuffer = 12;
	    	if (version != false) {
				    		nodeBuffer = 4
			}

	        var t_radius = radius(d3.max([d.target.totalDonationsMade, d.target.totalReceivedDonations])) + nodeBuffer; // nodeWidth is just a custom attribute I calculate during the creation of the nodes depending on the node width
	        var dx = d.target.x - d.source.x;
	        var dy = d.target.y - d.source.y;
	        var gamma = Math.atan2(dy,dx); // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan
	        var tx = d.target.x - (Math.cos(gamma) * t_radius);
	        var ty = d.target.y - (Math.sin(gamma) * t_radius);
	        return [tx,ty]; 
		}   


	  	}

	function dragstarted(d) {
		d3.select(".d3-tip").style("display", "none");
	  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	  d.fx = d.x;
	  d.fy = d.y;
	}

	function dragged(d) {
	  d.fx = d3.event.x;
	  d.fy = d3.event.y;
	}

	function dragended(d) {
		d3.select(".d3-tip").style("display", "block");
	  if (!d3.event.active) simulation.alphaTarget(0);
	  d.fx = null;
	  d.fy = null;
	}    

}  

function makeBubbles() {

	console.log("makeBubbles", firstRun, donorData);
	if (!firstRun) {
		simulation.stop();
	}

	var bubbleRadius = d3.scaleSqrt().range([4, 50]).domain(d3.extent(donorData, function(d) {return d.sum}));

	features.selectAll(".links")
		.transition()
		.style("opacity",0)
		.remove();

	// features.selectAll(".nodes circle")
	// 	.transition()
	// 	.attr("r",0);

	features.selectAll(".nodes")
		.remove();

	var center = {x: width / 2, y: height / 2};
	var forceStrength = 0.03;

	simulation = d3.forceSimulation(donorData)
	    .velocityDecay(0.2)
		  .force('x', d3.forceX().strength(forceStrength).x(center.x))
		  .force('y', d3.forceY().strength(forceStrength).y(center.y))
		  .force('charge', d3.forceManyBody().strength(-10))
		  .force("collide", d3.forceCollide().radius(function(d) { return bubbleRadius(d.sum) + 0.5; }).iterations(2))
	    .alphaTarget(1)
	    .on("tick", ticked);

	function charge(d) {
	  return -forceStrength * Math.pow(bubbleRadius(d.sum), 2.0);
	}    

	function ticked() {
	 	features.selectAll(".nodes").attr("transform", function(d) { return "translate(" + Math.max(bubbleRadius(d.sum), Math.min(width - bubbleRadius(d.sum), d.x)) + "," + Math.max(bubbleRadius(d.sum), Math.min(height - bubbleRadius(d.sum), d.y)) + ")" });
	}

	var node = features.selectAll(".nodes").data(donorData);

	var nodeContainer = node.enter()
			.append("g")
			.attr("class","nodes");

	nodeContainer
			.append("circle")		
			.attr("fill", function(d) { return nodeColors(d.donType); })
			.attr("r", 0)

	nodeContainer
			.append("text")
			.attr("text-anchor", "middle")
			.attr("dy", function(d) { return -1 * bubbleRadius(d.sum);})		
			.text(function(d) { return "$" + d.sum });	

	d3.selectAll(".nodes circle")
		.transition()
		.attr("r",function (d) {
			console.log(d);
			return bubbleRadius(d.sum);
		});

	d3.selectAll(".nodes text")
		.transition()
		.attr("dy", function(d) { return -1 * bubbleRadius(d.sum);});

	// Update and restart the simulation.
	simulation.nodes(donorData);   
	firstRun = false;

}


function bubbles() {
  makeBubbles();
}

function doNothing() {
  console.log("yieewwww")
}

function cormack() {
	makeChart('Cormack Foundation Pty Ltd');
}

function laborHoldings() {
	makeChart('Labor Holdings Pty Ltd');
}

function liberalparty() {
	makeChart('Liberal Party of Australia');
}


// makeChart('Cormack Foundation Pty Ltd');

activateFunctions[0] = bubbles;
activateFunctions[1] = cormack;
activateFunctions[2] = laborHoldings;
activateFunctions[3] = liberalparty;
activateFunctions[4] = doNothing;


d3.select('#footer')
	.style({'margin-bottom': window.innerHeight - 500 + 'px', padding: '100px'})

}