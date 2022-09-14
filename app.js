( async function(){
  
  let canvasText;
  let canvasFrame;


  let cameras = await navigator.mediaDevices.enumerateDevices();
  cameras = cameras.filter( camera => camera.kind === 'videoinput' );
  
  let activeCamera = cameras[0];
  let video = document.querySelector('#video-source');
  let canvas = document.querySelector('#canvas');

  

  function sizeCanvas(){
    let el = document.querySelector(".camara");
    canvas.width = el.clientWidth;
    canvas.height = el.clientHeight;
  }

  async function loadImage(){
    let image = document.createElement('img');
    image.src = 'frame.png';
    await image.decode();
    canvasFrame = image;
  };
  
  
  

  document.querySelector(".camara-switch").addEventListener("click", async function(ev){
    let index = cameras.indexOf(activeCamera);
    index = (index + 1) % cameras.length;
    activeCamera = cameras[index];
    console.log(index, activeCamera);
    await setVideo(video, activeCamera.deviceId);
  });

  document.querySelector(".camera-shutter").addEventListener("click", async function(ev){
    let canvas = document.querySelector("#canvas");
    let context = canvas.getContext('2d');
    let data = canvas.toDataURL('image/jpeg');

    let a = document.createElement('a');
    a.href = data;
    a.download = 'image.jpg';
    a.click();
  });

  document.querySelector("#addTextForm").addEventListener("submit", async function(ev){
    ev.preventDefault();
    let text = document.querySelector("#addTextForm input").value;
    canvasText = text;
  });

  loadImage();
  sizeCanvas();
  await setVideo(video);

  async function setVideo(video,videoId ){
    console.log(videoId);
    let localMediaStream = await navigator.mediaDevices.getUserMedia({ video: {deviceId: videoId ? videoId : undefined} });
    video.srcObject = localMediaStream;
    video.play();

    video.addEventListener('canplaythrough', function () {
      setCanvas(video);
    });

    
  }

  async function setCanvas(video){
    
    
    let context = canvas.getContext('2d');
    

    let draw = function(){
      // draw rectangle on canvas
      // context.drawImage(video, 0, 0, width, height);
      // drawVideoAsCover(video, 'cover', canvas, context);
      
      // get video width
      

      drawImageProp(context, video);

      if(canvasFrame){
        context.drawImage(canvasFrame, 0, 0, canvas.width, canvas.height);
      }

      if(canvasText){
        context.fillStyle = "white";
        context.font = "30px Arial";
        context.fillText(canvasText, 10, canvas.height - 10);
      }

      // console.log(">:(")
      
      requestAnimationFrame(draw);
    }

    draw();
  }

  /**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
*/
  function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
      x = y = 0;
      w = ctx.canvas.width;
      h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.videoWidth,
      ih = img.videoHeight,
      r = Math.min(w / iw, h / ih),
      nw = iw * r,   // new prop. width
      nh = ih * r,   // new prop. height
      cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
  }

})();

