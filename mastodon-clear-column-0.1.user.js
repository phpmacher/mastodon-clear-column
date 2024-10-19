// ==UserScript==
// @name         Hide Articles in Mastodon Column on button click
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds an icon to each column header to hide articles in the respective column
// @author       @phpmacher@sueden.social
// @match        https://sueden.social/*
// @match        https://chaos.social/*
// @match        https://mastodon.social/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create an icon and append it to the column header
    function addIconToColumnHeader(column) {
        // Check if the icon was already added to prevent multiple additions
        if (column.classList.contains('icon-added')) {
            return; // Icon already added, no need to add again
        }

        const header = column.querySelector('.column-header');
        const button = header?.querySelector('button');

        if (header && button) {

            // Create the icon element
            const icon = document.createElement('div');
            icon.innerHTML = '💧';
            icon.style.cursor = 'pointer';
            icon.style.margin = '15px 5px auto';
            icon.style.display = 'inline-block';
            icon.style.fontSize = '20px';

            // Add click event listener to the icon
            icon.addEventListener('click', () => {
                // Toggle article visibility in the current column
                const articles = column.querySelectorAll('.scrollable article');
                articles.forEach(article => {
                    if (article.style.display != 'none') {
                        // Hide article
                        article.style.display = 'none';
                    }
                });
            });

            // Insert the icon after the button in the header
            button.insertAdjacentElement('afterend', icon);

            // Mark the column as processed by adding a class
            column.classList.add('icon-added');
        }
    }

    // Find all columns and add the icon to each column header
    function addIconsToAllColumns() {
        const timestamp=Date.now();
        console.log('addIconsToAllColumns', timestamp);
        const columns = document.querySelectorAll('.column');
        columns.forEach(column => {
            console.log('column', timestamp);
            addIconToColumnHeader(column);
        });
    }

    // Run the function to add icons once the DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addIconsToAllColumns, 3000); // Wait 3 seconds before executing
    });

    // MutationObserver to dynamically handle new articles or columns
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches('.column')) {
                        addIconsToAllColumns();
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });


})();