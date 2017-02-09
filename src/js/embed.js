import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import share from './lib/share'
import networkData from './text/networkData.json!json'
import donorData from './text/donorData.json!json'
import { createScroller } from './createScroller'

window.init = function init(el, config) {

	el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath)
	console.log("blah")

	createScroller(networkData,donorData);
};
