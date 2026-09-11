// BiliNote official site - progressive enhancement.
// The download button already points to the FIXED latest URL
// (releases/latest/download/BiliNote-Setup.exe) which never expires and
// never hits the GitHub API rate limit. This script only enriches it with
// the exact version info when the API happens to be available - failures
// are harmless (button keeps working via the static URL).
(function () {
  "use strict";

  var API_URL = "https://api.github.com/repos/JX-Kenshin/bilinote-site/releases/latest";

  function pickExeAsset(release) {
    var assets = (release && release.assets) || [];
    // prefer the versioned asset (BiliNote-x.x.x-Setup.exe) for the exact link
    for (var i = 0; i < assets.length; i++) {
      if (/BiliNote-[\d.]+-Setup\.exe$/i.test(assets[i].name)) return assets[i];
    }
    for (var j = 0; j < assets.length; j++) {
      if (/\.exe$/i.test(assets[j].name)) return assets[j];
    }
    return null;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("zh-CN", {
        year: "numeric", month: "long", day: "numeric"
      });
    } catch (e) {
      return "";
    }
  }

  function renderReleaseNotes(body) {
    if (!body) return;
    var el = document.getElementById("release-notes-body");
    if (!el) return;
    var html = body
      .split(/\r?\n/)
      .map(function (line) {
        line = line.trim();
        if (!line) return "";
        if (/^#{1,3}\s/.test(line)) return "<b>" + line.replace(/^#{1,3}\s/, "") + "</b>";
        if (/^[-*]\s/.test(line)) return "&nbsp;&nbsp;&bull; " + line.replace(/^[-*]\s/, "");
        return line;
      })
      .filter(Boolean)
      .join("<br>");
    el.innerHTML = html;
  }

  fetch(API_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("api status " + res.status);
      return res.json();
    })
    .then(function (release) {
      var asset = pickExeAsset(release);
      var btn = document.getElementById("btn-download");
      var meta = document.getElementById("btn-version");
      var empty = document.getElementById("release-empty");
      if (asset && btn) btn.setAttribute("href", asset.browser_download_url);
      if (meta && release) {
        var label = "v" + release.tag_name;
        var date = fmtDate(release.published_at);
        if (date) label += " · " + date;
        meta.textContent = label;
      }
      if (empty) empty.style.display = "none";
      renderReleaseNotes(release.body);
      document.title = "BiliNote v" + release.tag_name + " - 视频一键转 AI 结构化笔记";
    })
    .catch(function () {
      // API unavailable/rate-limited: keep the static latest URL - nothing to do.
    });
})();
