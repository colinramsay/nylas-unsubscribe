{Utils, React, MessageStore} = require 'nylas-exports'
{RetinaImg} = require 'nylas-component-kit'

class MyComposerButton extends React.Component

  @displayName: 'UnsubscribeButton'

  componentWillMount: =>
    @match = @_getMatch()

  render: =>
    if @match
      <div className="unsubscribe">
        <button className="btn btn-toolbar" onClick={ => @_onClick()} ref="button">
          Unsubscribe!
        </button>
      </div>
    else
      null

  _getMatch: =>
    message = MessageStore.items()[0]
    doc = @_parseHTML message.body
    links = doc.getElementsByTagName 'a'

    matches = (item for item in links when item.innerText.toLowerCase().indexOf('unsubscribe') > -1)
    matches[matches.length - 1]

  _onClick: =>
    BrowserWindow = require('remote').require('browser-window')
    w = new BrowserWindow
      'node-integration': false,
      'web-preferences': {'web-security':false},
      'width': 700,
      'height': 600

    w.loadUrl @match.href

  _parseHTML: (text) ->
    domParser = new DOMParser()
    try
      doc = domParser.parseFromString(text, "text/html")
    catch error
      text = "HTML Parser Error: #{error.toString()}"
      doc = domParser.parseFromString(text, "text/html")
      atom.emitError(error)
    return doc


module.exports = MyComposerButton
