const pureImage = require('pureimage')
const fs = require('fs')

async function highlightText(imgSrc, imgDst, result_bounds) {
  let promise = null
  const stream = fs.createReadStream(imgSrc)

  promise = pureImage.decodeJPEGFromStream(stream)

  const img = await promise
  const context = img.getContext('2d')
  context.drawImage(img, 0, 0, img.width, img.height, 0, 0);
  context.strokeStyle = 'rgba(0, 255, 0, 0.25)'
  context.lineWidth = '1'

  result_bounds.forEach(section => {
    // if (section.id === "block") context.strokeStyle = 'rgba(255, 0, 0, 1)'
    if (section.id === "paragraph") context.strokeStyle = 'rgba(0, 0, 255, 0.25)'
    if (section.id === "word") context.strokeStyle = 'rgba(0, 255, 0, 0.25)'
    context.beginPath()
    let origX = 0
    let origY = 0
    section.vertices.forEach((bound, index) => {
      if (index === 0) {
        origX = bound.x
        origY = bound.y
        context.moveTo(bound.x, bound.y)
      } else {
        context.lineTo(bound.x, bound.y)
      }
    })
    context.lineTo(origX, origY)
    context.stroke()
  })

  // Write the result to a file
  console.log(`Writing to file ${imgDst}`);
  const writeStream = fs.createWriteStream(imgDst);
  await pureImage.encodePNGToStream(img, writeStream);

}
module.exports = highlightText