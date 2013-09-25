(function(win) {
// - -------------------------------------------------------------------- - //
// - Responsive

responsive({
	sizes: {
		"width > 800": "large",
		"width > 480": "medium",
		"width > 240": "small"
	}
});

// - -------------------------------------------------------------------- - //
// - Stuff

function encode(str) {
	return str
		.replace(/ +|\:+/g,"-")
		.replace(/[^\w^\-]/g,"")
		.replace(/[-]{2,}/g,"-")
		.replace(/-+$/g,"");
}

function encid(str) {
	return encode(str).toLowerCase();
}

function date(date) {
	// 23 Aug 2013 21:03 GMT
	return date.substring(5,date.length-7)+" GMT";
}

function number(num) {
	var chars = String(num).split("").reverse(),
		temp = [];
	for (var c = 0; c < chars.length; c++) {
		temp.unshift(chars[c]);
		if ((c+1) % 3 == 0 && chars.length > 3) {
			temp.unshift(".");
		}
	}
	return temp.join("");
}

function decimal(number,fixed) {
	fixed = fixed || 1;
	return parseFloat(number).toFixed(fixed);
}

function percent(count,total) {
	if (total > 0 && count > 0) {
		var p = (count * 100) / total;
		return decimal(p,2)+"%";
	} else {
		return "-";
	}
}

// - -------------------------------------------------------------------- - //
// - Stats

$(function() {
	$("#stats").view({
		async: true,
		done: function() { $(win).resize() },
		render: function() {
			var render = this;
			$.getJSON("data/stats.json",function(data) {
				var caption = {
					flags: "flags",
					users: "players",
					checkmate: "checkmates",
					matches: "games"
				};		
				var ul = render.elm.find("ul").empty();
				var items = ["flags","users","matches","checkmate"];
				for (var d = 0; d < items.length; d++) {
					var item = items[d];
					$("<li>")
						.addClass("small-hidden medium-hidden")
						.append( $("<strong>").html(number(data[item])) )
						.append( " " )
						.append( $("<span>").html(caption[item]) )
						.appendTo(ul);
				}

				$("<li>")
					.append( $("<strong>").html("Updated") )
					.append( " " )
					.append( $("<span>").html(date(data.date)) )
					.appendTo(ul);
				render.done();
			});
		}
	});
});

// - -------------------------------------------------------------------- - //
// - Divisions

$(function() {
	$("#divisions").view({
		cache: true,
		async: true,
		done: function() { $(win).resize() },
		render: function(league) {
			var link = $("#leagues a[href='#"+league+"']"),
				url = "data/"+league+"/data-"+league+".json",
				render = this,
				ul = render.elm.find("ul").empty();
			link.parent().addClass("active").siblings().removeClass("active");
			$.getJSON(url,function(data) {
				$.each(data,function(idx,div) {
					var name = div.title.split(" ").pop();
					$("<li>")
						.width((100/data.length)+"%")
						.data("record",div)
						.html( $("<a>").attr({ href:"#"+league+"/"+name }).html(name) )
						.attr("title",div.title)
						.appendTo(ul);
				});
				render.done();
			});
		}
	});
});

// - -------------------------------------------------------------------- - //
// - Teams

$(function() {
	$("#teams").view({
		cache: true,
		done: function() { $(win).resize() },
		render: function(league,division) {
			
			var render = this,
				link = $("#divisions a[href='#"+league+"/"+division+"']"),
				data = link.parent().data("record");

			link.parent().addClass("active").siblings().removeClass("active");

			var teams = [];
			for (var team in data.teams) {
				teams.push(data.teams[team]);
			}
			teams = teams.sort(function(a,b) {
				if (a.score > b.score) {
					return -1;
				} else if (a.score < b.score) {
					return 1;
				} else {
					if (a.tiebreak > b.tiebreak) {
						return -1;
					} else if (a.tiebreak < b.tiebreak) {
						return 1;
					} else {
						return 0;
					}
				}
			});


			render.elm.find("table").table(
				[data.title,"Points","Tiebreak",["Wins","small-hidden medium-hidden"],["Draws","small-hidden medium-hidden"],["Losses","small-hidden medium-hidden"],["Timeouts","small-hidden medium-hidden"],["Closed","small-hidden medium-hidden"]],
				teams,
				function(team) {
					var teamid = encode(team.title),
						flag = $("<img>").addClass("flag").attr({ id: encid(team.title)+"-flag", src: team.flag }),
						url = "#"+league+"/"+division+"/"+teamid,
						link = $("<a>").attr({ href: url }).append(flag).append(team.title),
						popout = $("<img>").attr({ src: "img/popout.png" }),
						gurl = "http://www.chess.com/groups/view/"+encode(team.title).toLowerCase(),
						out = $("<a>").addClass("popout").attr({ href: gurl, target:"_blank" }).append(popout);
					return [
						link.add(out),
						decimal(team.score),
						decimal(team.tiebreak,2),
						[$("<span>").html(team.count.win).attr({ title: percent(team.count.win,team.count.total) }),"small-hidden medium-hidden"],
						[$("<span>").html(team.count.draw).attr({ title: percent(team.count.draw,team.count.total) }),"small-hidden medium-hidden"],
						[$("<span>").html(team.count.lose).attr({ title: percent(team.count.lose,team.count.total) }),"small-hidden medium-hidden"],
						[$("<span>").html(team.count.timeout).attr({ title: percent(team.count.timeout,team.count.total) }),"small-hidden medium-hidden"],
						[$("<span>").html(team.unique.closed).attr({ title: team.count.closed+" - "+percent(team.count.closed,team.count.total) }),"small-hidden medium-hidden"]
					];
				}
			);
		}
	});

});

// - -------------------------------------------------------------------- - //
// - Rounds

$(function() {
	$("#rounds").view({
		cache: true,
		async: true,
		done: function() { $(win).resize() },
		render: function(league,division) {

			var render = this,
				link = $("#divisions a[href='#"+league+"/"+division+"']"),
				data = link.parent().data("record"),
				rounds = render.elm.empty(),
				count = 0,
				total = 0,
				completed = 0;

			$("<br/>")
				.addClass("clear")
				.appendTo(rounds);

			$.each(data.rounds,function(key,round) {
				count++;
				var matches = [];
				$.each(round,function(k,match) {
					match = {
						teams: match[0],
						score: match[1],
						players: match[2],
						completed: match[3]
					};
					total += match.players * 2;
					completed += match.completed;
					matches.push(match);
				});

				$("<table>")
					.addClass("rounds")
					.toggleClass("odd",count%2!=0)
					.toggleClass("even",count%2==0)
					.appendTo(rounds)
					.table(
						[[key,"",7],"","Players","Completed"],
						matches,
						function(match) {

							return [
								[$("<a>").attr({ href: "#"+league+"/"+division+"/"+encode(match.teams[0])+"/"+encode(match.teams[1]) }).html(match.teams[0]),"first"],
								[$("#"+encid(match.teams[0])+"-flag").clone(),"flag"],
								[$( match.score[0] > match.score[1] ? "<strong>" : "<span>" ).html(decimal(match.score[0],1)),"score"],
								["vs","flag"],
								[$( match.score[0] < match.score[1] ? "<strong>" : "<span>" ).html(decimal(match.score[1],1)),"score"],
								[$("#"+encid(match.teams[1])+"-flag").clone(),"flag"],
								[$("<a>").attr({ href: "#"+league+"/"+division+"/"+encode(match.teams[1])+"/"+encode(match.teams[0]) }).html(match.teams[1]),"last"],
								["","fill"],
								[match.players,"players"],
								[percent(match.completed,match.players*2),"completed"],
							];
						}
					);

			});

			$("<br/>")
				.addClass("clear")
				.appendTo(rounds);

			var width = [], tds = rounds.find("table td.first");
			tds.each(function() {
				width.push($(this).width());
			});
			tds.width(Math.max.apply(Math,width));

			render.done();
						
		}
	});
});

// - -------------------------------------------------------------------- - //
// - Matches

$(function() {
	$("#matches").view({
		cache: true,
		async: true,
		done: function() { $(win).resize() },
		render: function(league,division,team) {
			var link = $("a[href='#"+league+"/"+division+"/"+team+"']"),
				tr = link.parent().parent(),
				data = tr.data("record"),
				title = link.text(),
				render = this,
				table = render.elm.find("table");
			tr.addClass("active").siblings().removeClass("active");
			function renderData(tdata) {
				tr.data("record",tdata);
				table.table(
					[title,["Score","",3],["Adjustment","small-hidden medium-hidden",3],["Players","small-hidden medium-hidden"],["Timeouts","small-hidden medium-hidden"],["Closed","small-hidden medium-hidden"]],
					tdata.matches,
					function(match) {
						var teamid = team,
							otherid = encode(match.team),
							url = "#"+league+"/"+division+"/"+teamid+"/"+otherid,
							link = $("<a>").attr({ href: url }).append(title," vs ",match.team),
							popout = $("<img>").attr({ src: "img/popout.png" }),
							out = $("<a>").addClass("popout").attr({ href: match.url, target:"_blank" }).append(popout);
						return [
							link.add(out),
							(match.score[0] > match.score[1]) ? $("<strong>").html(decimal(match.score[0])) : decimal(match.score[0]),
							["x","cspan"],
							[(match.score[1] > match.score[0]) ? $("<strong>").html(decimal(match.score[1])) : decimal(match.score[1]),"cspan"],
							[decimal(match.adjustment[0]),"small-hidden medium-hidden"],
							["x","cspan small-hidden medium-hidden"],
							[decimal(match.adjustment[1]),"cspan small-hidden medium-hidden"],
							[match.players,"small-hidden medium-hidden"],
							[$("<span>").html(match.count.timeout).attr({ title: percent(match.count.timeout,match.count.total) }),"small-hidden medium-hidden"],
							[$("<span>").html(match.unique.closed).attr({ title: match.count.closed+" - "+percent(match.count.closed,match.count.total) }),"small-hidden medium-hidden"]
						];
					}
				);
				render.done();
			}
			$.isString(data.matches)
				? $.getJSON(data.matches,renderData)
				: renderData(data);
		}
	});
});

// - -------------------------------------------------------------------- - //
// - Users

$(function() {
	$("#users").view({
		cache: true,
		done: function() { $(win).resize() },
		render: function(league,division,team,match,sortby) {

			var parts = [league,division,team];
			if (match) parts.push(match);
			
			var render = this,
				link = $("#teams, #matches").find("a[href='#"+parts.join("/")+"']"),
				tr = link.parent().parent(),
				data = tr.data("record"),
				ref = { Rating: "rating", Wins: "win", Draws: "draw", Losses: "lose", Timeouts: "timeout", Closed: "closed" },
				cols = ["Players","Rating","Wins","Draws","Losses","Timeouts","Closed"],
				order = ["name","rating","win","draw","lose","timeout","closed","checkmate"],
				users = [];

			tr.addClass("active").siblings().removeClass("active");
			sortby = ref[sortby]? ref[sortby] : "win";

			for (var c = 0; c < cols.length; c++) {
				if (ref[cols[c]] && ref[cols[c]] == sortby) {
					cols[c] = [cols[c],"sortby"];
				}
			}

			for (var u = 0; u < data.users.length; u++) {
				var user = {};
				for (var o = 0; o < order.length; o++) {
					user[order[o]] = data.users[u][o];
				}
				users.push(user);
			}

			if (sortby != "rating") {
				var temp = [];
				for (var u = 0; u < users.length; u++) {
					if (users[u][sortby] > 0) {
						temp.push(users[u]);
					}
				}
				users = temp.sort(function(a,b) {
					var va = parseInt(a[sortby]),
						vb = parseInt(b[sortby]);
					if (va > vb) {
						return -1;
					} else if (va < vb) {
						return 1;
					} else {
						return 0;
					}
				});
			}

			render.elm
				.find("table")
				.table(
					cols,
					users,
					function(user) {
						var url = "http://www.chess.com/members/view/"+user.name,
							link = $("<a>").attr({ href: url }).append(user.name).toggleClass("closed",user.closed > 0),
							popout = $("<img>").attr({ src: "img/popout.png" }),
							out = $("<a>").addClass("popout").attr({ href: url, target:"_blank" }).append(popout);
						return [
							link.add(out),
							user.rating || 0,
							user.win || 0,
							user.draw || 0,
							user.lose || 0,
							user.timeout || 0,
							user.closed || 0
						];
					}
				)
				.find("th")
				.click(function() {
					var th = $(this),
						col = $.trim(th.text());
					$("#users").render(league,division,team,match,col);
				});

		}
	});
});

// - -------------------------------------------------------------------- - //
// - Main

$(function() {

	$(win).resize(function() {
		var content = $("#content").height("auto").height(),
			header = $("#header").height(),
			footer = $("#footer").height(),
			w = $(this).height();
		(content + header + footer < w) && $("#content").height( w - header - footer );
	});

	$("#content").router({

		rules: {
			league		: /l2013/,
			division	: /[0-9A-Z]{1}/i
		},

		routes: {
			"*"									: "main",
			":league"							: "main",
			":league/:division"					: "main",
			":league/:division/:team"			: "main",
			":league/:division/:team/:match"	: "main"
		},

		init: function() {
			$("#stats").render();
		},

		main: function(route) {
			var params = route.params;
			if (params.league) {
				$("#rounds").toggle(!params.team);
				$("#matches, #users").toggle(!!params.team);
				$("#divisions").render(params.league,function() {
					if (params.division) {
						win.ga && win.ga("send","pageview",{ page: "chess/"+route.hash });
						$("#teams").render(params.league,params.division,function() {
							if (params.team) {
								$("#matches").render(params.league,params.division,params.team,function() {
									$("#users").render(params.league,params.division,params.team,params.match);
								});
							} else {
								$("#rounds").render(params.league,params.division);
							}
						});
					} else {
						var division = this.elm
							.find("a")
							.first()
							.attr("href")
							.substr(1);
						$("#content").router(division);
					}
				});
			} else {
				var league = $("#leagues")
					.find("a")
					.first()
					.attr("href")
					.substr(1);
				$("#content").router(league);
			}
		}

	});

}); 

// - -------------------------------------------------------------------- - //
})(window);