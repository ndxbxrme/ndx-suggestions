'use strict'
module = null
try
  module = angular.module 'ndx'
catch e
  module = angular.module 'ndx', []
module.directive 'suggestions', ->
  restrict: 'A'
  scope:
    suggestions: '='
  link: (scope, elem, attrs, ctrl) ->
    holder = elem.wrap '<div class="suggestions-holder"></div>'
    sizer = $('<div class="sizer"></div>')
    sizer.insertBefore elem
    suggestor = $('<div class="suggestor"></div>')
    suggestor.insertBefore elem
    suggestions = $('<div class="suggestions hidden"></div>')
    suggestions.insertBefore elem
    options = $('<ul class="options"></ul>')
    suggestions.append options
    lastVal = elem.val()
    mysuggestions = []
    field = attrs.field or 'name'
    inputHeight = elem.height()
    inputBorderTop = parseInt elem.css('border-top-width')
    inputBorderLeft = parseInt elem.css('border-left-width')
    inputPaddingTop = parseInt elem.css('padding-top')
    inputPaddingLeft = parseInt elem.css('padding-left')
    inputFontFamily = elem.css('font-family')
    inputFontSize = elem.css('font-size')
    inputFontWeight = elem.css('font-weight')
    suggestorMarginTop = parseInt suggestor.css('margin-top')
    suggestor.css
      height: (inputHeight - (2 * suggestorMarginTop)) + 'px'
      lineHeight: (inputHeight - (2 * suggestorMarginTop)) + 'px'
      marginLeft: (inputPaddingLeft + inputBorderLeft) + 'px'
      marginTop: (suggestorMarginTop + inputBorderTop) + 'px'
      fontFamily: inputFontFamily
      fontSize: inputFontSize
      fontWeight: inputFontWeight
    sizer.css
      fontFamily: inputFontFamily
      fontSize: inputFontSize
      fontWeight: inputFontWeight
    deref = scope.$watch 'suggestions', (n, o) ->
      if n
        mysuggestions = []
        for item in n
          if mysuggestions.indexOf(item[field]) is -1
            mysuggestions.push item[field]
        mysuggestions.sort()
      else
        mysuggestions = []
    scope.$on '$destroy', ->
      deref()
    suggestions.bind 'mousedown', (e) ->
      $('li.selected', suggestions).removeClass 'selected'
      elem.val $(e.target).text()
    elem.bind 'blur', ->
      if selectedText = $('li.selected', suggestions).text()
        elem.val selectedText
      options.html ''
      suggestor.text ''
      suggestions.addClass 'hidden'
    elem.bind 'keydown', (e) ->
      switch e.keyCode
        when 38
          #key up
          selected = $('li.selected', suggestions)
          if selected.length
            if selected[0].previousSibling
              prev = $(selected[0].previousSibling)
              $('li.selected', suggestions).removeClass 'selected'
              prev.addClass 'selected'
              elem.val prev.text()
              suggestor.text ''
              if prev.offset().top < suggestions.offset().top
                prev[0].scrollIntoView()
        when 40
          #key down
          selected = $('li.selected', suggestions)
          if selected.length
            if selected[0].nextSibling
              next = $(selected[0].nextSibling)
              $('li.selected', suggestions).removeClass 'selected'
              next.addClass 'selected'
              elem.val next.text()
              suggestor.text ''
              if next.offset().top > suggestions.offset().top + suggestions.height()
                next[0].scrollIntoView()
          else
            li = $('li', suggestions)[0]
            if li
              $(li).addClass 'selected'
              elem.val $(li).text()
              suggestor.text ''
        when 8
          if suggestor.text()
            suggestor.text ''
            e.preventDefault()
            e.stopPropagation()
            e.cancelBubble = true
    elem.bind 'keyup', (e) ->
      if elem.val() isnt lastVal
        lastVal = elem.val()
        valChanged = true
      sizer.html elem.val().replace(/\s/g, '&nbsp;')
      suggestor.css
        left: sizer.width()
      switch e.keyCode
        when 38, 40
          true
        else
          i = 0
          if valChanged
            options.html('')
            if elem.val()
              for thing in mysuggestions
                r = RegExp '.*' + elem.val() + '.*', 'i'
                if r.test thing
                  r = RegExp '^' + elem.val(), 'i'
                  li = $ '<li>' + thing + '</li>'
                  options.append li
                  if i++ is 0
                    if r.test thing
                      suggestor.text thing.substr elem.val().length
                      li.addClass 'selected'
                    else
                      suggestor.text ''
            if i is 0
              suggestor.text ''
              suggestions.addClass 'hidden'
            else
              suggestions.removeClass 'hidden'
            suggestions.removeClass 'scrollY'
            if options.height() > suggestions.height()
              suggestions.addClass 'scrollY'
      if e.keyCode is 8
        suggestor.text ''
        $('li.selected', suggestions).removeClass 'selected'
      else if e.keyCode is 46
        suggestor.text ''
        $('li.selected', suggestions).removeClass 'selected'
