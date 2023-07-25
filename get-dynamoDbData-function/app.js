const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB();
exports.lambdaHandler = async (event) => {
    //get the object name from the event of api gateway query string
    let objectName = event.queryStringParameters.objectName;
    //get the object from dynamodb
    let object = await getObject(objectName);

    console.log('object', JSON.stringify(object));

    if(!object) {
        //if the object is not found, return 404
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Object not found'
            })
        };
    }
    //return the object
    return {
        statusCode: 200,
        body: JSON.stringify(object)
    };
}

const getObject = async (objectName) => {
    //get the object from dynamodb
    let object = await dynamodb.getItem({
        TableName: 'SkillScores',
        Key: {
            'id': {
                S: objectName
            }
        }
    }).promise();
    //return the object
    return object.Item;
}