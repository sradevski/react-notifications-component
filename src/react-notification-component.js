import React from 'react';
import ReactNotification from './react-notification';
import PropTypes from 'prop-types';
import store from './store';
import {
  getNotificationsForEachContainer,
  getNotificationsForMobileView
} from './utils/helpers';

import 'src/scss/notification.scss';

export default class ReactNotificationComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isMobile: props.isMobile,
      breakpoint: props.breakpoint,
      notifications: []
    };

    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.toggleRemoval = this.toggleRemoval.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  static propTypes = {
    isMobile: PropTypes.bool,
    breakpoint: PropTypes.number,
    types: PropTypes.array
  }

  static defaultProps = {
    isMobile: true,
    breakpoint: 768
  }

  componentDidMount() {
    const { types } = this.props;

    store.register({
      addNotification: this.add,
      removeNotification: this.remove,
      types
    });

    this.setState({ width: window.innerWidth });
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.setState({ width: window.innerWidth });
  }

  add(notification) {
    this.setState(({ notifications }) => ({
      notifications:
        notification.insert === 'top'
          ? [notification, ...notifications]
          : [...notifications, notification]
    }));

    return notification.id;
  }

  remove(id) {
    this.setState(({ notifications }) => ({
      notifications: notifications.map((notification) => {
        if (notification.id === id) {
          notification.removed = true;
        }

        return notification;
      })
    }));
  }

  toggleRemoval(id, callback) {
    this.setState(({ notifications }) => ({
      notifications: notifications.filter(({ id: nId }) => nId !== id)
    }), callback);
  }

  renderNotifications(notifications) {
    return notifications.map(notification => <ReactNotification
      key={notification.id}
      notification={notification}
      toggleRemoval={this.toggleRemoval}
      count={notifications.length}
      removed={notification.removed}
    />);
  }

  renderMobileNotifications(props) {
    const { className, id } = props;
    const { notifications } = this.state;
    const mobileNotifications = getNotificationsForMobileView(notifications);
    const top = this.renderNotifications(mobileNotifications.top);
    const bottom = this.renderNotifications(mobileNotifications.bottom);

    return (
      <div className={`react-notification-root ${className || ''}`} id={id}>
        <div className='notification-container-mobile-top'>
          {top}
        </div>
        <div className='notification-container-mobile-bottom'>
          {bottom}
        </div>
      </div>
    );
  }

  renderScreenNotifications(props) {
    const { className, id } = props;
    const { notifications } = this.state;
    const notificationsPerContainer = getNotificationsForEachContainer(notifications);
    const topLeft = this.renderNotifications(notificationsPerContainer.topLeft);
    const topRight = this.renderNotifications(notificationsPerContainer.topRight);
    const topCenter = this.renderNotifications(notificationsPerContainer.topCenter);
    const bottomLeft = this.renderNotifications(notificationsPerContainer.bottomLeft);
    const bottomRight = this.renderNotifications(notificationsPerContainer.bottomRight);
    const bottomCenter = this.renderNotifications(notificationsPerContainer.bottomCenter);

    return (
      <div className={`react-notification-root ${className || ''}`} id={id}>
        <div className='notification-container-top-left'>
          {topLeft}
        </div>
        <div className='notification-container-top-right'>
          {topRight}
        </div>
        <div className='notification-container-bottom-left'>
          {bottomLeft}
        </div>
        <div className='notification-container-bottom-right'>
          {bottomRight}
        </div>
        <div className='notification-container-top-center'>
          {topCenter}
        </div>
        <div className='notification-container-bottom-center'>
          {bottomCenter}
        </div>
      </div>
    );
  }

  render() {
    const { isMobile } = this.props;
    const { width, breakpoint } = this.state;

    if (isMobile && width <= breakpoint) {
      return this.renderMobileNotifications(this.props);
    }

    return this.renderScreenNotifications(this.props);
  }
}

export { store };
