var {NylasAPI, AccountStore} = require('nylas-exports');
var MailParser = require('mailparser').MailParser;

class Unsubscriber {

  constructor() {
    this.canAutoUnsubscribe = this.canAutoUnsubscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.unsubscribeByHttp = this.unsubscribeByHttp.bind(this);
    this.unsubscribeByMail = this.unsubscribeByMail.bind(this);
  }

  canAutoUnsubscribe() {
    return this.listUnsubscribeByMail || this.listUnsubscribeByHttp;
  }

  unsubscribe(http, mail) {
    if (mail) {
      return this.unsubscribeByMail(mail);
    } else if (http) {
      return this.unsubscribeByHttp(http);
    }
  }

  unsubscribeByHttp(http) {}
    // todo

  unsubscribeByMail(mail) {
    console.debug('Attempting to unsubscribe by mail ', mail);
    return NylasAPI.makeRequest({
      path: '/send',
      method: 'POST',
      accountId: AccountStore.current().id,
      body: {
        body: '',
        subject: 'Unsubscribe',
        to: [{
          name: 'Unsubscribe',
          email: mail
        }]
      }
    });
  }
}


module.exports = new Unsubscriber();