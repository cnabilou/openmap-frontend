L.Icon.Glyph = L.Icon.extend({
    options: {
        iconSize: [30, 40],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: '',
        prefix: '',
        glyph: 'home',
        glyphColor: 'white',
        glyphSize: '11px',
        glyphAnchor: [0, -7]
    },
    createIcon: function() {
        var div = document.createElement('div'),
            options = this.options;
        if (options.glyph) {
            div.appendChild(this._createGlyph())
        }
        this._setIconStyles(div, options.className);
        return div
    },
    _createGlyph: function() {
        var glyphClass,
            textContent,
            options = this.options;
        if (!options.prefix) {
            glyphClass = '';
            textContent = options.glyph
        } else if (options.glyph.slice(0, options.prefix.length + 1) === options.prefix + "-") {
            glyphClass = options.glyph
        } else {
            glyphClass = options.prefix + "-" + options.glyph
        }
        var span = L.DomUtil.create('span', options.prefix + ' ' + glyphClass);
        span.style.fontSize = options.glyphSize;
        span.style.color = options.glyphColor;
        span.style.width = options.iconSize[0] + 'px';
        span.style.lineHeight = (options.iconSize[1] + 7) + 'px';
        span.style.textAlign = 'center';
        span.style.marginLeft = options.glyphAnchor[0] + 'px';
        span.style.marginTop = options.glyphAnchor[1] + 'px';
        span.style.pointerEvents = 'none';
        if (textContent) {
            span.innerHTML = textContent;
            span.style.display = 'inline-block'
        }
        return span
    },
    _setIconStyles: function(div, name) {
        if (name === 'shadow') {
            return L.Icon.prototype._setIconStyles.call(this, div, name)
        }
        var options = this.options,
            size = L.point(options.iconSize),
            anchor = L.point(options.iconAnchor);
        if (!anchor && size) {
            anchor = size.divideBy(2, !0)
        }
        div.className = 'leaflet-marker-icon leaflet-glyph-icon ' + name;
        var src = this._getIconUrl('icon');
        if (src) {
            div.style.backgroundImage = "url('" + src + "')"
        }
        if (options.bgPos) {
            div.style.backgroundPosition = (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px'
        }
        if (options.bgSize) {
            div.style.backgroundSize = (options.bgSize.x) + 'px ' + (options.bgSize.y) + 'px'
        }
        if (anchor) {
            div.style.marginLeft = (-anchor.x) + 'px';
            div.style.marginTop = (-anchor.y) + 'px'
        }
        if (size) {
            div.style.width = size.x + 'px';
            div.style.height = size.y + 'px'
        }
    }
});
L.icon.glyph = function(options) {
    return new L.Icon.Glyph(options)
};
L.Icon.Glyph.prototype.options.iconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAoCAYAAADpE0oSAAAAAXNSR0IArs4c6QAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAK6WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjcyMDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjQ2PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9wbmc8L2RjOmZvcm1hdD4KICAgICAgICAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD54bXAuZGlkOjQ4OTI4ODdiLTZlMjEtNDc1YS05NzYyLTI4NjAwNWJmODc3MDwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTMtMTEtMjVUMTk6NTE6NDErMDE6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6YTg2MDAxOTQtMzdmYS00MGM3LTlmNjktYTE5MDIwMGUzNTUzPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmNyZWF0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTMtMTEtMjhUMjE6Mjc6MDcrMDE6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6M2I2Yjk0ZjYtYWUxZC00NWYzLTk3MDEtYzVmNjI4NGYxMTA0PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDozYjZiOTRmNi1hZTFkLTQ1ZjMtOTcwMS1jNWY2Mjg0ZjExMDQ8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6NDg5Mjg4N2ItNmUyMS00NzVhLTk3NjItMjg2MDA1YmY4NzcwPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAxMy0xMS0yNVQxOTo1MTo0MSswMTowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTMtMTEtMjhUMjE6Mjc6MDcrMDE6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDEzLTExLTI4VDIxOjI3OjA3KzAxOjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHBob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4KICAgICAgICAgICAgPHJkZjpCYWc+CiAgICAgICAgICAgICAgIDxyZGY6bGk+eG1wLmRpZDo0ODkyODg3Yi02ZTIxLTQ3NWEtOTc2Mi0yODYwMDViZjg3NzA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaT54bXAuZGlk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'
