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
 
 /*exports.sourceNodes = async (
   { boundActionCreators, getNode, store, cache },
   { }
 ) => {
   const { createNode } = boundActionCreators
   _siteURL = `http://syndicator.univision.com/feed/custom/camino-rusia-2018-conmebol?client_id=18bc31b21929a2e8369c2acfd1bcfa604e8c278d&signature=562608efc15aad620c672a82177f388097c020ad`
   createNodesFromJSON(_siteURL, createNode)
 
   return
 }*/
 /*
 exports.createPages = ({ graphql, boundActionCreators }) => {
     const { createPage } = boundActionCreators
     //_siteURL = `http://syndicator.univision.com/feed/custom/latin-grammy-video-feed-for-90-min?client_id=e038b1fb8bd776084f4dcce4109704ac46684396&signature=e4caf13c4471426eb9715e8ba5d28340c96bc823`
     _siteURL = `http://syndicator.univision.com/feed/custom/camino-rusia-2018-conmebol?client_id=18bc31b21929a2e8369c2acfd1bcfa604e8c278d&signature=562608efc15aad620c672a82177f388097c020ad`
     return Promise.all([axios({
         method: `get`,
         url: `${_siteURL}`
       })]).then(result => {
         if(result[0].status == 200)
         {
             let items = result[0].data.data.items;
             items.forEach(_entity =>
             {
                 
                 const $type = _.upperFirst(_.camelCase(`${_entity.type}`));
                 const id = `${_entity.uid}`;
                 const contentDigest = crypto
                 .createHash(`md5`)
                 .update(JSON.stringify(_entity))
                 .digest(`hex`)
                 const children = []
                 
                 let entity = {
                     id: id,
                     publishDate: _entity.publishDate,
                     url: _entity.url,
                     title: _entity.title,
                     shortTitle: _entity.shortTitle,
                     description: _entity.description,
                     images: {
                         original: _entity.image.original,
                         medium: _entity.image["640x360"],
                         small: _entity.image["175x100"]
                     }
                 }
                 
                 let node = {
                     ...entity,
                     children,
                     parent: entity.id,
                     internal: {
                         type: $type,
                         mediaType: 'application/json',
                         contentDigest: contentDigest,
                     },
                 }
                 const layout_index = path.resolve(`src/layouts/info.js`)
 
                 createPage({
                     path: `${ slugify( _.lowerCase( node.title ) ) }`, // required
                     component: slash(layout_index),
                     context: {
                         slug: id,
                         node: node
                     }
                 })
             });
         }
     })
     
   }
 */
 async function createNodesFromJSON ( _siteURL, createNode ) {
     
     return Promise.all([axios({
         method: `get`,
         url: `${_siteURL}`
       })]).then(result => {
         if(result[0].status == 200)
         {
             let items = result[0].data.data.items;
             items.forEach(_entity =>
             {
                 
                 const $type = _.upperFirst(_.camelCase(`${_entity.type}`));
                 const id = `${_entity.uid} >>> ` + $type;
                 const contentDigest = crypto
                 .createHash(`md5`)
                 .update(JSON.stringify(_entity))
                 .digest(`hex`)
                 const children = []
                 
                 let entity = {
                     id: id,
                     publishDate: _entity.publishDate,
                     url: _entity.url
                 }
                 
                 let node = {
                     ...entity,
                     children,
                     parent: entity.id,
                     internal: {
                         type: $type,
                         mediaType: 'application/json',
                         contentDigest: contentDigest,
                     },
                 }
                 console.log({
                     node: node
                 });
                 createNode(node)
             });
         }
     })
   }