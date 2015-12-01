var classNames = require('classnames');
var {Utils, React} = require('nylas-exports');
var Unsubscriber = require('./unsubscriber');
var UnsubscriberStore = require('./unsubscriber-store');


class UnsubscribeButton extends React.Component {

  constructor(props) {
    super();
    this.props = props;
    this._onStoreChanged = this._onStoreChanged.bind(this);
    this._onClick = this._onClick.bind(this);
    this.state = this._getStateFromStores();
  }

  render() {
    if (this.unsubscribeLink) { return null; }

    const cs = classNames({
      "btn": true,
      "btn-toolbar": true,
      "disabled": this._isDisabled()
    });

    return <button title={this._getTitle()} className={cs} onClick={this._onClick} ref="button">
      {this._getButtonText()}
    </button>
  }



  componentDidMount() {
    return this._unlisten = UnsubscriberStore.listen(this._onStoreChanged);
  }

  componentWillUnmount() {
    var fn;
    if (typeof (fn = this._unlisten) === "function") { return fn(); }
  }

  _onStoreChanged() {
    return this.setState(this._getStateFromStores());
  }

  _getStateFromStores() {
    return {
      listUnsubscribeByHttp: UnsubscriberStore.listUnsubscribeByHttp(),
      listUnsubscribeByMail: UnsubscriberStore.listUnsubscribeByMail(),
      unsubscribeLink: UnsubscriberStore.unsubscribeLink(),
    };
  }

  _getTitle() {
    return 'Unsubscribe';
  }

  _isDisabled() {
    return !this.state.unsubscribeLink || !(this.state.listUnsubscribeByMail || this.listUnsubscribeByHttp);
  }

  _getButtonText() {
    return 'Unsubscribe';
  }

  _archiveEmail() {
    return alert('Unsubscribe attempt complete.');
  }

  _canAutoUnsubscribe() {
    return this.state.listUnsubscribeByHttp || this.state.listUnsubscribeByMail;
  }

  _onClick() {
    if (this._isDisabled()) { return; }

    console.log('Attempting unsubscribe with', this.state.listUnsubscribeByHttp, this.state.listUnsubscribeByMail);

    if (this._canAutoUnsubscribe()) {
      console.log('Unsubscribing automatically...');
      var success = Unsubscriber.unsubscribe(this.state.listUnsubscribeByHttp, this.state.listUnsubscribeByMail);
    } else {
      console.log('Unsubscribing via browser fallback...');
      success = this._openBrowserFallback();
    }

    if (true) {
      return this._archiveEmail;
    }
  }

  _openBrowserFallback() {
    var BrowserWindow = require('remote').require('browser-window');
    var w = new BrowserWindow({
      'node-integration': false,
      'web-preferences': {'web-security':false},
      'width': 700,
      'height': 600
    });

    return w.loadUrl(this.state.unsubscribeLink.href);
  }
}

UnsubscribeButton.prototype.displayName = 'UnsubscribeButton';
UnsubscribeButton.displayName = 'UnsubscribeButton';

module.exports = UnsubscribeButton;
