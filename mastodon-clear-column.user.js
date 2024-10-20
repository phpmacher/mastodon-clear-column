// ==UserScript==
// @name         Hide Articles in Mastodon Column on button click
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Adds an icon to each column header to hide articles in the respective column
// @author       @phpmacher@sueden.social
// @match        https://sueden.social/*
// @match        https://chaos.social/*
// @match        https://mastodon.social/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Constants
    const ICON_HTML = '💧';
    const COLUMN_SELECTOR = '.column';
    const COLUMN_HEADER_SELECTOR = '.column-header';
    const ARTICLE_SELECTOR = '.scrollable article';
    const ICON_ADDED_CLASS = 'icon-added';

    // Column Utilities
    const columnUtils = {
        // Function to create an icon and append it to the column header
        addIconToColumnHeader: function (column) {
            try {
                // Check if the icon was already added to prevent multiple additions
                if (column.classList.contains(ICON_ADDED_CLASS)) {
                    return; // Icon already added, no need to add again
                }

                const header = column.querySelector(COLUMN_HEADER_SELECTOR);
                const button = header?.querySelector('button');

                if (header && button) {
                    // Create the icon element
                    const icon = document.createElement('div');
                    icon.textContent = ICON_HTML;
                    icon.style.cursor = 'pointer';
                    icon.style.margin = '15px 5px auto';
                    icon.style.display = 'inline-block';
                    icon.style.fontSize = '20px';
                    icon.classList.add('hide-articles-icon');

                    // Add click event listener to the icon
                    const clickListener = () => {
                        // Toggle article visibility in the current column
                        const articles = column.querySelectorAll(ARTICLE_SELECTOR);
                        articles.forEach(article => {
                            if (article.style.display !== 'none') {
                                // Hide article
                                article.style.display = 'none';
                            }
                        });
                    };
                    icon.addEventListener('click', clickListener);

                    // Insert the icon after the button in the header
                    button.insertAdjacentElement('afterend', icon);

                    // Mark the column as processed by adding a class
                    column.classList.add(ICON_ADDED_CLASS);

                    // Store the click listener for later removal
                    column.clickListener = clickListener;
                }
            } catch (error) {
                console.error('Error adding icon:', error);
            }
        },

        // Remove the icon and the event listener from a column
        removeIconFromColumn: function (column) {
            try {
                // Remove the icon
                const icon = column.querySelector('.hide-articles-icon');
                if (icon) {
                    icon.removeEventListener('click', column.clickListener);
                    icon.remove();
                }

                // Remove the ICON_ADDED_CLASS
                column.classList.remove(ICON_ADDED_CLASS);
            } catch (error) {
                console.error('Error removing icon:', error);
            }
        },

        // Find all columns and add the icon to each column header
        addIconsToAllColumns: function () {
            const columns = document.querySelectorAll(COLUMN_SELECTOR);
            columns.forEach(column => {
                this.addIconToColumnHeader(column);
            });
        }
    };

    // MutationObserver to dynamically handle new articles or columns
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches(COLUMN_SELECTOR)) {
                        columnUtils.addIconToColumnHeader(node);
                    }
                });
            }

            if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches(COLUMN_SELECTOR)) {
                        columnUtils.removeIconFromColumn(node);
                    }
                });
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, {childList: true, subtree: true});

    // Initial call to add icons to all existing columns
    columnUtils.addIconsToAllColumns();
})();