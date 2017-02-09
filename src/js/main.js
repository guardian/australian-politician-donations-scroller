import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import share from './lib/share'
import networkData from './text/networkData.json!json'
import donorData from './text/donorData.json!json'
import { scrollTo } from './lib/scrollto'
import { createScroller } from './createScroller'

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');


export function init(el, context, config, mediator) {

window.functionCounter = 0;
window.firstRun = true;

el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath)
console.log("blah")

createScroller(networkData,donorData);

var to=null
var lastWidth = document.querySelector(".interactive-container").getBoundingClientRect()
window.addEventListener('resize', () => {
  var thisWidth = document.querySelector(".interactive-container").getBoundingClientRect()
  if (lastWidth != thisWidth) {
    window.clearTimeout(to);
    to = window.setTimeout(function() {
    	createScroller(networkData,donorData);
    	scrollTo(document.querySelector("#no" + functionCounter));

    }, 500)
  }
})

}


