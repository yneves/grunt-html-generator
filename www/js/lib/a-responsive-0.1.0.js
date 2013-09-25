(function(win) {

	var doc = win.document,
		sizes = [],
		handle = {},
		rules = {},
		opts = {},
		css = {
			"hidden": "display: none;",
			"visible": ["display: block;","display: none;"]
		},
		data = {
			type: "",
			width: 0,
			height: 0,
			current: "",
			previous: ""
		};

	function fire(type) {
		if (handle[type] instanceof Array) {
			for (var h in handle[type]) {
				data.type = type;
				handle[type][h].apply(win,[data]);
			}
		}
	}

	function handler(name) {
		if (!handle[name]) handle[name] = [];
		for (var i = 1; i < arguments.length; i++) {
			handle[name].push(arguments[i]);
		}
	}

	function create(name) {
		if (!rules[name]) {
			var sheet = doc.styleSheets[0],
				selector = "body."+name+" ."+name+"-";
			if (sheet) {
				for (var suffix in css) {
					rules[name] = true;
					var text = css[suffix];
					if (text instanceof Array && text.length == 2) {
						(sheet.insertRule) 
							? sheet.insertRule("."+name+"-"+suffix+"{"+text[1]+"}",0)
							: sheet.addRule("."+name+"-"+suffix,text[1],0);
						text = text[0];
					}
					(sheet.insertRule) 
						? sheet.insertRule(selector+suffix+"{"+text+"}",0)
						: sheet.addRule(selector+suffix,text,0);
				}
			}
		}
	}

	win.responsive = function(param) {

		// calling with an Event object, process new dimensions
		if (param instanceof Event || String(param) == "[object Event]") {

			data.event = param;
			data.width = win.innerWidth || doc.documentElement.clientWidth;
			data.height = win.innerHeight || doc.documentElement.clientHeight;

			// fire resize callbacks
			fire("resize");
			
			// match current defined size
			var match;
			for (var size in sizes) {
				if (sizes[size][0](data.width,data.height)) {
					match = sizes[size][1];
					break;
				}
			}

			if (match && match != data.current) {

				// add class to body element 
				if (opts.bodyClass !== false) {
					var cls = doc.body.className.split(/ +/),
						temp = [match];
					for (var c in cls) {
						if (cls[c] != data.current && cls[c] != match) 
							temp.push(cls[c]);
					}
					doc.body.className = temp.join(" ");
				}

				if (opts.createRules !== false) create(match);

				data.previous = data.current;
				data.current = match;

				// fire change and matched callbacks
				fire("change");
				fire(match);

			}

		// calling with Object, initialize responsiveness
		} else if (typeof param == "object") {

			for (var p in param) {

				// create test function for each defined size
				if (p == "sizes") {
					for (var size in param[p]) {
						handler(param[p][size]);
						sizes.push([
							new Function("width","height","return !!("+size+")"),
							param[p][size],
						]);
					}

				// options for classes
				} else if (p == "options") {
					opts = param[p];

				// anything else is a handler
				} else {
					handler(p,param[p]);
				}
			}

			if (opts.createRules !== false) {
				for (var h in handle) {
					 create(h);
				}
			}

		} else if (arguments.length == 0) {
			return data;
		}

	};

	function resize(event) {
		win.responsive(event || win.event);
	}

	// watch for window resize
	win.addEventListener 
		? win.addEventListener("resize",resize)
		: win.attachEvent("onresize",resize);

	// execute first time on page load
	win.addEventListener 
		? win.addEventListener("DOMContentLoaded",resize)
		: win.attachEvent("onload",resize);

})(window);