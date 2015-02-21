var diacriticism = (function() {
  var presets = getPresets();
  var diacriticismApi = function(s) {
    return (function(selector) {
      var value = '',
        data = getData(value),
        preset = 'Mark X',
        presetFunc = presets[preset],
        intervalId = null;

      (new ZeroClipboard($(selector)))
        .on('copy', function(e) {
          e.clipboardData.setData('text/plain', $(selector).text());
        })
        .on('aftercopy', function(e) {
        });

      intervalId = setInterval(criticizer, 50);

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
          intervalId = setInterval(criticizer, 50);
          criticizer();
          return api;
        }
      };
      return api;

      function criticizer() {
        data = updateData(data, value);
        if (!presetFunc(data)) {
          clearInterval(intervalId);
          intervalId = null;
        }

        $(selector)
          .text(data.map(function(d) { return d.base + d.marks.join(''); }).join(''));
      }

      function getData(v) {
        return v.split('').map(function(d) { return {base: d, marks: []}; });
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
      if (data.length <= i || data[i].base != value.charAt(i)) {
        if (data.length > i + 1 && data[i + 1].base == value.charAt(i)) {
          data.splice(i, 1);
        }
        else {
          data.splice(i, 0, {base: value.charAt(i), marks: []});
        }
      }
    }
    return data.slice(0, value.length);
  }

  function getPresets() {
    return {
      'Mark I': function(d) { return criticizeMarkN(d, 1, randomMark); },
      'Mark III': function(d) { return criticizeMarkN(d, 3, randomMark); },
      'Mark V': function(d) { return criticizeMarkN(d, 5, randomMark); },
      'Mark X': function(d) { return criticizeMarkN(d, 10, randomMark); },
      'Mark XV': function(d) { return criticizeMarkN(d, 15, randomMark); },
      'Repetition': function(d) { return criticizeMarkN(d, getRandi(0, 5), repeatMark); },
      'Steamy': function(d) { return criticizeMarkN(d, getRandi(0, 5), function() { return '\u033E'; }); },
      'Electric': function(d) { return criticizeMarkN(d, getRandi(0, 5), function() { return '\u035B'; }); },
      'Rainstorm': function(d) { return criticizeStorm(d, '\u033E'); },
      'Thunderstorm': function(d) { return criticizeStorm(d, '\u035B'); },
    };
  }

  function criticizeMarkN(data, n, marker) {
    var incomplet = false;
    data.forEach(function(d) {
      if (typeof d.count == 'undefined') {
        d.count = typeof n == 'function' ? n() : n;
      }
      if (d.base != ' ' && d.marks.length < d.count) {
        var c = marker(d.base);
        if (c) {
          d.marks.push(c);
          incomplet = true;
        }
      }
    });
    return incomplet;
  }

  function criticizeStorm(data, c) {
    var incomplet = false;
    data.forEach(function(d) {
      if (typeof d.rainCount == 'undefined') {
        if (Math.random() < 0.9) {
          d.rainCount = randi(2, 6);
          d.cloudCount = randi(2, 4);
        }
        else {
          d.rainCount = 0;
          d.cloudCount = 0;
        }
      }
      if (d.base != ' ') {
        if (d.marks.length < d.rainCount) {
          d.marks.push(c);
        }
        else if (d.marks.length < d.rainCount + d.cloudCount) {
          d.marks.push('\u0360');
        }
        incomplet = true;
      }
    });
    return incomplet;
  }

  function getRandi(minVal, maxVal) {
    return (function(min, max) {
      return function() {
        return min + Math.floor(Math.random() * (max - min));
      };
    })(minVal, maxVal);
  }

  function randi(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }

  function randomMark() {
    return String.fromCharCode(768 + Math.floor(Math.random() * 111));
  }

  function repeatMark(base) {
    var map = {
      'a': '\u0363',
      'e': '\u0364',
      'i': '\u0365',
      'o': '\u0366',
      'u': '\u0367',
      'c': '\u0368',
      'd': '\u0369',
      'h': '\u036A',
      'm': '\u036B',
      'r': '\u036C',
      't': '\u036D',
      'v': '\u036E',
      'x': '\u036F'
    };
    return map[base.toLowerCase()];
  }

})();
