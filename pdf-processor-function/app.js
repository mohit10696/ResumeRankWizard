const AWS = require("aws-sdk");
const PDFParser = require("pdf-parse");
const csv = require("csv-parser");
const fs = require("fs");

const s3 = new AWS.S3();
const filePath = "Classification_Template.csv";
let skillScore = {};
let skillScoreIndexRange = {};
let combinedSkills = [];

exports.lambdaHandler = async (event) => {
  console.log(`Object details: ${JSON.stringify(event)}`);
  const objectDetails = JSON.parse(event.Records[0].body);
  const bucketName = objectDetails.bucketName;
  const objectKey = objectDetails.objectKey;
  const objectUrl = objectDetails.objectUrl;
  //read the file from s3
  const s3Response = await s3
    .getObject({
      Bucket: bucketName,
      Key: objectKey,
    })
    .promise();

  const dataArray = await convertCsvToObject(filePath);
  const keys = Object.keys(dataArray);
  let startIndex = 0;
  keys.forEach((key) => {
    skillScore[key] = 0;
    skillScoreIndexRange[key] = {
      startIndex,
      endIndex: startIndex + dataArray[key].length - 1,
    };
    startIndex += dataArray[key].length;
    combinedSkills = combinedSkills.concat(dataArray[key]);
  });

  const pdfText = await PDFParser(s3Response.Body);

  pdfText.text.replace(/[^\w\s]/gi, ' ').toLowerCase().split("\n").forEach((line) => {
    line.split(" ").forEach((word) => {
        if (combinedSkills.includes(word)) {
            const index = combinedSkills.indexOf(word);
            keys.forEach((key) => {
            if (
                index >= skillScoreIndexRange[key].startIndex &&
                index <= skillScoreIndexRange[key].endIndex
            ) {
                skillScore[key] += 1;
            }
            });
        }
    });
  });
  //   console.log("Extracted Text:", .length);


  //remove zero value skills from the object
    Object.keys(skillScore).forEach((key) => {
        if (skillScore[key] === 0) {
            delete skillScore[key];
        }
    });
    

  return {
    statusCode: 200,
    body: JSON.stringify(skillScore),
  };
};

const convertCsvToObject = async (filePath) => {
  const result = {};

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i].trim();
          const value = data[keys[i]].trim();

          if (value && key) {
            if (!result[key]) {
              result[key] = [];
            }
            result[key].push(value);
          }
        }
      })
      .on("end", () => resolve())
      .on("error", (error) => reject(error));
  });

  return result;
};
