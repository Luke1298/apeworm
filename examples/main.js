var selected_mic = false;
var video = document.getElementById('vid');
video.loop = true;

var graphs_element = document.getElementById("graphs");

document.getElementById("media_button").addEventListener("click",usemedia,false);
document.getElementById("video_button").addEventListener("click",usevideo,false);
document.getElementById("mic_button").addEventListener("click",usemic,false);

var game = new window.VowelWorm.Game({element: graphs_element});
var worms = [];

function getAveragesAndStdDev() {
  var filterBanks = 10;
  // thanks to zertosh at http://stackoverflow.com/a/13735425/390977
  var mfccs_totals = new Array(filterBanks+1).join('0').split('').map(parseFloat);
  var mfccs = [];
  worms.forEach(function(worm){
    var mfcc = worm.getMFCCs({
      minFreq: 300,
      maxFreq: 8000,
      filterBanks: filterBanks
    });
    mfccs.push(mfcc);
    mfcc.forEach(function(mfcc, index) {
      mfccs_totals[index] += mfcc;
    });
  });
  var mfcc_averages = mfccs_totals.map(function(mfcc_total){
    return mfcc_total/worms.length;
  });
  var variances = new Array(filterBanks+1).join('0').split('').map(parseFloat);
  mfccs.forEach(function(mfcc) {
    mfcc.forEach(function(coefficient, index) {
      variances[index] += Math.pow(coefficient-mfcc_averages[index],2);
    });
  });
  var stdevs = [];

  variances = variances.map(function(variance) {
    return variance/(worms.length-1);
  });
  stdevs = variances.map(function(variance) {
    return Math.sqrt(variance);
  });
  var response = [];
  for(var i = 0; i<filterBanks; i++) {
    response[i] ={average: mfcc_averages[i], stdev: stdevs[i]};
  };
  return response;
};

function usemedia() {
  var audio_els = document.getElementsByClassName('media');
  
  var audios_loaded = 0;
  function audioReady() {
    audios_loaded++;
    if(audios_loaded == audio_els.length) {
      for(var i = 0; i<audio_els.length; i++) {
        audio_els[i].play();
      }
    }
  }

  // hacky loop to make sure audio stays somewhat in sync
  var audios_finished = 0;
  function audioFinished() {
    if(audios_finished >= audio_els.length) {
      audios_finished = 0;
    }
    audios_finished++;
    if(audios_finished === audio_els.length) {
      for(var i = 0; i<audio_els.length; i++) {
        audio_els[i].play();
      }
    }
  };

  for(var i = 0; i<audio_els.length; i++) {
    var audio = audio_els[i];
    audio.style.display = 'block';
    audio.load();
    audio.addEventListener('canplaythrough', audioReady);
    audio.addEventListener('ended', audioFinished);
    var worm = new window.VowelWorm.instance(audio);
    worms.push(worm);
    game.addWorm(worm);
  }
}

function usevideo() {
  video.style.display = 'block';
  var worm = new window.VowelWorm.instance(video);
  game.addWorm(worm);
};

function usemic() {
  if(!selected_mic){
    getUserMedia({audio: true}, micSuccess, micFailure);
    selected_mic = true;
  }
};

function getUserMedia() {
  (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia
          || function(){alert('getUserMedia missing')}).apply(navigator, arguments);
}

function micSuccess(stream) {
  var worm = new window.VowelWorm.instance(stream);
  game.addWorm(worm);
};

function micFailure() {
  alert("Could not capture microphone input");
};
