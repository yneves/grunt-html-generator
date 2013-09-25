// - -------------------------------------------------------------------- - //
// - Table Plugin

$.fn.table = function (head,rows,render) {

	return this.each(function() {
		
		var table = $(this).empty(),
			header = $("<tr></tr>").appendTo(table),
			trs = [];
		
		$.each(head,function(idx,val) {
			var cspan = false, cls = "";
			if ($.isArray(val)) {
				if ($.isNumeric(val[2])) {
					cspan = val[2];
				}
				cls = val[1];
				val = val[0];
			}
			$("<th>")
				.attr({ colspan: cspan ? cspan : 1 })
				.html(val)
				.addClass(cls)
				.appendTo(header);
		});

		$.each(rows,function(idx,row) {
			var cols = $.isFunction(render) ? render(row) : [],
				tr = $("<tr>").data("record",row);
			$.each(cols,function(idx,val) {
				var cls = "";
				if ($.isArray(val)) {
					cls = val[1];
					val = val[0];
				}
				$("<td>").addClass(cls).html(val).appendTo(tr).click(function() {
					var href = tr.find("a").first().attr("href");
					if (href.indexOf("#") == 0) {
						$("#content").router(href.substr(1));
					}
				});
			});
			trs.push(tr);
		});

		table.append(trs);

	});
}

// - -------------------------------------------------------------------- - //