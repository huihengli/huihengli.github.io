/**
 * GitHub contribution heatmap.
 *
 * Put <div class="gh-heatmap" data-user="your-github-name"></div> in any page.
 * Data is fetched live on every visit from a public contributions API
 * (no token needed); if it can't be reached, a link to the GitHub profile is shown.
 */
(function () {
    var API = "https://github-contributions-api.jogruber.de/v4/";
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function parseDay(date) {
        return new Date(date + "T00:00:00Z");
    }

    function build(root, user, data) {
        var days = data.contributions || [];
        if (!days.length) throw new Error("no data");

        var profile = "https://github.com/" + encodeURIComponent(user);
        var total = data.total && data.total.lastYear != null ? data.total.lastYear
            : days.reduce(function (sum, d) { return sum + d.count; }, 0);

        // pad the first week so every column starts on Sunday
        var lead = parseDay(days[0].date).getUTCDay();
        var cells = [];
        for (var p = 0; p < lead; p++) cells.push('<i class="gh-pad"></i>');

        var months = [];
        var lastMonth = -1;
        days.forEach(function (day, index) {
            var date = parseDay(day.date);
            var week = Math.floor((index + lead) / 7);
            if (date.getUTCDay() === 0 || index === 0) {
                var month = date.getUTCMonth();
                if (month !== lastMonth) {
                    months.push('<span style="grid-column:' + (week + 1) + '">' + MONTHS[month] + "</span>");
                    lastMonth = month;
                }
            }
            var label = (day.count || "No") + " contribution" + (day.count === 1 ? "" : "s") + " on " + day.date;
            cells.push('<i data-l="' + Math.min(4, day.level || 0) + '" title="' + label + '"></i>');
        });

        // a label squeezed into the first column is unreadable; drop it
        if (months.length > 1 && lead > 0 && /grid-column:1"/.test(months[0])) months.shift();

        var weeks = Math.ceil((days.length + lead) / 7);
        var legend = [0, 1, 2, 3, 4].map(function (l) { return '<i data-l="' + l + '"></i>'; }).join("");

        root.innerHTML =
            '<div class="gh-head"><span><b>' + total.toLocaleString("en-US") + "</b> contributions in the last year</span>"
            + '<a href="' + profile + '" target="_blank" rel="noopener">@' + escapeHtml(user) + "</a></div>"
            + '<div class="gh-scroll"><div class="gh-graph" style="--weeks:' + weeks + '">'
            + '<div class="gh-months">' + months.join("") + "</div>"
            + '<div class="gh-days" aria-hidden="true"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>'
            + '<div class="gh-cells" role="img" aria-label="' + total + ' GitHub contributions in the last year">' + cells.join("") + "</div>"
            + "</div></div>"
            + '<div class="gh-legend">Less' + legend + "More</div>";
        root.classList.add("gh-ready");

        // on narrow screens, start scrolled to the most recent weeks
        var scroller = root.querySelector(".gh-scroll");
        scroller.scrollLeft = scroller.scrollWidth;
    }

    function fail(root, user) {
        root.classList.add("gh-error");
        root.innerHTML = 'GitHub activity is unavailable right now. '
            + '<a href="https://github.com/' + encodeURIComponent(user) + '" target="_blank" rel="noopener">View it on GitHub</a>';
    }

    function render(root) {
        if (root.getAttribute("data-state")) return;
        var user = root.getAttribute("data-user");
        if (!user) return;
        root.setAttribute("data-state", "loading");

        fetch(API + encodeURIComponent(user) + "?y=last", { cache: "no-cache" })
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                build(root, user, data);
                root.setAttribute("data-state", "ready");
            })
            .catch(function () {
                fail(root, user);
                root.setAttribute("data-state", "error");
            });
    }

    function init() {
        var roots = document.querySelectorAll(".gh-heatmap");
        for (var i = 0; i < roots.length; i++) render(roots[i]);
    }

    init();
    if (window.jQuery) jQuery(document).on("pjax:end", init);
})();
