(function() {
  'use strict';
  var e, module;

  module = null;

  try {
    module = angular.module('ndx');
  } catch (error) {
    e = error;
    module = angular.module('ndx', []);
  }

  module.directive('suggestions', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        suggestions: '=',
        select: '='
      },
      link: function(scope, elem, attrs, ctrl) {
        var deref, doSelect, field, holder, inputBorderLeft, inputBorderTop, inputFontFamily, inputFontSize, inputFontWeight, inputHeight, inputPaddingLeft, inputPaddingTop, lastVal, mysuggestions, options, render, sizer, suggestions, suggestor, suggestorMarginTop;
        elem[0].setAttribute('autocomplete', 'nope');
        holder = elem.wrap('<div class="suggestions-holder"></div>');
        sizer = $('<div class="sizer"></div>');
        sizer.insertBefore(elem);
        suggestor = $('<div class="suggestor"></div>');
        suggestor.insertBefore(elem);
        suggestions = $('<div class="suggestions hidden"></div>');
        suggestions.insertBefore(elem);
        options = $('<ul class="options"></ul>');
        suggestions.append(options);
        lastVal = elem.val();
        mysuggestions = [];
        field = attrs.field || 'name';
        inputHeight = elem.height();
        inputBorderTop = parseInt(elem.css('border-top-width'));
        inputBorderLeft = parseInt(elem.css('border-left-width'));
        inputPaddingTop = parseInt(elem.css('padding-top'));
        inputPaddingLeft = parseInt(elem.css('padding-left'));
        inputFontFamily = elem.css('font-family');
        inputFontSize = elem.css('font-size');
        inputFontWeight = elem.css('font-weight');
        suggestorMarginTop = parseInt(suggestor.css('margin-top'));
        suggestor.css({
          height: (inputHeight - (2 * suggestorMarginTop)) + 'px',
          lineHeight: (inputHeight - (2 * suggestorMarginTop)) + 'px',
          marginLeft: (inputPaddingLeft + inputBorderLeft) + 'px',
          marginTop: (suggestorMarginTop + inputBorderTop) + 'px',
          fontFamily: inputFontFamily,
          fontSize: inputFontSize,
          fontWeight: inputFontWeight
        });
        sizer.css({
          fontFamily: inputFontFamily,
          fontSize: inputFontSize,
          fontWeight: inputFontWeight
        });
        render = function() {
          var i, j, len, li, r, thing;
          i = 0;
          options.html('');
          if (elem.val()) {
            for (j = 0, len = mysuggestions.length; j < len; j++) {
              thing = mysuggestions[j];
              r = RegExp('.*' + elem.val() + '.*', 'i');
              if (r.test(thing)) {
                r = RegExp('^' + elem.val(), 'i');
                li = $('<li>' + thing + '</li>');
                options.append(li);
                if (i++ === 0) {
                  if (r.test(thing)) {
                    suggestor.text(thing.substr(elem.val().length));
                    li.addClass('selected');
                  } else {
                    suggestor.text('');
                  }
                }
              }
            }
            if (i === 0) {
              suggestor.text('');
              suggestions.addClass('hidden');
            } else {
              suggestions.removeClass('hidden');
            }
            suggestions.removeClass('scrollY');
            if (options.height() > suggestions.height()) {
              return suggestions.addClass('scrollY');
            }
          }
        };
        doSelect = function(text) {
          var item, j, len, ref, suggestion;
          if (scope.select) {
            console.log('select');
            item = null;
            ref = scope.suggestions;
            for (j = 0, len = ref.length; j < len; j++) {
              suggestion = ref[j];
              if (suggestion[field] === text) {
                item = suggestion;
                break;
              }
            }
            scope.select(item);
          } else {
            elem.val(text);
            ctrl.$setViewValue(text);
          }
          options.html('');
          suggestor.text('');
          return suggestions.addClass('hidden');
        };
        deref = scope.$watch('suggestions', function(n, o) {
          var item, j, len;
          if (n) {
            mysuggestions = [];
            for (j = 0, len = n.length; j < len; j++) {
              item = n[j];
              if (mysuggestions.indexOf(item[field]) === -1) {
                mysuggestions.push(item[field]);
              }
            }
            mysuggestions.sort();
            if (n !== o) {
              return render();
            }
          } else {
            return mysuggestions = [];
          }
        });
        scope.$on('$destroy', function() {
          return deref();
        });
        suggestions.bind('mousedown', function(e) {
          $('li.selected', suggestions).removeClass('selected');
          return doSelect($(e.target).text());
        });
        elem.bind('blur', function() {
          var selectedText;
          if (selectedText = $('li.selected', suggestions).text()) {
            doSelect(selectedText);
          }
          options.html('');
          suggestor.text('');
          return suggestions.addClass('hidden');
        });
        elem.bind('keydown', function(e) {
          var li, next, prev, selected;
          switch (e.keyCode) {
            case 38:
              //key up
              selected = $('li.selected', suggestions);
              if (selected.length) {
                if (selected[0].previousSibling) {
                  prev = $(selected[0].previousSibling);
                  $('li.selected', suggestions).removeClass('selected');
                  prev.addClass('selected');
                  elem.val(prev.text());
                  suggestor.text('');
                  if (prev.offset().top < suggestions.offset().top) {
                    return prev[0].scrollIntoView();
                  }
                }
              }
              break;
            case 40:
              //key down
              selected = $('li.selected', suggestions);
              if (selected.length) {
                if (selected[0].nextSibling) {
                  next = $(selected[0].nextSibling);
                  $('li.selected', suggestions).removeClass('selected');
                  next.addClass('selected');
                  elem.val(next.text());
                  suggestor.text('');
                  if (next.offset().top > suggestions.offset().top + suggestions.height()) {
                    return next[0].scrollIntoView();
                  }
                }
              } else {
                li = $('li', suggestions)[0];
                if (li) {
                  $(li).addClass('selected');
                  elem.val($(li).text());
                  return suggestor.text('');
                }
              }
              break;
            case 8:
              if (suggestor.text()) {
                suggestor.text('');
                e.preventDefault();
                e.stopPropagation();
                return e.cancelBubble = true;
              }
          }
        });
        return elem.bind('keyup', function(e) {
          var valChanged;
          if (elem.val() !== lastVal) {
            lastVal = elem.val();
            valChanged = true;
          }
          sizer.html(elem.val().replace(/\s/g, '&nbsp;'));
          suggestor.css({
            left: sizer.width()
          });
          switch (e.keyCode) {
            case 38:
            case 40:
              true;
              break;
            default:
              if (valChanged && !attrs.server) {
                console.log('rendering');
                render();
              }
          }
          if (e.keyCode === 8) {
            suggestor.text('');
            return $('li.selected', suggestions).removeClass('selected');
          } else if (e.keyCode === 46) {
            suggestor.text('');
            return $('li.selected', suggestions).removeClass('selected');
          }
        });
      }
    };
  });

}).call(this);

//# sourceMappingURL=index.js.map
