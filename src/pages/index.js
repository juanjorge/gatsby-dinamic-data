import React from 'react'
import Link from 'gatsby-link'

export default class IndexPage extends React.Component {
      GenerateStaticFiles() {
        console.log("Generatong...");
      }
      render() {
          return (
          <div>
              <h1>Hi there...</h1>
              <p>Press the button for generate something great.</p>
              <input type="button" onClick={this.GenerateStaticFiles} value="GENERATE NOW" />
          </div>
          )
      }
  }