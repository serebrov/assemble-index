Plugin for [assemble.io](http://assemble.io) to generate an index page with pagination.

Something like this:

```
Page 1
-------
- Post 1
- Post 2
- Post 3
[-1- 2 3]
```

```
Page 2
------
- Post 3
- Post 4
- Post 5
[1 -2- 3]
```

Configuration:
1. Add 'assemble-index' to plugins
2. Add a plugin configuration to options:

    taskname: {
        options: {
            collections: [{
                name: 'pages',
                sortby: 'data.start_time',
                sortorder: 'desc'
            }],
            plugins: ['assemble-index'],
            index: {
                //template for the index page
                template: 'src/templates/pages/my_index.hbs',
                //limit of records on the each page
                limit: 2,
                //destination folder
                //plugin will save files as
                //dest/path/index.html, dest/path-page2/index.html, etc
                dest: '<%= site.dest %>/posts'
            }
        },
    }

Note: at the moment there are no defaults, so all parameters are required.

3. Add a template for index page, example:

    ```html
    <ul>
      {{#each pages}}
          <li><a href="{{relative ../../page.dest this.dest}}">
            <li>{{json filename }} - {{ data.headline }}</li>
          </a></li>
      {{/each}}
    </ul>

    <ul>
      {{#if indexPageIsFirst}}
        <li><a href="#">Prev</a></li>
      {{else}}
        <li><a href="{{relative ../page.dest indexPagePrev.page.dest}}">Prev</a></li>
      {{/if}}
      {{#each indexPages}}
        <li><a href="{{relative ../page.dest this.page.dest}}">{{ indexPage }}</a></li>
      {{/each}}
      {{#if indexPageIsLast}}
        <li><a href="#">Next</a></li>
      {{else}}
        <li><a href="{{relative ../page.dest indexPageNext.page.dest}}">Next</a></li>
      {{/if}}
    </ul>
    ```

Here 'pages' refer to the limited subset of original pages and 'indexPages' are index pages itself,
so it is possible to build a pagination to move between index pages.
Additional variables:
- indexPageIsFirst - true if current page is first
- indexPageIsLast - true if current page is last
- indexPageFirst - first index page
- indexPageLast - last index page
- indexPageNext - next index page
- indexPagePrev - previous index page
