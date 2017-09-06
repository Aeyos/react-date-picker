import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Calendar from 'react-calendar';
import 'react-calendar/src/Calendar.less';

import detectElementOverflow from 'detect-element-overflow';

import './DatePicker.less';

import DateInput from './DateInput';

import { getISOLocalDate } from './shared/dates';
import {
  isCalendarType,
  isMaxDate,
  isMinDate,
} from './shared/propTypes';

export default class DatePicker extends Component {
  state = {
    isOpen: this.props.isOpen,
  }

  openCalendar = () => {
    this.setState({ isOpen: true });
  }

  closeCalendar = () => {
    this.setState({ isOpen: false });
  }

  toggleCalendar = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  onChange = (value, closeCalendar = true) => {
    this.setState({
      isOpen: !closeCalendar,
    });

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  onChangeNative = (event) => {
    const { value } = event.target;

    this.onChange(new Date(value));
  }

  get formattedDate() {
    const { locale, value } = this.props;

    return value.toLocaleDateString(locale || false);
  }

  get placeholder() {
    const { locale } = this.props;
    const date = new Date(2017, 11, 11);

    return (
      date.toLocaleDateString(locale || false)
        .replace('2017', 'YYYY')
        .replace('12', 'MM')
        .replace('11', 'DD')
    );
  }

  get displayNative() {
    const { preferNative } = this.props;

    const dateInputSupported = () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'date');
      return input.type !== 'text';
    };

    return preferNative && dateInputSupported();
  }

  onFocus = () => {
    this.blurRequested = false;

    this.openCalendar();
  }

  onBlur = () => {
    this.blurRequested = true;

    setTimeout(() => {
      if (this.blurRequested) {
        this.closeCalendar();

        this.blurRequested = false;
      }
    }, 100);
  }

  stopPropagation = event => event.stopPropagation()

  renderNativeInput() {
    const { value } = this.props;

    return (
      <input
        onChange={this.onChangeNative}
        onFocus={this.stopPropagation}
        type="date"
        value={value ? getISOLocalDate(value) : ''}
      />
    );
  }

  renderInput() {
    const {
      locale,
      preferNative,
      value,
    } = this.props;

    return (
      <div className="react-date-picker__button">
        <DateInput
          locale={locale}
          onChange={this.onChange}
          placeholder={this.placeholder}
          preferNative={preferNative}
          value={value}
        />
        <button
          className="react-date-picker__button__icon"
          onClick={this.toggleCalendar}
          onFocus={this.stopPropagation}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19">
            <g className="stroke-primary" stroke="black" strokeWidth="2">
              <rect width="15" height="15" x="2" y="2" fill="none" />
              <line x1="6" y1="0" x2="6" y2="4" />
              <line x1="13" y1="0" x2="13" y2="4" />
            </g>
          </svg>
        </button>
      </div>
    );
  }

  renderCalendar() {
    const { isOpen } = this.state;

    if (isOpen === null) {
      return null;
    }

    const {
      calendarType,
      locale,
      maxDate,
      minDate,
      showWeekNumbers,
      value,
    } = this.props;

    const className = 'react-date-picker__calendar';

    return (
      <div
        className={`${className} ${className}--${isOpen ? 'open' : 'closed'}`}
        ref={(ref) => {
          if (!ref) {
            return;
          }

          ref.classList.remove(`${className}--above-label`);

          const collisions = detectElementOverflow(ref, document.body);

          if (collisions.collidedBottom) {
            ref.classList.add(`${className}--above-label`);
          }
        }}
      >
        <Calendar
          calendarType={calendarType}
          locale={locale}
          maxDate={maxDate}
          minDate={minDate}
          onChange={this.onChange}
          showWeekNumbers={showWeekNumbers}
          value={value}
        />
      </div>
    );
  }

  render() {
    const { displayNative } = this;

    return (
      <div
        className="react-date-picker"
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        {displayNative ? this.renderNativeInput() : this.renderInput()}
        {displayNative || this.renderCalendar()}
      </div>
    );
  }
}

DatePicker.propTypes = {
  calendarType: isCalendarType,
  isOpen: PropTypes.bool,
  locale: PropTypes.string,
  maxDate: isMaxDate,
  minDate: isMinDate,
  onChange: PropTypes.func,
  preferNative: PropTypes.bool,
  showWeekNumbers: PropTypes.bool,
  value: PropTypes.instanceOf(Date),
};
