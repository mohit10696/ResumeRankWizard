// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const pdf = require('pdf-parse');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    const content = await s3.getObject({
        Bucket: 'resume-classifier',
        Key: 'DockerAssignment.pdf',
    }).promise();
    // console.log(content.Body.toString('utf-8'));
    try {
        pdf(content.Body).then(function(data) {
 
            // number of pages
            console.log("Pages",countInstances(data.text, 'docker'));                
        });
        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: event.message,
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};


function countInstances(string, word) {
    return string.split(word).length - 1;
 }