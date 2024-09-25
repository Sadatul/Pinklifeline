/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'http://localhost:3000', // Change this to your website's URL
    generateRobotsTxt: true, // Optionally generate robots.txt
    sitemapSize: 7000, // Maximum number of entries per sitemap file
    exclude: ['/admin/*'], // You can exclude specific pages or directories
};
