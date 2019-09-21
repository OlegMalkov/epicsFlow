/* eslint-disable import/group-exports */

'use strict';

const functions = require('firebase-functions');
const vision = require('@google-cloud/vision');
const path = require('path');
const requestLib = require('request');
const Clipper = require('image-clipper');
const Canvas = require('canvas');
const bucketName = 'mbp-ward.appspot.com';
const clipper = Clipper();
clipper.injectNodeCanvas(Canvas);

exports.eventFileCrop = (request, response) => {
    const { fileName, left, top, width, height } = request.query
  
    Clipper(`gs://${bucketName}/raw/${fileName}`, function() {
        this
            .crop(left, top, width, height)
            .toDataURL((dataUrl) => {
                res.status(200).send({
                    dataUrl
                });
            });
    });
};

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.read = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  const fileName = req.query.fileName;

  // Read a remote image as a text document
  const [result] = await client.documentTextDetection(
    `gs://${bucketName}/raw/${fileName}`
  );
  
  res.status(200).send(result);
};