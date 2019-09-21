/* eslint-disable import/group-exports */

'use strict';

const functions = require('firebase-functions');
const vision = require('@google-cloud/vision');
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