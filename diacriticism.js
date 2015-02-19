var diacriticism = (function() {
  var presets = getPresets();
  var diacriticismApi = function(s) {
    return (function(selector) {
      var value = '',
        data = getData(value),
        preset = 'Mark X',
        presetFunc = presets[preset];

      (new ZeroClipboard($(selector)))
        .on('copy', function(e) {
          e.clipboardData.setData('text/plain', $(selector).text());
        });

      setInterval(criticizer, 50);

      var api = {
        val: function(v) {
          value = v;
          criticizer();
          return api;
        },
        preset: function(v) {
          if (!arguments.length) return preset;
          preset = v;
          presetFunc = presets[v];
          api.reset();
          return api;
        },
        reset: function() {
          data = getData(selector);
          criticizer();
          return api;
        }
      };
      return api;

      function criticizer() {
        data = updateData(data, value);
        data = presetFunc(data);

        $(selector)
          .text(data.map(function(d) { return d[0] + d[1].join(''); }).join(''));
      }

      function getData(v) {
        return v.split('').map(function(d) { return [d, []]; });
      }
    })(s);
  };
  diacriticismApi.presets = function() {
    return Object.keys(presets);
  };
  return diacriticismApi;

  function updateData(data, value) {
    // Update the data to match the input value.
    for (var i = 0; i < value.length; i++) {
      if (data.length <= i || data[i][0] != value.charAt(i)) {
        if (data.length > i + 1 && data[i + 1][0] == value.charAt(i)) {
          data.splice(i, 1);
        }
        else {
          data.splice(i, 0, [value.charAt(i), []]);
        }
      }
    }
    return data.slice(0, value.length);
  }

  function getPresets() {
    return {
      'Mark I': function(d) { return criticizeMarkN(d, 1, mark); },
      'Mark III': function(d) { return criticizeMarkN(d, 3, mark); },
      'Mark V': function(d) { return criticizeMarkN(d, 5, mark); },
      'Mark X': function(d) { return criticizeMarkN(d, 10, mark); },
      'Mark XV': function(d) { return criticizeMarkN(d, 15, mark); },
    };
  }

  function criticizeMarkN(data, n, marker) {
    data.forEach(function(d) {
      if (d[0] != ' ' && d[1].length < n) {
        d[1].push(marker());
      }
    });
    return data;
  }

  function mark() {
    return String.fromCharCode(768 + Math.floor(Math.random() * 111));
  }
})();
