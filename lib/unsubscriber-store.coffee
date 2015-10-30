NylasStore = require 'nylas-store'
{MessageStore, NylasAPI, AccountStore} = require 'nylas-exports'
MailParser = require('mailparser').MailParser

_ = require('underscore')

class UnsubscriberStore extends NylasStore
  constructor: ->
    @listenTo MessageStore, @_onMessageStoreChanged

  listUnsubscribeByHttp: -> @_listUnsubscribeByHttp
  listUnsubscribeByMail: -> @_listUnsubscribeByMail
  unsubscribeLink: -> @_unsubscribeLink

  _onMessageStoreChanged: ->
    return unless MessageStore.threadId()
    itemIds = _.pluck(MessageStore.items(), "id")

    return if itemIds.length is 0 or _.isEqual(itemIds, @_lastItemIds)
    @_lastItemIds = itemIds

    msg = MessageStore.items()[0]

    @_getUnsubscribeLink()

    path = ('/messages/' + msg.id).trim()

    console.log('Fetching raw message', path)

    NylasAPI.makeRequest
      headers:
        Accept: 'message/rfc822'
      path: path
      accountId: msg.accountId
      json:false
      success: (body) =>
        mailparser = new MailParser
        mailparser.on 'end', (mailObject) =>
          @_setListUnsubscribeData(mailObject.headers)

        mailparser.write(body)
        mailparser.end()
      error: (error) =>
        console.log 'error'

  _getUnsubscribeLink: =>
    message = MessageStore.items()[0]
    doc = @_parseHTML message.body
    links = doc.getElementsByTagName 'a'

    matches = (item for item in links when item.innerText.toLowerCase().indexOf('unsubscribe') > -1)
    console.log 'Unsubscribe HTML link: ', matches[matches.length - 1]
    @_unsubscribeLink = matches[matches.length - 1]
    @trigger()


  _parseHTML: (text) =>
    domParser = new DOMParser()
    try
      doc = domParser.parseFromString(text, "text/html")
    catch error
      text = "HTML Parser Error: #{error.toString()}"
      doc = domParser.parseFromString(text, "text/html")
      atom.emitError(error)
    return doc

  _setListUnsubscribeData: (headers) =>
    console.log 'Raw list-unsubscribe: ', headers['list-unsubscribe']
    matches = /\<(.*?)\>/g.exec(headers['list-unsubscribe'])
    webMatch = null
    mailMatch = null

    # Euch.
    mailMatch = matches[0] if matches?[0].indexOf?('mailto:') > -1
    mailMatch = matches[1] if matches?[1].indexOf?('mailto:') > -1

    webMatch = matches[0] if matches?[0].indexOf?('http://') > -1
    webMatch = matches[1] if matches?[1].indexOf?('http://') > -1

    console.log 'mail/web matches: ', mailMatch, webMatch

    @_listUnsubscribeByHttp = webMatch.replace('http://', '') if webMatch
    @_listUnsubscribeByMail = mailMatch.replace('mailto:', '') if mailMatch
    @trigger()

module.exports = new UnsubscriberStore()