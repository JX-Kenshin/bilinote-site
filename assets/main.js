// BiliNote official site - dynamically fetch the latest release from GitHub.
// Zero maintenance: download button + version always point to the newest build.
(function () {
  "use strict";

  var API_URL = "https://api.github.com/repos/JX-Kenshin/bilinote-site/releases/latest";
  var FALLBACK_MSG = "下载 Windows 版";
  var NO_RELEASE_MSG = "暂无可用版本";

  function pickExeAsset(release) {
    var assets = (release && release.assets) || [];
    for (var i = 0; i < assets.length; i++) {
      if (/\.exe$/i.test(assets[i].name)) return assets[i];
    }
    return null;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function applyNoRelease() {
    var btn = document.getElementById("btn-download");
    var navBtn = document.getElementById("nav-download");
    var meta = document.getElementById("btn-version");
    var empty = document.getElementById("release-empty");
    btn.setAttribute("href", "#");
    if (meta) meta.textContent = NO_RELEASE_MSG;
    if (navBtn) navBtn.setAttribute("href", "#");
    if (empty) empty.style.display = "";
  }

  function applyRelease(release, asset) {
    var btn = document.getElementById("btn-download");
    var navBtn = document.getElementById("nav-download");
    var meta = document.getElementById("btn-version");
    var empty = document.getElementById("release-empty");

    btn.setAttribute("href", asset.browser_download_url);
    btn.setAttribute("download", asset.name);
    if (navBtn) navBtn.setAttribute("href", asset.browser_download_url);
    if (empty) empty.style.display = "none";

    var date = fmtDate(release.published_at);
    var label = "v" + release.tag_name;
    if (date) label += " · " + date;
    if (meta) meta.textContent = label;

    document.title = "BiliNote " + label + " - 视频一键转 AI 结构化笔记";
  }

  function renderReleaseNotes(body) {
    if (!body) return;
    var el = document.getElementById("release-notes-body");
    if (!el) return;
    // Minimal markdown-ish: headings -> <b>, lists -> <li>. Keep it plain and safe.
    var html = body
      .split(/\r?\n/)
      .map(function (line) {
        line = line.trim();
        if (!line) return "";
        if (/^#{1,3}\s/.test(line)) {
          return "<b>" + line.replace(/^#{1,3}\s/, "") + "</b>";
        }
        if (/^[-*]\s/.test(line)) {
          return "&nbsp;&nbsp;• " + line.replace(/^[-*]\s/, "");
        }
        return line;
      })
      .filter(Boolean)
      .join("<br>");
    el.innerHTML = html;
  }

  fetch(API_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("no release: " + res.status);
      return res.json();
    })
    .then(function (release) {
      var asset = pickExeAsset(release);
      if (!asset) throw new Error("no exe asset");
      applyRelease(release, asset);
      renderReleaseNotes(release.body);
    })
    .catch(function () {
      applyNoRelease();
    });
})();
