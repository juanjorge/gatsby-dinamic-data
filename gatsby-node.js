/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
 const Promise = require(`bluebird`)
 const axios = require(`axios`)
 const _ = require(`lodash`)
 const crypto = require(`crypto`)
 const path = require(`path`)
 const slash = require(`slash`)
 const slugify = require(`slugify`)

 exports.createPages = ({ graphql, boundActionCreators }) => {
     const { createPage } = boundActionCreators
     _siteURL = `https://syndicator.univision.com/web-api/content?url=https://www.univision.com/test/gatsby-dynamic-data-section2`
     return Promise.all([axios({
         method: `get`,
         url: `${_siteURL}`
       })]).then(result => {
         if(result[0].status == 200)
         {
             let widgets = result[0].data.data.widgets;
             widgets.forEach(_widget =>
             {
                 let contents = _widget.contents;
                 contents.forEach(_entity =>
                {
                    const $type = _.upperFirst(_.camelCase(`${_entity.type}`));
                    const id = `${_entity.uid}`;
                    const contentDigest = crypto
                    .createHash(`md5`)
                    .update(JSON.stringify(_entity))
                    .digest(`hex`)
                    const children = []
                    
                    let node = {
                        id: id,
                        publishDate: _entity.publishDate,
                        url: _entity.url,
                        title: _entity.title,
                        widget: _widget.name,
                        shortTitle: _entity.shortTitle,
                        description: _entity.description,
                        images: {
                            original: _entity.image.renditions.original
                        },
                        children,
                        parent: id,
                        internal: {
                            type: $type,
                            mediaType: 'application/json',
                            contentDigest: contentDigest,
                        },
                    }
                    const layout_index = path.resolve(`src/layouts/data.js`)
    
                    createPage({
                        path: `${ slugify( _.lowerCase( node.title ) ) }`,
                        component: slash(layout_index),
                        context: {
                            slug: id,
                            node: node
                        }
                    })
                });   
             });
         }
     })
   }