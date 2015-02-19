var diacriticism = (function() {
  return function(s) {
    return (function(selector) {
      var value = '',
        data = getData(value);

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
        reset: function() {
          data = getData(selector);
          return api;
        }
      };
      return api;

      function criticizer() {
        data = criticize(data, value);
        $(selector)
          .text(data.map(function(d) { return d[0] + d[1].join(''); }).join(''));
      }

      function getData(v) {
        return v.split('').map(function(d) { return [d, []]; });
      }
    })(s);
  };

  function criticize(data, value) {
    // Remove diacritical marks.
    value = value.split('').filter(function(d) {
      return d.charCodeAt(0) < 768 || d.charCodeAt(0) > 879;
    }).join('');

    // Update the data to match the base value.
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
    data = data.slice(0, value.length);

    // Add more diacritical marks to the data.
    data.forEach(function(d) {
      if (d[0] != ' ' && d[1].length < 10) {
        d[1].push(mark());
      }
    });

    return data;
  }

  function mark() {
    return String.fromCharCode(768 + Math.floor(Math.random() * 111));
  }
})();
