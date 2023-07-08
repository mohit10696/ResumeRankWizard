const parser = require("lambda-multipart-parser");
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET = "resume-classifier";
const sqs = new AWS.SQS();

exports.lambdaHandler = async (event) => {
  const result = await parser.parse(event);
  const file = result.files[0];

  const fileContent = Buffer.from(file.content, 'base64'); // Convert the file content to Buffer

  const s3Response = await s3.putObject({
    Bucket: BUCKET,
    Key: file.filename,
    Body: fileContent,
    ContentType: file.contentType, // Set the appropriate Content-Type
  }).promise();

  const objectUrl = `https://${BUCKET}.s3.amazonaws.com/${file.filename}`;

  // Push object URL to SQL queue
  await pushUrlToSQS(JSON.stringify({
    bucketName: BUCKET,
    objectKey: file.filename,
    objectUrl,
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      files: file.filename,
    }),
  };
};


const pushUrlToSQS = async (obj) => {
  const queueUrl = process.env.SQS_QUEUE_URL;
  

  const sqsParams = {
    MessageBody: obj,
    QueueUrl: queueUrl,
  };

  await sqs.sendMessage(sqsParams).promise();
};
