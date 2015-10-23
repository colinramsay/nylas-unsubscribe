{ComponentRegistry} = require 'nylas-exports'

UnsubscribeButton = require './unsubscribe-button'

module.exports =
  activate: (@state) ->
    ComponentRegistry.register UnsubscribeButton,
      role: 'MessageIndicator'

  deactivate: ->
    ComponentRegistry.unregister(MyComposerButton)