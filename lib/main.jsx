var ComponentRegistry = require('nylas-exports').ComponentRegistry,
    UnsubscribeButton = require('./unsubscribe-button');

module.exports = {
    displayName: 'tester',
    activate: function(state) {
        this.state = state != null ? state : {};
        return ComponentRegistry.register(UnsubscribeButton, {
            role: 'message:Toolbar'
        });
    },
    deactivate: function() {
        return ComponentRegistry.unregister(MyComposerButton);
    },
    serialize: function() {
        return this.state;
    }
};