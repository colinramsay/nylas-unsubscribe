classNames = require 'classnames'
{Utils, React} = require 'nylas-exports'
Unsubscriber = require('./unsubscriber')
UnsubscriberStore = require('./unsubscriber-store')


class UnsubscribeButton extends React.Component

  @displayName: 'UnsubscribeButton'

  constructor: (@props) ->
    @state = @_getStateFromStores()

  render: ->
    return null if @unsubscribeLink

    cs = classNames
      "btn": true
      "btn-toolbar": true
      "disabled": @_isDisabled()

    <button title={@_getTitle()} className={cs} onClick={ => @_onClick()} ref="button">
      {@_getButtonText()}
    </button>

  componentDidMount: ->
    @_unlisten = UnsubscriberStore.listen(@_onStoreChanged)

  componentWillUnmount: ->
    @_unlisten?()

  _onStoreChanged: =>
    @setState(@_getStateFromStores())

  _getStateFromStores: ->
    return {
      listUnsubscribeByHttp: UnsubscriberStore.listUnsubscribeByHttp(),
      listUnsubscribeByMail: UnsubscriberStore.listUnsubscribeByMail(),
      unsubscribeLink: UnsubscriberStore.unsubscribeLink(),
    }

  _getTitle: ->
    'Unsubscribe'

  _isDisabled: ->
    !@state.unsubscribeLink || !(@state.listUnsubscribeByMail || @listUnsubscribeByHttp)

  _getButtonText: ->
    'Unsubscribe'

  _archiveEmail: ->
    # todo

  _canAutoUnsubscribe: ->
    @state.listUnsubscribeByHttp || @state.listUnsubscribeByMail

  _onClick: =>
    return if @_isDisabled()

    console.log 'Attempting unsubscribe with', @state.listUnsubscribeByHttp, @state.listUnsubscribeByMail

    if @_canAutoUnsubscribe()
      console.log 'Unsubscribing automatically...'
      success = @Unsubscriber.unsubscribe(@state.listUnsubscribeByHttp, @state.listUnsubscribeByMail)
    else
      console.log 'Unsubscribing via browser fallback...'
      success = @_openBrowserFallback()

    if success
      @_archiveEmail
    else
      # display message

  _openBrowserFallback: ->
    BrowserWindow = require('remote').require('browser-window')
    w = new BrowserWindow
      'node-integration': false,
      'web-preferences': {'web-security':false},
      'width': 700,
      'height': 600

    w.loadUrl @state.unsubscribeLink.href


module.exports = UnsubscribeButton
