/*

Copyright (C) 2012 Caffeinated Code <http://caffeinatedco.de>
Copyright (C) 2012 Jono Cooper
Copyright (C) 2012 George Czabania
This program is free software: you can redistribute it and/or modify it 
under the terms of the GNU General Public License version 3, as published 
by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but 
WITHOUT ANY WARRANTY; without even the implied warranties of 
MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR 
PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along 
with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/**********************************
	OS INTERGRATION
**********************************/
os = {
  //Define OS HERE
  type: "web", // web, windows, macApp, macSource, linux
  legacy_support: false,
  keydown: false,
  defaultGradient: {
    // Same as linux
    web: [
      [0, "rgb(138, 226, 52)", 100],
      [50, "rgb(115, 210, 22)", 100],
      [100, "rgb(78, 154, 6)", 100],
    ],
    // Chameleon
    linux: [
      [0, "rgb(138, 226, 52)", 100],
      [50, "rgb(115, 210, 22)", 100],
      [100, "rgb(78, 154, 6)", 100],
    ],
    // Scarlet Red
    windows: [
      [0, "rgb(239,41,41)", 100],
      [50, "rgb(204,0,0)", 100],
      [100, "rgb(164,0,0)", 100],
    ],
    // Sky Blue
    macApp: [
      [0, "rgb(114,159,207)", 100],
      [50, "rgb(52,101,164)", 100],
      [100, "rgb(32,74,135)", 100],
    ],
    // Plum
    macSource: [
      [0, "rgb(173,127,168)", 100],
      [50, "rgb(117,80,123)", 100],
      [100, "rgb(92,53,102)", 100],
    ],
  },

  init: function () {
    switch (os.type) {
      case "web":
        $("#donatetext").html(
          "This is an working archive of Gradiator, a Mac &amp; Linux app originally released in 2011 to generate CSS gradients.",
        );
        $("#settingsHelpBTN").remove();
        $('input[type="color"]').on("change", function (e) {
          stops.color(e.currentTarget.value);
        });
        break;

      case "linux":
        $("#donatetext").html(
          "Please be awesome and help two students out by donating to Gradiator.<br><br>A couple of dollars may not seem like much but it makes a huge difference to us!<br>",
        );
        break;

      case "macApp" || "macSource":
        $("#about").remove();
        $("#settingsHelpBTN").remove();

        switch (os.type) {
          case "macApp":
            $("#donateBTN").html("css");
            $("#donatesend").remove();
            $("#donate .button").css({ display: "block", margin: "0 auto" });
            $("#donatetext").css({
              "font-family": "Monaco, monospace",
              "font-size": "10px",
            });
            break;

          case "macSource":
            $("#donatetext").html(
              "The Mac version of Gradiator was created on a borrowed single core MacBook. The animations are even laggy.<br><br>Please support Gradiator by purchasing it in the Mac App Store or donating.<br>",
            );
            break;
        }
        break;
    }
  },

  send: function (str1, str2) {
    switch (os.type) {
      case "web":
        if (str1 === "copy") {
          navigator.clipboard.writeText(str2);
        } else if (str1 === "color") {
          break;
        } else {
          console.log("not_implemented", str1, str2);
        }
        break;
      case "linux":
        /* Python Bridge */
        document.title = "null";
        document.title = str1 + "|" + str2;
        break;
      case "macApp" || "macSource":
        /* Objective-C Bridge */
        Cocoa.log(str1 + "|" + str2);
        break;
      case "windows":
        /* Add .net bridge */
        break;
    }
  },
};

/**********************************
		CACHING SELECTORS
**********************************/

var $slider = $("#slider"),
  gradient = {
    $preview: $("#preview"),
    $final: $("#final"),
    comments: false,
    type: "linear",
    direction: $.jStorage.get("direction", "d0"),
    posX: 50,
    posY: 50,
    shape: "circle",
    size: "closest-side",
  },
  details = {
    $position: $("#position .number, #positionCFG"),
    $color: $("#color .number"),
    $opacity: $("#alpha .number, #alphaCFG"),
  },
  // Width of slider
  max = $slider.width(),
  // variables for the slider to be dragged
  n = 1,
  dragok = false,
  x,
  d,
  dx;

/**********************************
			CLONE ARRAYS
**********************************/

Array.prototype.clone = function () {
  var arr = this.slice(0);
  for (var i = 0; i < this.length; i++) {
    if (this[i].clone) {
      arr[i] = this[i].clone();
    }
  }
  return arr;
};

/**********************************
		COLOR TOOLS
**********************************/

color = {
  // Takes an rgb or rgba color and returns the red/green/blue/alpha information
  split: function (_color) {
    switch (color.type(_color)) {
      case "rgba":
        var _rgba = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(0\.\d+))?\)$/.exec(
            _color,
          ),
          red = parseInt(_rgba[1]),
          green = parseInt(_rgba[2]),
          blue = parseInt(_rgba[3]),
          alpha = parseFloat(_rgba[4]);
        return [red, green, blue, alpha];
        break;
      case "rgb":
        var _rgb = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(_color),
          red = parseInt(_rgb[2]),
          green = parseInt(_rgb[3]),
          blue = parseInt(_rgb[4]);
        return [red, green, blue, 1];
        break;
    }
  },

  // Returns RGB or RGBA
  type: function (_color) {
    switch (_color.substr(0, 4)) {
      case "rgba":
        return "rgba";
        break;
      case "rgb(":
        return "rgb";
        break;
    }
  },

  // Blend two colors together proportional to the their position relative to a point
  blend: function (_min, _max, _min_x, _max_x, _x) {
    var _min = color.split(_min),
      _max = color.split(_max),
      _percent = Math.abs(1 / ((_max_x - _min_x) / (_x - _min_x))),
      _percent_inverse = 1 - _percent,
      _blend = {
        red: Math.round(_min[0] * _percent_inverse + _max[0] * _percent),
        green: Math.round(_min[1] * _percent_inverse + _max[1] * _percent),
        blue: Math.round(_min[2] * _percent_inverse + _max[2] * _percent),
        alpha:
          Math.round((_min[3] * _percent_inverse + _max[3] * _percent) * 100) /
          100,
      };
    if (_blend.alpha == 1) {
      return "rgb(" + _blend.red + "," + _blend.green + "," + _blend.blue + ")";
    } else if (_blend.alpha == 0) {
      return (
        "rgba(" +
        _blend.red +
        "," +
        _blend.green +
        "," +
        _blend.blue +
        "," +
        _blend.alpha +
        ".0)"
      );
    } else {
      return (
        "rgba(" +
        _blend.red +
        "," +
        _blend.green +
        "," +
        _blend.blue +
        "," +
        _blend.alpha +
        ")"
      );
    }
  },

  // Blends all the stops together into one color - ignores alpha
  average: function () {
    var _blend = {
      red: 0,
      green: 0,
      blue: 0,
    };
    for (var i = 0; i < stops.stopData.items.length; i++) {
      _blend.red += color.split(stops.stopData.items[i][1])[0];
      _blend.green += color.split(stops.stopData.items[i][1])[1];
      _blend.blue += color.split(stops.stopData.items[i][1])[2];
    }
    _blend.red = Math.round(_blend.red / stops.stopData.items.length);
    _blend.blue = Math.round(_blend.blue / stops.stopData.items.length);
    _blend.green = Math.round(_blend.green / stops.stopData.items.length);
    return "rgb(" + _blend.red + "," + _blend.green + "," + _blend.blue + ")";
  },

  colorBox: {
    rgb: function () {
      if (
        $("#rgbInput .0").val() != "" &&
        $("#rgbInput .1").val() != "" &&
        $("#rgbInput .2").val() != ""
      ) {
        var _val = color.convert(
          "rgb(" +
            $("#rgbInput .0").val() +
            "," +
            $("#rgbInput .1").val() +
            "," +
            $("#rgbInput .2").val() +
            ")",
          "rgb",
        );
        //Converts to RGBA if opacity < 100
        if (_val != undefined)
          stops.stopData.items[stops.stopData.current][2] < 100
            ? stops.color(
                "rgba(" +
                  _val.substring(4, _val.length - 1) +
                  "," +
                  stops.stopData.items[stops.stopData.current][2] / 100 +
                  ")",
              )
            : stops.color(_val);
      }
    },

    hsl: function () {
      if (
        $("#hslInput .0").val() != "" &&
        $("#hslInput .1").val() != "" &&
        $("#hslInput .2").val() != ""
      ) {
        var _val = color.convert(
          "hsl(" +
            $("#hslInput .0").val() +
            "," +
            $("#hslInput .1").val() +
            "," +
            $("#hslInput .2").val() +
            ")",
          "rgb",
        );
        //Converts to RGBA if opacity < 100
        if (_val != undefined)
          stops.stopData.items[stops.stopData.current][2] < 100
            ? stops.color(
                "rgba(" +
                  _val.substring(4, _val.length - 1) +
                  "," +
                  stops.stopData.items[stops.stopData.current][2] / 100 +
                  ")",
              )
            : stops.color(_val);
      }
    },

    alpha: function () {
      var value = $("#alpha .number").val();
      if (value != "") {
        $("#alphaCFG").val(value);
        stops.opacity(value);
      }
    },

    position: function () {
      var value = $("#position .number").val();
      if (value > 100) value = 100;
      if (value < 0) value = 0;
      $("#position .number").val(value);
      $("#positionCFG").val(value);
      stops.position(parseInt(value));
    },

    angle: function () {
      var _angle = $("#manualDirection input").val();
      if (_angle > 360) {
        $("#manualDirection input").val(360);
      } else if (_angle < 0) {
        $("#manualDirection input").val(0);
      }
      gradient.direction = "d" + _angle;
      $.jStorage.set("direction", gradient.direction);
      preview_gradient();
    },
  },

  /**********************************
			COLOR BOXES
	**********************************/

  boxes: function () {
    var _color = stops.stopData.items[stops.stopData.current][1];

    //Shows in UI
    if (!$("#hexInput").is(":focus"))
      $("#hexInput").val(color.convert(_color, "hex"));

    //RGB
    var str = color.convert(_color, "rgb");
    str = str.substring(4, str.length - 1);
    var rgb = str.split(",");
    for (var i = 0; i < 3; i++) {
      if (!$("#rgbInput ." + i).is(":focus")) $("#rgbInput ." + i).val(rgb[i]);
    }

    //HSL
    var str = color.convert(_color, "hsl");
    str = str.replace(/%/g, "");
    str = str.substring(4, str.length - 1);
    var hsl = str.split(",");
    for (var i = 0; i < 3; i++) {
      if (!$("#hslInput ." + i).is(":focus")) $("#hslInput ." + i).val(hsl[i]);
    }
  },

  /**********************************
			COLOR CONVERTER
	**********************************/

  convert: function (input, colorSpace, alpha) {
    //Strips spaces
    input = input.replace(/\s/g, "");
    //Converts RGBA to RGB
    if (input.match("^rgba\\(")) {
      input = input.substring(5, input.length - 1);
      rgb = input.split(",");
      input = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";

      // Converts RGBA to HLSA
      if (alpha) {
        if (colorSpace == "hsl") {
          // RGBA -> HSLA
          var hsl = rgb2Hsl(rgb[0], rgb[1], rgb[2]);
          return (
            "hsla(" +
            hsl[0] +
            "," +
            hsl[1] +
            "%," +
            hsl[2] +
            "%," +
            rgb[3] +
            ")"
          );
        } else if (colorSpace == "rgb" || colorSpace == "hex") {
          // RGBA -> RGBA
          return (
            "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + rgb[3] + ")"
          );
        }
      }
    }

    // HEX
    if (input.match("^#[0-f]{6}") || input.match("^#[0-f]{3}")) {
      input = input.substring(1, input.length);
      var longhex = input;
      if (input.length == 3) {
        longhex = input[0].replace(input[0], input[0] + input[0]);
        longhex += input[1].replace(input[1], input[1] + input[1]);
        longhex += input[2].replace(input[2], input[2] + input[2]);
      }

      // HEX -> RGB || HEX -> HSL
      if (colorSpace == "rgb" || colorSpace == "hsl") {
        var rgb = new Array();
        rgb[0] = parseInt(longhex.substring(0, 2), 16);
        rgb[1] = parseInt(longhex.substring(2, 4), 16);
        rgb[2] = parseInt(longhex.substring(4, 6), 16);
        //Checks if it is a number
        rgb[0] = isNaN(rgb[0]) ? 0 : rgb[0];
        rgb[1] = isNaN(rgb[1]) ? 0 : rgb[1];
        rgb[2] = isNaN(rgb[2]) ? 0 : rgb[2];
        if (colorSpace == "rgb") {
          return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        } else if (colorSpace == "hsl") {
          var hsl = rgb2Hsl(rgb[0], rgb[1], rgb[2]);
          return "hsl(" + hsl[0] + "," + hsl[1] + "%," + hsl[2] + "%)";
        }

        // HEX -> HEX
      } else if (colorSpace == "hex") {
        return "#" + longhex;
      }

      // RGB
    } else if (input.match("^rgb\\(")) {
      //Rips out the rgb bit
      input = input.substring(4, input.length - 1);
      var rgb = input.split(",");

      // RGB -> RGB
      if (colorSpace == "rgb") {
        return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";

        // RGB -> HEX
      } else if (colorSpace == "hex") {
        for (var i = 0; i < 3; i++) {
          //Converts Decimal to Hex
          rgb[i] = parseInt(rgb[i], 10).toString(16);
          //So we have a full 6 digit hex code
          if (rgb[i].length == 1) {
            rgb[i] = 0 + rgb[i];
          }
        }
        return "#" + rgb[0] + rgb[1] + rgb[2];

        // RGB -> HSL
      } else if (colorSpace == "hsl") {
        var hsl = rgb2Hsl(rgb[0], rgb[1], rgb[2]);
        return "hsl(" + hsl[0] + "," + hsl[1] + "%," + hsl[2] + "%)";
      }

      // HSL
    } else if (input.match("^hsl\\(")) {
      // HSL -> HSL
      if (colorSpace == "hsl") {
        return input;

        // HSL -> RGB || HSL -> HEX
      } else if (colorSpace == "rgb" || colorSpace == "hex") {
        input = input.replace(/%/g, "");
        input = input.substring(4, input.length - 1);
        hsl = input.split(",");
        //Converts to RGB
        rgb = hsl2Rgb(hsl[0], hsl[1], hsl[2]);
        //Rounds number
        rgb[0] = Math.round(rgb[0]);
        rgb[1] = Math.round(rgb[1]);
        rgb[2] = Math.round(rgb[2]);
        if (colorSpace == "rgb") {
          return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        } else if (colorSpace == "hex") {
          for (var i = 0; i < 3; i++) {
            //Converts Decimal to Hex
            rgb[i] = parseInt(rgb[i], 10).toString(16);
            //So we have a full 6 digit hex code
            if (rgb[i].length == 1) rgb[i] = 0 + rgb[i];
          }
          return "#" + rgb[0] + rgb[1] + rgb[2];
        }
      }
    }

    // Converting HSL to RGB
    function hsl2Rgb(h, s, l) {
      var m1, m2, hue;
      var r, g, b;
      s /= 100;
      l /= 100;
      if (s == 0) r = g = b = l * 255;
      else {
        if (l <= 0.5) m2 = l * (s + 1);
        else m2 = l + s - l * s;
        m1 = l * 2 - m2;
        hue = h / 360;
        r = hue2Rgb(m1, m2, hue + 1 / 3);
        g = hue2Rgb(m1, m2, hue);
        b = hue2Rgb(m1, m2, hue - 1 / 3);
      }
      return [r, g, b];
    }

    // Converting Hue to RGB
    function hue2Rgb(m1, m2, hue) {
      var v;
      if (hue < 0) hue += 1;
      else if (hue > 1) hue -= 1;

      if (6 * hue < 1) v = m1 + (m2 - m1) * hue * 6;
      else if (2 * hue < 1) v = m2;
      else if (3 * hue < 2) v = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
      else v = m1;

      return 255 * v;
    }

    // Converting RGB to HSL
    function rgb2Hsl(r, g, b) {
      (r /= 255), (g /= 255), (b /= 255);
      var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      var h,
        s,
        l = (max + min) / 2;
      if (max == min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
    }
  },
};

/**********************************
	EDITING COLOR STOPS
**********************************/
stops = {
  // create stops object that holds current stop and an array of all the stops
  stopData: {
    current: 0,
    items: $.jStorage.get("stops", os.defaultGradient[os.type]),
  },

  // Load stops from array
  load: function () {
    $.each(stops.stopData.items, function (index, data) {
      $slider
        .append('<div class="stop ' + index + '">')
        .find(".stop." + index)
        .css({
          "background-image":
            "linear-gradient(" +
            data[1] +
            "," +
            data[1] +
            "), url(img/grid.png)",
          left: (data[0] * max) / 100,
        });
    });
    $(".stop." + stops.stopData.current).addClass("current");
  },

  //Creates Handler for new Stops
  init: function () {
    $slider.mouseup(function (e) {
      if (!dragok) {
        var _x = Math.round(((e.clientX - $(this).offset().left) / max) * 100), // position of new stop
          _item_number = stops.stopData.items.length, // caching length of array
          _min = [-1, "null"],
          _max = [101, "null"];
        // Find the two stops on the immediate left/right of where the user clicked
        for (var _i = 0; _i < _item_number; _i++) {
          if (
            stops.stopData.items[_i][0] > _min[0] &&
            stops.stopData.items[_i][0] < _x
          ) {
            _min[0] = stops.stopData.items[_i][0];
            _min[1] = _i;
          }
          if (
            stops.stopData.items[_i][0] < _max[0] &&
            stops.stopData.items[_i][0] > _x
          ) {
            _max[0] = stops.stopData.items[_i][0];
            _max[1] = _i;
          }
        }
        // If the user clicked on the far right/left of the slider then just use the color on the opposite side
        if (_min[1] == "null") {
          _color = stops.stopData.items[_max[1]][1];
        } else if (_max[1] == "null") {
          _color = stops.stopData.items[_min[1]][1];
          // Else blend the colors together
        } else {
          _color = color.blend(
            stops.stopData.items[_min[1]][1],
            stops.stopData.items[_max[1]][1],
            stops.stopData.items[_min[1]][0],
            stops.stopData.items[_max[1]][0],
            _x,
          );
        }
        // Create a new stop and select it
        $("#slider .current").removeClass("current");
        $slider
          .append('<div class="stop ' + _item_number + ' current">')
          .find(".current")
          .css({
            background:
              "linear-gradient(" +
              _color +
              ", " +
              _color +
              "), url('img/grid.png')",
            left: (_x / 100) * max,
          });
        stops.stopData.current = _item_number;
        // Add the stop to the array
        stops.stopData.items.push([_x, _color, color.split(_color)[3] * 100]);
        // Load the gradient
        preview_gradient();
        update_details();
        // If any buttons were disabled, enable them as a stop is now selected and there are more than two stops
        $(".disabled").removeClass("disabled");
      }
    });
  },

  // Remove color stop from slider and array
  remove: function () {
    stops.stopData.items.splice(stops.stopData.current, 1); // remove stop from array
    $(".stop").remove();
    stops.load();
    $("#slider .current").removeClass("current");
    $("#gradientDetails div").addClass("disabled");
    preview_gradient();
    $.jStorage.set("stops", stops.stopData.items);
  },

  // Change color of stop
  color: function (_color) {
    if (_color) {
      // If color was chosen
      if (stops.stopData.items[stops.stopData.current][2] < 100) {
        var value = color.convert(_color, "rgb");
        _color =
          "rgba(" +
          value.substring(4, value.length - 1) +
          "," +
          stops.stopData.items[stops.stopData.current][2] / 100 +
          ")";
      }
      // Create a new element #temp and set the background to the chosen color
      $("body")
        .append('<div id="temp">')
        .find("#temp")
        .css("background", _color);
      // Then get the color of the #temporary element. This is returned in RGB format
      _color = $("#temp").css("background-color");
      // Remove #temp
      $("#temp").remove();
      // Update the array
      stops.stopData.items[stops.stopData.current][1] = _color;
      // Update the color stop. A gradient is used to enable multiple backgrounds for the transparency grid
      $("#slider .current").css({
        background:
          "linear-gradient(" +
          _color +
          ", " +
          _color +
          "), url('img/grid.png')",
      });
      // Update gradient
      preview_gradient();
      update_details();
    }
  },

  // Set the opacity of a color stop
  opacity: function (opacity) {
    var $current = $("#slider .current");
    _color = color.split(stops.stopData.items[stops.stopData.current][1]);
    if (opacity < 100) {
      if (opacity == 0) {
        opacity = "0.0";
      } else {
        opacity /= 100;
      }
      _color =
        "rgba(" +
        _color[0] +
        ", " +
        _color[1] +
        ", " +
        _color[2] +
        ", " +
        opacity +
        ")";
    } else {
      opacity = 1;
      _color = "rgb(" + _color[0] + ", " + _color[1] + ", " + _color[2] + ")";
    }
    stops.stopData.items[stops.stopData.current][1] = _color;
    stops.stopData.items[stops.stopData.current][2] = Math.round(opacity * 100);
    preview_gradient();
    update_details();
    $current.css({
      background:
        "linear-gradient(" + _color + ", " + _color + "), url(img/grid.png)",
    });
  },

  // Set the position of a color stop
  position: function (position) {
    stops.stopData.items[stops.stopData.current][0] = position;
    preview_gradient();
    $("#slider .current").css("left", (position / 100) * max);
  },

  // Sort stops by location
  sort: function () {
    var line,
      _temp = stops.stopData.items.clone();
    return _temp.sort(function (a, b) {
      if (a[0] > b[0]) {
        return 1;
      } else if (a[0] < b[0]) {
        return -1;
      } else {
        return 0;
      }
    });
  },

  /**********************************
			MOVING COLOR STOPS
	**********************************/

  // Clicking and holding a color stop
  down: function (e) {
    if (!e) e = window.event;
    var temp = typeof e.target != "undefined" ? e.target : e.srcElement;
    if ((temp.tagName != "HTML") | "BODY" && !$(temp).hasClass("stop")) {
      temp =
        typeof temp.parentNode != "undefined"
          ? temp.parentNode
          : temp.parentElement;
    }
    if ($(temp).hasClass("stop")) {
      //Blurs Color Box
      $("#colorCFG input").blur();
      // Show that it is selected by highlighting it
      $("#slider .current").removeClass("current");
      $(temp).addClass("current");
      // Set current stop to class name of selected stop
      stops.stopData.current = parseInt(
        $("#slider .current").attr("class").split(/\s+/)[1],
      );
      // Enable disabled buttons
      $("#alpha, #color, #position, #colorCFG, #colorCFG div").removeClass(
        "disabled",
      );
      if (stops.stopData.items.length > 2) $("#delete").removeClass("disabled");
      // Update details (location, color, opacity)
      update_details();
      // Slider code
      dragok = true;
      temp.style.zIndex = n++;
      d = temp;
      dx = parseInt(temp.style.left + 0);
      x = e.clientX;
      document.onmousemove = stops.move;
      return false;
    }
  },

  // Releasing a color stop
  up: function () {
    dragok = false;
    document.onmousemove = null;
    $.jStorage.set("stops", stops.stopData.items);
  },

  // Dragging a color stop
  move: function (e) {
    if (!e) e = window.event;
    if (dragok) {
      // Calculating position to move
      var left = dx + e.clientX - x;
      // Restricting min/max to edges of the slider
      if (left < 0) left = 0;
      if (left > max) left = max;
      // Updating position
      d.style.left = left + "px";
      // Updating stop.items array with percentage value of displacement
      stops.stopData.items[stops.stopData.current][0] = Math.round(
        (left / max) * 100,
      );
      // Display real-time gradient
      preview_gradient();
      // Updating details (location)
      details.$position.val(stops.stopData.items[stops.stopData.current][0]);
      return false;
    }
  },
};

/**********************************
	Directional Buttons
**********************************/

var buttonLocked = false;

$("#configSwitch").click(function () {
  if (!buttonLocked) {
    buttonLocked = true;

    switch (gradient.type) {
      case "linear":
        $("#configLinear").hide(
          "slide",
          { direction: "left" },
          150,
          function () {
            $("#configRadial").show("slide", { direction: "right" }, 150);
            buttonLocked = false;
          },
        );
        gradient.type = "radial";
        $("#configSwitch").removeClass("linear").addClass("radial");
        break;

      case "radial":
        $("#configRadial").hide(
          "slide",
          { direction: "right" },
          150,
          function () {
            $("#configLinear").show("slide", { direction: "left" }, 150);
            buttonLocked = false;
          },
        );
        gradient.type = "linear";
        $("#configSwitch").removeClass("radial").addClass("linear");
        break;
    }
    preview_gradient();
  }
});

$("#configRadial input[type=number]").on(
  "change mousewheel keyup",
  function () {
    var _name = $(this).attr("name"),
      _val = $(this).val();
    gradient[_name] = _val;
    preview_gradient();
  },
);

$("#shape .button").click(function () {
  $("#shape .highlight").removeClass("highlight");
  gradient.shape = $(this).addClass("highlight").attr("id");
  preview_gradient();
});

$("#size .button").click(function () {
  $("#size .menu").fadeToggle(150);
  $(this).toggleClass("clicked");
});

$("#size .menu ul li").click(function () {
  $("#size .button").html($(this).html()).removeClass("clicked");
  $("#size .menu").fadeOut(150);
  gradient.size = $(this).attr("class");
  preview_gradient();
});

$("#configRadial input[type=number]")
  .keydown(function () {
    if (!os.keydown) {
      var _el = this;
      os.keydown = true;
      timer = setInterval(function () {
        var _name = $(_el).attr("name"),
          _val = $(_el).val();
        gradient[_name] = _val;
        preview_gradient();
      }, 50);
    }
  })
  .keyup(function () {
    os.keydown = false;
    clearInterval(timer);
  });

// Directional button converter
function direction(dir, type) {
  switch (type) {
    case "svg":
      var p1,
        p2,
        angle = dir.substr(1);
      if (angle >= 315 || angle < 45) {
        angle < 45
          ? (angle = parseInt(angle) + 45)
          : (angle = parseInt(angle) - 315);
        p1 = (angle / 90) * 100;
        p2 = 100 - p1;
        return (
          'x1="0%" y1="' +
          Math.round(p1) +
          '%" x2="100%" y2="' +
          Math.round(p2) +
          '%"'
        );
      } else if (angle >= 45 && angle < 135) {
        p1 = ((angle - 45) / 90) * 100;
        p2 = 100 - p1;
        return (
          'x1="' +
          Math.round(p1) +
          '%" y1="100%" x2="' +
          Math.round(p2) +
          '%" y2="0%"'
        );
      } else if (angle >= 135 && angle < 225) {
        p1 = ((angle - 135) / 90) * 100;
        p2 = 100 - p1;
        return (
          'x1="100%" y1="' +
          Math.round(p2) +
          '%" x2="0%" y2="' +
          Math.round(p1) +
          '%"'
        );
      } else if ((angle >= 225) & (angle < 315)) {
        p1 = ((angle - 225) / 90) * 100;
        p2 = 100 - p1;
        return (
          'x1="' +
          Math.round(p2) +
          '%" y1="0%" x2="' +
          Math.round(p1) +
          '%" y2="100%"'
        );
      }

    case "legacy":
      switch (dir) {
        case "d0":
          return "left top, right top, ";
        case "d45":
          return "left bottom, right top, ";
        case "d90":
          return "left bottom, left top, ";
        case "d135":
          return "right bottom, left top, ";
        case "d180":
          return "right top, left top, ";
        case "d225":
          return "right top, left bottom, ";
        case "d270":
          return "left top, left bottom, ";
        case "d315":
          return "left top, right bottom, ";
        default:
          var p1,
            p2,
            angle = dir.substr(1);
          if (angle > 315 || angle < 45) {
            angle < 45
              ? (angle = parseInt(angle) + 45)
              : (angle = parseInt(angle) - 315);
            p1 = (angle / 90) * 100;
            p2 = 100 - p1;
            return "0% " + Math.round(p1) + "%, 100% " + Math.round(p2) + "%, ";
          } else if (angle > 45 && angle < 135) {
            p1 = ((angle - 45) / 90) * 100;
            p2 = 100 - p1;
            return Math.round(p1) + "% 100%, " + Math.round(p2) + "% 0%, ";
          } else if (angle > 135 && angle < 225) {
            p1 = ((angle - 135) / 90) * 100;
            p2 = 100 - p1;
            return "100% " + Math.round(p2) + "%, 0% " + Math.round(p1) + "%, ";
          } else if ((angle > 225) & (angle < 315)) {
            p1 = ((angle - 225) / 90) * 100;
            p2 = 100 - p1;
            return Math.round(p2) + "% 0%, " + Math.round(p1) + "% 100%, ";
          }
      }
      break;

    default:
      switch (dir) {
        case "d0":
          return "left";
        case "d45":
          return "bottom left";
        case "d90":
          return "bottom";
        case "d135":
          return "bottom right";
        case "d180":
          return "right";
        case "d225":
          return "top right";
        case "d270":
          return "top";
        case "d315":
          return "top left";
        default:
          return dir.substr(1) + "deg";
      }
  }
}

$("#direction .manual").click(function () {
  $("#direction .current").removeClass("current");
  $("#manualDirection input").val(gradient.direction.substr(1));
  $("#manualDirection").fadeIn(150);
  $("#overlay").addClass("transparent").show(0);
  $("#manualDirection input[type=number]").focus();
});

// Changing the direction of the gradient
$("#direction div:not(.manual)").click(function () {
  $("#direction .current").removeClass("current");
  gradient.direction = $(this).attr("class");
  $(this).addClass("current");
  preview_gradient();
  $.jStorage.set("direction", gradient.direction);
});

/**********************************
	GENERATING GRADIENTS
**********************************/

// Calculate the gradient and display it in the gradient window
function preview_gradient() {
  switch (gradient.type) {
    case "linear":
      if (os.legacy_support) {
        // LEGACY WEBKIT
        var preview = "-webkit-gradient(linear, left top, right top, ",
          final =
            "-webkit-gradient(linear, " +
            direction(gradient.direction, "legacy");
        for (var _i = 0; _i < stops.stopData.items.length; _i++) {
          if (_i != stops.stopData.items.length - 1) {
            line =
              "color-stop(" +
              stops.stopData.items[_i][0] / 100 +
              "," +
              stops.stopData.items[_i][1] +
              "), ";
            preview += line;
            final += line;
          } else {
            line =
              "color-stop(" +
              stops.stopData.items[_i][0] / 100 +
              "," +
              stops.stopData.items[_i][1] +
              "))";
            preview += line;
            final += line;
          }
        }
        gradient.$preview.css("background", preview);
        gradient.$final.css("background", final);
      } else {
        // WEBKIT
        var _temp = stops.sort(),
          preview = "-webkit-linear-gradient(left, ",
          final =
            "-webkit-linear-gradient(" + direction(gradient.direction) + ", ";
        for (var _i = 0; _i < _temp.length; _i++) {
          if (_i != _temp.length - 1) {
            line = _temp[_i][1] + " " + _temp[_i][0] + "%, ";
            preview += line;
            final += line;
          } else {
            line = _temp[_i][1] + " " + _temp[_i][0] + "%)";
            preview += line;
            final += line;
          }
        }
        gradient.$preview.css("background", preview);
        gradient.$final.css("background", final);
      }
      break;
    case "radial":
      switch (os.legacy_support) {
        case true:
        // TODO: Add legacy radial gradients
        // break;
        case false:
          var _temp = stops.sort(),
            preview = "-webkit-linear-gradient(left, ",
            _prefix = "";
          _prefix = "-webkit-radial-gradient";
          var final =
            _prefix +
            "(" +
            gradient.posX +
            "% " +
            gradient.posY +
            "%, " +
            gradient.shape +
            " " +
            gradient.size +
            ", ";
          for (var _i = 0; _i < _temp.length; _i++) {
            if (_i != _temp.length - 1) {
              line = _temp[_i][1] + " " + _temp[_i][0] + "%, ";
              preview += line;
              final += line;
            } else {
              line = _temp[_i][1] + " " + _temp[_i][0] + "%)";
              preview += line;
              final += line;
            }
          }
          gradient.$preview.css("background", preview);
          gradient.$final.css("background", final);
          break;
      }
      break;
  }
}

// Convert array items into a vendor prefixed CSS.
function calculate_gradient_code() {
  var syntax = {
      standard: function () {
        var _code = "";
        for (var i = 0; i < _items.length; i++) {
          color.type(_items[i][1]) == "rgba"
            ? (_color = color.convert(_items[i][1], _colorFormat, true))
            : (_color = color.convert(_items[i][1], _colorFormat));
          i != _items.length - 1
            ? (_code += _color + " " + _items[i][0] + "%, ")
            : (_code += _color + " " + _items[i][0] + "%);");
        }
        return _code;
      },
      legacy: function () {
        var _code = "";
        for (var i = 0; i < _items.length; i++) {
          color.type(_items[i][1]) == "rgba"
            ? (_color = color.convert(_items[i][1], _colorFormat, true))
            : (_color = color.convert(_items[i][1], _colorFormat));
          i != _items.length - 1
            ? (_code +=
                "color-stop(" + _items[i][0] / 100 + ", " + _color + "), ")
            : (_code +=
                "color-stop(" + _items[i][0] / 100 + ", " + _color + "));");
        }
        return _code;
      },
      scss: function () {
        var _code = "";
        for (var i = 0; i < _items.length; i++) {
          color.type(_items[i][1]) == "rgba"
            ? (_color = color.convert(_items[i][1], _colorFormat, true))
            : (_color = color.convert(_items[i][1], _colorFormat));
          i != _items.length - 1
            ? (_code += _color + " " + _items[i][0] + "%, ")
            : (_code += _color + " " + _items[i][0] + "%));");
        }
        return _code;
      },
      filter: function () {
        var _code = "",
          _dir = gradient.direction.substr(1, gradient.direction.length),
          _c1 = color.convert(_items[0][1], "hex"),
          _c2 = color.convert(_items[_items.length - 1][1], "hex");
        if (_dir >= 45 && _dir < 135) {
          // ^^
          _code =
            'startColorstr="' +
            _c2 +
            '", endColorstr="' +
            _c1 +
            '",GradientType=0);';
        } else if (_dir >= 135 && _dir < 225) {
          // <--
          _code =
            'startColorstr="' +
            _c2 +
            '", endColorstr="' +
            _c1 +
            '",GradientType=1);';
        } else if (_dir >= 225 && _dir < 315) {
          // vv
          _code =
            'startColorstr="' +
            _c1 +
            '", endColorstr="' +
            _c2 +
            '",GradientType=0);';
        } else if (_dir >= 315 || _dir < 45) {
          // -->
          _code =
            'startColorstr="' +
            _c1 +
            '", endColorstr="' +
            _c2 +
            '",GradientType=1);';
        }
        return _code;
      },
      svg: function () {
        var _code = "";
        for (var i = 0; i < _items.length; i++) {
          _color = color.convert(_items[i][1], "hex");
          _code +=
            '<stop offset="' +
            _items[i][0] +
            '%" stop-color="' +
            _color +
            '" stop-opacity="' +
            _items[i][2] / 100 +
            '"/>';
        }
        return _code;
      },
      solidColor: function () {
        var _solid_color = "";
        switch (_colorFallbackType) {
          case "first":
            _solid_color = stops.stopData.items[0][1];
            break;
          case "last":
            _solid_color =
              stops.stopData.items[stops.stopData.items.length - 1][1];
            break;
          case "average":
            _solid_color = color.average();
            break;
        }
        _solid_color = color.convert(_solid_color, "hex");
        return _solid_color;
      },
    },
    // Variables
    _prefix = [],
    _stops = "";
  _legacy_stops = "";
  (_items = stops.sort()),
    (_output = ""),
    (_colorFallback = $("#fallbackSolid").prop("checked")),
    (_colorFallbackType = $("#fallbackType").val()),
    (_colorFormat = $("#colorFormat").val());

  switch (gradient.type) {
    case "linear":
      $.each(settings.getBrowserPrefix(), function (_i, _data) {
        // W3 Standard
        if (_data == "w3") {
          _prefix.push(
            "linear-gradient(" + direction(gradient.direction) + ", ",
          );

          // Legacy
        } else if (_data == "legacywebkit") {
          _prefix.push("legacywebkit");

          // Old IE
        } else if (_data == "filter") {
          _prefix.push("filter");

          // SCSS
        } else if (_data == "scss") {
          _prefix.push("scss");

          // SVG
        } else if (_data == "svg") {
          _prefix.push("svg");

          // Standard
        } else {
          _prefix.push(
            "-" +
              _data +
              "-linear-gradient(" +
              direction(gradient.direction) +
              ", ",
          );
        }
      });
      break;

    case "radial":
      $.each(settings.getBrowserPrefix(), function (_i, _data) {
        // W3 Standard
        if (_data == "w3") {
          _prefix.push(
            "radial-gradient(" +
              gradient.posX +
              "% " +
              gradient.posY +
              "%, " +
              gradient.shape +
              " " +
              gradient.size +
              ", ",
          );

          // Legacy
        } else if (_data == "legacywebkit") {
          _prefix.push("legacywebkit");

          // Old IE
        } else if (_data == "filter") {
          _prefix.push("filter");

          // SCSS
        } else if (_data == "scss") {
          _prefix.push("scss");

          // SVG
        } else if (_data == "svg") {
          _prefix.push("svg");

          // Standard
        } else {
          _prefix.push(
            "-" +
              _data +
              "-radial-gradient(" +
              gradient.posX +
              "% " +
              gradient.posY +
              "%, " +
              gradient.shape +
              " " +
              gradient.size +
              ", ",
          );
        }
      });

      break;
  }

  // Only run if at least one browser was selected
  if (_prefix.length > 0 || _colorFallback) {
    // Standard Syntax
    _stops = syntax.standard();

    // Solid color fall back
    if (_colorFallback) {
      _output = "background-image: " + syntax.solidColor() + ";";
      if (gradient.comments)
        _output += "/* Solid color fallback for older browsers */";
      _output += "\n";
    }

    // Loop through each browser prefix and append the prefix and stops to the output
    for (var x = 0; x < _prefix.length; x++) {
      switch (gradient.type) {
        case "linear":
          // Legacy
          if (_prefix[x] == "legacywebkit") {
            _legacy_stops = syntax.legacy();
            _output +=
              "background-image: -webkit-gradient(linear, " +
              direction(gradient.direction, "legacy") +
              _legacy_stops;
            if (gradient.comments) _output += "/* Chrome, Safar4+ */";
            _output += "\n";

            // SCSS
          } else if (_prefix[x] == "scss") {
            _scss_stops = syntax.scss();
            _output +=
              "@include background(linear-gradient(" +
              direction(gradient.direction) +
              ", " +
              _scss_stops +
              "\n";

            // IE 6 - 9
          } else if (_prefix[x] == "filter") {
            _filter_stops = syntax.filter();
            _output +=
              "filter: progid:DXImageTransform.Microsoft.gradient(" +
              _filter_stops;
            if (gradient.comments) _output += "/* IE6-9 */";
            _output += "\n";

            // SVG
          } else if (_prefix[x] == "svg") {
            var id = Date.now(),
              _svg_output =
                '<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><linearGradient id="g' +
                id +
                '" gradientUnits="userSpaceOnUse" ' +
                direction(gradient.direction, "svg") +
                ">";
            _svg_output += syntax.svg();
            _svg_output +=
              '  </linearGradient><rect x="0" y="0" width="1" height="1" fill="url(#g' +
              id +
              ')" /></svg>';
            _output +=
              "background: url(data:image/svg+xml;base64," +
              btoa(_svg_output) +
              "); \n";

            // Standard
          } else {
            _output += "background-image: " + _prefix[x] + _stops + "\n";
          }
          break;

        case "radial":
          // Legacy
          if (_prefix[x] == "legacywebkit") {
            _legacy_stops = syntax.legacy();
            _output +=
              "background-image: -webkit-gradient(radial, " +
              gradient.posX +
              "% " +
              gradient.posY +
              "%, " +
              "0, " +
              gradient.posX +
              "% " +
              gradient.posY +
              "%, 100%, " +
              _legacy_stops;
            if (gradient.comments) _output += "/* Chrome, Safari4+ */";
            _output += "\n";

            // SCSS
          } else if (_prefix[x] == "scss") {
            _scss_stops = syntax.scss();
            _output +=
              "@include background(radial-gradient(" +
              gradient.posX +
              "% " +
              gradient.posY +
              "%, " +
              gradient.shape +
              " " +
              gradient.size +
              ", " +
              _scss_stops +
              "\n";

            // IE 6 - 9
          } else if (_prefix[x] == "filter") {
            _filter_stops = syntax.filter();
            _output +=
              "filter: progid:DXImageTransform.Microsoft.gradient(" +
              _filter_stops;
            if (gradient.comments)
              _output += "/* IE6-9 fallback on linear gradient */";
            _output += "\n";

            // SVG
          } else if (_prefix[x] == "svg") {
            var id = Date.now(),
              _svg_output =
                '<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none"><radialGradient id="g' +
                id +
                '" gradientUnits="userSpaceOnUse" cx="' +
                gradient.posX +
                '%" cy="' +
                gradient.posX +
                '%" r="50%">';
            _svg_output += syntax.svg();
            _svg_output +=
              '</radialGradient><rect x="-0" y="0" width="1" height="1" fill="url(#g' +
              id +
              ')" /></svg>';
            _output +=
              "background: url(data:image/svg+xml;base64," +
              btoa(_svg_output) +
              "); \n";

            // Standard
          } else {
            _output += "background-image: " + _prefix[x] + _stops + "\n";
          }
          break;
      }
    }

    // Else output this warning
  } else {
    _output = "You haven't selected any browser prefixes.";
  }

  // Get rid of extra break
  _output = _output.trim();

  return _output;
}

/**********************************
		SETTINGS PANEL
**********************************/

// Save settings on change
$("#settings input[type=checkbox], #fallbackType, #colorFormat").on(
  "change",
  function () {
    var _settings = [[], [], []];

    // Color Format
    for (var i = 0; i < $("#colorFormat option").length; i++) {
      if ($("#colorFormat option")[i].selected) {
        _settings[0].push(i);
      }
    }

    // Browser Support
    for (var i = 0; i < $("#prefix input").length; i++) {
      if ($("#prefix input")[i].checked) {
        _settings[1].push(1);
      } else {
        _settings[1].push(0);
      }
    }

    // Solid Colour Enabled
    if ($("#fallback input")[0].checked) _settings[2].push(1);
    else _settings[2].push(0);

    // Solid Colour Type
    for (var i = 0; i < $("#fallbackType option").length; i++) {
      if ($("#fallbackType option")[i].selected) {
        _settings[2].push(i);
      }
    }

    $.jStorage.set("settings", _settings);
  },
);

$("#prefixScss").on("change", function () {
  settings.updateScss();
});

settings = {
  getBrowserPrefix: function () {
    var _browsers = [];
    for (var _i = 0; _i < $("#prefix .prefix").length; _i++) {
      var _prefix = $("#prefix .prefix")[_i];
      if (_prefix.checked && !_prefix.disabled) {
        _browsers.push($(_prefix).attr("data-name"));
      }
    }
    return _browsers;
  },

  loadSettingsFromLocalStorage: function () {
    var _default = [[0], [0, 0, 0, 0, 0, 1, 0, 0, 0], [0, 2]],
      _settings = $.jStorage.get("settings", _default);
    $.jStorage.set("settings", _settings);

    // Colour Format
    $("#colorFormat option")[_settings[0][0]].setAttribute(
      "selected",
      "selected",
    );

    // Browser Support
    $("#prefix input").each(function (index, el) {
      if (_settings[1][index]) {
        $(this).prop("checked", true);
      }
    });

    // Fallback
    if (_settings[2][0] == 1) $("#fallback input").prop("checked", true);
    $("#fallback option")[_settings[2][1]].setAttribute("selected", "selected");
  },

  toggleDisable: function (_checkbox, _item, _prop, _state) {
    if ($(_checkbox).prop(_prop)) {
      switch (_state) {
        case "even":
          $(_item).prop("disabled", false);
          break;
        case "odd":
          $(_item).prop("disabled", true);
          break;
      }
    } else {
      switch (_state) {
        case "even":
          $(_item).prop("disabled", true);
          break;
        case "odd":
          $(_item).prop("disabled", false);
          break;
      }
    }
  },

  updateScss: function () {
    settings.toggleDisable(
      $("#prefixScss"),
      $("#prefix input[type=checkbox]:not(#prefixScss)"),
      "checked",
      "odd",
    );
  },
};

// Toggle fallback dropdown menu
$("#fallbackSolid").on("change", function () {
  settings.toggleDisable(
    $("#fallbackSolid"),
    $("#fallbackType"),
    "checked",
    "even",
  );
});

/**********************************
		UPDATING DETAILS
**********************************/

// Displays details about the current stop (position, color, opacity)
function update_details() {
  details.$position.val(stops.stopData.items[stops.stopData.current][0]);
  color.boxes();
  details.$color.html(
    color.convert(stops.stopData.items[stops.stopData.current][1], "hex"),
  );
  details.$opacity.val(stops.stopData.items[stops.stopData.current][2]);
  $("#alphaCFG").css({
    background:
      "linear-gradient(" +
      color.convert(stops.stopData.items[stops.stopData.current][1], "hex") +
      "," +
      color.convert(stops.stopData.items[stops.stopData.current][1], "hex") +
      '),  url("img/gridsmall.png")',
  });
  $.jStorage.set("stops", stops.stopData.items);
}

/**********************************
	STARTING GRADIATOR
**********************************/

$(document).ready(function () {
  // OS Intergration
  os.init();

  // Load stops from array
  stops.load();

  // Load gradient
  preview_gradient();
  update_details();

  // Load settings
  settings.loadSettingsFromLocalStorage();

  // If there are only two stops in the gradient, disable the delete button
  if (stops.stopData.items.length <= 2) {
    $("#delete").addClass("disabled");
  }

  // Set checkboxs
  settings.toggleDisable(
    $("#fallbackSolid"),
    $("#fallbackType"),
    "checked",
    "even",
  );
  settings.updateScss();

  // Set current direction
  $("." + gradient.direction).addClass("current");

  // Load default gradients
  storage.loadDefault();

  //Loads UI
  ui();
  stops.init();
  storage.uiInit();

  // Load mouse
  document.onmousedown = stops.down;
  document.onmouseup = stops.up;
});

//Starts Handlers ETC
function ui() {
  /**********************************
		POSITION AND ALPHA SLIDERS
	**********************************/

  // Alpha
  $("#alphaCFG").on("change", function () {
    var value = $(this).val();
    stops.opacity(value);
  });
  $("#alpha .number")
    .keydown(function () {
      if (!os.keydown) {
        os.keydown = true;
        alphaInputTimer = setInterval("color.colorBox.alpha()", 25);
      }
    })
    .keyup(function () {
      os.keydown = false;
      clearInterval(alphaInputTimer);
      color.colorBox.alpha();
    })
    .mousewheel(function () {
      color.colorBox.alpha();
    });

  // Position
  $("#positionCFG")
    .on("change", function () {
      var value = $(this).val();
      $("#position .number").val(value);
      stops.position(parseInt(value));
    })
    .on("mouseup", function () {
      $.jStorage.set("stops", stops.stopData.items);
    });
  $("#position .number")
    .keydown(function () {
      if (!os.keydown) {
        os.keydown = true;
        positionInputTimer = setInterval("color.colorBox.position()", 25);
      }
    })
    .keyup(function () {
      os.keydown = false;
      clearInterval(positionInputTimer);
      color.colorBox.position();
    })
    .mousewheel(function () {
      color.colorBox.position();
    });

  $("#manualDirection input")
    .keydown(function () {
      if (!os.keydown) {
        os.keydown = true;
        manualDirectionTimer = setInterval("color.colorBox.angle()", 25);
      }
    })
    .keyup(function () {
      os.keydown = false;
      clearInterval(manualDirectionTimer);
      color.colorBox.angle();
    })
    .mousewheel(function () {
      color.colorBox.angle();
    });

  /**********************************
		COLOR BOX INTERFACE
	**********************************/
  $("#gradientDetails #colorCFG nav ul li").click(function () {
    var id = $(this).attr("id").substring(0, 3);

    $("#gradientDetails #colorCFG nav ul li").removeClass("selected");
    $(this).addClass("selected");

    switch (id) {
      case "hex":
        $("#hexInput").delay(150).fadeIn(150);
        $("#rgbInput, #hslInput").fadeOut(150);
        break;
      case "rgb":
        $("#rgbInput").delay(150).fadeIn(150);
        $("#hexInput , #hslInput").fadeOut(150);
        break;
      case "hsl":
        $("#hslInput").delay(150).fadeIn(150);
        $("#hexInput, #rgbInput").fadeOut(150);
        break;
    }
  });

  // HEX
  $("#colorCFG #hexInput").on("keyup", function () {
    var _val = color.convert($(this).val(), "rgb");
    //Converts to RGBA if opacity < 100
    if (_val != undefined)
      stops.stopData.items[stops.stopData.current][2] < 100
        ? stops.color(
            "rgba(" +
              _val.substring(4, _val.length - 1) +
              "," +
              stops.stopData.items[stops.stopData.current][2] / 100 +
              ")",
          )
        : stops.color(_val);
  });

  // RGB
  $("#rgbInput input")
    .keydown(function () {
      if (!os.keydown) {
        os.keydown = true;
        colorBoxRgbTimer = setInterval("color.colorBox.rgb()", 100);
      }
    })
    .keyup(function () {
      os.keydown = false;
      clearInterval(colorBoxRgbTimer);
      color.colorBox.rgb();
    })
    .mousewheel(function () {
      color.colorBox.rgb();
    });

  // HSL
  $("#hslInput input")
    .keydown(function () {
      if (!os.keydown) {
        os.keydown = true;
        colorBoxHslTimer = setInterval("color.colorBox.hsl()", 100);
      }
    })
    .keyup(function () {
      os.keydown = false;
      clearInterval(colorBoxHslTimer);
      color.colorBox.hsl();
    })
    .mousewheel(function () {
      color.colorBox.hsl();
    });

  /**********************************
		CLOSING MODAL DIALOGS
	**********************************/

  // On ESC
  $(document).keyup(function (e) {
    if (e.keyCode == 27) {
      $("#overlay").click();
    }
  });
  // On CLICK
  $("#overlay, .close").click(function () {
    $("#overlay").hide(0);
    $(".tooltip").fadeOut(150);
    $(".modal").slideUp(150);
  });

  /**********************************
		OPENING MODAL DIALOGS
	**********************************/

  // Donate
  $("#donateBTN").click(function () {
    if (os.type == "macApp") $("#donatetext").html(calculate_gradient_code());
    $("#donate").slideDown(150);
    $("#overlay").show(0);
  });

  // Settings
  $("#settingsBTN").click(function () {
    $("#settings").slideDown(150);
    $("#overlay").show(0);
  });

  /**********************************
			MODAL BUTTONS
	**********************************/

  $("#gradientDetails div, #copyBTN").click(function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected").html("remove<br>stop");
      if (stops.stopData.items.length <= 2) $("#delete").addClass("disabled");
      $("#alphaCFG, #positionCFG, #colorCFG").fadeOut(200);
      $("#alpha, #color, #position").delay(250).animate({ width: "show" }, 200);
    } else {
      //Get the id of this clicked item
      var type = $(this).attr("id");
      if (type == "alpha" || type == "position" || type == "color") {
        if ($(this).hasClass("disabled")) {
          //Do nothing
        } else {
          $(this).children().focus();
          $("#delete")
            .removeClass("disabled")
            .addClass("selected")
            .html("save<br>changes");
          if (type == "alpha") {
            $("#color, #position").animate({ width: "hide" }, 200);
            $("#alphaCFG").delay(250).fadeIn(200);
          } else if (type == "position") {
            $("#alpha, #color").animate({ width: "hide" }, 200);
            $("#positionCFG").delay(250).fadeIn(200);
          } else if (type == "color") {
            $("#alpha, #color, #position").animate({ width: "hide" }, 200);
            $("#colorCFG").delay(250).fadeIn(200);
          }
        }
      } else if (type == "delete") {
        if (!$(this).is(".disabled")) stops.remove();
      } else if (type == "copyBTN") {
        $("#code").html(calculate_gradient_code());
        os.send("copy", $("#code").html());
        $("#copy").slideDown(150).delay(1500).slideUp(150);
      } else if (type == "picker") {
        if (!$(this).is(".disabled")) {
          var x = color.convert(
            stops.stopData.items[stops.stopData.current][1],
            "hex",
          );
          $('input[type="color"]').val(x);
          os.send("color", x);
        }
      }
    }
  });
}

/**********************************
		GRADIENT MANAGER
**********************************/

storage = {
  view: "thumbnails",

  // Loading gradients from jStorage
  loadDefault: function () {
    var _default = [
      [
        "Butter",
        "gradient",
        [
          [
            [0, "rgb(252,233,79)", 100],
            [50, "rgb(237,212,0)", 100],
            [100, "rgb(196,160,0)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
      [
        "Orange",
        "gradient",
        [
          [
            [0, "rgb(252,175,62)", 100],
            [50, "rgb(245,121,0)", 100],
            [100, "rgb(206,92,0)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
      [
        "Chocolate",
        "gradient",
        [
          [
            [0, "rgb(233,185,110)", 100],
            [50, "rgb(193,125,17)", 100],
            [100, "rgb(143,89,2)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
      [
        "Chameleon",
        "gradient",
        [
          [
            [0, "rgb(138,226,52)", 100],
            [50, "rgb(115,210,22)", 100],
            [100, "rgb(78,154,6)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
      [
        "Sky Blue",
        "gradient",
        [
          [
            [0, "rgb(114,159,207)", 100],
            [50, "rgb(52,101,164)", 100],
            [100, "rgb(32,74,135)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
      [
        "Plum",
        "gradient",
        [
          [
            [0, "rgb(173,127,168)", 100],
            [50, "rgb(117,80,123)", 100],
            [100, "rgb(92,53,102)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
      [
        "Scarlet Red",
        "gradient",
        [
          [
            [0, "rgb(239,41,41)", 100],
            [50, "rgb(204,0,0)", 100],
            [100, "rgb(164,0,0)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
      [
        "Aluminium Light",
        "gradient",
        [
          [
            [0, "rgb(238,238,236)", 100],
            [50, "rgb(211,215,207)", 100],
            [100, "rgb(186,189,182)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
      [
        "Aluminium Dark",
        "gradient",
        [
          [
            [0, "rgb(136,138,133)", 100],
            [50, "rgb(85,87,83)", 100],
            [100, "rgb(46,52,54)", 100],
          ],
        ],
        [2012, 00, 31, 12, 00],
      ],
    ];
    _default_gradients = $.jStorage.get("savedGradients", _default);

    // Each gradient
    for (var z = 0; z < _default_gradients.length; z++) {
      var _stops = "",
        _date = "",
        _name = _default_gradients[z][0]
          .replace(/\\/g, "&#92;")
          .replace(/\|/g, "&#124")
          .replace(/\"/g, "&#34;")
          .replace(/\'/g, "&#39;"),
        _type = _default_gradients[z][1],
        _length = 0;

      // Each layer
      for (var y = 0; y < _default_gradients[z][2].length; y++) {
        // Each stop
        for (var i = 0; i < _default_gradients[z][2][y].length; i++) {
          if (i != _default_gradients[z][2][y].length - 1) {
            _stops +=
              _default_gradients[z][2][y][i][0] +
              "-" +
              _default_gradients[z][2][y][i][1] +
              "-" +
              _default_gradients[z][2][y][i][2] +
              ";";
          } else {
            _stops +=
              _default_gradients[z][2][y][i][0] +
              "-" +
              _default_gradients[z][2][y][i][1] +
              "-" +
              _default_gradients[z][2][y][i][2];
          }
          _length++;
        }
      }

      for (var i = 0; i < 5; i++) {
        if (i != 4) {
          _date += _default_gradients[z][3][i] + "-";
        } else {
          _date += _default_gradients[z][3][i];
        }
      }

      $("#storedGradientBox").append(
        '<div class="storedGradient ' +
          storage.view +
          '"><div class="storedGradientPreview" data-date="' +
          _date +
          '" data-stops="' +
          _stops +
          '" data-name="' +
          _name +
          '" data-type="' +
          _type +
          '"></div><h5>' +
          _name +
          '</h5><p class="length">' +
          _length +
          ' stops</p><p class="date">' +
          storage.parseDate(_date),
      );
    }
  },

  // Loading the gradients from the html and generating the gradient code to show them
  loadStored: function () {
    for (var z = 0; z < $(".storedGradientPreview").length; z++) {
      var _storedGradientArray = storage.gradientToArray(
        $(".storedGradientPreview")[z].getAttribute("data-stops"),
      );
      $(".storedGradientPreview")[z].style.background =
        storage.generateStoredCode(_storedGradientArray[0]);
    }
  },

  // Saving gradients to jStorage
  saveStored: function () {
    var _array = [];
    for (var z = 0; z < $(".storedGradientPreview").length; z++) {
      _array.push([]);
      _array[z].push(
        $(".storedGradientPreview")
          [z].getAttribute("data-name")
          .replace(/\\/g, "&#92;")
          .replace(/\|/g, "&#124")
          .replace(/\"/g, "&#34;")
          .replace(/\'/g, "&#39;"),
      );
      _array[z].push($(".storedGradientPreview")[z].getAttribute("data-type"));
      _array[z].push(
        storage.gradientToArray(
          $(".storedGradientPreview")[z].getAttribute("data-stops"),
        ),
      );
      _array[z].push(
        storage.dateToArray(
          $(".storedGradientPreview")[z].getAttribute("data-date"),
        ),
      );
    }
    $.jStorage.set("savedGradients", _array);
  },

  // Converting the stops to an html format for easy storage: 0-rgb(0,0,0)-100;100-rgb(255,255,255)-100
  arrayToGradient: function () {
    var _output = "";
    var _temp = stops.sort();
    for (var i = 0; i < _temp.length; i++) {
      if (i != _temp.length - 1) {
        _output += _temp[i][0] + "-" + _temp[i][1] + "-" + _temp[i][2] + ";";
      } else {
        _output += _temp[i][0] + "-" + _temp[i][1] + "-" + _temp[i][2];
      }
    }
    return _output;
  },

  // Converting the html format back to an array
  gradientToArray: function (_stops) {
    var _array = [];
    for (var y = 0; y < _stops.split("|").length; y++) {
      _array.push([]);
      for (var i = 0; i < _stops.split("|")[y].split(";").length; i++) {
        _array[y].push([]);
        _array[y][i].push(
          parseInt(_stops.split("|")[y].split(";")[i].split("-")[0]),
        );
        _array[y][i].push(_stops.split("|")[y].split(";")[i].split("-")[1]);
        _array[y][i].push(
          parseInt(_stops.split("|")[y].split(";")[i].split("-")[2]),
        );
      }
    }
    return _array;
  },

  dateToArray: function (_date) {
    var _array = [];
    for (var i = 0; i < _date.split("-").length; i++) {
      _array.push(parseInt(_date.split("-")[i]));
    }
    return _array;
  },

  parseDate: function (_input) {
    var _input = storage.dateToArray(_input),
      _months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      _minutes,
      _hours;

    // Minutes
    if (_input[4] == 0) _minutes = "00";
    else if (_input[4] > 9 && _input[4].length == 1) _minutes = _input[4] + "0";
    else _minutes = _input[4];

    // Hours
    if (_input[3] > 12) {
      _hours = _input[3] - 12;
      _hours += ":" + _minutes + " p.m.";
    } else {
      _hours = _input[3] + ":" + _minutes + " a.m.";
    }

    // Everything
    var _output = _hours + " " + _input[2] + " " + _months[_input[1]];
    return _output;
  },

  // Generating the gradient code for each stop based on an array
  generateStoredCode: function (_input) {
    var _output = "-webkit-gradient(linear, left top, right bottom, ";
    for (var x = 0; x < _input.length; x++) {
      if (x != _input.length - 1) {
        _line = "color-stop(" + _input[x][0] / 100 + "," + _input[x][1] + "), ";
      } else {
        _line =
          "color-stop(" +
          _input[x][0] / 100 +
          "," +
          _input[x][1] +
          ")), url('img/grid.png')";
      }
      _output += _line;
    }
    return _output;
  },

  uiInit: function () {
    // Manager
    $("#loadBTN").click(function () {
      storage.loadStored();
      $("#manage").slideDown(150);
      $("#overlay").show(0);
    });

    // Add new gradient
    $("#saveBTN").click(function () {
      function add_gradient() {
        $("#saveGradient").slideUp(150);
        $("#overlay").hide(0);
        var _date = new Date(),
          _date =
            _date.getFullYear() +
            "-" +
            _date.getMonth() +
            "-" +
            _date.getDate() +
            "-" +
            _date.getHours() +
            "-" +
            _date.getMinutes(),
          _name = $("#saveGradient input").val();

        $("#storedGradientBox").append(
          '<div class="storedGradient ' +
            storage.view +
            '"><div class="storedGradientPreview" data-date="' +
            _date +
            '" data-stops="' +
            storage.arrayToGradient() +
            '" data-name="' +
            _name +
            '" data-type="gradient"></div><h5>' +
            _name +
            '</h5><p class="length">' +
            stops.stopData.items.length +
            ' stops</p><p class="date">' +
            storage.parseDate(_date),
        );
        storage.loadStored();
        storage.saveStored();
        $("#saveGradient input").val("");
      }

      // Create the preview gradient
      $(".saveGradientPreview").css(
        "background",
        storage.generateStoredCode(stops.stopData.items),
      );
      $("#saveGradient").slideDown(150).children("input").focus();
      $("#overlay").show(0);
      // Listen for the user to press enter:
      $("#saveGradient input")
        .unbind()
        .keydown(function (e) {
          if (e.keyCode == 13) {
            add_gradient();
          }
        });
      // Or if the user presses the go button
      $("#saveGradient .save")
        .unbind()
        .click(function () {
          add_gradient();
        });
    });

    $("#manageRemoveBTN").click(function () {
      if (!$(".storedGradient.selected").is(".storedGradient:last-of-type")) {
        $(".storedGradient.selected")
          .next()
          .addClass("selected")
          .prev()
          .remove();
      } else if ($(".storedGradient").length != 1) {
        $(".storedGradient.selected")
          .prev()
          .addClass("selected")
          .next()
          .remove();
      } else {
        $(".storedGradient.selected").remove();
      }
      storage.saveStored();
    });

    $("#storedGradientBox").delegate(".storedGradient", "click", function () {
      if (!$(this).is(".selected")) {
        $(".storedGradient.selected").removeClass("selected");
        $(this).addClass("selected");
      }
    });

    function loadGradient() {
      if ($(".storedGradient.selected").length) {
        $("#manage").slideUp(150);
        $("#overlay").hide(0);
        stops.stopData.current = 0;
        stops.stopData.items = storage.gradientToArray(
          $(".storedGradient.selected .storedGradientPreview").attr(
            "data-stops",
          ),
        )[0];
        $(".stop").remove();
        stops.load();
        preview_gradient();
        update_details();
      }
    }

    $("#storedGradientBox").delegate(
      ".storedGradient.selected",
      "click",
      function () {
        loadGradient();
      },
    );
    $("#manageLoadBTN").click(function () {
      loadGradient();
    });

    // Switch view
    $("#storedGradientView").click(function () {
      switch (storage.view) {
        case "thumbnails":
          $("#storedGradientView, .storedGradient")
            .removeClass("thumbnails")
            .addClass("details");
          storage.view = "details";
          break;
        case "details":
          $("#storedGradientView, .storedGradient")
            .removeClass("details")
            .addClass("thumbnails");
          storage.view = "thumbnails";
          break;
      }
    });
  },
};
