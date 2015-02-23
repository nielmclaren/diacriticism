var diacriticism = (function() {
  var presets = getPresets();
  var diacriticismApi = function(s) {
    return (function(selector) {
      var value = '',
        data = getData(value),
        preset = 'Default',
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
      'Default': criticizeDefault
    };
  }

  function criticizeZigZag(data) {
    // TODO: Randomize which one it starts on.
    return criticizeMarkN(data, 10, function(base, i) {
      return String.fromCharCode(768 + i % 2);
    });
  }

  function criticizeDefault(data, n, marker) {
    n = 10;
    marker = function(base, i) {
      return i % 2 ? '\u0331' : '\u033A';
    };

    var incomplet = false;
    data.forEach(function(d) {
      if (typeof d.count == 'undefined') {
        d.count = typeof n == 'function' ? n() : n;
      }
      if (d.base != ' ') {
        if (d.marks.length < d.count) {
          var c = marker(d.base, d.marks.length);
          if (c) {
            d.marks.push(c);
            incomplet = true;
          }
        }
        else if (d.marks.length == d.count) {
          d.marks.push(String.fromCharCode(768 + 2));
        }
      }
    });
    return incomplet;
  }

  function criticizeHattedTower(data, n, marker) {
    n = 10;
    marker = function(base, i) {
      return String.fromCharCode(768 + 4 + (1 - i % 2));
    };

    var incomplet = false;
    data.forEach(function(d) {
      if (typeof d.count == 'undefined') {
        d.count = typeof n == 'function' ? n() : n;
      }
      if (d.base != ' ') {
        if (d.marks.length < d.count) {
          var c = marker(d.base, d.marks.length);
          if (c) {
            d.marks.push(c);
            incomplet = true;
          }
        }
        else if (d.marks.length == d.count) {
          d.marks.push(String.fromCharCode(768 + 2));
        }
      }
    });
    return incomplet;
  }

  function criticizeMarkN(data, n, marker) {
    var incomplet = false;
    data.forEach(function(d) {
      if (typeof d.count == 'undefined') {
        d.count = typeof n == 'function' ? n() : n;
      }
      if (d.base != ' ' && d.marks.length < d.count) {
        var c = marker(d.base, d.marks.length);
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

  function getMarkMetadata() {
    return [
      {mark: '\u0300', position: 'over', shape: 'tick'},
      {mark: '\u0301', position: 'over', shape: 'tick'},
      {mark: '\u0302', position: 'over', shape: 'curved'},
      {mark: '\u0303', position: 'over', shape: 'curved'},
      {mark: '\u0304', position: 'over', shape: 'straight'},
      {mark: '\u0305', position: 'over', shape: 'straight'},
      {mark: '\u0306', position: 'over', shape: 'curved'},
      {mark: '\u0307', position: 'over', shape: 'tick'},
      {mark: '\u0308', position: 'over', shape: 'tick'},
      {mark: '\u0309', position: 'over', shape: 'tick'},
      {mark: '\u030A', position: 'over', shape: 'curved'},
      {mark: '\u030B', position: 'over', shape: 'tick'},
      {mark: '\u030C', position: 'over', shape: 'curved'},
      {mark: '\u030D', position: 'over', shape: 'tick'},
      {mark: '\u030E', position: 'over', shape: 'tick'},
      {mark: '\u030F', position: 'over', shape: 'tick'},
      {mark: '\u0310', position: 'over', shape: 'curved'},
      {mark: '\u0311', position: 'over', shape: 'curved'},
      {mark: '\u0312', position: 'over', shape: 'tick'},
      {mark: '\u0313', position: 'over', shape: 'tick'},
      {mark: '\u0314', position: 'over', shape: 'tick'},
      {mark: '\u0315', position: 'over', shape: 'tick'},
      {mark: '\u0316', position: 'under', shape: 'tick'},
      {mark: '\u0317', position: 'under', shape: 'tick'},
      {mark: '\u0318', position: 'under', shape: 'straight'},
      {mark: '\u0319', position: 'under', shape: 'straight'},
      {mark: '\u031A', position: 'over', shape: 'straight'},
      {mark: '\u031B', position: 'over', shape: 'tick'},
      {mark: '\u031C', position: 'under', shape: 'tick'},
      {mark: '\u031D', position: 'under', shape: 'straight'},
      {mark: '\u031E', position: 'under', shape: 'straight'},
      {mark: '\u031F', position: 'under', shape: 'straight'},
      {mark: '\u0320', position: 'under', shape: 'straight'},
      {mark: '\u0321', position: 'under', shape: 'straight'},
      {mark: '\u0322', position: 'under', shape: 'straight'},
      {mark: '\u0323', position: 'under', shape: 'curved'},
      {mark: '\u0324', position: 'under', shape: 'tick'},
      {mark: '\u0325', position: 'under', shape: 'curved'},
      {mark: '\u0326', position: 'under', shape: 'tick'},
      {mark: '\u0327', position: 'under', shape: 'curved'},
      {mark: '\u0328', position: 'under', shape: 'curved'},
      {mark: '\u0329', position: 'under', shape: 'tick'},
      {mark: '\u032A', position: 'under', shape: 'straight'},
      {mark: '\u032B', position: 'under', shape: 'curved'},
      {mark: '\u032C', position: 'under', shape: 'angled'},
      {mark: '\u032D', position: 'under', shape: 'angled'},
      {mark: '\u032E', position: 'under', shape: 'curved'},
      {mark: '\u032F', position: 'under', shape: 'curved'},
      {mark: '\u0330', position: 'under', shape: 'curved'},
      {mark: '\u0331', position: 'under', shape: 'straight'},
      {mark: '\u0332', position: 'under', shape: 'straight'},
      {mark: '\u0333', position: 'under', shape: 'straight'},
      {mark: '\u0334', position: 'over', shape: 'curved'},
      {mark: '\u0335', position: 'over', shape: 'straight'},
      {mark: '\u0336', position: 'over', shape: 'straight'},
      {mark: '\u0337', position: 'on', shape: 'angled'},
      {mark: '\u0338', position: 'on', shape: 'angled'},
      {mark: '\u0339', position: 'under', shape: 'tick'},
      {mark: '\u033A', position: 'under', shape: 'straight'},
      {mark: '\u033B', position: 'under', shape: 'straight'},
      {mark: '\u033C', position: 'under', shape: 'curved'},
      {mark: '\u033D', position: 'over', shape: 'angled'},
      {mark: '\u033E', position: 'over', shape: 'curved'},
      {mark: '\u033F', position: 'over', shape: 'straight'},
      {mark: '\u0340', position: 'over', shape: ''},
      {mark: '\u0341', position: 'over', shape: ''},
      {mark: '\u0342', position: 'over', shape: ''},
      {mark: '\u0343', position: 'over', shape: ''},
      {mark: '\u0344', position: 'over', shape: ''},
      {mark: '\u0345', position: 'under', shape: ''},
      {mark: '\u0346', position: 'over', shape: ''},
      {mark: '\u0347', position: 'under', shape: ''},
      {mark: '\u0348', position: 'under', shape: ''},
      {mark: '\u0349', position: 'under', shape: ''},
      {mark: '\u034A', position: 'over', shape: ''},
      {mark: '\u034B', position: 'over', shape: ''},
      {mark: '\u034C', position: 'over', shape: ''},
      {mark: '\u034D', position: 'under', shape: ''},
      {mark: '\u034E', position: 'under', shape: ''},
      {mark: '\u034F', position: 'on', shape: ''},
      {mark: '\u03', position: '', shape: ''},
    ];
  }
})();
