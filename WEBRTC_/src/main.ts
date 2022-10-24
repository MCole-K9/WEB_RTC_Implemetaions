import './style.css'

let servers = {
  iceServers:[
      {
          urls:['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
      }
  ]
}

//Create Peer Connection Instance
const pc = new RTCPeerConnection(servers);
let localStream: MediaStream | null = null;
let remoteStream = new MediaStream();





async function init() {
  
  //Get Local Stream
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

  (document.getElementById('user-1') as HTMLVideoElement).srcObject = localStream;
  (document.getElementById('user-2') as HTMLVideoElement).srcObject = remoteStream;


}


async function createOffer() {
  //
  localStream?.getTracks().forEach((track)=>{
    //Add Track to Peer Connection
    pc.addTrack(track, localStream!);
  })

  //Create Offer
  const offer = await pc.createOffer();

  //Set Local Description, which is the offer
  await pc.setLocalDescription(offer);

  //event listener for getting remote track
  pc.ontrack = async (event) => {
    event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
  }

  //event listener for getting / sending ice candidate
  pc.onicecandidate = (event) => {
    if(event.candidate) {
      //this is should be sent to the other peer to add to their peer connection 
      document.getElementById('offer-sdp')!.innerText = JSON.stringify(pc.localDescription);
    }

  }

  //initial offer
  document.getElementById('offer-sdp')!.innerText = JSON.stringify(offer);

}


async function createAnswer() {
  //get local tracks and add to peer connection - Callee
  localStream?.getTracks().forEach(track => pc.addTrack(track, localStream!));


  //get remote tracks and add to peer connection - from Caller
  pc.ontrack = async (event) => {
    event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
  }


  let offerSdp: string | RTCSessionDescriptionInit = ( document.getElementById('offer-sdp') as HTMLTextAreaElement).value;

  if(!offerSdp) {
    alert('Please get offer first');
  }

  offerSdp = JSON.parse(offerSdp) as RTCSessionDescriptionInit;

  

  
  await pc.setRemoteDescription(offerSdp);

  let answer = await pc.createAnswer();

  await pc.setLocalDescription(answer);

  document.getElementById('answer-sdp')!.innerText = JSON.stringify(answer);

}


async function addAnswer() {

  let answerSdp: string | RTCSessionDescriptionInit = ( document.getElementById('answer-sdp') as HTMLTextAreaElement).value;

  answerSdp = JSON.parse(answerSdp) as RTCSessionDescriptionInit;
  console.log(answerSdp);
  

  if(!pc.currentRemoteDescription) {
    await pc.setRemoteDescription(answerSdp);

  }

}

init();

document.getElementById('create-offer')!.addEventListener('click', createOffer);
document.getElementById('create-answer')!.addEventListener('click', createAnswer);
document.getElementById('add-answer')!.addEventListener('click', addAnswer);
