import React from 'react'
import Link from 'gatsby-link'
const AWS = require('aws-sdk/dist/aws-sdk-react-native')
     
AWS.config.apiVersions = {
    codebuild: '2016-10-06'
};
AWS.config.update({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: 'us-east-1'
});   
var codebuild = new AWS.CodeBuild();

export default class FeeWatchPage extends React.Component {
    
    componentWillMount()
    {
        this.state = {
            info: null,
            called: false,
            STATUS: "INITIALIZED"
        };
        
    }
    listProfects()
    {
        var params = {
            sortOrder: "ASCENDING"
        };
        codebuild.listProjects(params, function(err, data) {
            if (err){
                console.log(err, err.stack);
                this.setState({
                    info: {
                        type: "error",
                        data: err.stack,
                    },
                    STATUS: "Error, " + err.code
                });
            }
            else{
                console.log({
                    data: data,
                    called: this.state.called
                });
                this.setState({
                    info: {
                        type: "success",
                        data: data
                    },
                    called : true,
                    STATUS: "# Projects: " + data.projects.length
                });
            }
        }.bind(this));
    }
    startBuild()
    {
        var params = {
            projectName: "gatsby-test-dynamic-data"
        };
        codebuild.startBuild(params, function(err, data) {
            if (err){
                console.log(err, err.stack);
                this.setState({
                    info: {
                        type: "error",
                        data: err.stack
                    },
                    STATUS: "ERROR, " + err.code
                });
            }
            else{
                console.log({
                    data: data,
                    called: this.state.called
                });
                this.setState({
                    info: {
                        type: "success",
                        data: data
                    },
                    called : true,
                    STATUS: "Build phase: " + data.build.currentPhase
                });
            }
        }.bind(this));
    }
    startMonitoring()
    {
        this.startBuild();
    }
    msg(msg)
    {
        this.setState({
            STATUS: msg
        });
    }
    render() {

        return (
            <div>
                <h1>MONITOR: { this.state.STATUS }</h1>
                <input className="btn btn-primary" type="button" value="START" onClick={ () => this.startMonitoring() } />
                <br />
                <br />
                <div>Results:</div>
                <code>
                    { JSON.stringify( this.state ) }
                    
                </code>
            </div>
        )
    }
}