// /client/src/hooks/useConfirmActions.js
/**
 * @fileoverview Confirmation dialog hook.
 *
 * Wraps the NotificationContext's confirmation modal in a Promise-based API
 * with pre-built confirmation types (delete, archive, publish, reset) and a
 * generic `confirmAction` for custom dialogs.
 *
 * @module hooks/useConfirmActions
 * @requires react
 * @requires ../context (useNotification)
 */

import { useCallback, useMemo } from "react";
import { useNotification } from "../context";

export const useConfirmActions = () => {
  const { showConfirm } = useNotification();

  const createConfirmPromise = useCallback(
    (config) => {
      return new Promise((resolve) => {
        showConfirm({
          cancelText: "Cancel",
          ...config,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    },
    [showConfirm],
  );

  return useMemo(
    () => ({
      confirmDelete: (resourceName = "item") =>
        createConfirmPromise({
          title: `Delete ${resourceName}`,
          message: `Are you sure you want to delete this ${resourceName}? This action cannot be undone.`,
          confirmText: "Delete",
          type: "danger",
        }),

      confirmArchive: (resourceName = "item") =>
        createConfirmPromise({
          title: `Archive ${resourceName}`,
          message: `This will hide the ${resourceName} from users. You can restore it later.`,
          confirmText: "Archive",
          type: "warning",
        }),

      confirmPublish: (resourceName = "item") =>
        createConfirmPromise({
          title: `Publish ${resourceName}`,
          message: `This will make the ${resourceName} visible to all users.`,
          confirmText: "Publish",
        }),

      confirmReset: () =>
        createConfirmPromise({
          title: "Reset Changes",
          message:
            "Are you sure you want to reset all changes? This cannot be undone.",
          confirmText: "Reset",
        }),

      confirmAction: (title, message, confirmText = "Confirm") =>
        createConfirmPromise({ title, message, confirmText }),

      createConfirmPromise,
    }),
    [createConfirmPromise],
  );
};
