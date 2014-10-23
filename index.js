'use strict';

var options = {
  stage: 'render:post:pages'
};


var plugin = function(params, next) {

  var path = require('path');
  var matter = require('gray-matter');
  var _ = require('lodash');
  var assemble = params.assemble;
  var grunt = assemble.grunt;
  var file = grunt.file;

  var injectBody = function(layout, body) {
    return layout.replace(assemble.engine.bodyRegex, body);
  };
  var processContext = function(grunt, context, data) {
    grunt.config.data = _.extend({}, grunt.config.data, context, data);
    return grunt.config.process(data || context);
  };

  var indexPages = [];

  var buildIndex = function() {
    var pages = assemble.options.pages;
    var template = assemble.options.index.template;
    var ext = path.extname(template);
    var limit = assemble.options.index.limit;
    var destBase = assemble.options.index.dest;
    var options  = assemble.options;
    var start = 0;
    var end = 0;
    var num = 0;

    while (end < pages.length) {
        num++;
        var dest = num <= 1 ? destBase : destBase + '-page' + num;
        dest = dest + '/index.html';
        end = Math.min(pages.length, (start + limit));
        var subPages = pages.slice(start, end);
        start += limit;
        //render subPages
        var layout   = _.cloneDeep(options.defaultLayout);
        var context = _.extend({}, assemble.util.filterProperties(options), layout.data, options.data);
        context = processContext(grunt, context);
        var tpl = grunt.file.read(template);
        var parsedPage = matter(tpl);
        var currentPage = {
            '_page': "all",
            assets: assemble.options.assets,
            basename: path.basename(template, ext),
            dirname: path.dirname(dest),
            dest: dest,
            src: template,
            ext: assemble.options.ext,
            extname: assemble.options.ext,
            filename: path.basename(dest),
            page: parsedPage.content,
            data: parsedPage.data,
        };
        currentPage.data = processContext(grunt, context, currentPage.data);
        context.pages = subPages;
        context.page = currentPage;
        context.page.page = injectBody(layout.layout, context.page.page);
        context.indexPage = num;
        indexPages.push(context);
    }
  }

  if (!assemble.options.pages.length) {
    grunt.log.write('assemble-index: No pages to process '.cyan);
    return;
  }

  buildIndex();

  var writePage = function(page) {
    grunt.log.write('Assembling ' + (page.dest).cyan +' ');
    // Write the file.
    file.write(page.dest, page.content);
    grunt.verbose.writeln('Assembled ' + (page.dest).cyan +' OK'.green);
  }

  var idx = 0, idxCount = indexPages.length;
  var renderPage = function() {
    var context = indexPages[idx];
    context.indexPageIsFirst = (idx === 0);
    context.indexPageIsLast = (idx === idxCount-1);
    context.indexPageFirst = indexPages[0];
    context.indexPagePrev = context.indexPageIsFirst ? null : indexPages[idx-1];
    context.indexPageNext = context.indexPageIsLast ? null : indexPages[idx+1];
    context.indexPageLast = indexPages[idxCount-1];
    context.indexPages = indexPages;
    assemble.engine.render(context.page.page, context, function (err, content) {
      if (err) {
        next(err);
      }
      indexPages[idx].page.content = content;
      writePage(indexPages[idx].page);
      idx++;
      if (idx < idxCount) {
        renderPage();
      } else {
        next(null, indexPages);
      }
    });
  };
  renderPage();

};

// export options
plugin.options = options;
module.exports = plugin;
