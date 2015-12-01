var NylasStore = require('nylas-store');
var {MessageStore, NylasAPI, AccountStore} = require('nylas-exports');
var MailParser = require('mailparser').MailParser;

var _ = require('underscore');

class UnsubscriberStore extends NylasStore {
  constructor() {
    super()
    this._getUnsubscribeLink = this._getUnsubscribeLink.bind(this);
    this._parseHTML = this._parseHTML.bind(this);
    this._setListUnsubscribeData = this._setListUnsubscribeData.bind(this);
    this.listenTo(MessageStore, this._onMessageStoreChanged);
  }

  listUnsubscribeByHttp() { return this._listUnsubscribeByHttp; }
  listUnsubscribeByMail() { return this._listUnsubscribeByMail; }
  unsubscribeLink() { return this._unsubscribeLink; }

  _onMessageStoreChanged() {
    if (!MessageStore.threadId()) { return; }
    var itemIds = _.pluck(MessageStore.items(), "id");

    if (itemIds.length === 0 || _.isEqual(itemIds, this._lastItemIds)) { return; }
    this._lastItemIds = itemIds;

    var msg = MessageStore.items()[0];

    this._getUnsubscribeLink();

    var path = ('/messages/' + msg.id).trim();

    console.log('Fetching raw message', path);

    return NylasAPI.makeRequest({
      headers:
        {Accept: 'message/rfc822'},
      path: path,
      accountId: msg.accountId,
      json:false,
      success: (body) => {
        var mailparser = new MailParser();
        mailparser.on('end', (mailObject) => {
          return this._setListUnsubscribeData(mailObject.headers);
        });

        mailparser.write(body);
        return mailparser.end();
      },
      error: (error) => {
        return console.log('error');
      }
    });
  }

  _getUnsubscribeLink() {
    var message = MessageStore.items()[0];
    var doc = this._parseHTML(message.body);
    var links = doc.getElementsByTagName('a');

    var matches = ((() => {
      var result = [];
      for (var i = 0, item; i < links.length; i++) {
        item = links[i];
        if (item.innerText.toLowerCase().indexOf('unsubscribe') > -1) {
          result.push(item);
        }
      }
      return result;
    })());
    console.log('Unsubscribe HTML link: ', matches[matches.length - 1]);
    this._unsubscribeLink = matches[matches.length - 1];
    return this.trigger();
  }


  _parseHTML(text) {
    var domParser = new DOMParser();
    try {
      var doc = domParser.parseFromString(text, "text/html");
    } catch (error) {
      text = `HTML Parser Error: ${error.toString()}`;
      doc = domParser.parseFromString(text, "text/html");
      atom.emitError(error);
    }
    return doc;
  }

  _setListUnsubscribeData(headers) {
    console.log('Raw list-unsubscribe: ', headers['list-unsubscribe']);
    var matches = /\<(.*?)\>/g.exec(headers['list-unsubscribe']);
    var webMatch = null;
    var mailMatch = null;

    // Euch.
    if(matches && matches[0].indexOf('mailto:') > -1) {
        mailMatch = matches[0];
    }

    if(matches && matches[1].indexOf('mailto:') > -1) {
        mailMatch = matches[1];
    }

    if(matches && matches[0].indexOf('http://') > -1) {
        webMatch = matches[0];
    }

    if(matches && matches[1].indexOf('http://') > -1) {
        webMatch = matches[1];
    }

    console.log('mail/web matches: ', mailMatch, webMatch);

    if (webMatch) { this._listUnsubscribeByHttp = webMatch.replace('http://', ''); }
    if (mailMatch) { this._listUnsubscribeByMail = mailMatch.replace('mailto:', ''); }
    return this.trigger();
  }
}

module.exports = new UnsubscriberStore();