(function(win) {

// - -------------------------------------------------------------------- - //
// - Util

$.isString = function(str) { return typeof(str) === "string" }

// - -------------------------------------------------------------------- - //
// - 

$.args = function(map) {

	if (!$.isPlainObject(map)) map = {};
	if (!$.isFunction(map._)) map._ = function() {};

	for (var name in map) {
		if ($.isString(map[name])) {
			map[name] = $.isNumeric(name)
				? new Function(map[name])
				: new Function(name.split("").join(","),map[name]);
		}
	}

	var types = {
		"array"		: "a",
		"boolean"	: "b",
		"date"		: "d",
		"element"	: "e",
		"function"	: "f",
		"jquery"	: "j",
		"number"	: "n",
		"object"	: "o",
		"regexp"	: "r",
		"string"	: "s"
	};

	return function() {

		var args = arguments,
			signature = "";

		for (var a = 0; a < args.length; a++) {
			var arg = args[a],
				type = $.type(arg);
			if (type == "object") {
				if (arg.nodeType === 1 && $.isString(arg.nodeName)) {
					type = "element";
				} else if (arg.jquery) {
					type = "jquery";
				}
			}
			signature += types[type];
		}

		return (map[signature]
			? map[signature]
			: map[args.length]
				? map[args.length]
				: map._).apply(this,args);

	}
}

// - -------------------------------------------------------------------- - //
// - Plugin Factory

$.plugin = function(name,code) {
	if (!$.fn[name]) {
		$.fn[name] = $.isFunction(code) ? code : $.args(code);
	}
}

// - -------------------------------------------------------------------- - //
// - Class Factory

var Class = function() {

	var constructor = function() {
		var obj = this, 
			args = arguments;
		obj.e = {};
		obj.extend.apply(obj,args)
		obj.init.apply(obj,args);
	};

	constructor.prototype = {

		init: function() {
			this.fire("init");
		},

		on: function(event,callback) {
			var obj = this;
			if (!obj.e[event]) obj.e[event] = $.Callbacks("stopOnFalse");
			if ($.isFunction(callback)) obj.e[event].add(callback);
			return obj;
		},

		off: function(event,callback) {
			var obj = this;
			if (obj.e[event] && $.isFunction(callback)) obj.e[event].remove(callback);
			return obj;
		},

		has: function(event,callback) {
			var obj = this, has = false;
			if (obj.e[event] && $.isFunction(callback)) has = obj.e[event].has(callback);
			return has;
		},

		one: function(event,callback) {
			var obj = this;
			if ($.isFunction(callback)) {
				var func = function() {
					obj.off(event,func);
					callback.apply(obj,arguments);
				};
				obj.on(event,func);
			}
			return obj;
		},

		fire: function(event,args) {
			var obj = this;
			args = args || [];
			if (obj.e[event]) obj.e[event].fireWith(obj,args);
			return obj;
		},

		extend: function() {
			var obj = this,
				args = arguments;
			for (var a = 0; a < args.length; a++) {
				if ($.isPlainObject(args[a])) {
					for (var o in args[a]) {
						if ($.isFunction(args[a][o])) {
							obj.on(o,args[a][o]);
						} else {
							obj[o] = args[a][o];
						}
					}
				}
			};
			return obj;
		},

	};

	// extends class prototype
	var args = arguments;
	for (var a = 0; a < args.length; a++) {
		if ($.isPlainObject(args[a])) {
			for (var m in args[a]) {
				if ($.isString(args[a][m])) {
					args[a][m] = new Function(args[a][m]);
				} else if ($.isPlainObject(args[a][m])) {
					args[a][m] = $.args(args[a][m]);
				}
			}
		}
		$.extend(constructor.prototype,args[a]);
	}

	return constructor;
}

// - -------------------------------------------------------------------- - //
// - View Class

var View = Class({

	done: function() {
		return this.fire("done");
	},

	render: function() {
		var obj = this,
			args = [],
			done = [];
		for (var a = 0; a < arguments.length; a++) {
			$.isFunction(arguments[a])
				? done.push(arguments[a])
				: args.push(arguments[a]);
		}
		for (var d = 0; d < done.length; d++) {
			obj.one("done",done[d]);
		}
		if (obj.cache) {
			var serialized = $.param({_:args});
			if (obj.cache && obj.cache == serialized) {
				obj.done();
			} else {
				obj.fire("render",args);
				obj.cache = serialized;
				if (!obj.async) obj.done();
			}
		} else {
			obj.fire("render",args);
			if (!obj.async) obj.done();
		}
		return obj;
	}

});

// - -------------------------------------------------------------------- - //
// - View Plugin

$.plugin("view",{
	0: "return this.data('view')",
	f: "return this.view('render',callback)",
	o: function(params) {
		return this.each(function() {
			var elm = $(this),
				view = elm.data("view");
			if (!view) {
				view = new View({ elm: elm });
				elm.data("view",view);
			}
			view.extend(params);
		});
	},
	sa: function(method,args) {
		return this.each(function() {
			var view = $(this).data("view");
			if (view && $.isFunction(view[method])) view[method].apply(view,args);
		});
	},
	sf: function(event,callback) {
		return this.each(function() {
			var view = $(this).data("view");
			if (view) view.on(event,callback);
		});
	}
});

// - -------------------------------------------------------------------- - //
// - Render Plugin

$.plugin("render",function() {
	var args = arguments;
	return this.each(function() {
		var view = $(this).data("view");
		if (view) view.render.apply(view,args);
	});
});

// - -------------------------------------------------------------------- - //
// - Router Class

var Router = Class({

	init: function() {
		var obj = this;
		obj.hashchange = [];
		obj.current = { stack: [], length: 0 };
		$(function() { 
			obj.fire("init");
			obj.change(function() { obj.change() }).change();
		});
	},

	change: {
		
		0: function() {

			var obj = this,
				current = obj.current,
				previous = $.extend({},current),
				stack = current.stack,
				initial =  current.length,
				length = win.history.length,
				hash = win.location.href.split("#")[1] || "";

			current.hash = hash;
			current.back = false;
			current.forward = false;
			current.previous = previous;

			if (previous) {
				if (previous.hash != hash) {
					if (stack.length > 0 && initial == length) {
						if (stack[stack.length - 2] == hash) {
							stack = stack.slice(0,-1);
							current.back = true;
						} else {
							stack.push(hash);
							current.forward = true;
						}
					} else {
						stack.push(hash);
						current.length = length;
					}
					obj.route();
				}
			} else {
				$(function() { 
					obj.route() 
				});
			}

			return obj;
		},

		f: function(callback) {

			var obj = this;

			if (obj.hashchange.length == 0) {

				var listen = win.addEventListener ? "addEventListener" : "attachEvent"
					name = win.addEventListener ? "hashchange" : "onhashchange",
					support = win[listen] && ("onhashchange" in win),
					change = function () {
						for (var c = 0; c < obj.hashchange.length; c++) {
							obj.hashchange[c].apply(obj,[]);
						}
					};

				if (support) {
					win[listen](name,change,false);
				} else {
					obj.interval = setInterval(change,50);
				}

			}

			obj.hashchange.push(callback);

			return obj;
		}


	},

	route: {

		f: "return this.on('route',f);",

		s: function(url) {
			var obj = this;
			if (win.location.hash == "#"+url) {
				obj.route();
			} else {
				win.location.hash = url;
			}
			return obj;
		},

		0: function() {

			var obj = this,
				current = obj.current,
				hash = current.hash,
				routes = obj.routes || {},
				rules = obj.rules || {},
				path = hash.length > 0 ? hash.split("/") : [],
				route;

			if (path.length > 0) {

				for (var p = 0; p < path.length; p++) {
					path[p] = decodeURIComponent(path[p]);
				}

				for (var p in routes) {

					if (p != "*") {

						var parts = p.split("/"),
							match = 0,
							params = {};

						if (parts.length == path.length) {

							for (var r = 0; r < parts.length; r++) {

								var part = parts[r].split(":");

								if (part.length == 1) {
									if (part[0] == parts[r]) {
										match++;
									} else {
										break;
									}

								} else if (part.length == 2) {

									var length = part[0].length,
										pos = length > 0 ? parts[r].indexOf(part[0]) : length;
									if (pos == 0) {
										var name = part[1],
											value = path[r].substr(pos + length);

										if (!rules[name] || rules[name].test(value)) {
											params[name] = value;
											match++;
										} else {
											break;
										}

									} else {
										break;
									}
								}

							}

							if (match == parts.length) {

								route = $.extend({
									route		: routes[p],
									params		: params,
									path		: path,
									refresh		: current.refresh
								},current);

								break;

							}

						}

					}

				}

			}

			if (!route && routes["*"]) {
				route = $.extend({
					route		: routes["*"],
					params		: {},
					path		: path,
					refresh		: current.refresh
				},current);
			}

			if (route) {
				route.back && obj.fire("back",[route]);
				route.forward && obj.fire("forward",[route]);
				route.route && obj.fire("route",[route]);
				route.route && obj.fire(route.route,[route]);
			}

			return obj;
		}
	
	}

});

// - -------------------------------------------------------------------- - //
// - Router Plugin

$.plugin("router",{
	0: "return this.data('router')",
	f: "return this.router('route',callback)",
	s: "return this.router('route',[s])",
	o: function(params) {
		return this.each(function() {
			var elm = $(this),
				router = elm.data("router");
			if (!router) {
				router = new Router({ elm: elm });
				elm.data("router",router);
			}
			router.extend(params);
		});
	},
	sa: function(method,args) {
		return this.each(function() {
			var router = $(this).data("router");
			if (router && $.isFunction(router[method])) router[method].apply(router,args);
		});
	},
	sf: function(event,callback) {
		return this.each(function() {
			var router = $(this).data("router");
			if (router) router.on(event,callback);
		});
	}
});

// - -------------------------------------------------------------------- - //
})(window)