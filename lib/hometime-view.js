/** @babel */

import { CompositeDisposable } from 'atom';

import moment from 'moment';
import childProcess from 'child_process';

export default class HometimeView {
  constructor(statusBar) {
    this.statusBar = statusBar;
    this.subscriptions = new CompositeDisposable();
  }

  get hometimeFormatted() {
    return this.hometimeMoment.format('hh:mm:ss a');
  }

  get isHometime() {
    return moment().isAfter(this.hometimeMoment);
  }

  get timeLeft() {
    return moment().to(this.hometimeMoment);
  }

  get timeLeftRaw() {
    // Returns the relative time without a prefix/suffix
    // return moment().to(this.hometimeMoment, true);
    return Math.abs(moment().diff(this.hometimeMoment, 'minutes')) + ' Minutes';
  }

  get worktimeCount() {
    return moment().to(this.uptime, true);
  }

  setConfigVariables() {
    this.worktime = atom.config.get('hometime.worktime');
    this.homeTimeText = atom.config.get('hometime.homeTimeText');
    this.workTimeText = atom.config.get('hometime.workTimeText');
    this.workTimeAsCountdown = atom.config.get('hometime.workTimeAsCountdown');
  }

  start() {
    this.initialize();
  }

  initialize() {
    this.setConfigVariables();

    this.subscriptions.add(atom.config.onDidChange('hometime.worktime', () => {
      this.setHomeTime();
      this.refreshTicker();
    }));

    this.subscriptions.add(atom.config.onDidChange('hometime.homeTimeText', () => {
      this.refreshTicker()
    }));

    this.subscriptions.add(atom.config.onDidChange('hometime.workTimeText', () => {
      this.refreshTicker()
    }));

    // TODO: Stress-test this
    // TODO: Check support for Mac and Windows
    childProcess.exec('uptime -s', (error, stdout, stderr) => {
      // TODO: Store this value in a config/storage, then compare it each time
      //       to see if it's different. If it's different, only use the new
      //       value if the day is different. This is so we can reboot our
      //       system without losing the earliest boot time.
      this.uptime = moment(stdout, 'YYYY-MM-DD HH:mm:ss');
      this.setHomeTime();

      this.setupElement();
      this.startTicker();
    });
  }

  setupElement() {
    this.element = document.createElement('div');
    this.element.classList.add('hometime', 'inline-block');

    this.drawElement();

    this.statusBar.addRightTile({
      item: this.element,
      priority: -500
    })
  }

  drawElement() {
    if (this.isHometime) {
      this.setIsHometime();
    } else {
      this.setIsNotHometime();
    }
  }

  setHomeTime() {
    // TODO: Stress-test this, and see if there's a way to break it by changing configs. Never trust the user.
    const [ hours, minutes ] = this.worktime.split(':');

    this.hometimeMoment = this.uptime.clone().add(hours, 'hours').add(minutes, 'minutes');
    // this.hometimeMoment = moment('10 PM', 'HH AA')
  }

  setIsHometime() {
    this.element.innerHTML = this.homeTimeText;
    this.element.setAttribute("title", `It was hometime ${this.timeLeft}! (${this.hometimeFormatted})`);
    this.element.setAttribute("data-is-hometime", "yes");
  }

  setIsNotHometime() {
    let workTimeText = (this.workTimeAsCountdown) ? this.timeLeftRaw : this.workTimeText;

    this.element.innerHTML = workTimeText;
    this.element.setAttribute(
      "title",
      `It's hometime ${this.timeLeft} (${this.hometimeFormatted})\nYou've been "working" for ${this.worktimeCount}`
    );
    this.element.setAttribute("data-is-hometime", "no");
  }

  startTicker() {
    this.drawElement()
    var nextTick = 1000 - (Date.now() % 1000)
    this.tick = setTimeout (() =>  { this.startTicker() }, nextTick)
  }

  clearTicker() {
    if (this.tick) clearTimeout(this.tick);
  }

  refreshTicker() {
    this.setConfigVariables();
    this.clearTicker();
    this.startTicker();
  }

  destroy() {
    this.subscriptions.dispose();
    this.element.remove();
  }
}
