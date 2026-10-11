/* Dive Site Finder: filters the site's own dive-site data by island, month, training and entry. */
(function () {
  var el = document.getElementById('finder-data');
  var form = document.getElementById('finder');
  var out = document.getElementById('fres');
  var sum = document.getElementById('fsum');
  if (!el || !form || !out) return;
  var SITES = JSON.parse(el.textContent);
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var ISL = { 'oahu': ['Oʻahu', '/dive-sites/oahu/'], 'maui': ['Maui & Lānaʻi', '/dive-sites/maui/'], 'big-island': ['Big Island', '/dive-sites/big-island/'], 'kauai': ['Kauaʻi', '/dive-sites/kauai/'] };
  var RANK = { snorkel: 0, dsd: 1, ow: 2, aow: 3 };
  var LEVEL = { snorkel: 'Snorkel / any level', dsd: 'Discover Scuba and up', ow: 'Open Water', aow: 'Advanced recommended' };

  function val(name) {
    var f = form.elements[name];
    if (!f) return '';
    if (f.length !== undefined && f.tagName !== 'SELECT') {
      for (var i = 0; i < f.length; i++) if (f[i].checked) return f[i].value;
      return '';
    }
    return f.value;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function card(s, m) {
    var st = s.g.indexOf(m) > -1 ? 'g' : (s.f.indexOf(m) > -1 ? 'f' : 'p');
    var badge = st === 'g' ? '<span class="fbadge g">Usually diveable in ' + MONTHS[m - 1].slice(0, 3) + '</span>'
      : '<span class="fbadge f">Swell-dependent in ' + MONTHS[m - 1].slice(0, 3) + '</span>';
    var mlcd = s.mlcd ? '<span class="fbadge m">' + esc(s.mlcd) + '</span>' : '';
    var isl = ISL[s.island];
    return '<div class="fcard"><h3><a href="' + isl[1] + '#' + s.id + '">' + esc(s.name) + '</a></h3>' +
      '<p class="fmeta">' + esc(isl[0]) + ' · ' + esc(s.entry) + ' · ' + esc(LEVEL[s.level]) + '</p>' +
      badge + mlcd +
      '<p><strong>Depth:</strong> ' + esc(s.depth) + '</p>' +
      '<p><strong>Season:</strong> ' + esc(s.season) + '</p>' +
      '<p>' + esc(s.notes) + '</p>' +
      '<p><a href="' + isl[1] + '#' + s.id + '">Full site briefing ›</a></p></div>';
  }

  function run() {
    var island = val('island'), m = parseInt(val('month'), 10), lvl = val('level'), entry = val('entry');
    var list = SITES.filter(function (s) {
      return (island === 'all' || s.island === island) &&
        RANK[s.level] <= RANK[lvl] &&
        (entry === 'any' || s.entry === entry);
    });
    var good = list.filter(function (s) { return s.g.indexOf(m) > -1; });
    var maybe = list.filter(function (s) { return s.f.indexOf(m) > -1; });
    var closed = list.length - good.length - maybe.length;
    var html = good.concat(maybe).map(function (s) { return card(s, m); }).join('');
    if (!html) {
      html = '<div class="fempty">No sites match that combination. Try another month or island, or widen the training level. Sites that need more training than you selected are left out on purpose.</div>';
    }
    out.innerHTML = html;
    sum.textContent = good.length + ' usually diveable, ' + maybe.length + ' swell-dependent' +
      (closed ? ', ' + closed + ' usually closed in ' + MONTHS[m - 1] + ' (hidden)' : '') + '.';
    try { history.replaceState(null, '', '#' + [island, m, lvl, entry].join('.')); } catch (e) {}
  }

  // restore from hash, else default to the current month
  var h = (location.hash || '').replace('#', '').split('.');
  var now = new Date().getMonth() + 1;
  function setRadio(name, v) { var f = form.elements[name]; if (!f) return; for (var i = 0; i < f.length; i++) if (f[i].value === v) f[i].checked = true; }
  if (h.length === 4 && (ISL[h[0]] || h[0] === 'all')) {
    setRadio('island', h[0]);
    if (h[1]) form.elements.month.value = h[1];
    if (h[2] && RANK[h[2]] !== undefined) form.elements.level.value = h[2];
    if (h[3]) setRadio('entry', h[3]);
  } else {
    form.elements.month.value = String(now);
  }
  form.addEventListener('change', run);
  form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
  run();
})();
