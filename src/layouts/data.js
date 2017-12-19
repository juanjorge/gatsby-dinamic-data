import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'
import Img from "gatsby-image"

import './index.css'

class BlogPostRoute extends React.Component {
    render() {
      const node = this.props.pathContext.node
      console.log({
        node_info: node
      });
      return (
        <div class="uvn-content">
          <header>
            {node.widget}
            <h1 style={{ padding: 0, margin: 0 }}>
                {node.title}
            </h1>
          </header>
          <div style={{ "margin-top": "20px" }}>
              <img  src={node.images.original.href} />
              <span>{node.description}</span>
          </div>
        </div>
      )
    }
  }
  
  export default BlogPostRoute
