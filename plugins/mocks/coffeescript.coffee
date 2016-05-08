React = require 'react'
_ = require('underscore')

foo = ->
    alert()
    
class Foo
    initialize: ->
        alert(1)

class Bar extends Foo
    initialize2: ->
