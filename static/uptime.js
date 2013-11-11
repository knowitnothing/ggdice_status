var uptime_text = {
	service_up: 'Service is up now',
	service_down: 'Service is down'
}
var up_color = '#390';
var down_color = '#d30';

jsonUptimeRobotApi = function(data) {
	if (data.stat != 'ok') {
		console.log("Failed", data, "<<");
		return;
	}

	for (var i = 0; i < data.monitors.monitor.length; i++) {
		display_monitor(data.monitors.monitor[i])
	}
};

display_monitor = function(monitor) {
	console.log(monitor);

	var id = monitor.id;
	var status = '';
	var title = 'Unknown';
	if (monitor.status == '2') {
		/* Service is up. */
		status = 'upstatus-good';
		title = 'Service is up now';
	} else if (monitor.status == '9') {
		/* Service is down. */
		status = 'upstatus-bad';
		title = 'Service is down';
	} else if (monitor.status == '8') {
		/* Seems down. */
		status = 'upstatus-maybe';
		title = 'Service might be down';
	}
	/* Status 0 (paused) and 1 (not checked yet) not handled. */

	var custom_uptime = monitor.customuptimeratio.split('-');
	custom_uptime.push(monitor.alltimeuptimeratio);
	var pie = [];
	var lbl = ["plot-24", "plot-7", "plot-30", "plot-all"];
	for (var i = 0; i < custom_uptime.length; i++) {
		pie.push([
			{value: Number(custom_uptime[i]), color: up_color},
			{value: 100 - custom_uptime[i], color: down_color}
		]);
	}

	var row = [
		"<tr><td class='service'>",
		"<div class='upstatus " + status + "' title='" + title + "'></div>",
		"<div class='uptitle'><a target='_blank' href='" + monitor.url + "'>" + monitor.friendlyname + "</a></div>",
        "<div class='upsince'>Monitored since " + monitor.log[monitor.log.length - 1].datetime + "</div>",
		"</td>",
		"<td><canvas width='100' height='100' id='" + lbl[0] + '-' + id + "'></canvas>",
		"<div>" + custom_uptime[0] + "%</div></td>",
		"<td><canvas width='100' height='100' id='" + lbl[1] + '-' + id + "'></canvas>",
		"<div>" + custom_uptime[1] + "%</div></td>",
		"<td><canvas width='100' height='100' id='" + lbl[2] + '-' + id + "'></canvas>",
		"<div>" + custom_uptime[2] + "%</div></td>",
		"<td><canvas width='100' height='100' id='" + lbl[3] + '-' + id + "'></canvas>",
		"<div>" + custom_uptime[3] + "%</div></td>",
		"</tr>"];
	$('#upbox tbody').append(row.join(''));

	/* Build charts now. */
	for (var i = 0; i < pie.length; i++) {
		var canvas = document.getElementById(lbl[i] + "-" + id);
		var pie_i = new Chart(canvas.getContext("2d")).Doughnut(pie[i], {
			animationSteps: 60, animationEasing: "easeOutQuart"});
	}
}

uptime_data = function(key) {
	var baseurl = 'http://api.uptimerobot.com';
	var method = '/getMonitors';
	$.ajax({
		url: baseurl + method,
		data: {
			format: 'json',
			apiKey: key,
			customUptimeRatio: '1-7-30',
			logs: '1'
		},
		dataType: 'jsonp'
	});
};
