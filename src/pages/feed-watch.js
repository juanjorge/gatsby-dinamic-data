import React from 'react'
import Link from 'gatsby-link'
const AWS = require('aws-sdk/dist/aws-sdk-react-native')
const axios = require(`axios`)
const crypto = require(`crypto`)
     
AWS.config.apiVersions = {
    codebuild: '2016-10-06',
    dynamodb: '2012-08-10'
};
AWS.config.update({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: 'us-east-1'
});   
var codebuild = new AWS.CodeBuild();
var dynamodb = new AWS.DynamoDB();

export default class FeedWatchPage extends React.Component {
    
    componentWillMount()
    {
        this.state = {
            info: null,
            called: false,
            STATUS: "INITIALIZED"
        };
    }
    listProjects()
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
                    loc: "listProjects",
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
                    loc: "startBuild",
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
        let _siteURL = `https://syndicator.univision.com/web-api/content?url=https://www.univision.com/test/gatsby-dynamic-data-section2`
        axios({
            method: `get`,
            url: `${_siteURL}`
        }).then(function (result) {
            if(result.status == 200)
            {
                let widgets = result.data.data.widgets;
                let hashes = [];
                widgets.map(_widget =>
                {
                    let contents = _widget.contents;
                    contents.map(_entity =>
                    {
                       const contentDigest = crypto
                                            .createHash(`md5`)
                                            .update(JSON.stringify(_entity))
                                            .digest(`hex`)
                       hashes.push({
                            "HashPage": {
                                S: contentDigest
                            }
                       });
                   });   
                });
                this.batchGetItems(hashes, function (err, data){
                    if (err){
                        console.log(err, err.stack);
                        this.setState({ info: { type: "error", data: err.stack, }, STATUS: "Error, " + err.code });
                    }
                    else{
                        let gatsby_pages = data.Responses["gatsby-pages"];
                        let dynamo_new_data = [];
                        hashes.map(_hash =>
                        {
                            let inthere = false
                            gatsby_pages.map(_hash_gatsby_page =>{
                                if(_hash.HashPage.S == _hash_gatsby_page.HashPage.S)
                                {
                                    inthere = true
                                }
                            })
                            if(!inthere)
                            {
                                dynamo_new_data.push({
                                    PutRequest: {
                                     Item: {
                                      "HashPage": {
                                        S: _hash.HashPage.S
                                       }
                                     }
                                    }
                                });
                            }
                        });
                        console.log({
                            loc: "batchGetItems",
                            data: data,
                            gatsby_pages: gatsby_pages,
                            hashes: hashes,
                            dynamo_new_data: dynamo_new_data
                        });
                        if(dynamo_new_data.length > 0)
                        {
                            this.batchSaveItems(dynamo_new_data, function (err, data) {
                                if (err){
                                    console.log(err, err.stack);
                                    this.setState({ info: { type: "error", data: err.stack, }, STATUS: "Error, " + err.code });
                                }
                                else
                                {
                                    console.log({
                                        loc: "batchSaveItems",
                                        data: data
                                    });
                                }
                            }.bind(this));
                            //this.startBuild();
                        }
                    }         
                }.bind(this));
            }
        }.bind(this));

        //this.startBuild();
    }
    batchSaveItems(new_items, callback)
    {
        var params = {
            RequestItems: {
                "gatsby-pages": new_items
            }
        };
        dynamodb.batchWriteItem(params, function(err, data) {
            callback(err, data);
        });
    }
    batchGetItems(hashes, callback) {
        var params = {
            RequestItems: {
                "gatsby-pages": {
                    Keys: hashes, 
                    ProjectionExpression: "HashPage"
                }
            }
        };
        dynamodb.batchGetItem(params, function(err, data) {
            callback(err, data);
        });
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