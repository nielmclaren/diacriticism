var diacriticism = (function() {
  return function(selector) {
    $(selector)
      .append('<div class="output"></div>')
      .append('<div class="form"><input type="text" class="input" type="text" value="diacriticism" /></div>');

    $(selector).find('.input')
      .focus(function() {
        this.select();
      })
      .keyup(function(e) {
        if (e.which == 13) {
          criticizer.reset();
        }
        criticizer();
      })
      .select();

    var criticizer = (function(selector) {
      var data = getData(selector);
      var c = function() {
        data = criticize(data, $(selector).find('.input').val());
        $(selector).find('.output')
          .text(data.map(function(d) { return d[0] + d[1].join(''); }).join(''));
      };
      c.reset = function() {
        data = getData(selector);
      };
      return c;
    })(selector);

    function getData(selector) {
      return $(selector).find('.input').val().split('')
        .map(function(d) { return [d, []]; });
    }

    setInterval(criticizer, 100);
    criticizer();
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
