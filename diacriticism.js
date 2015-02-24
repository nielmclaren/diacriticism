var diacriticism = (function() {
  var presets = getPresets();
  var markMetadata = getMarkMetadata();

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
      'Jagged': function(d) { return criticizeMarkN(d, getRandi(5, 10),
        getFilteredMarker(function(d) { return d.position != 'on' && !d.straight && d.angled && !d.curved; })); },
      'Curvaceous': function(d) { return criticizeMarkN(d, getRandi(5, 10),
        getFilteredMarker(function(d) { return d.position != 'on' && d.curved; })); },
      'Boxy': function(d) { return criticizeMarkN(d, getRandi(5, 10),
        getFilteredMarker(function(d) { return d.position != 'on' && d.straight && !d.angled && !d.curved; })); },
      'Ticklish': function(d) { return criticizeMarkN(d, getRandi(5, 10),
        getFilteredMarker(function(d) { return d.position != 'on' && d.tick; })); },
      'Bubbly': function(d) { return criticizeMarkN(d, getRandi(5, 10), getArrayMarker(['\u030A', '\u030A', '\u0325', '\u035A'])); },
      'Faces': function(d) { return criticizeFaces(d); }
    };
  }

  function criticizeZigZag(data) {
    // TODO: Randomize which one it starts on.
    return criticizeMarkN(data, 10, function(base, i) {
      return String.fromCharCode(768 + i % 2);
    });
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
        var c = typeof marker == 'function' ? marker(d.base, d.marks.length) : marker;
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

  function criticizeFaces(data) {
    var incomplet = false;
    data.forEach(function(d) {
      if (typeof d.count == 'undefined') {
        d.count = randi(0, 3);
      }
      if (d.base != ' ') {
        if (d.marks.length < d.count * 2) {
          d.marks = d.marks.concat(getFace());
          incomplet = true;
        }
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

  /**
   * Run a filter on mark metadata and return a random one.
   */
  function getFilteredMarker(filter) {
    return function(d) {
      var marks = markMetadata.filter(filter);
      return marks[Math.floor(Math.random() * marks.length)].mark;
    };
  }

  /**
   * Return a random mark from a list of characters.
   */
  function getArrayMarker(marks) {
    return function() {
      return marks[Math.floor(Math.random() * marks.length)];
    };
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

  function getFace() {
    var faces = [
      ['\u0306', '\u0308'], // over, happy
      ['\u0311', '\u0308'], // over, sad
      ['\u0304', '\u0308'], // over, meh
      ['\u0346', '\u0308'], // over, square sad
      ['\u0303', '\u0308'], // over, tilde
      ['\u033D', '\u0308'], // over, x
      ['\u030A', '\u0308'], // over, o

      ['\u0324', '\u032E'], // under, happy
      ['\u0324', '\u032F'], // under, sad
      ['\u0324', '\u033A'], // under, square happy
      ['\u0324', '\u032A'], // under, square sad
      ['\u0324', '\u0331'], // under, meh
      ['\u0324', '\u033B'], // under, square
      ['\u0324', '\u0353'], // under, x
      ['\u0324', '\u0325'], // under, o
      ['\u0324', '\u0330'], // under, tilde
      ['\u035A', '\u032E'], // under, nerd

      // repeat
      ['\u0306', '\u0308'], // over, happy
      ['\u0311', '\u0308'], // over, sad
      ['\u0304', '\u0308'], // over, meh
      ['\u0303', '\u0308'], // over, tilde
    ];
    return faces[Math.floor(Math.random() * faces.length)];
  }

  function getMarkMetadata() {
    return [
      {mark: '\u0300', position: 'over', tick: true, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0301', position: 'over', tick: true, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0302', position: 'over', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0303', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0304', position: 'over', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0305', position: 'over', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0306', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0307', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0308', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: true},
      {mark: '\u0309', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u030A', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u030B', position: 'over', tick: true, straight: false, angled: true, curved: false, multi: true},
      {mark: '\u030C', position: 'over', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u030D', position: 'over', tick: true, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u030E', position: 'over', tick: true, straight: true, angled: false, curved: false, multi: true},
      {mark: '\u030F', position: 'over', tick: true, straight: false, angled: true, curved: false, multi: true},

      {mark: '\u0310', position: 'over', tick: true, straight: false, angled: false, curved: true, multi: true},
      {mark: '\u0311', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0312', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0313', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0314', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0315', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0316', position: 'under', tick: true, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0317', position: 'under', tick: true, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0318', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0319', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u031A', position: 'over', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u031B', position: 'over', tick: true, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u031C', position: 'under', tick: true, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u031D', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u031E', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u031F', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},

      {mark: '\u0320', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0321', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0322', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0323', position: 'under', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0324', position: 'under', tick: true, straight: false, angled: false, curved: false, multi: true},
      {mark: '\u0325', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0326', position: 'under', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0327', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0328', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0329', position: 'under', tick: true, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u032A', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u032B', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u032C', position: 'under', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u032D', position: 'under', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u032E', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u032F', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},

      {mark: '\u0330', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0331', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0332', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0333', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: true},
      {mark: '\u0334', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0335', position: 'over', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0336', position: 'over', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0337', position: 'on', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0338', position: 'on', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0339', position: 'under', tick: true, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u033A', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u033B', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u033C', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u033D', position: 'over', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u033E', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u033F', position: 'over', tick: false, straight: true, angled: false, curved: false, multi: true},

      {mark: '\u0340', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0341', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0342', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0343', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0344', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: true},
      {mark: '\u0345', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0346', position: 'over', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0347', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: true},
      {mark: '\u0348', position: 'under', tick: true, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u0349', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u034A', position: 'over', tick: false, straight: true, angled: false, curved: true, multi: false},
      {mark: '\u034B', position: 'over', tick: true, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u034C', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: true},
      {mark: '\u034D', position: 'under', tick: false, straight: true, angled: true, curved: false, multi: false},
      {mark: '\u034E', position: 'under', tick: false, straight: true, angled: true, curved: false, multi: false},
      {mark: '\u034F', position: 'on', tick: false, straight: false, angled: false, curved: false, multi: false}, // CGJ

      {mark: '\u0350', position: 'over', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0351', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0352', position: 'over', tick: true, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0353', position: 'under', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0354', position: 'under', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0355', position: 'under', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u0356', position: 'under', tick: false, straight: false, angled: true, curved: false, multi: true},
      {mark: '\u0357', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0358', position: 'over', tick: true, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0359', position: 'under', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u035A', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u035B', position: 'over', tick: false, straight: false, angled: true, curved: false, multi: false},
      {mark: '\u035C', position: 'under', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u035D', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u035E', position: 'over', tick: false, straight: true, angled: false, curved: false, multi: false},
      {mark: '\u035F', position: 'under', tick: false, straight: true, angled: false, curved: false, multi: false},

      {mark: '\u0360', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0361', position: 'over', tick: false, straight: false, angled: false, curved: true, multi: false},
      {mark: '\u0362', position: 'under', tick: false, straight: true, angled: true, curved: false, multi: false},
      {mark: '\u0363', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false}, // characters
      {mark: '\u0364', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0365', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0366', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0367', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0368', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u0369', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u036A', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u036B', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u036C', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u036D', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u036E', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false},
      {mark: '\u036F', position: 'over', tick: false, straight: false, angled: false, curved: false, multi: false}
    ];
  }
})();
