var templates = require('./templates');

var header = templates.App.header();
console.assert(header === '<header>Hello!</header>', 'Output should match');
console.log('templates.App.header: %s', header);

var app = templates.App();
console.assert(app === 'This is the app!', 'Output should match');
console.log('templates.App: %s', app);

var footer = templates.App.footer();
console.assert(footer === '<footer>Goodbye!</footer>', 'Output should match');
console.log('templates.App.footer: %s', footer);

var otherItem = templates.Other.item();
console.assert(otherItem === 'An item!', 'Output should match');
console.log('templates.Other.item: %s', otherItem);
