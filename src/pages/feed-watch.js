import React from 'react'
import Link from 'gatsby-link'
import { setTimeout } from 'timers';
const AWS = require('aws-sdk/dist/aws-sdk-react-native')
const axios = require(`axios`)
const crypto = require(`crypto`)
const BUCKET = 'agency-fe-test-2'
const BUCKET_SOURCE = 'agency-fe-test-2-build'
const OBJECT = 'gatsby-test-dynamic-data'
     
AWS.config.apiVersions = {
    codebuild: '2016-10-06',
    dynamodb: '2012-08-10',
    s3: '2006-03-01'
};
AWS.config.update({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: 'us-east-2'
});   
var codebuild = new AWS.CodeBuild();
var dynamodb = new AWS.DynamoDB();
var s3 = new AWS.S3();
var thread_monitoring = 0;
var thread_monitoring_build = 0;
var current_build = "";

export default class FeedWatchPage extends React.Component {
    
    componentWillMount()
    {
        this.state = {
            info: null,
            stoped: false,
            button: {
                text: "START",
                disabled: ''
            },
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
                    data: data
                });
                this.setState({
                    info: {
                        type: "success",
                        data: data
                    },
                    STATUS: "# Projects: " + data.projects.length
                });
            }
        }.bind(this));
    }
    updateEncryptionAndACL(index, contents, callback)
    {
        console.log({
            percent_update: (index + 1) / contents.length
        });
        if(index >= contents)
        {
            callback();
        }
        else {
            const _key = contents[index].Key;
            var params = {
                Bucket: BUCKET,
                Key: _key,
                ServerSideEncryption: null,
                ACL: 'public-read'
            };
            s3.putObject(params, function(err, data) {
                if (err) console.log(err, err.stack);
                else {
                    /*console.log({
                        loc: "updateEncryptionAndACL",
                        data: data
                    }); // successful response
                    */
                }
                this.updateEncryptionAndACL(index + 1, contents, callback)
            }.bind(this));
        }
    }
    move(index, contents, callback)
    {
        
        if(index >= contents.length)
        {
            callback();
        }
        else {
            let perce = ((index + 1) / contents.length) * 100;
            this.setState({
                STATUS: "MOVING NEW STATIC FILES " + parseInt( perce ) + "%"
            })
            const _key = contents[index].Key;
            var params = {
                Bucket: BUCKET,
                CopySource: "/" + BUCKET_SOURCE + "/" + _key,
                Key: _key,
                ACL: 'public-read'
            };
            s3.copyObject(params, function(err, data) {
                if (err) {
                    console.log(err, err.stack);    
                } else {
                    /*console.log({
                        loc: "putObjectAcl",
                        data: data
                    });*/
                }
                this.move(index + 1, contents, callback)
            }.bind(this));
        }
    }
    deleteEncryptionAndPutPublic(callback)
    {
        var params = {
            Bucket: BUCKET_SOURCE,
            MaxKeys: 1000
        };
        s3.listObjectsV2(params, function(err, data) {
            if (err)
            {
                console.log(err, err.stack);
                this.setState({
                    info: {
                        type: "error",
                        data: err.stack,
                    },
                    STATUS: "Error, " + err.code
                });
            }
            else
            {
                console.log({
                    loc: "deleteEncryptionAndPutPublic",
                    data: data
                });
                data.Contents.map(function (_object) {
                    const key = _object.Key;
                    
                });

                /*this.updateEncryptionAndACL(0, data.Contents, function (){
                    callback();
                }.bind(this));*/
                this.move(0, data.Contents, function (){
                    if(callback != undefined)
                        callback();
                }.bind(this).bind(callback));

            }
        }.bind(this));
        /*var params = {
            Bucket: BUCKET
        };
        s3.deleteBucketEncryption(params, function(err, data) {
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
                    loc: "deleteEncryption",
                    data: data
                });
                var params2 = {
                    Bucket: BUCKET, 
                    Key: OBJECT,
                    ACL: 'public-read',
                    GrantRead: "uri=http://acs.amazonaws.com/groups/global/AllUsers"
                };
                s3.putObjectAcl(params2, function(err, data) {
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
                            loc: "putObjectAcl",
                            data: data
                        });
                        callback();
                    }
                });
            }
        }.bind(this));*/
        
    }
    startBuild()
    {
        var params = {
            //projectName: "gatsby-test-dynamic-data"
            projectName: "gatsby-build"
        };
        codebuild.startBuild(params, function(err, data) {
            if (err){
                console.log({ err: err, stack: err.stack});
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
                    data: data
                });
                this.setState({
                    info: {
                        type: "success",
                        data: data
                    },
                    STATUS: "Building.. phase: " + data.build.currentPhase
                });
                thread_monitoring_build = setTimeout(function () {
                    this.checkBuild(data.build.id);
                }.bind(this), 10000);
            }
        }.bind(this));
    }
    checkBuild(id)
    {
        var params = {
            ids: [
                id
            ]
        };
        codebuild.batchGetBuilds(params, function(err, data) {
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
                    loc: "batchGetBuilds",
                    data: data
                });
                let _build = data.builds[0];
                this.setState({
                    STATUS: "Building.. phase: " + _build.currentPhase
                });
                if(_build.currentPhase != "COMPLETED")
                {
                    thread_monitoring_build = setTimeout(function () {
                        this.checkBuild(id);
                    }.bind(this), 10000);
                }
                else 
                {
                    clearTimeout(thread_monitoring_build);
                    this.deleteEncryptionAndPutPublic(function (){
                        thread_monitoring = setTimeout(function (){ this.startMonitoring(); }.bind(this), 5000);
                    }.bind(this));
                    /*this.deleteEncryptionAndPutPublic(function (){
                        thread_monitoring = setTimeout(function (){ this.startMonitoring(); }.bind(this), 5000);
                    }.bind(this))*/
                    //thread_monitoring = setTimeout(function (){ this.startMonitoring(); }.bind(this), 5000);
                }
            }
        }.bind(this));
    }
    stopMonitoring(){
        clearTimeout(thread_monitoring);
        clearTimeout(thread_monitoring_build);
        this.setState({
            button: {
                text: "START AGAIN",
                disabled: ""
            },
            STATUS: "STOPED",
            stoped: true
        });
    }
    startMonitoring(from_button)
    {
        from_button = from_button == undefined ? false : from_button;
        if(this.state.stoped && !from_button){ return }
        let _siteURL = `https://syndicator.univision.com/web-api/content?url=https://www.univision.com/test/gatsby-dynamic-data-section2`
        this.setState({
            STATUS: "MONITORING...",
            button: {
                text: "MONITORING...",
                disabled: 'disabled'
            },
            stoped: false
        });
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
                                    this.startBuild();
                                }
                            }.bind(this));
                        }
                        else {
                            thread_monitoring = setTimeout(function (){ this.startMonitoring(); }.bind(this), 5000);
                        }
                    }         
                }.bind(this));
            }
        }.bind(this));
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
                <h1><span style={{ 'fontWeight': 'normal' }}>STATUS:</span> { this.state.STATUS }</h1>
                <input type="button" value={ this.state.button.text } disabled={ this.state.button.disabled } onClick={ () => this.startMonitoring(true) } /> &nbsp;
                <input type="button" value="STOP" disabled={ this.state.button.disabled == '' ? "disabled" : "" } onClick={ () => this.stopMonitoring() } />
                
                <br />
                <br />
                <code style={{ visibility: "hidden" }}>
                    { JSON.stringify( this.state ) }
                </code>
            </div>
        )
    }
}