{ComponentRegistry} = require 'nylas-exports'

UnsubscribeButton = require './unsubscribe-button'

module.exports =
  activate: (@state={}) ->
    ComponentRegistry.register UnsubscribeButton,
      role: 'message:Toolbar'

  deactivate: ->
    ComponentRegistry.unregister(MyComposerButton)

  serialize: -> @state