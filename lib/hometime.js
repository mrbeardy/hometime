/** @babel */

import HometimeView from './hometime-view';

export default {
  config: {
    worktime: {
      type: 'string',
      description: "How long do you work? (eg: 8:30 for 8 hours, 30 minutes)",
      default: '8:30',
      order: 0,
    },
    homeTimeText: {
      type: 'string',
      description: 'Text to display when it\'s past home-time.',
      default: 'Hometime!',
      order: 10,
    },
    workTimeAsCountdown: {
      type: 'boolean',
      description: 'Display a countdown in the status-bar when within work-time. (Note: Overrides Work Time Text).',
      default: true,
      order: 20,
    },
    workTimeText: {
      type: 'string',
      description: 'Text to display when it\'s before home-time. (Note: this will only be used it Work Time As Countdown is disabled)',
      default: 'Time to work',
      order: 30,
    },
  },

  activate() {},

  deactivate() {
    if (this.hometimeView)
      this.hometimeView.destroy();
  },

  consumeStatusBar(statusBar) {
    this.hometimeView = new HometimeView(statusBar);
    this.hometimeView.start();
  }

};
