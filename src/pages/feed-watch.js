import React from 'react'
import Link from 'gatsby-link'
import ReactJson from 'react-json-view'
const AWS = require('aws-sdk/dist/aws-sdk-react-native')
AWS.config.apiVersions = {
    codebuild: '2016-10-06'
};
AWS.config.update({
    region: 'us-east-1',
    accessKeyId: 'AKIAIDIOLWQV3CCQDL7Q',
    secretAccessKey: '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'
});        
var codebuild = new AWS.CodeBuild();

export default class FeeWatchPage extends React.Component {
    
    componentWillMount()
    {
        this.state = {
            info: null,
            called: false,
            STATUS: ""
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
                        data: {
                            err: err,
                            stack: err.stacK
                        }
                    },
                    STATUS: "ERROR: " + err.stack
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
                        data: {
                            err: err,
                            stack: err.stack
                        },
                        STATUS: "Error: " + err.stack
                    }
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
        this.listProfects();
    }
    render() {

        return (
            <div>
                <h1>Monitoring...</h1>
                <input type="button" value="START" onClick={ () => this.startMonitoring() } />
                <div>{ this.state.STATUS }</div>
                <ReactJson collapsed="true" displayDataTypes="false" src={ this.state  } />
            </div>
        )
    }
}