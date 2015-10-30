{NylasAPI, AccountStore} = require 'nylas-exports'
MailParser = require('mailparser').MailParser

class Unsubscriber

  canAutoUnsubscribe: =>
    @listUnsubscribeByMail || @listUnsubscribeByHttp

  unsubscribe: (http, mail) =>
    if mail
      @unsubscribeByMail(mail)
    else if http
      @unsubscribeByHttp(http)

  unsubscribeByHttp: (http) =>
    # todo

  unsubscribeByMail: (mail) =>
    NylasAPI.makeRequest({
      path: '/send'
      method: 'POST'
      accountId: AccountStore.current().id
      body: {
        body: ''
        subject: 'Unsubscribe'
        to: [{
          name: 'Unsubscribe'
          email: mail
        }]
      }
    })
    .then (json) =>
      console.log 'success'
      console.log arguments
    .catch (err) =>
      console.log 'error'
      console.log arguments


module.exports = new Unsubscriber()