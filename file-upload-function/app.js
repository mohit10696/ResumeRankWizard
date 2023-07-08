const parser = require("lambda-multipart-parser");
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET = "resume-classifier";

exports.lambdaHandler = async (event) => {
  const result = await parser.parse(event);
  console.log(result.files);
  const file = result.files[0];

  const fileContent = Buffer.from(file.content, 'base64'); // Convert the file content to Buffer

  await s3.putObject({
    Bucket: BUCKET,
    Key: file.filename,
    Body: fileContent,
    ContentType: file.contentType, // Set the appropriate Content-Type
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      files: file.filename,
    }),
  };
};
