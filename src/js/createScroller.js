import * as graphScroll from 'graph-scroll'
import * as d3 from 'd3'

export function createScroller() {
var button,regPicks,intPicks,features,svg;
var activateFunctions = [];
var gW = document.querySelector("#graphic").getBoundingClientRect().width,
gH = gW*0.6,
r = 40;
console.log(gW);

var pageHeight = document.documentElement.clientHeight

d3.selectAll('#sections > div').style("height", pageHeight + "px")

var gs = graphScroll.graphScroll()
    .container(d3.select('#container1'))
    .graph(d3.selectAll('.graphicContainer'))
    .sections(d3.selectAll('#sections > div'))
    .on('active', function(i){
        activateFunctions[i]();
    });
console.log("pageHeight",pageHeight,"gW",gW,"gH",gH)

svg = d3.select('#graphic').append('svg')
  .attr("width", gW)
  .attr("height", gH)

features = svg.append("g")

console.log(svg);

var scoreCounter = 0;
function makeButton() {

  console.log("makeButton");
  console.log(svg);
  button = features.append('circle');

  button
    .attr("id","button")
    .style("fill","#4bc6df")
    .attr("cx", gW/2)
    .attr("cy",gH/2)
    .attr("r",0)


} //end makeButton

function submitTimes(times) {

    var gformUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScSAqULG2Ozj7JPQAfjKs9nPYR8Kv3XhVACPH0ddCMKD3mc9Q/formResponse';
    var dataTimes = {'entry.1898863029':times}
    var data = '';
    for (var key in dataTimes) {
        data += encodeURIComponent(key) + '=' + encodeURIComponent(dataTimes[key]) + '&';
    }
    console.log(data)
    var xhr = new XMLHttpRequest();
    xhr.open('POST', gformUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data.substr(0, data.length-1));

}


d3.select("#testButton").on("click",function() { blahReq()})

function regularReward() {


  button
    .transition()
    .attr("r",40);

    console.log('regularReward')

    regPicks = [];

    scoreCounter = 0;
    var hasClicked = false;
    var firstTime;

    d3.select("#scoreCounter").html(scoreCounter);

   function giveScore() {

      button
      .transition()
        .duration(50)
        .attr("r",r-2)
      .transition()
        .duration(50)
        .attr("r",r) 

    var rewardPick = 100;
    console.log(rewardPick);
    scoreCounter = scoreCounter + rewardPick;

    if (!hasClicked) {
      firstTime = new Date();
      hasClicked = true;
    }
    
    var now = new Date();

    var timeDiff = now - firstTime;
    console.log(timeDiff);
    regPicks.push({'score':scoreCounter,'time':timeDiff});

    console.log(scoreCounter);
    d3.select("#scoreCounter").html(scoreCounter);

      svg.append("text")
        .attr("x", gW/2)
        .attr("text-anchor", "middle")
        .attr("y", gH/2 - r)
        .text(rewardPick)
      .transition()
        .duration(1000)
        .ease(d3.easeLinear)
          .style("opacity",0)
          .attr("x", gW/2)
          .attr("y", gH*0.1)    
          .remove();

    }  

    button
      .on("click", giveScore);

}


function intermittentReward() {

    console.log('intermittentReward')
    intPicks = [];
    scoreCounter = 0;
    d3.select("#scoreCounter").html(scoreCounter);
    var hasClicked = false;
    var firstTime;

    button
      .transition()
      .style("fill","#005689")

    function giveScore() {

    button
      .transition()
        .duration(50)
        .attr("r",r-2)
      .transition()
        .duration(50)
        .attr("r",r) 

    var rewardOnly = [100,0,0,0,0];
    var rewardPick = rewardOnly[Math.floor(Math.random() * (rewardOnly.length)) + 0];
    console.log(rewardPick);
    scoreCounter = scoreCounter + rewardPick;
    console.log(scoreCounter);


    if (!hasClicked) {
      firstTime = new Date();
      hasClicked = true;
    }
    
    var now = new Date();

    var timeDiff = now - firstTime;
    console.log(timeDiff);
    intPicks.push({'score':scoreCounter,'time':timeDiff});

    d3.select("#scoreCounter").html(scoreCounter);
    
      svg.append("text")
        .attr("x", gW/2)
        .attr("text-anchor", "middle")
        .attr("y", gH/2 - r)
        .text(rewardPick)
      .transition()
        .duration(1000)
        .ease(d3.easeLinear)
          .style("opacity",0)
          .attr("x", gW/2)
          .attr("y", gH*0.1)    
          .remove();

    }


      button
    .on("click", giveScore);

  } //end intermittentReward();

function graphResults() {

  var times = {"regTotal":regPicks[regPicks.length-1],"intPicks":intPicks[intPicks.length-1]}
  submitTimes(JSON.stringify(times));
  var temp = regPicks.concat(intPicks);

  button
    .transition()
    .attr("r",0);

  
  var x = d3.scaleLinear()
            .range([0, gW]);

  var y = d3.scaleLinear()
            .range([gH, 0]);

  x.domain(d3.extent(temp, function(d) { return d.time; }));
  y.domain(d3.extent(temp, function(d) { return d.score; }));  

  var line = d3.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.score); });    

  svg.append("path")
      .datum(regPicks)
      .attr("class", "line")
      .style("stroke","#4bc6df")
      .attr("d", line)

  svg.append("path")
      .datum(intPicks)
      .attr("class", "line")
      .style("stroke","#005689")
      .attr("d", line)    

} //end graphReg


function doNothing() {
  console.log("yieewwww")
}// 


makeButton();
activateFunctions[0] = regularReward;
activateFunctions[1] = intermittentReward;
activateFunctions[2] = doNothing;
activateFunctions[3] = graphResults;



d3.select('#footer')
    .style({'margin-bottom': window.innerHeight - 500 + 'px', padding: '100px'})

}