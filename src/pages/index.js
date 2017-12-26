import React from 'react'
import Link from 'gatsby-link'

export default class IndexPage extends React.Component {
  
      render() {
        const pages = this.props.data.allSitePage.edges

          return (
          <div>
              <h1>Static pages generated: ({pages.length - 5})</h1>
              <ul>
                  {
                    pages.map(({ node }) => {
                      if(node.path != '/feed-watch/' && node.path != 'dev-404-page/' && node.path != '/404/' && node.path != '/404.html' && node.path != '/dev-404-page/' && node.path != '/')
                      return (
                        <li>
                            <a href={'/gatsby-test-dynamic-data/public' + node.path}>{node.path}</a>
                        </li>
                      )
                    })
                  }
              </ul>
          </div>
          )
      }
  }

export const pageQuery = graphql`
query Pages {
  allSitePage{
    edges {
      node {
        id
        path
      }
    }
  }
}`