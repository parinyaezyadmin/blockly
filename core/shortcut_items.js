/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registers default keyboard shortcuts.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.module('Blockly.ShortcutItems');
goog.module.declareLegacyNamespace();

goog.require('Blockly');
goog.require('Blockly.clipboard');
goog.require('Blockly.Gesture');
goog.require('Blockly.ShortcutRegistry');
goog.require('Blockly.utils.KeyCodes');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.ICopyable');


/**
 * Object holding the names of the default shortcut items.
 * @enum {string}
 */
const names = {
  ESCAPE: 'escape',
  DELETE: 'delete',
  COPY: 'copy',
  CUT: 'cut',
  PASTE: 'paste',
  UNDO: 'undo',
  REDO: 'redo'
};
exports.names = names;

/** Keyboard shortcut to hide chaff on escape. */
const registerEscape = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const escapeAction = {
    name: names.ESCAPE,
    preconditionFn: function (workspace) {
      return !workspace.options.readOnly;
    },
    callback: function () {
      Blockly.hideChaff();
      return true;
    }
  };
  Blockly.ShortcutRegistry.registry.register(escapeAction);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.ESC, escapeAction.name);
};
exports.registerEscape = registerEscape;

/** Keyboard shortcut to delete a block on delete or backspace */
const registerDelete = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const deleteShortcut = {
    name: names.DELETE,
    preconditionFn: function (workspace) {
      return !workspace.options.readOnly &&
          Blockly.selected &&
          Blockly.selected.isDeletable();
    },
    callback: function (workspace, e) {
      // Delete or backspace.
      // Stop the browser from going back to the previous page.
      // Do this first to prevent an error in the delete code from resulting in
      // data loss.
      e.preventDefault();
      // Don't delete while dragging.  Jeez.
      if (Blockly.Gesture.inProgress()) {
        return false;
      }
      Blockly.deleteBlock(/** @type {!Blockly.BlockSvg} */ (Blockly.selected));
      return true;
    }
  };
  Blockly.ShortcutRegistry.registry.register(deleteShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.DELETE, deleteShortcut.name);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.BACKSPACE, deleteShortcut.name);
};
exports.registerDelete = registerDelete;

/** Keyboard shortcut to copy a block on ctrl+c, cmd+c, or alt+c. */
const registerCopy = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const copyShortcut = {
    name: names.COPY,
    preconditionFn: function (workspace) {
      return !workspace.options.readOnly &&
          !Blockly.Gesture.inProgress() &&
          Blockly.selected &&
          Blockly.selected.isDeletable() &&
          Blockly.selected.isMovable();
    },
    callback: function (workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      Blockly.hideChaff();
      Blockly.clipboard.copy(/** @type {!Blockly.ICopyable} */ (Blockly.selected));
      return true;
    }
  };
  Blockly.ShortcutRegistry.registry.register(copyShortcut);

  const ctrlC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlC, copyShortcut.name);

  const altC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altC, copyShortcut.name);

  const metaC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaC, copyShortcut.name);
};
exports.registerCopy = registerCopy;

/** Keyboard shortcut to copy and delete a block on ctrl+x, cmd+x, or alt+x. */
const registerCut = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const cutShortcut = {
    name: names.CUT,
    preconditionFn: function (workspace) {
      return !workspace.options.readOnly &&
          !Blockly.Gesture.inProgress() &&
          Blockly.selected &&
          Blockly.selected.isDeletable() &&
          Blockly.selected.isMovable() &&
          !Blockly.selected.workspace.isFlyout;
    },
    callback: function() {
      Blockly.clipboard.copy(/** @type {!Blockly.ICopyable} */ (Blockly.selected));
      Blockly.deleteBlock(/** @type {!Blockly.BlockSvg} */ (Blockly.selected));
      return true;
    }
  };

  Blockly.ShortcutRegistry.registry.register(cutShortcut);

  const ctrlX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlX, cutShortcut.name);

  const altX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

  const metaX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaX, cutShortcut.name);
};
exports.registerCut = registerCut;

/** Keyboard shortcut to paste a block on ctrl+v, cmd+v, or alt+v. */
const registerPaste = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const pasteShortcut = {
    name: names.PASTE,
    preconditionFn: function (workspace) {
      return !workspace.options.readOnly && !Blockly.Gesture.inProgress();
    },
    callback: function() {
      return Blockly.clipboard.paste();
    }
  };

  Blockly.ShortcutRegistry.registry.register(pasteShortcut);

  const ctrlV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

  const altV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altV, pasteShortcut.name);

  const metaV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaV, pasteShortcut.name);
};
exports.registerPaste = registerPaste;

/** Keyboard shortcut to undo the previous action on ctrl+z, cmd+z, or alt+z. */
const registerUndo = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const undoShortcut = {
    name: names.UNDO,
    preconditionFn: function (workspace) {
      return !workspace.options.readOnly &&
          !Blockly.Gesture.inProgress();
    },
    callback: function (workspace) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(false);
      return true;
    }
  };
  Blockly.ShortcutRegistry.registry.register(undoShortcut);

  const ctrlZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlZ, undoShortcut.name);

  const altZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altZ, undoShortcut.name);

  const metaZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaZ, undoShortcut.name);
};
exports.registerUndo = registerUndo;

/** Keyboard shortcut to redo the previous action on ctrl+shift+z, cmd+shift+z, or alt+shift+z. */
const registerRedo = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const redoShortcut = {
    name: names.REDO,
    preconditionFn: function (workspace) {
      return !Blockly.Gesture.inProgress() && !workspace.options.readOnly;
    },
    callback: function (workspace) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(true);
      return true;
    }
  };
  Blockly.ShortcutRegistry.registry.register(redoShortcut);

  const ctrlShiftZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z,
      [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      ctrlShiftZ, redoShortcut.name);

  const altShiftZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z,
      [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altShiftZ, redoShortcut.name);

  const metaShiftZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z,
      [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      metaShiftZ, redoShortcut.name);

  // Ctrl-y is redo in Windows.  Command-y is never valid on Macs.
  const ctrlY = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Y, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlY, redoShortcut.name);
};
exports.registerRedo = registerRedo;

/**
 * Registers all default keyboard shortcut item. This should be called once per instance of
 * KeyboardShortcutRegistry.
 */
const registerDefaultShortcuts = function() {
  registerEscape();
  registerDelete();
  registerCopy();
  registerCut();
  registerPaste();
  registerUndo();
  registerRedo();
};
/** @package */
exports.registerDefaultShortcuts = registerDefaultShortcuts;

registerDefaultShortcuts();
