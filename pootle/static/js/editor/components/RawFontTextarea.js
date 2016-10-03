/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import assign from 'object-assign';
import Mousetrap from 'mousetrap';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

import AutosizeTextarea from 'components/AutosizeTextarea';

import { RawFontAware } from '../utils/RawFontAware';


const UNDO_SHORTCUT = 'mod+z';
const REDO_SHORTCUT = 'mod+shift+z';


const RawFontTextarea = React.createClass({

  propTypes: {
    autoFocus: React.PropTypes.bool,
    id: React.PropTypes.string,
    initialValue: React.PropTypes.string,
    isDisabled: React.PropTypes.bool,
    isRawMode: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    overrideValue: React.PropTypes.any,
    style: React.PropTypes.object,
  },

  contextTypes: {
    currentLocaleCode: React.PropTypes.string,
    currentLocaleDir: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      initialValue: '',
    };
  },

  getInitialState() {
    return {
      done: [],
      undone: [],
    };
  },

  componentWillMount() {
    this.saveSnapshot = _.debounce(this.saveSnapshot, 300, true);
  },

  componentDidMount() {
    this.mousetrap = new Mousetrap(this._textareaNode);
    this.mousetrap.bind(UNDO_SHORTCUT, this.handleUndo);
    this.mousetrap.bind(REDO_SHORTCUT, this.handleRedo);

    const { isRawMode } = this.props;
    this.rawFont = new RawFontAware(this._textareaNode, { isRawMode });
    this.previousSnapshot = this.rawFont.setValue(this.props.initialValue);

    this.isDirty = false;
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.isRawMode !== nextProps.isRawMode) {
      this.rawFont.setMode({ isRawMode: nextProps.isRawMode });
    }
  },

  shouldComponentUpdate(nextProps) {
    // Avoid unnecessary re-renders when the undo stack saves snapshots but
    // Only value and mode changes should re-render the textarea — otherwise
    // there are many unnecessary re-renders when the undo stack saves snapshots.
    return (
      this.isDirty ||
      this.props.isRawMode !== nextProps.isRawMode
    );
  },

  componentDidUpdate() {
    this._textareaNode.focus();
  },

  componentWillUnmount() {
    this.mousetrap.unbind(UNDO_SHORTCUT);
    this.mousetrap.unbind(REDO_SHORTCUT);

    this.rawFont.destroy();
  },

  // FIXME: let's rename value to something else; it'll be an object with the
  // value and selection information, so not a plain value
  saveSnapshot(value) {
    this.setState((prevState) => ({
      done: [...prevState.done, value],
      undone: [],
    }), () => {
      this.previousSnapshot = this.rawFont.getValue();
    });
  },

  handleChange() {
    this.isDirty = true;
    this.saveSnapshot(this.previousSnapshot);
    this.props.onChange();
  },

  handleUndo(e) {
    e.preventDefault();
    if (this.state.done.length === 0) {
      return;
    }

    const currentValue = this.rawFont.getValue();
    const done = this.state.done.slice();
    const newValue = done.slice(-1)[0];

    this.setState((prevState) => ({
      done: done.slice(0, -1),
      undone: [...prevState.undone, currentValue],
    }), () => {
      this.previousSnapshot = this.rawFont.setValue(newValue);
      this.props.onChange();
    });
  },

  handleRedo(e) {
    e.preventDefault();
    if (this.state.undone.length === 0) {
      return;
    }

    const currentValue = this.rawFont.getValue();
    const undone = this.state.undone.slice();
    const newValue = undone.slice(-1)[0];

    this.setState((prevState) => ({
      done: [...prevState.done, currentValue],
      undone: undone.slice(0, -1),
    }), () => {
      this.previousSnapshot = this.rawFont.setValue(newValue);
      this.props.onChange();
    });
  },

  render() {
    const style = assign({}, {
      boxSizing: 'border-box',
      margin: '0 0 0.5em 0',
      padding: '0.3em',
    }, this.props.style);

    return (
      <AutosizeTextarea
        autoFocus={this.props.autoFocus}
        className="translation focusthis js-translation-area"
        defaultValue={this.props.initialValue}
        dir={this.context.currentLocaleDir}
        disabled={this.props.isDisabled}
        id={this.props.id}
        lang={this.context.currentLocaleCode}
        onChange={this.handleChange}
        ref={(textarea) => {
          if (textarea !== null) {
            // `textarea` doesn't hold the actual DOM textarea; it is a
            // component, hence using `ReactDOM.findDOMNode` here.
            this._textareaNode = ReactDOM.findDOMNode(textarea);
          }
        }}
        style={style}
        value={undefined}
      />
    );
  },

});


export default RawFontTextarea;
