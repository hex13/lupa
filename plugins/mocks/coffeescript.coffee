React = require 'react'
_ = require('underscore')

class Foo
    initialize: ->
        alert(1)

class Bar extends Foo
    initialize: ->
