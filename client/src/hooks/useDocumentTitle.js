import { useEffect } from 'react';
import { SITE_NAME } from '../constants/site';

/**
 * Sets the browser tab title for the current page, e.g. "Marketplace | PHILAConnect".
 * Pass nothing to get the default site title.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} – Stamp Marketplace & Collector Community`;
  }, [title]);
}
