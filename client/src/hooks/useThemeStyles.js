// /client/src/hooks/useThemeStyles.js
/**
 * @fileoverview Theme-aware style hook.
 *
 * Provides the current theme colour and hover event handlers for interactive
 * elements. The hover colour is derived from `getHoverColor` and memoised.
 *
 * @module hooks/useThemeStyles
 * @requires react
 * @requires ../context (useTheme)
 * @requires ../utils (getHoverColor)
 */

import { useMemo } from "react";
import { useTheme } from "../context";
import { getHoverColor } from "../utils";

/**
 * Provides the current theme color and event handlers for interactive elements.
 * @returns {{themeColor: string, hoverHandlers: object}}
 */

export const useThemeStyles = () => {
  const { themeColor } = useTheme();

  // Calculate relevant theme color
  const themeHoverColor = useMemo(() => {
    return getHoverColor(themeColor);
  }, [themeColor]);

  // Event handlers
  const hoverHandlers = useMemo(
    () => ({
      onMouseEnter: (e) => {
        e.currentTarget.style.backgroundColor = themeHoverColor;
      },

      onMouseLeave: (e) => {
        e.currentTarget.style.backgroundColor = themeColor;
      },
    }),
    [themeColor, themeHoverColor],
  );

  return { themeColor, hoverHandlers };
};
