import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import share from './lib/share'
import { createScroller } from './createScroller'

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');

export function init(el, context, config, mediator) {

el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath)
console.log("blah")


setTimeout(function() {
createScroller()
},100)

}


